import {
  type Locator,
  type Page,
  type Response,
} from '@playwright/test';

import { expect, test } from './fixtures';
import { mitLadewarnung } from './helpers/ladewarnung';

const STARTSEITE = '/home/Start';
const STARTSEITEN_URL = 'https://www.bexis.uni-jena.de/home/Start';

type LinkBereich = 'menu' | 'header' | 'banner' | 'main' | 'footer';

type Navigationsziel = {
  bereich: LinkBereich;
  name: string;
  href: string;
  menu?: 'Open Data' | 'Tools' | 'Documents' | 'Events' | 'Help';
  neuerTab?: boolean;
};

const NAVIGATIONSZIELE: readonly Navigationsziel[] = [
  // Elemente unter den Navigationsreitern
  {
    bereich: 'menu',
    menu: 'Open Data',
    name: 'Public Data Search',
    href: '/ddm/publicsearch',
  },
  {
    bereich: 'menu',
    menu: 'Open Data',
    name: 'Public Climate Data',
    href: '/tcd/publicclimatedata/index',
  },
  {
    bereich: 'menu',
    menu: 'Tools',
    name: 'LUI Calculation',
    href: '/lui/luicalculation/index',
  },
  {
    bereich: 'menu',
    menu: 'Documents',
    name: 'Data Management Plans',
    href: '/fmt/dmpfiles/index',
  },
  {
    bereich: 'menu',
    menu: 'Events',
    name: 'Event Registration',
    href: '/emm/eventregistration/eventregistration',
  },
  {
    bereich: 'menu',
    menu: 'Help',
    name: 'Documentation',
    href: '/home/docs/general',
    neuerTab: true,
  },
  {
    bereich: 'menu',
    menu: 'Help',
    name: 'How-to Fieldwork',
    href: '/rbm/help/index',
    neuerTab: true,
  },
  {
    bereich: 'menu',
    menu: 'Help',
    name: 'How-to credit',
    href: 'https://github.com/bexis/Documents/blob/master/HowTo/HowToCreditData.md',
    neuerTab: true,
  },

  // Kopfleiste und Einleitung
  {
    bereich: 'header',
    name: 'Register',
    href: '/Account/Register',
  },
  {
    bereich: 'header',
    name: 'Login',
    href: '/Account/Login',
  },
  {
    bereich: 'banner',
    name: 'terms and conditions',
    href: '/TermsAndConditions/Index',
  },
  {
    bereich: 'banner',
    name: 'Login',
    href: '../account/login',
  },
  {
    bereich: 'banner',
    name: 'Register',
    href: '../account/register',
  },

  // Kacheln auf der Hauptseite
  {
    bereich: 'main',
    name: 'Public Data',
    href: '../ddm/publicsearch/',
  },
  {
    bereich: 'main',
    name: 'Public Climate Data',
    href: '../tcd/PublicClimateData/Index',
  },
  {
    bereich: 'main',
    name: 'LUI Tool',
    href: '../lui/LUICalculation/index',
  },
  {
    bereich: 'main',
    name: 'About Public Data',
    href: 'https://www.biodiversity-exploratories.de/en/public-data-bexis/',
    neuerTab: true,
  },
  {
    bereich: 'main',
    name: 'Data Management Plans',
    href: '/fmt/DmpFiles/Index',
  },
  {
    bereich: 'main',
    name: 'How-to',
    href: '/home/docs/general/',
    neuerTab: true,
  },
  {
    bereich: 'main',
    name: 'How-to Credit Data',
    href: 'https://github.com/bexis/Documents/blob/master/HowTo/HowToCreditData.md',
    neuerTab: true,
  },
  {
    bereich: 'main',
    name: 'Contact Us',
    href: '../footer/contactus',
  },
  {
    bereich: 'main',
    name: 'Terms and Conditions',
    href: '../TermsAndConditions/Index',
  },

  // Links im Footer
  {
    bereich: 'footer',
    name: 'Privacy Policy',
    href: '/footer/policy',
  },
  {
    bereich: 'footer',
    name: 'Terms and Conditions',
    href: '/footer/termsandconditions',
  },
  {
    bereich: 'footer',
    name: 'Contact Us',
    href: '/footer/Contactus',
  },
  {
    bereich: 'footer',
    name: 'Imprint',
    href: '/footer/Imprint',
  },
  {
    bereich: 'footer',
    name: 'Accessibility',
    href: 'https://github.com/BEXIS2/Documents/blob/master/Accessibility.md',
    neuerTab: true,
  },
  {
    bereich: 'footer',
    name: 'BEXIS2 software website',
    href: 'http://bexis2.uni-jena.de',
    neuerTab: true,
  },
] as const;

function linkMitHref(bereich: Locator, href: string): Locator {
  return bereich.locator(`a[href=${JSON.stringify(href)}]`);
}

