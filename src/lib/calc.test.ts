import { describe, it, expect } from "vitest";
import { computeQuote, won } from "./calc";
import type { QuoteInput } from "./calc";

const base: QuoteInput = {
  devices: { note: 1, notePro: 0 }, plan: "starter", users: 1, years: 1,
  vatIncluded: false, roi: { meetingsPerMonth: 20, minutesPerNote: 30, hourlyWage: 30000 },
};

describe("computeQuote TCO", () => {
  it("노트1대·무료·1년 = 하드웨어 269,000, 구독 0, TCO 269,000", () => {
    const r = computeQuote(base);
    expect(r.hardwareCost).toBe(269000);
    expect(r.subscriptionCost).toBe(0);
    expect(r.tco).toBe(269000);
  });
  it("노트Pro2대·Pro·2명·3년 VAT별도", () => {
    const r = computeQuote({ ...base, devices: { note: 0, notePro: 2 }, plan: "pro", users: 2, years: 3 });
    // 하드웨어 2×319,000=638,000 ; 구독 2명×105,000×3년=630,000 ; TCO 1,268,000
    expect(r.hardwareCost).toBe(638000);
    expect(r.subscriptionCost).toBe(630000);
    expect(r.tco).toBe(1268000);
  });
  it("VAT 포함 시 ×1.1", () => {
    const r = computeQuote({ ...base, vatIncluded: true });
    expect(r.tco).toBe(Math.round(269000 * 1.1)); // 295,900
  });
  it("won 포맷", () => { expect(won(269000)).toBe("269,000"); });
});

describe("computeQuote ROI", () => {
  it("기본 가정(미팅20·30분·시급3만) 월절약액 300,000", () => {
    const r = computeQuote(base); // base from earlier
    // 월절약시간 = 20×30/60 = 10h ; 월절약액 = 10×30,000 = 300,000
    expect(r.monthlySaving).toBe(300000);
  });
  it("회수기간 = 하드웨어 ÷ 월절약액 (노트1대=269,000/300,000≈0.9개월)", () => {
    const r = computeQuote(base);
    expect(r.paybackMonths).toBeCloseTo(269000 / 300000, 2);
  });
  it("월절약액 0이면 회수기간 0(분모0 가드)", () => {
    const r = computeQuote({ ...base, roi: { meetingsPerMonth: 0, minutesPerNote: 30, hourlyWage: 30000 } });
    expect(r.monthlySaving).toBe(0);
    expect(r.paybackMonths).toBe(0);
  });
  it("순절약액 = 월절약액×기간개월 − TCO (1년)", () => {
    const r = computeQuote(base);
    expect(r.netSaving).toBe(300000 * 12 - 269000);
  });
});
