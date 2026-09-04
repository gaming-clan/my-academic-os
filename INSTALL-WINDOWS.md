# Instalimi në Windows

## Mënyra e rekomanduar: versioni i gatshëm

1. Shpaketo arkivin e blerë në një dosje, për shembull `Documents\My Academic OS`.
2. Hape dosjen `app-dist`.
3. Për versionin e gatshëm, përdor `npx serve app-dist` nga dosja kryesore dhe hap adresën që shfaqet.
4. Për nisjen nga source code, hap PowerShell si përdorues normal në dosjen `source-code`. Nëse Windows bllokon ekzekutimin e skriptit, ekzekuto:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\launchers\windows\start-academic-os.ps1
```

Skripti kërkon Node.js dhe nis serverin lokal. Nëse nuk e ke Node.js të instaluar, shkarko versionin LTS nga https://nodejs.org/.

## Nisja nga source code

Hap PowerShell në dosjen `source-code` dhe ekzekuto:

```powershell
npm install
npm run dev
```

Më pas hap `http://localhost:3000`.

## Instalimi si PWA

Kur aplikacioni është i hapur në Chrome ose Edge, përdor ikonën e instalimit në shiritin e adresës ose komandën **Install My Academic OS** në aplikacion.

## Troubleshooting

Nëse porta 3000 është e zënë, mbyll procesin që po e përdor ose ndrysho portën në komandën e nisjes. Mos fshi të dhënat e shfletuesit pa bërë më parë backup të të dhënave lokale.
