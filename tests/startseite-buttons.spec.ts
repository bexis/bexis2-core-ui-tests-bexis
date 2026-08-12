import { expect, test } from '@playwright/test';

import { mitLadewarnung } from './helpers/ladewarnung';

const STARTSEITE = '/home/Start';

// Stand 27.07.2026: alle auf der Desktop-Startseite sichtbaren Elemente
// mit der semantischen Rolle "button".
const MENU_BUTTONS = [
  'Open Data',
  'Tools',
  'Documents',
  'Events',
  'Help',
] as const;

test.describe('BEXIS-Startseite – Buttons', () => {
  test.beforeEach(async ({ page }) => {
    const response = await mitLadewarnung('Die BEXIS-Startseite', async () => {
      const navigation = await page.goto(STARTSEITE, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForLoadState('load');
      return navigation;
    });

    expect(response, 'Die Startseite muss eine HTTP-Antwort liefern.').not.toBeNull();
    expect(
      response!.status(),
      `Die Startseite antwortete mit HTTP ${response!.status()}.`,
    ).toBeLessThan(400);

    await expect(page.locator('body')).toBeVisible();
  });

  for (const buttonName of MENU_BUTTONS) {
    test(`"${buttonName}" lässt sich anklicken und die Seite bleibt geladen`, async ({
      page,
    }) => {
      const pageErrors: string[] = [];
      const failedDocumentRequests: string[] = [];

      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('requestfailed', (request) => {
        if (request.resourceType() === 'document') {
          failedDocumentRequests.push(
            `${request.url()} – ${request.failure()?.errorText ?? 'unbekannter Fehler'}`,
          );
        }
      });

      const button = page.getByRole('button', {
        name: buttonName,
        exact: true,
      });

      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
      await expect(button).toHaveAttribute('aria-expanded', 'false');

      await button.click();

      // Diese Navigations-Buttons öffnen Dropdown-Menüs und laden keine neue URL.
      // Deshalb prüfen wir zusätzlich, ob das Menü geöffnet wurde und die
      // bestehende Seite weiterhin vollständig und fehlerfrei nutzbar ist.
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('body')).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => document.readyState))
        .toBe('complete');

      expect(page.url()).toBe('https://www.bexis.uni-jena.de/home/Start');
      expect(failedDocumentRequests).toEqual([]);
      expect(pageErrors).toEqual([]);
    });
  }

  test('die Testliste enthält alle sichtbaren Buttons der Startseite', async ({
    page,
  }) => {
    const visibleButtonNames = await page
      .getByRole('button')
      .filter({ visible: true })
      .allTextContents();

    expect(
      visibleButtonNames.map((name) => name.trim()).sort(),
      'Bei einer Änderung der Startseite muss MENU_BUTTONS aktualisiert werden.',
    ).toEqual([...MENU_BUTTONS].sort());
  });
});
