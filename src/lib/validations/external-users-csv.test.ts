import { describe, expect, it } from "vitest";
import { parseExternalUsersCsv } from "@/lib/validations/external-users-csv";

describe("parseExternalUsersCsv", () => {
  it("parses standard headers and rows", () => {
    const csv = `name,email,phone,company,position
Jane Doe,jane@example.com,+1 555 0100,Acme Corp,Sales Rep`;

    const rows = parseExternalUsersCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+1 555 0100",
      company: "Acme Corp",
      position: "Sales Rep",
    });
  });

  it("rejects missing required columns", () => {
    expect(() =>
      parseExternalUsersCsv("name,email\nJane,jane@example.com"),
    ).toThrow(/Missing required column/);
  });
});
