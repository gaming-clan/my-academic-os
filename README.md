<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Sistemi Im Akademik

Një hapësirë pune gjithëpërfshirëse për studentët dhe nxënësit shqiptarë, për të organizuar lëndët, detyrat, notat dhe shënimet e studimit — e përshtatur për sistemin arsimor shqiptar.

## Karakteristikat

- **Lëndët**: menaxhoni lëndët tuaja me kod, mësues/pedagog, semestër dhe progres të programit.
- **Detyra & Notat**: ndiqni detyrat dhe provimet me peshë përqindjeje, dhe llogaritni automatikisht mesataren sipas **shkallës shqiptare 4-10** (Nota), me përshkrues cilësorë nga Mbetës deri në Shkëlqyeshëm.
- **Lista e Detyrave**: një listë e thjeshtë detyrash ditore, opsionalisht e lidhur me një lëndë.
- **Shënime Studimi**: shënime në Markdown, të organizuara në kategori (Leksione, Laborator, Udhëzues Studimi, etj.).
- **Kohëmatësi i Fokusit**: sesione studimi/pushimi në stilin Pomodoro.
- **Ora e Tiranës**: ora dhe data aktuale sipas orës së Tiranës.
- Sinkronizim opsional në cloud me Google Sign-In dhe Cloud Firestore; funksionon edhe jashtë linje duke përdorur `localStorage`.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

View your app in AI Studio: https://ai.studio/apps/6e33f03d-e4c2-4c61-a222-0912613a5a6c
