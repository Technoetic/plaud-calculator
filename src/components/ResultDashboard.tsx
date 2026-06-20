import { motion } from "framer-motion";
import type { QuoteResult } from "../lib/calc";
import { NumberTicker } from "./NumberTicker";

const card = "p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10";

export function ResultDashboard({ result, years }: { result: QuoteResult; years: number }) {
  const stats = [
    { label: `${years}년 총비용(TCO)`, value: result.tco, suffix: " 원" },
    { label: "월 절약액(추정)", value: result.monthlySaving, suffix: " 원" },
    { label: "투자 회수기간", value: Math.round(result.paybackMonths * 10) / 10, suffix: " 개월" },
  ];
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} className={card}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5 }}>
            <div className="text-xs text-white/60">{s.label}</div>
            <div className="text-2xl font-bold text-accent">
              <NumberTicker value={s.value} suffix={s.suffix} />
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-[11px] text-white/40">
        {/* 단가 기준 2026-06 · 구독·무료한도는 추정 · ROI는 가정 기반 · 한국어 요약 품질 별도 검증 필요 */}
        단가 기준 2026-06 · 구독·무료한도는 추정 · ROI는 가정 기반 · 한국어 요약 품질 별도 검증 필요
      </p>
    </section>
  );
}
