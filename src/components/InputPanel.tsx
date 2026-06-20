import type { QuoteInput } from "../lib/calc";
import { PRICING } from "../data/pricing";
import type { ExchangeRate } from "../hooks/useExchangeRate";

interface Props {
  input: QuoteInput;
  set: <K extends keyof QuoteInput>(k: K, v: QuoteInput[K]) => void;
  setRoi: (k: keyof QuoteInput["roi"], v: number) => void;
  fx: ExchangeRate;
}

export function InputPanel({ input, set, setRoi, fx }: Props) {
  // USD 기반 플랜 배지 — 실시간 환율 적용 시 "실시간", 폴백 시 "추정"
  const proLive = fx.isLive && typeof PRICING.plans.pro.usd === "number";
  const proBadge = proLive
    ? ` · 실시간 ₩${Math.round(fx.rate).toLocaleString()}/$`
    : (PRICING.plans.pro.estimated ? " ⚠️추정" : "");
  const unlimitedLive = fx.isLive && typeof PRICING.plans.unlimited.usd === "number";
  const unlimitedBadge = unlimitedLive
    ? ` · 실시간 ₩${Math.round(fx.rate).toLocaleString()}/$`
    : (PRICING.plans.unlimited.estimated ? " ⚠️추정" : "");
  // 월 전사 한도 표시: minutes===0 이면 무제한, 아니면 N분
  const selectedPlanMinutes = PRICING.plans[input.plan].minutes;
  const transcriptionLimit = selectedPlanMinutes === 0
    ? "무제한"
    : `${selectedPlanMinutes.toLocaleString()}분`;
  return (
    <section className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
      <h2 className="text-lg font-bold mb-5">입력</h2>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
        {/* 좌: 기기·구독·기간·VAT */}
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm text-white/70">{PRICING.devices.note.label} 수량</label>
              <input type="number" min={0} value={input.devices.note}
                onChange={(e) => set("devices", { ...input.devices, note: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full px-3 py-2 rounded bg-black/30 border border-white/10" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm text-white/70">{PRICING.devices.notePin.label} 수량</label>
              <input type="number" min={0} value={input.devices.notePin}
                onChange={(e) => set("devices", { ...input.devices, notePin: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full px-3 py-2 rounded bg-black/30 border border-white/10" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm text-white/70">{PRICING.devices.notePro.label} 수량</label>
              <input type="number" min={0} value={input.devices.notePro}
                onChange={(e) => set("devices", { ...input.devices, notePro: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full px-3 py-2 rounded bg-black/30 border border-white/10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm text-white/70">구독 플랜</label>
            <select value={input.plan} onChange={(e) => set("plan", e.target.value as "starter" | "pro" | "unlimited")}
              className="w-full px-3 py-2 rounded bg-black/30 border border-white/10">
              <option value="starter">{PRICING.plans.starter.label}{PRICING.plans.starter.estimated ? " ⚠️추정" : ""}</option>
              <option value="pro">{PRICING.plans.pro.label}{proBadge}</option>
              <option value="unlimited">{PRICING.plans.unlimited.label}{unlimitedBadge}</option>
            </select>
            <p className="text-[11px] text-white/40">월 전사 한도: {transcriptionLimit}</p>
            <p className="text-[11px] text-white/40">구독은 기기 1대당 1개 — 기기 총 {input.devices.note + input.devices.notePin + input.devices.notePro}대 기준 적용</p>
          </div>

          <div className="flex gap-2">
            {[1, 3].map((y) => (
              <button key={y} onClick={() => set("years", y as 1 | 3)}
                className={`flex-1 py-2 rounded ${input.years === y ? "bg-accent text-black" : "bg-black/30"}`}>
                {y}년 TCO
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={input.vatIncluded}
              onChange={(e) => set("vatIncluded", e.target.checked)} />
            VAT 포함 표시
          </label>
        </div>

        {/* 우: ROI 가정 슬라이더 */}
        <fieldset className="space-y-4 md:border-l md:border-white/10 md:pl-8">
          <legend className="text-sm text-white/60 mb-1">ROI 가정 (이 숫자는 가정입니다 — 조정 가능)</legend>
          {([
            ["meetingsPerMonth", "월 미팅 수", 0, 100],
            ["minutesPerNote", "회의록 작성시간(분)", 0, 120],
            ["hourlyWage", "시간당 인건비(원)", 0, 100000],
          ] as const).map(([key, label, min, max]) => (
            <div key={key}>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">{label}</span>
                <span className="text-accent font-semibold tabular-nums">{input.roi[key].toLocaleString()}</span>
              </div>
              <input type="range" min={min} max={max} value={input.roi[key]}
                onChange={(e) => setRoi(key, Number(e.target.value))} className="w-full accent-[#ff6a3d] mt-1" />
            </div>
          ))}
        </fieldset>
      </div>
    </section>
  );
}
