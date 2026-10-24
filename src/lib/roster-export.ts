/** Spreadsheet-safe CSV with Excel-compatible UTF-8 and quoted multiline cells. */
export function rosterCsv(rows: (string | number | null | undefined)[][]): string {
  return "\uFEFF" + rows.map(row => row.map(value => {
    let text = String(value ?? "");
    if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }).join(",")).join("\r\n");
}
