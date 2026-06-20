import { PRICING } from "../data/pricing";

export interface QuoteInput {
  devices: { note: number; notePro: number };
  plan: "starter" | "pro";
  users: number;
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

export function computeQuote(input: QuoteInput): QuoteResult {
  const { devices, plan, users, years, vatIncluded, roi } = input;
  const hardwareCost =
    devices.note * PRICING.devices.note.price +
    devices.notePro * PRICING.devices.notePro.price;
  const subscriptionCost = users * PRICING.plans[plan].yearly * years;
  let tco = hardwareCost + subscriptionCost;
  if (vatIncluded) tco = Math.round(tco * (1 + PRICING.vatRate));

  const monthlySavingHours = (roi.meetingsPerMonth * roi.minutesPerNote) / 60;
  const monthlySaving = monthlySavingHours * roi.hourlyWage;
  const paybackMonths = monthlySaving > 0 ? hardwareCost / monthlySaving : 0;
  const netSaving = monthlySaving * (years * 12) - tco;
  return { hardwareCost, subscriptionCost, tco, monthlySaving, paybackMonths, netSaving };
}
