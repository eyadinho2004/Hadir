import { describe, expect, it, vi } from 'vitest';
import { downloadCsv, toCsv, toCsvTable } from '../../src/lib/csv';

describe('toCsv', () => {
  it('writes the header and escapes commas', () => {
    const csv = toCsv([{ name: 'أحمد, علي', status: 'present', at: '2026-11-11T09:05:00Z' }]);
    expect(csv.split('\n')[0]).toBe('الاسم,الحالة,وقت الحضور');
    expect(csv).toContain('"أحمد, علي"');
  });

  it('writes only the header when there are no rows', () => {
    expect(toCsv([])).toBe('الاسم,الحالة,وقت الحضور');
  });
});

describe('toCsvTable', () => {
  it('joins the header and the escaped rows', () => {
    const csv = toCsvTable(
      ['الاسم', 'تاريخ التسجيل'],
      [
        ['سارة العتيبي', '2026-11-02T09:00:00.000Z'],
        ['أحمد, علي', '2026-11-03T09:00:00.000Z'],
      ],
    );

    expect(csv.split('\n')).toEqual([
      'الاسم,تاريخ التسجيل',
      'سارة العتيبي,2026-11-02T09:00:00.000Z',
      '"أحمد, علي",2026-11-03T09:00:00.000Z',
    ]);
  });

  it('writes only the header when there are no rows', () => {
    expect(toCsvTable(['الاسم', 'تاريخ التسجيل'], [])).toBe('الاسم,تاريخ التسجيل');
  });
});

const readBlob = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });

const readBlobBytes = (blob: Blob) =>
  new Promise<number[]>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve([...new Uint8Array(reader.result as ArrayBuffer)]);
    reader.readAsArrayBuffer(blob);
  });

describe('downloadCsv', () => {
  it('tells Excel which separator the file uses', async () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:csv');
    const revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    Object.assign(URL, { createObjectURL, revokeObjectURL });

    try {
      downloadCsv('registrants-EV-ABC123.csv', toCsvTable(['الاسم'], [['سارة العتيبي']]));

      const blob = createObjectURL.mock.calls[0]![0];
      const contents = await readBlob(blob);
      const bytes = await readBlobBytes(blob);

      expect(bytes.slice(0, 3)).toEqual([0xef, 0xbb, 0xbf]);
      expect(contents.startsWith('sep=,\r\n')).toBe(true);
      expect(contents.split('\r\n').slice(1)).toEqual(['الاسم', 'سارة العتيبي']);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv');
      expect(click).toHaveBeenCalled();
    } finally {
      Object.assign(URL, { createObjectURL: originalCreate, revokeObjectURL: originalRevoke });
      click.mockRestore();
    }
  });
});
