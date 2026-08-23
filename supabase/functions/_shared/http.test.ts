import { assertEquals, assertStringIncludes } from 'jsr:@std/assert@1';
import { handleError } from './http.ts';

const request = new Request('https://functions.example.test', { headers: { Origin: 'https://app.example.test' } });

Deno.test('handleError maps known business error', async () => {
  const response = handleError(new Error('AUTH_REQUIRED'), request);
  assertEquals(response.status, 401);
  assertEquals(await response.json(), { error: 'Đăng nhập là bắt buộc.' });
});

Deno.test('handleError never exposes unknown internal error detail', async () => {
  const detail = 'duplicate key value violates unique constraint community_messages_pkey';
  const response = handleError(new Error(detail), request);
  assertEquals(response.status, 500);
  const body = await response.text();
  assertEquals(body, '{"error":"Không thể xử lý yêu cầu."}');
  assertEquals(body.includes(detail), false);
});

Deno.test('handleError sanitizes dynamic invalid codes', async () => {
  const response = handleError(new Error('INVALID_MESSAGE'), request);
  assertEquals(response.status, 400);
  assertStringIncludes(await response.text(), 'Dữ liệu yêu cầu không hợp lệ.');
});
