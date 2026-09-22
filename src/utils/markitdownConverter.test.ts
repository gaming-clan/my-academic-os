import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';

import { decodeTextWithFallbacks, extractDocxText, sanitizeExtractedText } from './markitdownConverter';

test('keeps Albanian characters when sanitizing extracted text', () => {
  const input = 'Përmbajtja përfshin ç, ë, sh, xh, z, Ç, Ë, Shqipëri.\n\r\n\u0000bad\u0001 text';

  const sanitized = sanitizeExtractedText(input);

  assert.equal(sanitized.includes('Ç'), true);
  assert.equal(sanitized.includes('ë'), true);
  assert.equal(sanitized.includes('Shqipëri'), true);
  assert.equal(sanitized.includes('bad'), true);
  assert.equal(sanitized.includes('\u0000'), false);
  assert.equal(sanitized.includes('\u0001'), false);
});

test('decodes Windows-1250 Albanian text correctly', () => {
  const bytes = Buffer.from('Përmbajtja në Shqipëri. Ç, Ë, Shqipëri.\n', 'latin1');

  const decoded = decodeTextWithFallbacks(new Uint8Array(bytes));

  assert.equal(decoded.includes('Përmbajtja'), true);
  assert.equal(decoded.includes('Shqipëri'), true);
  assert.equal(decoded.includes('Ç'), true);
  assert.equal(decoded.includes('Ë'), true);
  assert.equal(decoded.includes('\uFFFD'), false);
});

test('extracts Albanian text from a real DOCX XML payload', async () => {
  const zip = new JSZip();
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p><w:r><w:t>Përmbajtja e dokumentit në Shqipëri.</w:t></w:r></w:p>
        <w:p><w:r><w:t>Çdo paragraf ruan shkrimin e saktë.</w:t></w:r></w:p>
      </w:body>
    </w:document>`
  );

  const buffer = await zip.generateAsync({ type: 'arraybuffer' });
  const file = new File([buffer], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

  const extracted = await extractDocxText(file);

  assert.equal(extracted.includes('Përmbajtja'), true);
  assert.equal(extracted.includes('Shqipëri'), true);
  assert.equal(extracted.includes('Çdo'), true);
  assert.equal(extracted.includes('�'), false);
});
