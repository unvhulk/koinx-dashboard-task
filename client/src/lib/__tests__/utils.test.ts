import { describe, expect, it } from "vitest";
import { cn, outlineToMarkdown, toSlug } from "../utils";

// --- toSlug ---

describe("toSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(toSlug("Crypto Tax India")).toBe("crypto-tax-india");
  });

  it("collapses multiple spaces and special chars into one hyphen", () => {
    expect(toSlug("Crypto  Tax  India!")).toBe("crypto-tax-india");
  });

  it("strips leading and trailing hyphens", () => {
    expect(toSlug("!Crypto Tax!")).toBe("crypto-tax");
  });

  it("handles numbers", () => {
    expect(toSlug("Crypto Tax 2024")).toBe("crypto-tax-2024");
  });

  it("handles already-lowercase slug", () => {
    expect(toSlug("bitcoin")).toBe("bitcoin");
  });

  it("handles empty string", () => {
    expect(toSlug("")).toBe("");
  });

  it("produces URL-safe output — no spaces or specials", () => {
    const result = toSlug("How to File Crypto Taxes? (India Guide)");
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });
});

// --- outlineToMarkdown ---

const sampleOutline = {
  title: "How to File Crypto Tax in India",
  intro: "If you traded crypto in India, here is exactly what you owe.",
  sections: [
    { heading: "What counts as taxable", points: ["All trades", "Mining income"] },
    { heading: "How to calculate gains", points: ["FIFO method", "Subtract fees"] },
  ],
  conclusion: "Use KoinX to calculate and file in minutes.",
};

describe("outlineToMarkdown", () => {
  it("starts with H1 title", () => {
    const md = outlineToMarkdown(sampleOutline);
    expect(md.startsWith("# How to File Crypto Tax in India")).toBe(true);
  });

  it("includes intro on its own line", () => {
    const md = outlineToMarkdown(sampleOutline);
    expect(md).toContain("If you traded crypto in India, here is exactly what you owe.");
  });

  it("renders sections as H2 headings", () => {
    const md = outlineToMarkdown(sampleOutline);
    expect(md).toContain("## What counts as taxable");
    expect(md).toContain("## How to calculate gains");
  });

  it("renders points as bullet list items", () => {
    const md = outlineToMarkdown(sampleOutline);
    expect(md).toContain("- All trades");
    expect(md).toContain("- Mining income");
    expect(md).toContain("- FIFO method");
    expect(md).toContain("- Subtract fees");
  });

  it("ends with conclusion after separator", () => {
    const md = outlineToMarkdown(sampleOutline);
    expect(md).toContain("---\nUse KoinX to calculate and file in minutes.");
  });

  it("handles outline with no sections", () => {
    const md = outlineToMarkdown({ ...sampleOutline, sections: [] });
    expect(md).toContain("# How to File Crypto Tax in India");
    expect(md).toContain("---");
    expect(md).not.toContain("##");
  });
});

// --- cn ---

describe("cn", () => {
  it("joins class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("returns empty string when all falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
