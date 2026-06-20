---
title: "PLAUD 견적 웹앱 구현 계획"
type: project
domain: dhis
status: done
ai_priority: medium
tags: [plan, plaud, calculator, webapp, tool, react]
related:
  - "[[PLAUD 견적 웹앱 설계 스펙]]"
  - "[[PLAUD AI 녹음기 DHIS 도입 제안]]"
project: DHIS-AX
created: 2026-06-19
updated: 2026-06-19
---

# PLAUD 견적 웹앱 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PLAUD AI 녹음기 도입 TCO/ROI를 입력 즉시 산출해 시각적으로 인상적인 대시보드로 보여주는, GitHub Pages 배포형 React 웹앱을 만든다.

**Architecture:** 순수 계산 모듈(`calc.ts`, React·DOM 무관)을 TDD로 먼저 고정하고, 데이터(`pricing.ts`)를 분리한 뒤, React 컴포넌트로 입력/결과 UI를 조립한다. 시각 레이어(Framer Motion·ApexCharts·NumberTicker·3D·Aurora)는 계산이 검증된 뒤 얹는다. Vite 정적 빌드 → GitHub Pages 배포.

**Tech Stack:** React 18 + Vite + TypeScript, Tailwind CSS + shadcn/ui, Framer Motion, ApexCharts(react-apexcharts), Aceternity/Magic UI 패턴(NumberTicker·Aurora·Spotlight), react-three-fiber(@react-three/fiber·drei) 히어로 3D, Vitest 테스트.

## Global Constraints

- 작업 디렉토리: `00-meta/scripts/plaud-calculator/` 외부에 파일 생성 금지. 빌드 산출물 `dist/`는 배포 전용.
- 단가·요금제·ROI 기본값은 `src/data/pricing.ts` **한 파일만** 수정해 바꿀 수 있어야 한다.
- 단가 출처: 2026-06 plaud.kr 검증 — 노트 269,000원, 노트Pro 319,000원(정가, 확정). 구독 Pro yearly 105,000원·무료한도 300분은 **추정**(estimated:true → 화면 ⚠️ 배지).
- ROI는 가정 기반 — 화면에 "이 숫자는 가정입니다" 명시 + 슬라이더 조절. 한국어 요약 품질 미검증 푸터 주석.
- 한글 UTF-8. 통화는 천단위 콤마 + "원".
- 계산 로직(`calc.ts`)은 React/DOM import 0 — 순수 함수로 단독 테스트.
- 배포: `vite.config.ts`에 `base: '/plaud-calculator/'`. 정적 빌드만, 서버 불필요.
- 시각 방침: 절대 최대 화려함([[webapp-coding-principles]] §6). 단 B2B 신뢰감 위해 모션 duration < 1s·절제 이징.

---

### Task 1: 프로젝트 스캐폴드 (Vite + React + TS + Tailwind)

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`

**Interfaces:**
- Consumes: 없음 (최초 태스크)
- Produces: `npm run dev`로 뜨는 빈 앱, `npm run build`로 dist 생성, Tailwind 유틸리티 동작.

- [ ] **Step 1: Vite React-TS 스캐폴드 생성**

작업 디렉토리에서 실행:
```bash
cd "d:/DHAX/00-meta/scripts/plaud-calculator"
npm create vite@latest . -- --template react-ts
npm install
```
Expected: src/ 와 package.json 생성, 설치 성공.

- [ ] **Step 2: Tailwind + 의존성 설치**

```bash
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npm install framer-motion react-apexcharts apexcharts
npm install three @react-three/fiber @react-three/drei
npx tailwindcss init -p
```
Expected: 설치 성공, tailwind.config.js·postcss.config.js 생성.

- [ ] **Step 3: Tailwind content·base 설정**

`tailwind.config.js`의 content를 설정:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ink: "#0b1220", accent: "#ff6a3d" }, // PLAUD 오렌지 계열 액센트
  } },
  plugins: [],
};
```
`src/index.css` 최상단에 추가:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: vite.config base + vitest 설정**

`vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "/plaud-calculator/",
  test: { environment: "jsdom", globals: true, setupFiles: "./src/setupTests.ts" },
});
```
`src/setupTests.ts`:
```ts
import "@testing-library/jest-dom";
```
`package.json` scripts에 `"test": "vitest run"` 추가.

- [ ] **Step 5: 빌드·실행 검증**

Run: `npm run build`
Expected: dist/ 생성, 에러 0.

- [ ] **Step 6: Commit**

```bash
git init 2>/dev/null; git add -A
git commit -m "chore: scaffold PLAUD calculator (Vite+React+TS+Tailwind)"
```

---

### Task 2: 가격 데이터 모듈 (pricing.ts)

**Files:**
- Create: `src/data/pricing.ts`
- Test: `src/data/pricing.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  ```ts
  export interface PlaudPricing {
    asOf: string; vatRate: number;
    devices: { note: Device; notePro: Device };
    plans: { starter: Plan; pro: Plan };
    roiDefaults: { meetingsPerMonth: number; minutesPerNote: number; hourlyWage: number };
  }
  export interface Device { label: string; price: number }
  export interface Plan { label: string; yearly: number; minutes: number; estimated: boolean }
  export const PRICING: PlaudPricing;
  ```

- [ ] **Step 1: 데이터 검증 테스트 작성**

`src/data/pricing.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { PRICING } from "./pricing";

