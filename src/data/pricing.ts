// PLAUD 단가 — 변경 시 이 파일만 수정.
// 출처: plaud.ai 공식 가격 페이지(plaud.ai/pages/plaud-ai-plan-pricing) + support.plaud.ai 직접 확인(2026-06).
// 하드웨어 정가: plaud.kr 제품페이지(확정). 구독: plaud.ai 공식 USD(확정), 원화는 환율 환산.
export interface Device { label: string; price: number }
export interface Plan { label: string; yearly: number; minutes: number; estimated: boolean; note?: string }
export interface PlaudPricing {
  asOf: string; vatRate: number; usdRate: number;
  devices: { note: Device; notePro: Device };
  plans: { starter: Plan; pro: Plan };
  roiDefaults: { meetingsPerMonth: number; minutesPerNote: number; hourlyWage: number };
}

export const PRICING: PlaudPricing = {
  asOf: "2026-06",
  vatRate: 0.1,
  usdRate: 1330, // ₩/$ 환산 기준 — 변동 시 갱신
  devices: {
    note: { label: "PLAUD 노트 64GB", price: 269000 },       // 확정(plaud.kr 정가)
    notePro: { label: "PLAUD 노트 Pro 64GB", price: 319000 }, // 확정(plaud.kr 정가)
  },
  plans: {
    // 무료 Starter 300분: 모든 기기 기본 포함·만료 없음(plaud.ai 공식·support.plaud.ai 확인) → 확정
    starter: { label: "Starter(무료)", yearly: 0, minutes: 300, estimated: false },
    // Pro 연 $99.99(공식)·1,200분/월. 원화는 $99.99×1,330≈133,000원(환율 환산이라 추정 표기 유지)
    pro: { label: "Pro", yearly: 133000, minutes: 1200, estimated: true, note: "공식 $99.99/년 환율 환산" },
  },
  roiDefaults: { meetingsPerMonth: 20, minutesPerNote: 30, hourlyWage: 30000 },
};
