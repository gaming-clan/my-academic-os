# Nisës Automatik Lokal (Windows / Linux)

Këta skripta e nisin `npm run dev` në sfond (nëse s'është duke punuar tashmë) dhe hapin `http://localhost:3000` automatikisht — janë krejtësisht opsionalë, thjesht për komoditet gjatë përdorimit lokal.

## Windows

Skedarët: `windows/start-academic-os.ps1` + `windows/start-academic-os.vbs`

1. Kopjoji të dy skedarët në të njëjtin folder (p.sh. `C:\Users\<emri>\AcademicOS-Launcher\`).
2. Hap `start-academic-os.ps1` me Notepad dhe ndrysho rreshtin:
   ```
   $projectPath = "C:\Path\To\my-academic-os"
   ```
   me rrugën e vërtetë ku ke bërë `git clone` të projektit.
3. Testoje: dyklik mbi `start-academic-os.vbs` — duhet të hapet automatikisht browser-i te `localhost:3000`.
4. Për nisje automatike në çdo hyrje të Windows-it: `Win + R` → `shell:startup` → Enter → krijo aty një shkurtore (**New → Shortcut**) drejt `start-academic-os.vbs`.
5. (Opsionale) Bëj edhe një shkurtore në Desktop të të njëjtit `.vbs` si "ikonë aplikacioni" për rihapje manuale — skripti kontrollon portin 3000 përpara se të nisë një kopje të re, kështu që është i sigurt për dyklikime të shumëfishta.

## Linux

Skedarët: `linux/start-academic-os.sh` + `linux/academic-os.desktop`

1. Kopjo skriptin diku fiks, p.sh.:
   ```
   mkdir -p ~/.local/bin
   cp scripts/launchers/linux/start-academic-os.sh ~/.local/bin/
   chmod +x ~/.local/bin/start-academic-os.sh
   ```
2. Hape me një editor dhe ndrysho rreshtin:
   ```
   PROJECT_PATH="$HOME/Projects/my-academic-os"
   ```
   me rrugën e vërtetë ku ke bërë `git clone` të projektit.
3. Testoje: `~/.local/bin/start-academic-os.sh` — duhet të hapet automatikisht browser-i te `localhost:3000`.
4. Për nisje automatike në çdo hyrje grafike (GNOME/KDE/XFCE etj.):
   ```
   mkdir -p ~/.config/autostart
   cp scripts/launchers/linux/academic-os.desktop ~/.config/autostart/
   ```
5. (Opsionale) Për ta pasur edhe si ikonë të klikueshme në menynë e aplikacioneve:
   ```
   mkdir -p ~/.local/share/applications
   cp scripts/launchers/linux/academic-os.desktop ~/.local/share/applications/
   ```
   Për ikonë të personalizuar (gëzhoja e diplomës e aplikacionit), ndrysho rreshtin `Icon=` në `academic-os.desktop` me rrugën absolute drejt `public/icons/icon-512.png` të projektit tënd.

> Kërkon `curl` dhe `xdg-open` (parazgjedhje në shumicën e shpërndarjeve desktop Linux).

## Shënim

Këta skripta janë vetëm për përdorim lokal/zhvillimi (`npm run dev`) dhe nuk kanë lidhje me vetë aplikacionin — mund t'i fshish ose t'i injorosh pa ndikuar te Sistemi Im Akademik.
