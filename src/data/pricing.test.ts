import { describe, it, expect } from "vitest";
import { PRICING } from "./pricing";

describe("PRICING", () => {
  it("노트/노트Pro 정가가 확정값", () => {
    expect(PRICING.devices.note.price).toBe(269000);
    expect(PRICING.devices.notePro.price).toBe(319000);
  });
  it("무료 Starter는 0원·추정 플래그", () => {
    expect(PRICING.plans.starter.yearly).toBe(0);
    expect(PRICING.plans.starter.estimated).toBe(true);
  });
  it("ROI 기본값 존재", () => {
    expect(PRICING.roiDefaults.meetingsPerMonth).toBe(20);
    expect(PRICING.roiDefaults.minutesPerNote).toBe(30);
    expect(PRICING.roiDefaults.hourlyWage).toBe(30000);
  });
  it("VAT율 0.1", () => { expect(PRICING.vatRate).toBe(0.1); });
});
