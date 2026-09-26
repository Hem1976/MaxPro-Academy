import { z } from "zod";

const externalUserRowSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(40),
  company: z.string().trim().min(1).max(120),
  position: z.string().trim().min(1).max(120),
});

export type ExternalUserRow = z.infer<typeof externalUserRowSchema>;

const HEADER_ALIASES: Record<string, keyof ExternalUserRow> = {
  name: "fullName",
  "full name": "fullName",
  fullname: "fullName",
  "full_name": "fullName",
  email: "email",
  "e-mail": "email",
  phone: "phone",
  "phone number": "phone",
  mobile: "phone",
  company: "company",
  organization: "company",
  position: "position",
  title: "position",
  "job title": "position",
  job_title: "position",
  role: "position",
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseExternalUsersCsv(csvText: string): ExternalUserRow[] {
  const lines = csvText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one learner.");
  }

  const headerCells = parseCsvLine(lines[0]);
  const columnKeys: (keyof ExternalUserRow | null)[] = headerCells.map((cell) => {
    const key = HEADER_ALIASES[normalizeHeader(cell)];
    return key ?? null;
  });

  const required: (keyof ExternalUserRow)[] = [
    "fullName",
    "email",
    "phone",
    "company",
    "position",
  ];
  for (const field of required) {
    if (!columnKeys.includes(field)) {
      throw new Error(
        `Missing required column for "${field}". Expected headers like name, email, phone, company, position.`,
      );
    }
  }

  const rows: ExternalUserRow[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const cells = parseCsvLine(lines[lineIndex]);
    const record: Partial<ExternalUserRow> = {};

    columnKeys.forEach((key, columnIndex) => {
      if (!key) return;
      record[key] = cells[columnIndex] ?? "";
    });

    const parsed = externalUserRowSchema.safeParse(record);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid row";
      throw new Error(`Row ${lineIndex + 1}: ${message}`);
    }

    rows.push(parsed.data);
  }

  if (rows.length > 500) {
    throw new Error("Maximum 500 learners per upload.");
  }

  return rows;
}
