import { describe, expect, it } from 'vitest';
import html from '../../index.html?raw';
import regular from '../../src/assets/fonts/thmanyah/thmanyahsans-Regular.woff2?url';
import medium from '../../src/assets/fonts/thmanyah/thmanyahsans-Medium.woff2?url';
import bold from '../../src/assets/fonts/thmanyah/thmanyahsans-Bold.woff2?url';

describe('arabic typeface', () => {
  it('bundles the Thmanyah Sans weights the UI uses', () => {
    expect([regular, medium, bold]).toEqual([
      expect.stringContaining('thmanyahsans-Regular'),
      expect.stringContaining('thmanyahsans-Medium'),
      expect.stringContaining('thmanyahsans-Bold'),
    ]);
  });

  it('loads no font from a third-party host', () => {
    expect(html).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
  });
});
