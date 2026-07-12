# === NDRYSHO VETËM KËTË RRESHT ===
# Vendos këtu rrugën e plotë ku ke bërë 'git clone' të projektit my-academic-os
$projectPath = "C:\my-academic-os"
# ==================================

$port = 3000

if (-not (Test-Path $projectPath)) {
    Write-Host "Gabim: rruga '$projectPath' nuk ekziston. Ndrysho `$projectPath në këtë skript."
    exit 1
}

Set-Location $projectPath

if (-not (Test-Path "$projectPath\node_modules")) {
    npm install
}

$portInUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if (-not $portInUse) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$projectPath`" && npm run dev" -WindowStyle Hidden
    Start-Sleep -Seconds 5
}
