import { motion } from "framer-motion";
import type { QuoteResult } from "../lib/calc";
import { NumberTicker } from "./NumberTicker";
import { TcoChart } from "./TcoChart";
import { PaybackGauge } from "./PaybackGauge";

const card = "p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10";
const statCard = "px-4 py-5 rounded-2xl bg-white/5 backdrop-blur border border-white/10 min-w-0 flex flex-col";

export function ResultDashboard({ result, years }: { result: QuoteResult; years: number }) {
  const stats = [
    { label: `${years}년 총비용`, note: "TCO", value: result.tco, unit: "원" },
    { label: "월 절약액", note: "추정", value: result.monthlySaving, unit: "원" },
    { label: "투자 회수기간", note: "", value: Math.round(result.paybackMonths * 10) / 10, unit: "개월" },
    { label: `${years}년 순절약액`, note: "추정", value: result.netSaving, unit: "원" },
  ];
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} className={statCard}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5 }}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-white/70 break-keep leading-snug">{s.label}</span>
              {s.note && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 shrink-0">{s.note}</span>
              )}
            </div>
            <div className="mt-auto pt-3 flex items-baseline gap-0.5 whitespace-nowrap">
              <span className="text-xl lg:text-2xl font-bold text-accent tabular-nums leading-none">
                <NumberTicker value={s.value} />
              </span>
              <span className="text-sm font-semibold text-accent/80 shrink-0">{s.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className={card}><TcoChart result={result} /></div>
        <div className={card}><PaybackGauge paybackMonths={result.paybackMonths} /></div>
      </div>
      <p className="text-[11px] text-white/40">
        {/* 단가 기준 2026-06 · 구독·무료한도는 추정 · ROI는 가정 기반 · 한국어 요약 품질 별도 검증 필요 */}
        단가 기준 2026-06 · 구독·무료한도는 추정 · ROI는 가정 기반 · 한국어 요약 품질 별도 검증 필요
      </p>
    </section>
  );
}
