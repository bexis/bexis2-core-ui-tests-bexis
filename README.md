# BEXIS Playwright-Tests

Die Tests öffnen die BEXIS-Startseite und prüfen jeden sichtbaren
Navigations-Button sowie jeden weiterführenden Link einzeln:

- Der Button ist sichtbar und aktiviert.
- Der Klick öffnet das zugehörige Dropdown-Menü.
- Jeder Link unter den Dropdown-Reitern wird wirklich angeklickt.
- Sämtliche Links in Kopfleiste, Einleitung, Hauptkacheln und Footer werden
  ebenfalls angeklickt.
- Die Zielseite liefert einen HTTP-Status unter 400, erreicht den vollständigen
  Ladezustand und enthält sichtbaren Inhalt.
- Es treten keine JavaScript-Seitenfehler, Browser-Fehlerseiten oder
  fehlgeschlagenen Dokument-Anfragen auf.
- Vollständigkeitstests melden neue oder entfernte Buttons und Links.

## Installation

```powershell
pnpm install
pnpm exec playwright install chromium
```

## Playwright UI starten

```powershell
pnpm test:ui
```

Alternativ können die Tests ohne UI ausgeführt werden:

```powershell
pnpm test
```

## Warnung bei langsamen Seiten

Braucht die Startseite oder eine angeklickte Zielseite länger als fünf
Sekunden bis zum vollständigen Laden, erscheint eine `[WARNUNG]` in der
Testausgabe. Der betroffene Test wird als fehlgeschlagen markiert, aber nicht
sofort abgebrochen: Seine weiteren Prüfungen und alle nachfolgenden Tests laufen
weiter. Die regulären Playwright-Timeouts gelten ebenfalls weiterhin.
