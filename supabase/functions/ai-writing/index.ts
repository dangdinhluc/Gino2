import { assertAllowedOrigin, authenticate, assertEnrollment, corsHeaders, errorResponse, handleError, isAllowedOrigin, optionalString, parseJsonBody, serviceClient, stringField } from '../_shared/http.ts';

interface WritingResult {
  score: number;
  summary: string;
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
  strengths: string[];
  rewritten: string;
}

function geminiRequest(): { endpoint: string; apiKey: string } {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  if (!apiKey) throw new Error('SERVICE_CONFIG_MISSING');
  return { endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, apiKey };
}

async function generate(endpoint: string, apiKey: string, payload: unknown): Promise<Response> {
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

function parseResult(value: string): WritingResult {
  const normalized = value.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    const parsed = JSON.parse(normalized) as Partial<WritingResult>;
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score ?? 0))),
      summary: typeof parsed.summary === 'string' ? parsed.summary : 'Chưa có nhận xét.',
      corrections: Array.isArray(parsed.corrections) ? parsed.corrections.slice(0, 20).map((item) => ({
        original: typeof item?.original === 'string' ? item.original : '',
        corrected: typeof item?.corrected === 'string' ? item.corrected : '',
        explanation: typeof item?.explanation === 'string' ? item.explanation : '',
      })) : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter((item): item is string => typeof item === 'string').slice(0, 10) : [],
      rewritten: typeof parsed.rewritten === 'string' ? parsed.rewritten : '',
    };
  } catch {
    return { score: 0, summary: value.slice(0, 3000), corrections: [], strengths: [], rewritten: '' };
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return isAllowedOrigin(request) ? new Response('ok', { headers: corsHeaders(request) }) : errorResponse('Origin không được phép.', 403, request);
  if (request.method !== 'POST') return errorResponse('Chỉ hỗ trợ POST.', 405, request);

  let quotaReserved = false;
  let quotaClient: Awaited<ReturnType<typeof authenticate>>['client'] | null = null;
  try {
    assertAllowedOrigin(request);
    const { client, user } = await authenticate(request);
    quotaClient = client;
    const body = parseJsonBody(await request.json());
    const text = stringField(body, 'text', 1, 10000);
    const courseId = optionalString(body, 'courseId', 160);
    const promptId = optionalString(body, 'promptId', 160);
    await assertEnrollment(client, user.id, courseId);
    const { endpoint, apiKey } = geminiRequest();
    const { error: rateLimitError } = await client.rpc('consume_ai_rate_limit', { target_feature: 'writing' });
    if (rateLimitError) throw new Error(rateLimitError.message);

    const { error: quotaError } = await client.rpc('consume_ai_quota', { target_feature: 'writing' });
    if (quotaError) throw new Error(quotaError.message);
    quotaReserved = true;

    const prompt = [
      'Bạn là giám khảo luyện viết tiếng Nhật cho kỳ Tokutei Gino.',
      'Chấm bài theo độ rõ ý, lịch sự, ngữ pháp và phù hợp bối cảnh nơi làm việc.',
      'Trả về JSON hợp lệ, không markdown, theo schema: score (0-100), summary (string), corrections (array of {original, corrected, explanation}), strengths (string[]), rewritten (string).',
      `Bài viết của học viên:\n${text}`,
    ].join('\n\n');
    const upstream = await generate(endpoint, apiKey, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1400, responseMimeType: 'application/json' },
    });
    if (!upstream.ok) throw new Error(`GEMINI_REQUEST_FAILED_${upstream.status}`);
    const payload = await upstream.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const raw = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    if (!raw) throw new Error('GEMINI_EMPTY_RESPONSE');

    const result = parseResult(raw);
    const admin = serviceClient();
    const { data: submission, error: submissionError } = await admin
      .from('ai_writing_submissions')
      .insert({ user_id: user.id, course_id: courseId ?? null, prompt_id: promptId ?? null, input_text: text, result, status: 'completed' })
      .select('id')
      .single();
    if (submissionError) throw new Error(submissionError.message);
    quotaReserved = false;
    return new Response(JSON.stringify({ ...result, submissionId: submission.id }), {
      headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (quotaReserved) {
      try { await quotaClient?.rpc('refund_ai_quota', { target_feature: 'writing' }); } catch (refundError) { console.error('[ai-writing] quota refund failed', refundError); }
    }
    return handleError(error, request);
  }
});
