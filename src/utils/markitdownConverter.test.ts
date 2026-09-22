import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeExtractedText } from './markitdownConverter';

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
