<div align="center">

# 🎓 Sistemi Im Akademik

### Hapësira jote akademike, 100% lokale, e ndërtuar posaçërisht për sistemin arsimor shqiptar.

🇦🇱 Lokalizuar plotësisht &nbsp;•&nbsp; 🔒 100% Lokal &nbsp;•&nbsp; 📱 PWA e Instalueshme &nbsp;•&nbsp; 🌗 Temë E Çelët/E Errët &nbsp;•&nbsp; 🆓 Falas & Open Source

</div>

---

## 📖 Përmbajtja

- [Rreth Projektit](#-rreth-projektit)
- [Karakteristikat](#-karakteristikat)
- [Teknologjitë e Përdorura](#-teknologjitë-e-përdorura)
- [Struktura e Projektit](#-struktura-e-projektit)
- [Nisja Lokale](#-nisja-lokale)
- [Instalimi si Aplikacion (PWA)](#-instalimi-si-aplikacion-pwa)
- [Nisja Automatike Lokale](#-nisja-automatike-lokale)
- [Privatësia](#-privatësia)
- [Frymëzimi & Falënderimet](#-frymëzimi--falënderimet)
- [Licenca & Autorësia](#-licenca--autorësia)

---

## 💡 Rreth Projektit

**Sistemi Im Akademik** është një aplikacion web (React + TypeScript) i menduar posaçërisht për studentët e universiteteve dhe nxënësit e shkollave të mesme në Shqipëri. Ndryshe nga shumica e mjeteve të ngjashme (të ndërtuara zakonisht për sistemin amerikan), këtu gjithçka është përshtatur për realitetin tonë:

- 📊 **Shkalla e notave 4-10** (jo GPA/sistemi amerikan me shkronja)
- 🎓 **Kredite ECTS** dhe mesatare e ponderuar për Universitetin
- 🏫 Terminologji shqip: Semestri, Lënda, Pedagogu/Mësuesi, Numri i Amzës, etj.

Aplikacioni funksionon **plotësisht lokalisht** — pa llogari, pa identifikim, pa asnjë server apo bazë të dhënash në cloud. Çdo gjë ruhet vetëm në shfletuesin tënd.

## ✨ Karakteristikat

### 📚 Lëndët
Menaxho lëndët e tua me kod, mësues/pedagog, semestër, ngjyrë dalluese, progres të programit dhe **kredite ECTS** (për modalitetin Universitet).

### 📝 Detyra & Notat
- Regjistro detyra dhe provime me **peshë përqindjeje** për secilën lëndë.
- Llogaritje automatike e mesatares sipas **shkallës shqiptare 4-10** (Nota), me përshkrues cilësorë — nga *Mbetës* deri në *Shkëlqyeshëm*.
- **Konvertues Pikë → Notë**: nëse profesori vlerëson me sistemin 0-100 pikë, konvertohet automatikisht në notën 4-10 sipas shkallës zyrtare.
- Në modalitetin **Universitet**, mesatarja e përgjithshme ponderohet sipas **kreditëve ECTS** të çdo lënde (Mesatarja e Ponderuar), njësoj si në universitetet reale.
- Ndjek kreditet e grumbulluara (të fituara/gjithsej).

### ✅ Lista e Detyrave
Listë e thjeshtë ditore detyrash, opsionalisht e lidhur me një lëndë specifike, me statuse (Pa Filluar / Në Vazhdim / Përfunduar).

### 🗒️ Shënime Studimi
Shënime në **Markdown** me mbështetje të plotë për formula matematikore (**LaTeX/KaTeX**), të organizuara në kategori: Leksione, Laborator, Udhëzues Studimi, Detyra Shtëpie, etj.

### 🍅 Kohëmatësi i Fokusit (Pomodoro)
Sesione studimi/pushimi në stilin Pomodoro, me kohëzgjatje të rregullueshme.

### 🕐 Ora e Tiranës
Ora dhe data aktuale, gjithmonë sipas orës zyrtare të Tiranës — pavarësisht ku ndodhesh.

### 🌗 Temë: E Çelët / E Errët / Sistemi
Ndrysho temën me një klikim, ose lëre të ndjekë automatikisht preferencën e sistemit tënd.

### 📱 Aplikacion i Instalueshëm (PWA)
Mund të instalohet si aplikacion i vërtetë desktop ose mobile, dhe funksionon edhe pa internet (falë një *service worker*-i që ruan aplikacionin lokalisht).

### 👤 Profili i Studentit/Nxënësit
Fusha të përshtatura sipas nivelit arsimor: Universitet (Nr. Studentit, Grupi, Universiteti) ose Shkollë e Mesme (Nr. Nxënësit, Klasa/Paralelja, Numri i Amzës).

---

## 🛠️ Teknologjitë e Përdorura

| Kategoria | Teknologjia |
|---|---|
| Frontend | React 19, TypeScript |
| Ndërtimi/Build | Vite |
| Stilizimi | Tailwind CSS v4 |
| Ikonat | Lucide React |
| Animacionet | Motion (Framer Motion) |
| Markdown & Matematikë | react-markdown, remark-math, rehype-katex |
| Ruajtja e të dhënave | `localStorage` (100% në shfletues) |
| Instalueshmëri | Web App Manifest + Service Worker (PWA) |

## 📁 Struktura e Projektit

```
my-academic-os/
├── src/
│   ├── components/       # Widget-ët: Lëndët, Detyrat, Notat, Shënimet, Profili, Ora, Pomodoro
│   ├── hooks/            # useTheme, usePWAInstall, useFullscreen
│   ├── types.ts          # Tipet: Course, Assignment, Note, Task, Profile
│   ├── App.tsx           # Faqja kryesore dhe menaxhimi i të dhënave
│   └── main.tsx          # Pika hyrëse + regjistrimi i service worker-it
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js             # Service worker (funksionim jashtë linje)
│   └── icons/            # Ikonat e aplikacionit
├── scripts/launchers/    # Skripta opsionale nisje-automatike (Windows/Linux)
└── README.md
```

## 🚀 Nisja Lokale

**Parakushte:** [Node.js](https://nodejs.org/)

```bash
# 1. Instalo varësitë
npm install

# 2. Nis serverin e zhvillimit
npm run dev
```

Hape më pas `http://localhost:3000` në shfletuesin tënd. 🎉

## 📲 Instalimi si Aplikacion (PWA)

- **Desktop (Chrome/Edge):** kliko butonin **"Instalo"** lart djathtas në aplikacion, ose ikonën ⊕ te shiriti i adresës.
- **Android (Chrome):** menyja ⋮ → *"Install app"*, ose butoni "Instalo" brenda vetë aplikacionit.
- **iPhone/iPad (Safari):** butoni Share (📤) → *"Add to Home Screen"*.

> 💡 PWA-të kërkojnë lidhje të sigurt (HTTPS); `localhost` gjatë zhvillimit e plotëson këtë automatikisht.

## ⚡ Nisja Automatike Lokale

Në `scripts/launchers/` gjenden skripta opsionalë (Windows + Linux) që nisin automatikisht serverin lokal dhe hapin aplikacionin — të dobishëm nëse do ta kesh gjithmonë gati pa komanda manuale. Shiko `scripts/launchers/README.md` për udhëzime hap pas hapi.

## 🔒 Privatësia

Nuk ka llogari, nuk ka identifikim, nuk ka asnjë server apo bazë të dhënash në cloud. **Çdo gjë ruhet vetëm në `localStorage` të shfletuesit tënd**, në pajisjen tënde. Të dhënat nuk largohen kurrë nga kompjuteri/telefoni yt.

## 🙏 Frymëzimi & Falënderimet

Ky projekt merr frymëzim konceptual dhe emërtimin nga template-t popullore **"Academic OS"** që qarkullojnë në tregun e template-ve të Notion-it. Përtej idesë dhe emrit, **i gjithë kodi, dizajni, funksionalitetet dhe përshtatja për sistemin arsimor shqiptar janë krijuar plotësisht nga e para**, si një aplikacion i pavarur web (jo një template Notion).

## 📄 Licenca & Autorësia

Ky projekt lëshohet nën **Licencën MIT** — shiko skedarin [`LICENSE`](./LICENSE) për tekstin e plotë (ligjërisht të vlefshëm), ose [`LICENSE-sq.md`](./LICENSE-sq.md) për një përkthim shqip informativ.

> ⚠️ **Shënim i rëndësishëm mbi pronësinë**: Ky projekt **nuk ka asnjë lidhje zyrtare, bashkëpunim, sponsorizim, miratim apo filial** me krijuesit e ndonjë template-i "Academic OS" në Notion, as me vetë kompaninë **Notion Labs, Inc.** Emri dhe koncepti u përdorën vetëm si **frymëzim i lirë**; ky është një projekt krejtësisht i pavarur, ndërtuar nga zero si aplikacion web më vete. Çdo e drejtë autori, markë tregtare apo pronësi intelektuale mbi template-t origjinalë të Notion-it i përket përkatësisht pronarëve/krijuesve të tyre dhe nuk pretendohet këtu në asnjë formë.

Copyright © 2026 Dario Lloshi. Të gjitha të drejtat sipas Licencës MIT.