describe("PRICING", () => {
  it("노트/노트Pro 정가가 확정값", () => {
    expect(PRICING.devices.note.price).toBe(269000);
    expect(PRICING.devices.notePro.price).toBe(319000);
  });
  it("무료 Starter는 0원·추정 플래그", () => {
    expect(PRICING.plans.starter.yearly).toBe(0);
    expect(PRICING.plans.starter.estimated).toBe(true);
  });
  it("ROI 기본값 존재", () => {
    expect(PRICING.roiDefaults.meetingsPerMonth).toBe(20);
    expect(PRICING.roiDefaults.minutesPerNote).toBe(30);
    expect(PRICING.roiDefaults.hourlyWage).toBe(30000);
  });
  it("VAT율 0.1", () => { expect(PRICING.vatRate).toBe(0.1); });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- pricing`
Expected: FAIL — "./pricing" 모듈 없음.

- [ ] **Step 3: pricing.ts 구현**

`src/data/pricing.ts`:
```ts
// PLAUD 단가 — 변경 시 이 파일만 수정. 출처: PLAUD AI 녹음기 DHIS 도입 제안 (2026-06 plaud.kr 검증).
export interface Device { label: string; price: number }
export interface Plan { label: string; yearly: number; minutes: number; estimated: boolean }
export interface PlaudPricing {
  asOf: string; vatRate: number;
  devices: { note: Device; notePro: Device };
  plans: { starter: Plan; pro: Plan };
  roiDefaults: { meetingsPerMonth: number; minutesPerNote: number; hourlyWage: number };
}

export const PRICING: PlaudPricing = {
  asOf: "2026-06",
  vatRate: 0.1,
  devices: {
    note: { label: "PLAUD 노트 64GB", price: 269000 },       // 확정(정가)
    notePro: { label: "PLAUD 노트 Pro 64GB", price: 319000 }, // 확정(정가)
  },
  plans: {
    starter: { label: "Starter(무료)", yearly: 0, minutes: 300, estimated: true }, // ⚠️국내 동일여부 추정
    pro: { label: "Pro", yearly: 105000, minutes: 1200, estimated: true },         // ⚠️$6.6/월×12, ₩1,330/$ 가정
  },
  roiDefaults: { meetingsPerMonth: 20, minutesPerNote: 30, hourlyWage: 30000 },
};
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- pricing`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/pricing.ts src/data/pricing.test.ts
git commit -m "feat: add PLAUD pricing data module"
```

---

### Task 3: 순수 계산 모듈 (calc.ts) — TCO

**Files:**
- Create: `src/lib/calc.ts`
- Test: `src/lib/calc.test.ts`

**Interfaces:**
- Consumes: `PRICING` from `src/data/pricing.ts`
- Produces:
  ```ts
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
  export function computeQuote(input: QuoteInput): QuoteResult;
  export function won(n: number): string; // "269,000"
  ```

- [ ] **Step 1: TCO 테스트 작성**

`src/lib/calc.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeQuote, won, QuoteInput } from "./calc";

const base: QuoteInput = {
  devices: { note: 1, notePro: 0 }, plan: "starter", users: 1, years: 1,
  vatIncluded: false, roi: { meetingsPerMonth: 20, minutesPerNote: 30, hourlyWage: 30000 },
};

describe("computeQuote TCO", () => {
  it("노트1대·무료·1년 = 하드웨어 269,000, 구독 0, TCO 269,000", () => {
    const r = computeQuote(base);
    expect(r.hardwareCost).toBe(269000);
    expect(r.subscriptionCost).toBe(0);
    expect(r.tco).toBe(269000);
  });
  it("노트Pro2대·Pro·2명·3년 VAT별도", () => {
    const r = computeQuote({ ...base, devices: { note: 0, notePro: 2 }, plan: "pro", users: 2, years: 3 });
    // 하드웨어 2×319,000=638,000 ; 구독 2명×105,000×3년=630,000 ; TCO 1,268,000
    expect(r.hardwareCost).toBe(638000);
    expect(r.subscriptionCost).toBe(630000);
    expect(r.tco).toBe(1268000);
  });
  it("VAT 포함 시 ×1.1", () => {
    const r = computeQuote({ ...base, vatIncluded: true });
    expect(r.tco).toBe(Math.round(269000 * 1.1)); // 295,900
  });
  it("won 포맷", () => { expect(won(269000)).toBe("269,000"); });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- calc`
Expected: FAIL — computeQuote 없음.

- [ ] **Step 3: calc.ts TCO 부분 구현**

`src/lib/calc.ts`:
```ts
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
  const { devices, plan, users, years, vatIncluded } = input;
  const hardwareCost =
    devices.note * PRICING.devices.note.price +
    devices.notePro * PRICING.devices.notePro.price;
  const subscriptionCost = users * PRICING.plans[plan].yearly * years;
  let tco = hardwareCost + subscriptionCost;
  if (vatIncluded) tco = Math.round(tco * (1 + PRICING.vatRate));
  // ROI는 Task 4에서 채움 (임시 0)
  return { hardwareCost, subscriptionCost, tco, monthlySaving: 0, paybackMonths: 0, netSaving: 0 };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- calc`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/calc.ts src/lib/calc.test.ts
git commit -m "feat: add TCO calculation (pure module)"
```

---

### Task 4: 계산 모듈 — ROI 추가

**Files:**
- Modify: `src/lib/calc.ts` (computeQuote의 ROI 부분)
- Modify: `src/lib/calc.test.ts` (ROI 테스트 추가)

**Interfaces:**
- Consumes: Task 3의 `QuoteInput`, `QuoteResult`
- Produces: `computeQuote`가 `monthlySaving`, `paybackMonths`, `netSaving`을 채워 반환.

- [ ] **Step 1: ROI 테스트 추가**

`src/lib/calc.test.ts`에 describe 블록 추가:
```ts
describe("computeQuote ROI", () => {
  it("기본 가정(미팅20·30분·시급3만) 월절약액 300,000", () => {
    const r = computeQuote(base); // base from earlier
    // 월절약시간 = 20×30/60 = 10h ; 월절약액 = 10×30,000 = 300,000
    expect(r.monthlySaving).toBe(300000);
  });
  it("회수기간 = 하드웨어 ÷ 월절약액 (노트1대=269,000/300,000≈0.9개월)", () => {
    const r = computeQuote(base);
    expect(r.paybackMonths).toBeCloseTo(269000 / 300000, 2);
  });
  it("월절약액 0이면 회수기간 0(분모0 가드)", () => {
    const r = computeQuote({ ...base, roi: { meetingsPerMonth: 0, minutesPerNote: 30, hourlyWage: 30000 } });
    expect(r.monthlySaving).toBe(0);
    expect(r.paybackMonths).toBe(0);
  });
  it("순절약액 = 월절약액×기간개월 − TCO (1년)", () => {
    const r = computeQuote(base);
    expect(r.netSaving).toBe(300000 * 12 - 269000);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- calc`
Expected: ROI 테스트 FAIL (monthlySaving 0 반환 중).

- [ ] **Step 3: computeQuote ROI 부분 구현**

`src/lib/calc.ts`의 computeQuote에서 임시 0 부분을 교체:
```ts
  const { roi } = input;
  const monthlySavingHours = (roi.meetingsPerMonth * roi.minutesPerNote) / 60;
  const monthlySaving = monthlySavingHours * roi.hourlyWage;
  const paybackMonths = monthlySaving > 0 ? hardwareCost / monthlySaving : 0;
  const netSaving = monthlySaving * (years * 12) - tco;
  return { hardwareCost, subscriptionCost, tco, monthlySaving, paybackMonths, netSaving };
```
(기존 `return { ... monthlySaving: 0, ... }` 줄을 위로 대체.)

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- calc`
Expected: PASS (전체 8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/calc.ts src/lib/calc.test.ts
git commit -m "feat: add ROI calculation (saving, payback, net)"
```

---

### Task 5: 상태 훅 + 입력 패널 컴포넌트

**Files:**
- Create: `src/hooks/useQuote.ts`
- Create: `src/components/InputPanel.tsx`
- Modify: `src/App.tsx`
- Test: `src/hooks/useQuote.test.ts`

**Interfaces:**
- Consumes: `computeQuote`, `QuoteInput`, `QuoteResult` from `src/lib/calc.ts`; `PRICING` from pricing.ts
- Produces:
  ```ts
  export function useQuote(): {
    input: QuoteInput; result: QuoteResult;
    set: <K extends keyof QuoteInput>(k: K, v: QuoteInput[K]) => void;
    setRoi: (k: keyof QuoteInput["roi"], v: number) => void;
  };
  ```
  `InputPanel` 컴포넌트: props `{ input, set, setRoi }`.

- [ ] **Step 1: useQuote 훅 테스트 작성**

`src/hooks/useQuote.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuote } from "./useQuote";

describe("useQuote", () => {
  it("초기 result는 기본 입력으로 계산됨", () => {
    const { result } = renderHook(() => useQuote());
    expect(result.current.result.tco).toBeGreaterThan(0);
  });
  it("set으로 기기 수량 변경 시 result 재계산", () => {
    const { result } = renderHook(() => useQuote());
    act(() => result.current.set("devices", { note: 2, notePro: 0 }));
    expect(result.current.result.hardwareCost).toBe(538000);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- useQuote`
Expected: FAIL — useQuote 없음.

- [ ] **Step 3: useQuote 구현**

`src/hooks/useQuote.ts`:
```ts
import { useMemo, useState } from "react";
import { computeQuote, QuoteInput, QuoteResult } from "../lib/calc";
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- useQuote`
Expected: PASS (2 tests).

- [ ] **Step 5: InputPanel 컴포넌트 작성**

`src/components/InputPanel.tsx`:
```tsx
import { QuoteInput } from "../lib/calc";
import { PRICING } from "../data/pricing";

interface Props {
  input: QuoteInput;
  set: <K extends keyof QuoteInput>(k: K, v: QuoteInput[K]) => void;
  setRoi: (k: keyof QuoteInput["roi"], v: number) => void;
}

export function InputPanel({ input, set, setRoi }: Props) {
  return (
    <section className="space-y-6 p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
      <h2 className="text-lg font-bold">입력</h2>

      <div className="space-y-2">
        <label className="block text-sm">{PRICING.devices.note.label} 수량</label>
        <input type="number" min={0} value={input.devices.note}
          onChange={(e) => set("devices", { ...input.devices, note: Number(e.target.value) || 0 })}
          className="w-full px-3 py-2 rounded bg-black/30 border border-white/10" />
        <label className="block text-sm">{PRICING.devices.notePro.label} 수량</label>
        <input type="number" min={0} value={input.devices.notePro}
          onChange={(e) => set("devices", { ...input.devices, notePro: Number(e.target.value) || 0 })}
          className="w-full px-3 py-2 rounded bg-black/30 border border-white/10" />
      </div>

      <div className="space-y-2">
        <label className="block text-sm">구독 플랜</label>
        <select value={input.plan} onChange={(e) => set("plan", e.target.value as "starter" | "pro")}
          className="w-full px-3 py-2 rounded bg-black/30 border border-white/10">
          <option value="starter">{PRICING.plans.starter.label}</option>
          <option value="pro">{PRICING.plans.pro.label}</option>
        </select>
        <label className="block text-sm">사용자 수</label>
        <input type="number" min={1} value={input.users}
          onChange={(e) => set("users", Number(e.target.value) || 1)}
          className="w-full px-3 py-2 rounded bg-black/30 border border-white/10" />
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

      <fieldset className="space-y-3 border-t border-white/10 pt-4">
        <legend className="text-sm text-white/60">ROI 가정 (이 숫자는 가정입니다 — 조정 가능)</legend>
        {([
          ["meetingsPerMonth", "월 미팅 수", 0, 100],
          ["minutesPerNote", "회의록 작성시간(분)", 0, 120],
          ["hourlyWage", "시간당 인건비(원)", 0, 100000],
        ] as const).map(([key, label, min, max]) => (
          <div key={key}>
            <div className="flex justify-between text-sm">
              <span>{label}</span><span className="text-accent">{input.roi[key].toLocaleString()}</span>
            </div>
            <input type="range" min={min} max={max} value={input.roi[key]}
              onChange={(e) => setRoi(key, Number(e.target.value))} className="w-full accent-[#ff6a3d]" />
          </div>
        ))}
      </fieldset>
    </section>
  );
}
```

- [ ] **Step 6: App.tsx에 연결 + 수동 실행 확인**

`src/App.tsx`:
```tsx
import { useQuote } from "./hooks/useQuote";
import { InputPanel } from "./components/InputPanel";

export default function App() {
  const { input, result, set, setRoi } = useQuote();
  return (
    <main className="min-h-screen bg-ink text-white p-8 grid md:grid-cols-2 gap-8">
      <InputPanel input={input} set={set} setRoi={setRoi} />
      <pre className="text-xs opacity-60">{JSON.stringify(result, null, 2)}</pre>
    </main>
  );
}
```
Run: `npm run dev` → 브라우저에서 입력 변경 시 우측 JSON 실시간 갱신 확인.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add useQuote hook and InputPanel"
```

---

### Task 6: 결과 대시보드 + NumberTicker 카운트업

**Files:**
- Create: `src/components/NumberTicker.tsx`
- Create: `src/components/ResultDashboard.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/NumberTicker.test.tsx`

**Interfaces:**
- Consumes: `QuoteResult` from calc.ts; `won` from calc.ts; framer-motion
- Produces: `NumberTicker({ value, suffix })` 컴포넌트, `ResultDashboard({ result })` 컴포넌트.

- [ ] **Step 1: NumberTicker 테스트 작성**

`src/components/NumberTicker.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NumberTicker } from "./NumberTicker";

describe("NumberTicker", () => {
  it("최종값을 렌더한다", async () => {
    render(<NumberTicker value={269000} suffix="원" />);
    // 애니메이션 후 최종 텍스트에 269,000 포함
    expect(await screen.findByText(/269,000원/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- NumberTicker`
Expected: FAIL — NumberTicker 없음.

- [ ] **Step 3: NumberTicker 구현 (framer-motion 카운트업)**

`src/components/NumberTicker.tsx`:
```tsx
import { useEffect } from "react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";

export function NumberTicker({ value, suffix = "" }: { value: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("en-US") + suffix);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- NumberTicker`
Expected: PASS.

- [ ] **Step 5: ResultDashboard 작성**

`src/components/ResultDashboard.tsx`:
```tsx
import { motion } from "framer-motion";
import { QuoteResult } from "../lib/calc";
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
        단가 기준 2026-06 · 구독·무료한도는 추정 · ROI는 가정 기반 · 한국어 요약 품질 별도 검증 필요
      </p>
    </section>
  );
}
```

- [ ] **Step 6: App.tsx에서 JSON을 ResultDashboard로 교체**

`src/App.tsx`의 `<pre>` 줄을 교체:
```tsx
<ResultDashboard result={result} years={input.years} />
```
import 추가: `import { ResultDashboard } from "./components/ResultDashboard";`
Run: `npm run dev` → 입력 변경 시 큰 숫자가 카운트업·카드 stagger 등장 확인.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add ResultDashboard with NumberTicker count-up"
```

---

### Task 7: 차트 (ApexCharts) — TCO 막대 + 비용 구성 도넛

**Files:**
- Create: `src/components/TcoChart.tsx`
- Modify: `src/components/ResultDashboard.tsx`

**Interfaces:**
- Consumes: `QuoteResult`; `react-apexcharts`
- Produces: `TcoChart({ result })` 컴포넌트 (하드웨어 vs 구독 도넛 + 그라데이션).

- [ ] **Step 1: TcoChart 구현 (도넛 + 그라데이션)**

`src/components/TcoChart.tsx`:
```tsx
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { QuoteResult } from "../lib/calc";

export function TcoChart({ result }: { result: QuoteResult }) {
  const series = [result.hardwareCost, result.subscriptionCost];
  const options: ApexOptions = {
    labels: ["하드웨어(1회)", "구독(누적)"],
    colors: ["#ff6a3d", "#3da5ff"],
    fill: { type: "gradient" },
    legend: { labels: { colors: "#fff" }, position: "bottom" },
    dataLabels: { enabled: true, formatter: (_v, o) => (series[o.seriesIndex] || 0).toLocaleString() + "원" },
    plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: "TCO",
      formatter: () => result.tco.toLocaleString() + "원", color: "#fff" } } } } },
    stroke: { width: 0 },
    chart: { animations: { enabled: true, speed: 800 } },
  };
  return <Chart type="donut" series={series} options={options} height={320} />;
}
```

- [ ] **Step 2: PaybackGauge 구현 (ROI 회수기간 라디얼 게이지)**

`src/components/PaybackGauge.tsx`:
```tsx
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export function PaybackGauge({ paybackMonths }: { paybackMonths: number }) {
  // 회수기간을 36개월 대비 % 게이지로 표현(짧을수록 가득) — 0이면 0%
  const pct = paybackMonths > 0 ? Math.max(0, Math.min(100, (1 - paybackMonths / 36) * 100)) : 0;
  const options: ApexOptions = {
    labels: ["회수 진행도"],
    colors: ["#ff6a3d"],
    fill: { type: "gradient", gradient: { gradientToColors: ["#3da5ff"] } },
    plotOptions: { radialBar: { hollow: { size: "60%" },
      dataLabels: { name: { color: "#fff", offsetY: 24 },
        value: { color: "#fff", fontSize: "22px", offsetY: -8,
          formatter: () => (paybackMonths > 0 ? `${Math.round(paybackMonths * 10) / 10}개월` : "—") } } } },
    stroke: { lineCap: "round" },
    chart: { animations: { enabled: true, speed: 800 } },
  };
  return <Chart type="radialBar" series={[pct]} options={options} height={300} />;
}
```

- [ ] **Step 3: ResultDashboard에 차트 2종 삽입**

`src/components/ResultDashboard.tsx`의 푸터 `<p>` 위에 추가:
```tsx
<div className="grid md:grid-cols-2 gap-4">
  <div className={card}><TcoChart result={result} /></div>
  <div className={card}><PaybackGauge paybackMonths={result.paybackMonths} /></div>
</div>
```
import 추가:
```tsx
import { TcoChart } from "./TcoChart";
import { PaybackGauge } from "./PaybackGauge";
```

- [ ] **Step 4: 빌드 + 수동 확인**

Run: `npm run build`
Expected: 빌드 성공.
Run: `npm run dev` → 도넛(비용 구성, 중앙 TCO) + 라디얼 게이지(회수기간 N개월)가 그라데이션·애니메이션으로 그려지는지 확인.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add cost-breakdown donut and ROI payback gauge"
```

---

### Task 8: 시각 강화 (Aurora 히어로 + 3D 기기) + 인쇄

**Files:**
- Create: `src/components/Hero.tsx`
- Create: `src/components/AuroraBackground.tsx`
- Modify: `src/App.tsx`, `src/index.css`

**Interfaces:**
- Consumes: @react-three/fiber·drei (3D), framer-motion
- Produces: `Hero()` (Aurora 배경 + 3D 회전 형상 + 타이틀), 인쇄 스타일.

- [ ] **Step 1: AuroraBackground (CSS 그라데이션 애니)**

`src/components/AuroraBackground.tsx`:
```tsx
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/4 h-[60vh] w-[60vw] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #ff6a3d, transparent 60%)", animation: "drift 14s ease-in-out infinite" }} />
      <div className="absolute top-1/3 right-1/4 h-[50vh] w-[50vw] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, #3da5ff, transparent 60%)", animation: "drift 18s ease-in-out infinite reverse" }} />
    </div>
  );
}
```
`src/index.css`에 keyframes 추가:
```css
@keyframes drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.1); } }
@media print { .no-print { display: none !important; } body { background: #fff; color: #000; } }
```

- [ ] **Step 2: Hero (3D 회전 형상 — drei Float + 단순 지오메트리)**

`src/components/Hero.tsx`:
```tsx
import { Canvas } from "@react-three/fiber";
import { Float, RoundedBox, Environment } from "@react-three/drei";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <header className="relative grid md:grid-cols-2 items-center gap-6 mb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <h1 className="text-4xl font-black leading-tight">PLAUD AI 녹음기<br/>도입 견적</h1>
        <p className="mt-3 text-white/60">영업 미팅·통화를 AI 요약으로 — 도입 총비용과 회수기간을 즉시 산출</p>
      </motion.div>
      <div className="h-64 no-print">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 3]} />
          <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5}>
            <RoundedBox args={[1, 1.7, 0.25]} radius={0.08}>
              <meshStandardMaterial color="#ff6a3d" metalness={0.4} roughness={0.3} />
            </RoundedBox>
          </Float>
          <Environment preset="city" />
        </Canvas>
      </div>
    </header>
  );
}
```
(주: PLAUD 노트 형상을 단순 RoundedBox로 표현 — 실제 제품 3D 모델 소싱은 후속 개선. 현 단계는 "기기형 오브젝트가 떠서 회전".)

- [ ] **Step 3: App.tsx 조립 + 인쇄 버튼**

`src/App.tsx`:
```tsx
import { useQuote } from "./hooks/useQuote";
import { InputPanel } from "./components/InputPanel";
import { ResultDashboard } from "./components/ResultDashboard";
import { Hero } from "./components/Hero";
import { AuroraBackground } from "./components/AuroraBackground";

export default function App() {
  const { input, result, set, setRoi } = useQuote();
  return (
    <main className="min-h-screen bg-ink text-white p-8 max-w-6xl mx-auto">
      <AuroraBackground />
      <Hero />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="no-print"><InputPanel input={input} set={set} setRoi={setRoi} /></div>
        <ResultDashboard result={result} years={input.years} />
      </div>
      <button onClick={() => window.print()}
        className="no-print mt-8 px-5 py-2 rounded-lg bg-accent text-black font-semibold">🖨️ 인쇄 / PDF</button>
    </main>
  );
}
```

- [ ] **Step 4: 빌드 + 수동 확인**

Run: `npm run build`
Expected: 빌드 성공(3D·차트 포함).
Run: `npm run dev` → 히어로에 기기 오브젝트가 떠서 회전, Aurora 배경 흐름, 인쇄 시 입력패널·3D 숨김 확인.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Aurora hero with 3D floating device and print view"
```

---

### Task 9: 통합 검증 + GitHub Pages 배포 + 볼트 등록

**Files:**
- Create: `.gitignore`, `README.md`
- Modify: `00-meta/index.md`, `00-meta/log.md`

**Interfaces:**
- Consumes: 전체 앱
- Produces: 공개 URL, 볼트 등록.

- [ ] **Step 1: 전체 테스트 통과 확인**

Run: `npm test`
Expected: 전 테스트 PASS (pricing 4 + calc 8 + useQuote 2 + NumberTicker 1).

- [ ] **Step 2: .gitignore + README**

`.gitignore`:
```
node_modules/
dist/
.DS_Store
```
`README.md`: 앱 설명·단가는 pricing.ts만 수정·빌드/배포 명령·추정·ROI 가정 면책 1단락.

- [ ] **Step 3: 프로덕션 빌드 + 로컬 미리보기**

Run: `npm run build && npm run preview`
Expected: dist 생성, 미리보기에서 정상 동작.

- [ ] **Step 4: GitHub Pages 배포**

```bash
npm install -D gh-pages
# package.json scripts에 "deploy": "gh-pages -d dist" 추가
gh repo create plaud-calculator --public --source=. --remote=origin --push 2>&1 || git push -u origin main
npm run build && npm run deploy
gh api -X POST repos/:owner/plaud-calculator/pages -f "source[branch]=gh-pages" -f "source[path]=/" 2>&1 || true
```
Expected: gh-pages 브랜치에 dist 푸시, Pages 활성화.
검증: `curl -s -o /dev/null -w "%{http_code}" https://technoetic.github.io/plaud-calculator/` → 200 (전파 후).

- [ ] **Step 5: 볼트 등록**

`00-meta/index.md` 시스템 섹션에 1줄:
```
- `00-meta/scripts/plaud-calculator/` — PLAUD AI 녹음기 도입 견적 웹앱(TCO 1/3년+ROI 회수기간, React+시각최선 스택, GitHub Pages 배포). 단가는 src/data/pricing.ts만 수정. [[PLAUD 견적 웹앱 설계 스펙]]·[[PLAUD AI 녹음기 DHIS 도입 제안]]
```
`00-meta/log.md` 최상단에 1줄 요약(검증 수치·공개 URL 포함).

- [ ] **Step 6: Final Commit**

```bash
git add -A
git commit -m "chore: gitignore, README, deploy config"
git push
```

---

## 주의

- 이 디렉토리(`00-meta/scripts/plaud-calculator/`) 외부에 파일 생성 금지.
- 단가·요금제·ROI 기본값은 `src/data/pricing.ts`만 수정.
- 추정값(구독·무료한도)·ROI 가정·한국어 품질 미검증은 화면에 정직하게 표기.
- 3D 제품 모델은 현 계획에서 단순 형상(RoundedBox)으로 대체 — 실제 PLAUD 모델 소싱은 후속 개선 항목.
- B2B 신뢰감: 모션 duration < 1s·절제 이징 유지(게임풍 일탈 금지).
