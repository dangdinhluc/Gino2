import { assertAllowedOrigin, authenticate, assertEnrollment, corsHeaders, errorResponse, handleError, isAllowedOrigin, optionalString, parseJsonBody, serviceClient, stringField } from '../_shared/http.ts';

const encoder = new TextEncoder();

function event(data: Record<string, unknown>): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

function geminiEndpoint(): { endpoint: string; apiKey: string } {
  const key = Deno.env.get('GEMINI_API_KEY');
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  if (!key) throw new Error('SERVICE_CONFIG_MISSING');
  return { endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, apiKey: key };
}

async function fetchWithRetry(endpoint: string, apiKey: string, payload: unknown): Promise<Response> {
  let response: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(payload),
    });
    if (response.ok || attempt === 1) return response;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return response as Response;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return isAllowedOrigin(request) ? new Response('ok', { headers: corsHeaders(request) }) : errorResponse('Origin không được phép.', 403, request);
  if (request.method !== 'POST') return errorResponse('Chỉ hỗ trợ POST.', 405, request);

  let quotaReserved = false;
  let refundQuota: (() => Promise<void>) | null = null;
  try {
    assertAllowedOrigin(request);
    const { client, user } = await authenticate(request);
    refundQuota = async () => {
      const { error } = await client.rpc('refund_ai_quota', { target_feature: 'chat' });
      if (error) throw new Error(error.message);
    };
    const body = parseJsonBody(await request.json());
    const message = stringField(body, 'message', 1, 4000);
    const courseId = optionalString(body, 'courseId', 160);
    const requestedConversationId = optionalString(body, 'conversationId', 80);

    await assertEnrollment(client, user.id, courseId);
    const { endpoint, apiKey } = geminiEndpoint();
    // Quota reservation is refunded if provider or persistence fails.
    const { error: rateLimitError } = await client.rpc('consume_ai_rate_limit', { target_feature: 'chat' });
    if (rateLimitError) throw new Error(rateLimitError.message);
    const { error: quotaError } = await client.rpc('consume_ai_quota', { target_feature: 'chat' });
    if (quotaError) throw new Error(quotaError.message);
    quotaReserved = true;

    const admin = serviceClient();

    let conversationId = requestedConversationId;
    if (conversationId) {
      const { data, error } = await client.from('ai_conversations').select('id').eq('id', conversationId).eq('user_id', user.id).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) conversationId = undefined;
    }
    if (!conversationId) {
      const { data, error } = await admin
        .from('ai_conversations')
        .insert({ user_id: user.id, course_id: courseId ?? null, title: message.slice(0, 80) })
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      conversationId = data.id;
    }

    const { data: history, error: historyError } = await client
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(12);
    if (historyError) throw new Error(historyError.message);

    const { error: userMessageError } = await admin.from('ai_messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      content: message,
      metadata: { courseId: courseId ?? null },
    });
    if (userMessageError) throw new Error(userMessageError.message);

    const contents = [
      ...(history ?? []).reverse().map((item) => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: item.content }] })),
      { role: 'user', parts: [{ text: message }] },
    ];
    const { data: approvedContext, error: approvedContextError } = courseId
      ? await client
        .from('lessons')
        .select('title, description, lesson_type, objectives')
        .eq('course_id', courseId)
        .eq('status', 'published')
        .order('order_index')
        .limit(20)
      : { data: [], error: null };
    if (approvedContextError) throw new Error(approvedContextError.message);
    const contextText = (approvedContext ?? []).map((lesson) => [
      lesson.title,
      lesson.description,
      lesson.lesson_type,
      ...(lesson.objectives ?? []),
    ].filter(Boolean).join(' — ')).join('\n').slice(0, 12000);
    const systemText = [
      'Bạn là gia sư tiếng Nhật Tokutei Gino cho học viên Việt Nam.',
      'Trả lời ngắn gọn, chính xác, ưu tiên ví dụ dùng được trong học tập và nơi làm việc.',
      'Không bịa nội dung khóa học; nếu không đủ dữ liệu, nói rõ giới hạn.',
      contextText ? `Ngữ cảnh khóa học đã duyệt:\n${contextText}` : '',
    ].filter(Boolean).join('\n\n');

    const upstream = await fetchWithRetry(endpoint, apiKey, {
      systemInstruction: { parts: [{ text: systemText }] },
      contents,
      generationConfig: { temperature: 0.35, maxOutputTokens: 900 },
    });
    if (!upstream.ok || !upstream.body) {
      throw new Error(`GEMINI_REQUEST_FAILED_${upstream.status}`);
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let buffer = '';
        let assistantText = '';
        const decoder = new TextDecoder();
        const reader = upstream.body!.getReader();
        const processLine = (line: string) => {
          if (!line.startsWith('data:')) return;
          const value = line.slice(5).trim();
          if (!value || value === '[DONE]') return;
          try {
            const payload = JSON.parse(value) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
            const delta = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
            if (!delta) return;
            assistantText += delta;
            controller.enqueue(event({ conversationId, delta }));
          } catch {
            // Ignore provider keep-alive fragments; the final provider error is surfaced by the outer request retry.
          }
        };

        try {
          while (true) {
            const { value, done } = await reader.read();
            buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? '';
            lines.forEach(processLine);
            if (done) break;
          }
          if (buffer) processLine(buffer);
          if (assistantText) {
            const { error: assistantError } = await admin.from('ai_messages').insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: 'assistant',
              content: assistantText,
              metadata: { model: Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash' },
            });
            if (assistantError) throw new Error(assistantError.message);
          }
          const { error: conversationError } = await admin.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
          if (conversationError) throw new Error(conversationError.message);
          quotaReserved = false;
          controller.enqueue(event({ done: true, conversationId }));
        } catch (error) {
          console.error('[ai-chat] stream failed', error);
          try { await refundQuota?.(); } catch (refundError) { console.error('[ai-chat] quota refund failed', refundError); }
          quotaReserved = false;
          controller.enqueue(event({ error: 'AI_STREAM_FAILED' }));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: { ...corsHeaders(request), 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
  } catch (error) {
    if (quotaReserved) {
      try { await refundQuota?.(); } catch (refundError) { console.error('[ai-chat] quota refund failed', refundError); }
    }
    return handleError(error, request);
  }
});
