# Instalimi në macOS dhe Linux

## Nisja nga source code

Instalo Node.js 20 ose më të ri nga https://nodejs.org/ dhe hap Terminalin në dosjen `source-code`:

```bash
npm install
npm run dev
```

Hap `http://localhost:3000` në shfletues.

## Build për përdorim lokal

Për të krijuar versionin e prodhimit:

```bash
npm run lint
npm run build
```

Skedarët përfundimtarë krijohen në `dist/`. Për ta shërbyer lokalisht mund të përdorësh:

```bash
npx serve dist
```

## Nisja automatike në Linux

Në paketë përfshihet skripti `scripts/launchers/linux/start-academic-os.sh`. Jepi leje ekzekutimi dhe nise:

```bash
chmod +x scripts/launchers/linux/start-academic-os.sh
./scripts/launchers/linux/start-academic-os.sh
```

## Instalimi si PWA

Pasi aplikacioni të jetë hapur në Chrome ose një shfletues të pajtueshëm, përdor komandën **Install**. Për instalim PWA kërkohet një origin i sigurt, si HTTPS ose `localhost` gjatë zhvillimit.

## Troubleshooting

Nëse komanda `npm` nuk gjendet, kontrollo instalimin e Node.js dhe rinis Terminalin. Nëse aplikacioni nuk ngarkon pas një ndryshimi, fshi cache-in e build-it dhe ekzekuto përsëri `npm run build`.

Të dhënat ruhen në shfletues. Mos pastro të dhënat e site-it pa bërë më parë backup manual.
