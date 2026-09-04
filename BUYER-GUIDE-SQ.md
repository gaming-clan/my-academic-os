# My Academic OS — Udhëzuesi i Blerësit

## Mirë se vini

My Academic OS është një organizues akademik lokal për studentë dhe nxënës shqiptarë. Ai mundëson menaxhimin e lëndëve, detyrave, notave, shënimeve dhe kohës së studimit nga një hapësirë e vetme.

Aplikacioni nuk kërkon llogari ose abonim dhe të dhënat ruhen në pajisjen dhe shfletuesin tuaj.

## Çfarë përfshin paketa

Paketa përmban versionin e gatshëm të aplikacionit, source code-in, udhëzimet e instalimit, licencën MIT dhe shënimet e versionit.

| Skedari ose dosja | Përshkrimi |
|---|---|
| `app-dist/` | Versioni i ndërtuar për përdorim të menjëhershëm |
| `source-code/` | Kodi burimor React/Vite/TypeScript |
| `README.md` | Dokumentacioni kryesor në shqip |
| `INSTALL-WINDOWS.md` | Udhëzime për Windows |
| `INSTALL-MAC-LINUX.md` | Udhëzime për macOS dhe Linux |
| `LICENSE` | Licenca MIT |
| `CHANGELOG.md` | Historia e versioneve |

## Mënyra më e shpejtë e përdorimit

Përdorni një server lokal për të hapur dosjen `app-dist/`. Nëse keni Node.js të instaluar, hapni Terminalin ose PowerShell-in brenda dosjes `app-dist/` dhe ekzekutoni:

```bash
npx serve .
```

Më pas hapni adresën që shfaqet në terminal. Për instalim si aplikacion, hapeni përmes HTTPS ose përdorni një host lokal të sigurt; më pas zgjidhni komandën **Install** në shfletuesin Chrome ose Edge.

## Instalimi nga source code

Parakushtet janë Node.js 20 ose më i ri dhe npm. Brenda dosjes `source-code/` ekzekutoni:

```bash
npm install
npm run dev
```

Hapni `http://localhost:3000` në shfletues. Për një build prodhimi përdorni:

```bash
npm run lint
npm run build
```

## Privatësia dhe ruajtja e të dhënave

Të dhënat e aplikacionit ruhen lokalisht në `localStorage` të shfletuesit. Ato nuk sinkronizohen automatikisht me një server ose me pajisje të tjera.

Bëni backup manual para se të pastroni të dhënat e shfletuesit, të çinstaloni shfletuesin ose të ndryshoni pajisje. Versioni aktual nuk ofron cloud backup, login ose rikuperim automatik.

## Mbështetja

Për probleme instalimi, përfshini sistemin operativ, shfletuesin, komandën që ekzekutuat dhe mesazhin e plotë të gabimit. Mos dërgoni të dhënat personale të profilit tuaj ose përmbajtjen private të shënimeve.

## Licenca

Kodi shpërndahet sipas Licencës MIT. Kjo do të thotë se blerësi mund ta përdorë dhe modifikojë kodin sipas kushteve të saj. Paketa e blerjes ofron një version të organizuar, të dokumentuar dhe të gatshëm për përdorim; nuk ofron ekskluzivitet mbi kodin.

## Autorësia

Copyright © 2026 Dario Lloshi. My Academic OS nuk është i lidhur, sponsorizuar ose miratuar nga Notion Labs, Inc. ose nga krijuesit e template-ve me emrin Academic OS.

## Pyetje të shpeshta

### A funksionon pa internet?

Po. Pas hapjes dhe instalimit fillestar, aplikacioni është i përshtatshëm për përdorim offline. Disa shfletues mund të kërkojnë një hapje të parë me lidhje aktive për të ruajtur asetet e aplikacionit.

### A mund ta përdor në telefon?

Po. Në Android mund ta instaloni nga Chrome. Në iPhone ose iPad përdorni Safari dhe komandën **Add to Home Screen**.

### A ruhen notat e mia në cloud?

Jo. Në versionin aktual ato ruhen vetëm lokalisht në pajisjen tuaj.

### A përfshihet mbështetje e pakufizuar?

Paketa përfshin udhëzimet e instalimit. Çdo mbështetje shtesë varet nga oferta dhe përshkrimi i versionit që është blerë në Gumroad.

### A është produkti ekskluziv?

Jo. Versioni aktual është nën licencën MIT dhe nuk shitet si kod ekskluziv.

## Versioni

Versioni aktual: **1.0.0**

Data e release-it: **2026**

Mund të gjeni ndryshimet në `CHANGELOG.md`.

---

Nëse keni pyetje, përdorni kanalin e kontaktit të shfaqur në faqen e produktit në Gumroad.