async function findeLink(page: Page, ziel: Navigationsziel): Promise<Locator> {
  if (ziel.bereich === 'menu') {
    const reiter = page.getByRole('button', {
      name: ziel.menu,
      exact: true,
    });

    await expect(reiter).toBeVisible();
    await reiter.click();
    await expect(reiter).toHaveAttribute('aria-expanded', 'true');

    return linkMitHref(page.locator('.dropdown-menu'), ziel.href);
  }

  if (ziel.bereich === 'header') {
    return linkMitHref(page.locator('.navbar-right'), ziel.href);
  }

  if (ziel.bereich === 'banner') {
    return linkMitHref(page.getByRole('banner'), ziel.href);
  }

  if (ziel.bereich === 'footer') {
    return linkMitHref(page.getByRole('contentinfo'), ziel.href);
  }

  // Die Hauptseiten-Kacheln bestehen aus einem Link mit Blockelementen.
  // Der Link selbst hat deshalb in Chromium keine eigene Bounding Box.
  // Ein Klick auf seine sichtbare Überschrift löst denselben Link aus.
  return linkMitHref(page.getByRole('main'), ziel.href).getByRole('heading', {
    name: ziel.name,
    exact: true,
  });
}

function bereichsname(ziel: Navigationsziel): string {
  if (ziel.bereich === 'menu') {
    return `Menü ${ziel.menu}`;
  }

  const namen: Record<Exclude<LinkBereich, 'menu'>, string> = {
    header: 'Kopfleiste',
    banner: 'Einleitung',
    main: 'Hauptseite',
    footer: 'Footer',
  };

  return namen[ziel.bereich];
}

test.describe('BEXIS-Startseite – alle weiterführenden Elemente', () => {
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

  for (const ziel of NAVIGATIONSZIELE) {
    test(`${bereichsname(ziel)}: "${ziel.name}" lädt nach dem Klick`, async ({
      context,
      page,
    }) => {
      const seitenfehler: string[] = [];
      const fehlgeschlageneDokumente: string[] = [];
      const dokumentAntworten: Response[] = [];

      const beobachteSeite = (neueSeite: Page) => {
        neueSeite.on('pageerror', (error) => seitenfehler.push(error.message));
      };

      beobachteSeite(page);
      context.on('page', beobachteSeite);
      context.on('response', (response) => {
        if (response.request().resourceType() === 'document') {
          dokumentAntworten.push(response);
        }
      });
      context.on('requestfailed', (request) => {
        if (request.resourceType() === 'document') {
          fehlgeschlageneDokumente.push(
            `${request.url()} – ${request.failure()?.errorText ?? 'unbekannter Fehler'}`,
          );
        }
      });

      const link = await findeLink(page, ziel);
      await expect(link, `"${ziel.name}" muss sichtbar sein.`).toBeVisible();
      await expect(link).toBeEnabled();

      const zielseite = await mitLadewarnung(
        `Die Zielseite "${ziel.name}"`,
        async () => {
          let geladeneSeite: Page;

          if (ziel.neuerTab) {
            [geladeneSeite] = await Promise.all([
              context.waitForEvent('page'),
              link.click(),
            ]);

            // Das "page"-Ereignis kann bereits für den kurzlebigen about:blank-
            // Zustand des neuen Tabs eintreffen. Erst die echte Ziel-URL werten.
            await geladeneSeite.waitForURL(
              (url) => url.protocol !== 'about:',
              { waitUntil: 'domcontentloaded' },
            );
          } else {
            const [navigation] = await Promise.all([
              page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
              link.click(),
            ]);

            expect(
              navigation,
              `"${ziel.name}" muss eine Dokument-Antwort auslösen.`,
            ).not.toBeNull();
            expect(
              navigation!.status(),
              `"${ziel.name}" antwortete mit HTTP ${navigation!.status()}.`,
            ).toBeLessThan(400);
            geladeneSeite = page;
          }

          await geladeneSeite.waitForLoadState('load');
          return geladeneSeite;
        },
      );

      await expect(zielseite.locator('body')).toBeVisible();
      await expect
        .poll(() => zielseite.evaluate(() => document.readyState))
        .toBe('complete');

      // Einige BEXIS-Seiten rendern ihren Inhalt erst nach dem load-Ereignis
      // clientseitig. Auf den Inhalt warten, statt sofort einen Leerzustand
      // zwischen Navigation und Rendering als Fehler zu melden.
      await expect
        .poll(
          async () => (await zielseite.locator('body').innerText()).trim().length,
          {
            message: `"${ziel.name}" muss sichtbaren Seiteninhalt laden.`,
            timeout: 10_000,
          },
        )
        .toBeGreaterThan(0);
      expect(zielseite.url()).not.toBe(STARTSEITEN_URL);
      expect(zielseite.url()).not.toContain('chrome-error://');

      const antwortenDerZielseite = dokumentAntworten.filter(
        (response) => response.request().frame() === zielseite.mainFrame(),
      );
      expect(
        antwortenDerZielseite.length,
        `"${ziel.name}" muss mindestens eine Dokument-Antwort laden.`,
      ).toBeGreaterThan(0);
      expect(
        antwortenDerZielseite
          .filter((response) => response.status() >= 400)
          .map((response) => `${response.status()} ${response.url()}`),
      ).toEqual([]);
      expect(fehlgeschlageneDokumente).toEqual([]);
      expect(seitenfehler).toEqual([]);
    });
  }

  test('die Testliste enthält sämtliche weiterführenden Links', async ({
    page,
  }) => {
    const vorhandeneHrefs = await page
      .locator('a[href]:not([role="button"])')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute('href')).filter(Boolean),
      );

    expect(
      vorhandeneHrefs.sort(),
      'Bei Änderungen der Startseite muss NAVIGATIONSZIELE aktualisiert werden.',
    ).toEqual(NAVIGATIONSZIELE.map((ziel) => ziel.href).sort());
  });
});
