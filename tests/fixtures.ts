import {
  expect,
  type ConsoleMessage,
  type Page,
  test as basis,
} from '@playwright/test';

type Konsolenpruefung = {
  konsolenfehler: string[];
};

export const test = basis.extend<Konsolenpruefung>({
  konsolenfehler: [
    async ({ context, page }, use) => {
      const konsolenfehler: string[] = [];
      const beobachteteSeiten = new Set<Page>();

      const erfasseKonsolenfehler = (nachricht: ConsoleMessage) => {
        if (nachricht.type() !== 'error') {
          return;
        }

        const quelle = nachricht.location();
        const position = quelle.url
          ? ` (${quelle.url}:${quelle.lineNumber}:${quelle.columnNumber})`
          : '';

        konsolenfehler.push(`${nachricht.text()}${position}`);
      };

      const beobachteSeite = (neueSeite: Page) => {
        if (beobachteteSeiten.has(neueSeite)) {
          return;
        }

        beobachteteSeiten.add(neueSeite);
        neueSeite.on('console', erfasseKonsolenfehler);
      };

      beobachteSeite(page);
      context.on('page', beobachteSeite);

      await use(konsolenfehler);

      context.off('page', beobachteSeite);
      for (const beobachteteSeite of beobachteteSeiten) {
        beobachteteSeite.off('console', erfasseKonsolenfehler);
      }

      expect(
        konsolenfehler,
        'In der Browser-Konsole dürfen keine Fehler ausgegeben werden.',
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
