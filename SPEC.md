---
title: "PLAUD 견적 웹앱 설계 스펙"
type: project
domain: dhis
status: approved
ai_priority: medium
tags: [spec, plaud, calculator, webapp, tool, ax]
related:
  - "[[PLAUD AI 녹음기 DHIS 도입 제안]]"
  - "[[네이버웍스 견적 계산기 설계 스펙]]"
  - "[[webapp-coding-principles]]"
project: DHIS-AX
created: 2026-06-19
updated: 2026-06-19
---

# PLAUD 견적 웹앱 — 설계 스펙

## 1. 목적과 범위

**무엇:** 영업 담당 부사장에게 **시연·전달**할 PLAUD AI 녹음기 도입 견적 웹앱. 기기 구성·구독·기간·ROI 가정을 입력하면 **TCO(1년/3년)와 ROI(회수기간)**를 즉석 산출하고, 시각적으로 인상적인 결과 대시보드로 보여준다.

**사용 주체:** 우리(컨설팅) 내부 + 부사장 시연. 근거: [[PLAUD AI 녹음기 DHIS 도입 제안]].

**핵심 결정 (확정):**
- 계산 초점: **도입 총비용(TCO) 1년/3년** + **ROI(절약시간×인건비→회수기간)**.
- 입력: 기기 구성 + 구독 + 기간 + ROI 가정치(슬라이더, 사용자 조절).
- 시각: **절대 최대 화려함**(2026-06-19 사용자 명시 "서버·빌드 OK, 시각적으로 무조건 최선"). [[webapp-coding-principles]] §6.
- 배포: 정적 빌드 → GitHub Pages(technoetic.github.io), 네이버웍스 계산기 선례.

**비범위 (YAGNI):**
- 저장/불러오기·시나리오 비교·서버 전송·다국어.
- 노트핀 S(가격 미확정)·부가옵션(아카이빙 등 단가 미확정) — 미포함.

## 2. 기술 스택 (시각 최선 — 13에이전트 평가 후 확정)

| 레이어 | 선택 | 역할 |
|---|---|---|
| 프레임워크/빌드 | React + Vite + TypeScript | SPA 토대, 정적 빌드 |
| 화려 컴포넌트 | Aceternity UI + Magic UI | Aurora 배경·Spotlight·BentoGrid·NumberTicker·Meteors |
| 모션 | Framer Motion (+GSAP ScrollTrigger 보조) | layout 애니·스프링·시네마틱 스크롤 |
| 차트 | visx (커스텀) / ApexCharts 폴백 | TCO 막대·ROI 손익분기 발광 마커 |
| 3D | react-three-fiber / Three.js | 히어로에 PLAUD 녹음기 3D 회전 |
| 스타일/UI | Tailwind CSS + shadcn/ui | 세련 컴포넌트·B2B 글래스 톤 |
| 액센트 | Lottie (1컷) | 회수기간 도달 시네마틱 모먼트 |

**분리 원칙([[webapp-coding-principles]]):** 데이터(pricing) / 계산(순수 함수·클래스) / UI(컴포넌트) / 스타일 분리. 계산 로직은 DOM·React 무관 순수 모듈로 단독 테스트 가능.

## 3. 데이터 모델 (pricing — 단가 변경 시 이 파일만 수정)

```ts
// 출처: PLAUD AI 녹음기 DHIS 도입 제안 (2026-06 plaud.kr 검증)
const PLAUD_PRICING = {
  asOf: "2026-06",
  vatRate: 0.10,
  devices: {
    note:    { label: "PLAUD 노트 64GB",     price: 269000 },  // 확정(정가)
    notePro: { label: "PLAUD 노트 Pro 64GB", price: 319000 },  // 확정(정가)
  },
  plans: {
    starter: { label: "Starter(무료)", yearly: 0,      minutes: 300,  estimated: true },  // ⚠️국내 동일여부 추정
    pro:     { label: "Pro",           yearly: 105000, minutes: 1200, estimated: true },  // ⚠️추정: $6.6/월×12≈$79, 환율 ₩1,330/$ 가정 → 약 105,000원. 환율·정책 변동 시 갱신
  },
  roiDefaults: { meetingsPerMonth: 20, minutesPerNote: 30, hourlyWage: 30000 }, // 가정치 기본값(조절가능)
};
```

**정직성 (네이버웍스 Lite 경고 선례):**
- `estimated: true` 항목은 화면에 ⚠️ "추정" 배지.
- ROI 가정치는 "이 숫자는 가정입니다" 명시 + 슬라이더 조절.
- 한국어 요약 품질 미검증 → 푸터 주석.

## 4. 계산 규칙 (순수 함수)

**입력:** `{ devices:{note,notePro}, plan, users, years(1|3), vatIncluded, roi:{meetingsPerMonth,minutesPerNote,hourlyWage} }`

**TCO (확정 데이터):**
1. 하드웨어비(1회) = note수×269,000 + notePro수×319,000
2. 연 구독비 = users × plan.yearly
3. TCO = 하드웨어비 + 연구독비 × years
4. VAT 토글 시 × (1+vatRate)

**ROI (가정 기반):**
5. 월 절약시간(h) = meetingsPerMonth × minutesPerNote ÷ 60
6. 월 절약액 = 월 절약시간 × hourlyWage
7. 회수기간(개월) = 하드웨어비 ÷ 월 절약액
8. 누적 절약액(기간) = 월 절약액 × (years×12) − TCO

**반환:** `{ hardwareCost, subscriptionCost, tco, monthlySaving, paybackMonths, netSaving, breakdown }`

## 5. UI / 화면 구성

**레이아웃:** 히어로(3D 기기+Aurora) → 입력 패널(좌) / 결과 대시보드(우) → 스크롤 시 TCO·ROI 섹션 시네마틱 reveal.

**입력부:** 기기 수량 스테퍼, 구독 플랜 선택, 기간 탭(1년/3년), VAT 토글, ROI 가정 슬라이더 3종.

**결과부(입력 변경 시 즉시·모션):**
- 큰 숫자 3종(총비용/월절약액/회수기간) — NumberTicker 카운트업.
- TCO 막대(1년 vs 3년, 하드웨어 vs 구독).
- ROI 라디얼 게이지 + 손익분기 차트(누적절약−TCO 교차점 발광).
- 분해표 + ⚠️ 추정 배지 + 푸터 주석.

**시그니처 모먼트:** ① 3D 기기 회전+Aurora ② NumberTicker+Spotlight ③ BentoGrid+발광 손익분기 ④ 스크롤 시네마틱 reveal.

**인쇄/PDF:** 결과부만 깔끔 출력(@media print 또는 전용 뷰).

## 6. 검증 방법

- 계산 순수 모듈 단위 테스트:
  - 노트 1대 무료구독 1년 → TCO=269,000(VAT별도) / 회수기간 = 269,000 ÷ 월절약액.
  - 기본 ROI(미팅20·30분·3만원) → 월절약액 = 20×0.5×30,000 = 300,000 → 회수기간 ≈ 0.9개월.
  - VAT 토글 ×1.1 검증.
- 빌드: `npm run build` → dist 정적 산출 → 로컬 미리보기 → GitHub Pages 배포.

## 7. 배포

Vite base 설정(프로젝트 페이지) → `npm run build` → dist를 gh-pages(또는 Actions). 100% 정적, 서버 불필요. 네이버웍스 계산기와 동일 호스팅 패턴.

## 8. 위치

`00-meta/scripts/plaud-calculator/` (소스). 빌드 산출물 dist는 배포 전용. 볼트는 코드 리포 아님 → 도구는 이 경로에만.
