export function renderTable(rows: Array<Record<string, string | number>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]!);
  const widths = headers.map((header) => Math.max(header.length, ...rows.map((row) => String(row[header] ?? '').length)));
  const line = `+-${widths.map((width) => '-'.repeat(width)).join('-+-')}-+`;
  const render = (values: string[]) => `| ${values.map((value, index) => value.padEnd(widths[index]!)).join(' | ')} |`;

  return [
    line,
    render(headers),
    line,
    ...rows.map((row) => render(headers.map((header) => String(row[header] ?? '')))),
    line
  ].join('\n');
}
