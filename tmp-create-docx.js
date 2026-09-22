const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

(async () => {
  const zip = new JSZip();
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p><w:r><w:t>Përmbajtja e dokumentit në Shqipëri.</w:t></w:r></w:p>
        <w:p><w:r><w:t>Çdo paragraf ruan shkrimin e saktë.</w:t></w:r></w:p>
        <w:p><w:r><w:t>Shkronjat Ç, Ë, Gj, Sh, Xh janë të dukshme.</w:t></w:r></w:p>
      </w:body>
    </w:document>`
  );
  const outDir = path.join(process.cwd(), 'tmp-test');
  fs.mkdirSync(outDir, { recursive: true });
  const filePath = path.join(outDir, 'albanian-test.docx');
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(filePath, buffer);
  console.log(filePath);
})();
