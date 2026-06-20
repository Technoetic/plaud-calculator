import { motion } from "framer-motion";

export function Hero() {
  return (
    <header className="relative mb-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <span className="inline-block text-xs font-semibold tracking-wider text-accent/90 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
          PLAUD AI · 도입 견적 시뮬레이터
        </span>
        <h1 className="mt-4 text-4xl md:text-5xl font-black leading-tight">
          PLAUD AI 녹음기 <span className="text-accent">도입 견적</span>
        </h1>
        <p className="mt-3 text-white/60 max-w-2xl">
          영업 미팅·통화를 AI 요약으로 — 기기·구독·기간을 입력하면 <strong className="text-white/80">도입 총비용(TCO)</strong>과 <strong className="text-white/80">투자 회수기간</strong>을 즉시 산출합니다.
        </p>
      </motion.div>
    </header>
  );
}
