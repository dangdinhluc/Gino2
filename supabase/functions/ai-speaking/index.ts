import { assertAllowedOrigin, authenticate, assertEnrollment, corsHeaders, errorResponse, handleError, isAllowedOrigin, optionalString, parseJsonBody, serviceClient, stringField } from '../_shared/http.ts';

interface SpeakingFeedback {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  rewritten: string;
  transcriptConfidence: number | null;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

let cachedGoogleToken: { accessToken: string; expiresAt: number } | null = null;

function geminiEndpoint(): string {
  const key = Deno.env.get('GEMINI_API_KEY');
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  if (!key) throw new Error('SERVICE_CONFIG_MISSING');
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
}

function getServiceAccount(): ServiceAccount {
  const raw = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('SERVICE_CONFIG_MISSING');
  try {
    const value = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!value.client_email || !value.private_key) throw new Error('SERVICE_CONFIG_MISSING');
    return { client_email: value.client_email, private_key: value.private_key, token_uri: value.token_uri };
  } catch (error) {
    if (error instanceof Error && error.message === 'SERVICE_CONFIG_MISSING') throw error;
    throw new Error('SERVICE_CONFIG_MISSING');
  }
}

function base64Url(value: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < value.length; index += 0x8000) binary += String.fromCharCode(...value.subarray(index, index + 0x8000));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(value: string): ArrayBuffer {
  const base64 = value.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

async function googleAccessToken(): Promise<string> {
  if (cachedGoogleToken && cachedGoogleToken.expiresAt > Date.now() + 60_000) return cachedGoogleToken.accessToken;
  const account = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64Url(new TextEncoder().encode(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: account.token_uri ?? 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3300,
  })));
  const key = await crypto.subtle.importKey('pkcs8', pemToArrayBuffer(account.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${payload}`)));
  const assertion = `${header}.${payload}.${base64Url(signature)}`;
  const response = await fetch(account.token_uri ?? 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!response.ok) throw new Error(`SPEECH_AUTH_FAILED_${response.status}`);
  const token = await response.json() as { access_token?: string; expires_in?: number };
  if (!token.access_token) throw new Error('SPEECH_AUTH_FAILED');
  cachedGoogleToken = { accessToken: token.access_token, expiresAt: Date.now() + Math.max(60, token.expires_in ?? 3600) * 1000 };
  return cachedGoogleToken.accessToken;
}

function speechEncoding(mimeType: string): string {
  if (mimeType === 'audio/webm') return 'WEBM_OPUS';
  if (mimeType === 'audio/ogg') return 'OGG_OPUS';
  if (mimeType === 'audio/wav') return 'LINEAR16';
  if (mimeType === 'audio/mpeg') return 'MP3';
  throw new Error('SPEECH_UNSUPPORTED_AUDIO');
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}

async function transcribeAudio(blob: Blob, mimeType: string): Promise<{ transcript: string; confidence: number | null }> {
  if (blob.size <= 0 || blob.size > 10 * 1024 * 1024) throw new Error('SPEECH_AUDIO_TOO_LARGE');
  const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${await googleAccessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config: { encoding: speechEncoding(mimeType), languageCode: 'ja-JP', enableAutomaticPunctuation: true, maxAlternatives: 1 },
      audio: { content: toBase64(new Uint8Array(await blob.arrayBuffer())) },
    }),
  });
  if (!response.ok) throw new Error(`SPEECH_REQUEST_FAILED_${response.status}`);
  const payload = await response.json() as { results?: Array<{ alternatives?: Array<{ transcript?: string; confidence?: number }> }> };
  const alternatives = (payload.results ?? []).flatMap((item) => item.alternatives?.slice(0, 1) ?? []);
  const transcript = alternatives.map((item) => item.transcript?.trim() ?? '').filter(Boolean).join(' ');
  if (!transcript) throw new Error('SPEECH_EMPTY_TRANSCRIPT');
  const confidences = alternatives.map((item) => item.confidence).filter((value): value is number => typeof value === 'number' && value > 0);
  return { transcript, confidence: confidences.length ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length : null };
}

function parseFeedback(value: string, confidence: number | null): SpeakingFeedback {
  try {
    const result = JSON.parse(value.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()) as Partial<SpeakingFeedback>;
    if (typeof result.summary !== 'string') throw new Error('invalid');
    return {
      score: Math.max(0, Math.min(100, Number(result.score ?? 0))),
      summary: result.summary,
      strengths: Array.isArray(result.strengths) ? result.strengths.filter((item): item is string => typeof item === 'string').slice(0, 8) : [],
      improvements: Array.isArray(result.improvements) ? result.improvements.filter((item): item is string => typeof item === 'string').slice(0, 8) : [],
      rewritten: typeof result.rewritten === 'string' ? result.rewritten : '',
      transcriptConfidence: confidence,
    };
  } catch {
    throw new Error('GEMINI_INVALID_RESPONSE');
  }
}

async function assessTranscript(transcript: string, instructions: string, rubric: unknown, confidence: number | null): Promise<SpeakingFeedback> {
  const response = await fetch(geminiEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: [
        'Bạn là giám khảo luyện nói tiếng Nhật Tokutei Gino cho học viên Việt Nam.',
        'Dựa trên transcript, đề bài và rubric; không khẳng định đã đánh giá âm thanh trực tiếp ngoài transcript.',
        'Trả JSON hợp lệ, không markdown: score (0-100), summary, strengths (string[]), improvements (string[]), rewritten (string).',
        `Đề bài: ${instructions}`,
        `Rubric: ${JSON.stringify(rubric ?? {})}`,
        `Transcript: ${transcript}`,
      ].join('\n\n') }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1000, responseMimeType: 'application/json' },
    }),
  });
  if (!response.ok) throw new Error(`GEMINI_REQUEST_FAILED_${response.status}`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const raw = payload.candidates?.[0]?.content?.parts?.map((item) => item.text ?? '').join('') ?? '';
  if (!raw) throw new Error('GEMINI_EMPTY_RESPONSE');
  return parseFeedback(raw, confidence);
}

function resultResponse(submission: { id: string; transcript: string | null; result: unknown; status: string }, request: Request): Response {
  return new Response(JSON.stringify({ submissionId: submission.id, transcript: submission.transcript, result: submission.result, status: submission.status }), { headers: { ...corsHeaders(request), 'Content-Type': 'application/json' } });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return isAllowedOrigin(request) ? new Response('ok', { headers: corsHeaders(request) }) : errorResponse('Origin không được phép.', 403, request);
  if (request.method !== 'POST') return errorResponse('Chỉ hỗ trợ POST.', 405, request);

  let submissionId: string | undefined;
  let userId: string | undefined;
  let admin: ReturnType<typeof serviceClient> | undefined;
  try {
    assertAllowedOrigin(request);
    const { client, user } = await authenticate(request);
    userId = user.id;
    const body = parseJsonBody(await request.json());
    const action = optionalString(body, 'action', 20) ?? 'process';
    submissionId = stringField(body, 'submissionId', 1, 80);
    if (action !== 'process' && action !== 'delete') throw new Error('INVALID_ACTION');

    const { data: submission, error: submissionError } = await client
      .from('speaking_submissions')
      .select('id, user_id, prompt_id, course_id, storage_path, mime_type, status, transcript, result')
      .eq('id', submissionId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (submissionError) throw new Error(submissionError.message);
    if (!submission) throw new Error('SPEAKING_SUBMISSION_NOT_FOUND');
    admin = serviceClient();

    if (action === 'delete') {
      const { error: storageError } = await admin.storage.from('learner-submissions').remove([submission.storage_path]);
      if (storageError) throw new Error(storageError.message);
      const { error: updateError } = await admin.from('speaking_submissions').update({ status: 'deleted', error_code: null }).eq('id', submission.id).eq('user_id', user.id);
      if (updateError) throw new Error(updateError.message);
      return resultResponse({ ...submission, status: 'deleted' }, request);
    }

    if (submission.status === 'completed') return resultResponse(submission, request);
    if (submission.status === 'deleted') throw new Error('SPEAKING_SUBMISSION_DELETED');
    await assertEnrollment(client, user.id, submission.course_id ?? undefined);
    const { data: prompt, error: promptError } = await client
      .from('speaking_prompts')
      .select('id, instructions, rubric')
      .eq('id', submission.prompt_id ?? '')
      .maybeSingle();
    if (promptError) throw new Error(promptError.message);
    if (!prompt) throw new Error('SPEAKING_PROMPT_NOT_AVAILABLE');

    getServiceAccount();
    geminiEndpoint();
    const { error: rateError } = await client.rpc('consume_ai_rate_limit', { target_feature: 'speaking' });
    if (rateError) throw new Error(rateError.message);
    const { error: quotaError } = await client.rpc('consume_ai_quota', { target_feature: 'speaking' });
    if (quotaError) throw new Error(quotaError.message);

    const { error: processingError } = await admin.from('speaking_submissions').update({ status: 'processing', error_code: null }).eq('id', submission.id).eq('user_id', user.id);
    if (processingError) throw new Error(processingError.message);
    const { data: audio, error: audioError } = await admin.storage.from('learner-submissions').download(submission.storage_path);
    if (audioError || !audio) throw new Error(audioError?.message ?? 'SPEECH_AUDIO_NOT_FOUND');
    const { transcript, confidence } = await transcribeAudio(audio, submission.mime_type);
    const result = await assessTranscript(transcript, prompt.instructions, prompt.rubric, confidence);
    const { data: completed, error: completedError } = await admin
      .from('speaking_submissions')
      .update({ status: 'completed', transcript, result, error_code: null })
      .eq('id', submission.id)
      .eq('user_id', user.id)
      .select('id, transcript, result, status')
      .single();
    if (completedError) throw new Error(completedError.message);
    return resultResponse(completed, request);
  } catch (error) {
    if (admin && submissionId && userId) {
      const code = error instanceof Error ? error.message.slice(0, 120) : 'SPEAKING_FAILED';
      await admin.from('speaking_submissions').update({ status: 'failed', error_code: code }).eq('id', submissionId).eq('user_id', userId).neq('status', 'deleted');
    }
    return handleError(error, request);
  }
});
