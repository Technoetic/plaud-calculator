// PLAUD 단가 — 변경 시 이 파일만 수정. 출처: PLAUD AI 녹음기 DHIS 도입 제안 (2026-06 plaud.kr 검증).
export interface Device { label: string; price: number }
export interface Plan { label: string; yearly: number; minutes: number; estimated: boolean }
export interface PlaudPricing {
  asOf: string; vatRate: number;
  devices: { note: Device; notePro: Device };
  plans: { starter: Plan; pro: Plan };
  roiDefaults: { meetingsPerMonth: number; minutesPerNote: number; hourlyWage: number };
}

export const PRICING: PlaudPricing = {
  asOf: "2026-06",
  vatRate: 0.1,
  devices: {
    note: { label: "PLAUD 노트 64GB", price: 269000 },       // 확정(정가)
    notePro: { label: "PLAUD 노트 Pro 64GB", price: 319000 }, // 확정(정가)
  },
  plans: {
    starter: { label: "Starter(무료)", yearly: 0, minutes: 300, estimated: true }, // ⚠️국내 동일여부 추정
    pro: { label: "Pro", yearly: 105000, minutes: 1200, estimated: true },         // ⚠️$6.6/월×12, ₩1,330/$ 가정
  },
  roiDefaults: { meetingsPerMonth: 20, minutesPerNote: 30, hourlyWage: 30000 },
};
