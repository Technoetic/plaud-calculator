import { useMemo, useState } from "react";
import { computeQuote } from "../lib/calc";
import type { QuoteInput, QuoteResult } from "../lib/calc";
import { PRICING } from "../data/pricing";
import { useExchangeRate } from "./useExchangeRate";
import type { ExchangeRate } from "./useExchangeRate";

const initial: QuoteInput = {
  devices: { note: 1, notePin: 0, notePro: 0 },
  plan: "starter", years: 1, vatIncluded: false,
  roi: { ...PRICING.roiDefaults },
};

export function useQuote() {
  const [input, setInput] = useState<QuoteInput>(initial);
  const fx: ExchangeRate = useExchangeRate(PRICING.usdRate); // 실시간 USD→KRW (실패 시 폴백)
  // 실시간이면 그 환율로, 아니면 undefined → calc가 yearly 폴백 사용
  const result: QuoteResult = useMemo(
    () => computeQuote(input, fx.isLive ? fx.rate : undefined),
    [input, fx.isLive, fx.rate],
  );
  function set<K extends keyof QuoteInput>(k: K, v: QuoteInput[K]) {
    setInput((p) => ({ ...p, [k]: v }));
  }
  function setRoi(k: keyof QuoteInput["roi"], v: number) {
    setInput((p) => ({ ...p, roi: { ...p.roi, [k]: v } }));
  }
  return { input, result, set, setRoi, fx };
}
