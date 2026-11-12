export type CsvRow = { name: string; status: string; at: string };

const escape = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export function toCsvTable(header: string[], rows: string[][]): string {
  return [header, ...rows].map((row) => row.map(escape).join(',')).join('\n');
}

export function toCsv(rows: CsvRow[]): string {
  return toCsvTable(
    ['الاسم', 'الحالة', 'وقت الحضور'],
    rows.map((row) => [row.name, row.status, row.at]),
  );
}

export function downloadCsv(filename: string, contents: string): void {
  const body = `\uFEFFsep=,\r\n${contents.replace(/\r?\n/g, '\r\n')}`;
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
