import { describe, it, expect } from "vitest";
import { PRICING } from "./pricing";

describe("PRICING", () => {
  it("노트/노트Pro 정가가 확정값", () => {
    expect(PRICING.devices.note.price).toBe(269000);
    expect(PRICING.devices.notePro.price).toBe(319000);
  });
  it("무료 Starter는 0원·300분·공식확정(추정 아님)", () => {
    expect(PRICING.plans.starter.yearly).toBe(0);
    expect(PRICING.plans.starter.minutes).toBe(300);
    expect(PRICING.plans.starter.estimated).toBe(false); // plaud.ai 공식 확인 → 확정
  });
  it("Pro는 공식 $99.99/년 환율환산 133,000원·1200분·환율추정 표기", () => {
    expect(PRICING.plans.pro.yearly).toBe(133000);
    expect(PRICING.plans.pro.minutes).toBe(1200);
    expect(PRICING.plans.pro.estimated).toBe(true); // 환율 환산이라 추정 유지
  });
  it("ROI 기본값 존재", () => {
    expect(PRICING.roiDefaults.meetingsPerMonth).toBe(20);
    expect(PRICING.roiDefaults.minutesPerNote).toBe(30);
    expect(PRICING.roiDefaults.hourlyWage).toBe(30000);
  });
  it("VAT율 0.1", () => { expect(PRICING.vatRate).toBe(0.1); });
});
