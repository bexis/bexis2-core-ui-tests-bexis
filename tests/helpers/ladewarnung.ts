import { expect } from '@playwright/test';

const LADEWARNUNG_NACH_MS = 5_000;

/**
 * Meldet langsame Seitenaufrufe und markiert den Test per Soft Assertion als
 * fehlgeschlagen. Die laufende Navigation und weitere Tests werden nicht
 * abgebrochen.
 */
export async function mitLadewarnung<T>(
  seitenname: string,
  ladevorgang: () => Promise<T>,
): Promise<T> {
  const gestartetUm = Date.now();
  let warnungAusgegeben = false;

  const warnung = () => {
    warnungAusgegeben = true;
    const dauerInSekunden = ((Date.now() - gestartetUm) / 1_000).toFixed(1);

    console.warn(
      `[WARNUNG] ${seitenname} lädt seit ${dauerInSekunden} Sekunden ` +
        `(Warnschwelle: ${LADEWARNUNG_NACH_MS / 1_000} Sekunden). ` +
        'Der Test läuft weiter.',
    );
  };

  const timer = setTimeout(warnung, LADEWARNUNG_NACH_MS);

  try {
    const ergebnis = await ladevorgang();
    const dauerInMs = Date.now() - gestartetUm;

    // Falls der Event Loop den Timer erst nach Abschluss ausführen könnte,
    // die tatsächlich überschrittene Warnschwelle trotzdem melden.
    if (!warnungAusgegeben && dauerInMs > LADEWARNUNG_NACH_MS) {
      warnung();
    }

    expect.soft(
      dauerInMs,
      `${seitenname} hat länger als ${LADEWARNUNG_NACH_MS / 1_000} Sekunden geladen.`,
    ).toBeLessThanOrEqual(LADEWARNUNG_NACH_MS);

    return ergebnis;
  } finally {
    clearTimeout(timer);
  }
}
