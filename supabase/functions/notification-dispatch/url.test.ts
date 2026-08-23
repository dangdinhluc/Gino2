import { assertEquals } from 'jsr:@std/assert@1';
import { actionLink, appRelativeRoute } from './url.ts';

Deno.test('push routes stay app-relative', () => {
  assertEquals(appRelativeRoute('/app/dashboard'), '/app/dashboard');
  assertEquals(appRelativeRoute('/app/review/flashcards?mode=due'), '/app/review/flashcards?mode=due');
  assertEquals(appRelativeRoute('//evil.com'), null);
  assertEquals(appRelativeRoute('https://evil.com'), null);
  assertEquals(appRelativeRoute(null), null);
});

Deno.test('email links preserve the GitHub Pages base path', () => {
  assertEquals(
    actionLink('/app/review/flashcards?mode=due', 'https://dangdinhluc.github.io/Gino2'),
    'https://dangdinhluc.github.io/Gino2/app/review/flashcards?mode=due',
  );
});
