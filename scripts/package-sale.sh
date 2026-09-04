#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(node -p "require('${ROOT_DIR}/package.json').version")"
RELEASE_NAME="my-academic-os-v${VERSION}"
RELEASES_DIR="${ROOT_DIR}/releases"
STAGING_DIR="${RELEASES_DIR}/${RELEASE_NAME}"
ZIP_PATH="${RELEASES_DIR}/${RELEASE_NAME}.zip"

cd "${ROOT_DIR}"

echo "Building My Academic OS ${VERSION}..."
npm run lint
npm run build

rm -rf "${STAGING_DIR}" "${ZIP_PATH}"
mkdir -p "${STAGING_DIR}/app-dist" "${STAGING_DIR}/source-code"

cp -R dist/. "${STAGING_DIR}/app-dist/"

# Include the complete reproducible source package without development artifacts.
cp -R src public scripts "${STAGING_DIR}/source-code/"
cp package.json package-lock.json requirements.txt vite.config.ts tsconfig.json index.html LICENSE LICENSE-sq.md README.md "${STAGING_DIR}/source-code/"

cp BUYER-GUIDE-SQ.md INSTALL-WINDOWS.md INSTALL-MAC-LINUX.md CHANGELOG.md LICENSE "${STAGING_DIR}/"
cp GUMROAD-LISTING-SQ.md "${STAGING_DIR}/GUMROAD-LISTING-SQ.md"

cat > "${STAGING_DIR}/START-HERE.md" <<'EOF'
# My Academic OS — Start Here

Për përdorim të menjëhershëm, shërbe dosjen `app-dist` me një server lokal dhe hap adresën që shfaqet:

```bash
npx serve app-dist
```

Për zhvillim ose personalizim, lexo `BUYER-GUIDE-SQ.md` dhe hap dosjen `source-code`.

Lexo gjithmonë `LICENSE` dhe `BUYER-GUIDE-SQ.md` për kushtet e përdorimit dhe kufizimet e versionit lokal.
EOF

(cd "${RELEASES_DIR}" && zip -qr "${ZIP_PATH##*/}" "${RELEASE_NAME}")

printf '\nRelease created:\n%s\n' "${ZIP_PATH}"
printf 'Release size: '
du -h "${ZIP_PATH}" | cut -f1
