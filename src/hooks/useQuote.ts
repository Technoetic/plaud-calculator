import { useMemo, useState } from "react";
import { computeQuote } from "../lib/calc";
import type { QuoteInput, QuoteResult } from "../lib/calc";
import { PRICING } from "../data/pricing";

const initial: QuoteInput = {
  devices: { note: 1, notePro: 0 },
  plan: "starter", users: 1, years: 1, vatIncluded: false,
  roi: { ...PRICING.roiDefaults },
};

export function useQuote() {
  const [input, setInput] = useState<QuoteInput>(initial);
  const result: QuoteResult = useMemo(() => computeQuote(input), [input]);
  function set<K extends keyof QuoteInput>(k: K, v: QuoteInput[K]) {
    setInput((p) => ({ ...p, [k]: v }));
  }
  function setRoi(k: keyof QuoteInput["roi"], v: number) {
    setInput((p) => ({ ...p, roi: { ...p.roi, [k]: v } }));
  }
  return { input, result, set, setRoi };
}
