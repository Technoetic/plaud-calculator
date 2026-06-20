import { PRICING } from "../data/pricing";

export interface QuoteInput {
  devices: { note: number; notePin: number; notePro: number };
  plan: "starter" | "pro" | "unlimited";
  years: 1 | 3;
  vatIncluded: boolean;
  roi: { meetingsPerMonth: number; minutesPerNote: number; hourlyWage: number };
}
export interface QuoteResult {
  hardwareCost: number; subscriptionCost: number; tco: number;
  monthlySaving: number; paybackMonths: number; netSaving: number;
}

export function won(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** plan의 연 구독료(원). usdRate가 주어지고 plan에 usd 원가가 있으면 실시간 환율로 환산, 아니면 yearly 폴백. */
export function planYearlyKrw(plan: "starter" | "pro" | "unlimited", usdRate?: number): number {
  const p = PRICING.plans[plan];
  if (usdRate && typeof p.usd === "number") return Math.round(p.usd * usdRate);
  return p.yearly;
}

export function computeQuote(input: QuoteInput, usdRate?: number): QuoteResult {
  const { devices, plan, years, vatIncluded, roi } = input;
  const hardwareCost =
    devices.note * PRICING.devices.note.price +
    devices.notePin * PRICING.devices.notePin.price +
    devices.notePro * PRICING.devices.notePro.price;
  // 구독 인원 = 기기 총 대수(기기 1대 = 구독 1개). PLAUD는 기기 단위 구독 구조.
  const seats = devices.note + devices.notePin + devices.notePro;
  const subscriptionCost = seats * planYearlyKrw(plan, usdRate) * years;
  let tco = hardwareCost + subscriptionCost;
  if (vatIncluded) tco = Math.round(tco * (1 + PRICING.vatRate));

  const monthlySavingHours = (roi.meetingsPerMonth * roi.minutesPerNote) / 60;
  const monthlySaving = monthlySavingHours * roi.hourlyWage;
  const paybackMonths = monthlySaving > 0 ? hardwareCost / monthlySaving : 0;
  const netSaving = monthlySaving * (years * 12) - tco;
  return { hardwareCost, subscriptionCost, tco, monthlySaving, paybackMonths, netSaving };
}
