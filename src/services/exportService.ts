import type { SheetData } from "write-excel-file/browser";

type ExportRow = Record<string, string | number | boolean | null | undefined>;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function spreadsheetSafeValue(value: unknown) {
  const raw = value == null ? "" : String(value);
  return /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
}

function escapeCsv(value: unknown) {
  const text = spreadsheetSafeValue(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function exportRowsToCsv(rows: ExportRow[], filename: string) {
  if (!rows.length) return false;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header])).join(","),
    ),
  ].join("\r\n");
  downloadBlob(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    filename,
  );
  return true;
}

export async function exportRowsToExcel(
  rows: ExportRow[],
  filename: string,
  sheetName: string,
) {
  if (!rows.length) return false;
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const headers = Object.keys(rows[0]);
  const data: SheetData = [
    headers.map((header) => ({
      value: header,
      fontWeight: "bold" as const,
      color: "#FFFFFF",
      backgroundColor: "#6820CE",
      align: "center" as const,
      wrap: true,
    })),
    ...rows.map((row) =>
      headers.map((header) => ({
        value: spreadsheetSafeValue(row[header]),
        wrap: true,
        align: "left" as const,
      })),
    ),
  ];
  const workbook = writeXlsxFile(data, {
    sheet: sheetName.slice(0, 31),
    stickyRowsCount: 1,
    columns: headers.map((header) => ({
      width: Math.min(42, Math.max(14, header.length + 4)),
    })),
  });
  await workbook.toFile(filename);
  return true;
}
