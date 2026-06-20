import { useEffect, useState } from "react";

export interface ExchangeRate {
  rate: number;      // USD → KRW
  isLive: boolean;   // true=실시간 fetch 성공, false=폴백
  updatedAt: string; // 환율 기준 시각(실시간일 때) 또는 ""
}

// 무료·키불필요·CORS open API. 실패 시 폴백 환율 사용.
const API = "https://open.er-api.com/v6/latest/USD";

/**
 * 실시간 USD→KRW 환율을 가져온다. 네트워크 I/O이므로 비동기.
 * 실패(오프라인·API 다운)하면 fallback 환율로 폴백하고 isLive=false.
 */
export function useExchangeRate(fallback: number): ExchangeRate {
  const [state, setState] = useState<ExchangeRate>({ rate: fallback, isLive: false, updatedAt: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("rate fetch failed");
        const data = await res.json();
        const krw = data?.rates?.KRW;
        if (typeof krw !== "number" || !isFinite(krw)) throw new Error("invalid rate");
        if (!cancelled) {
          setState({ rate: krw, isLive: true, updatedAt: (data.time_last_update_utc || "").slice(0, 16) });
        }
      } catch {
        // 폴백 유지(초기 state가 이미 fallback)
        if (!cancelled) setState({ rate: fallback, isLive: false, updatedAt: "" });
      }
    })();
    return () => { cancelled = true; };
  }, [fallback]);

  return state;
}
