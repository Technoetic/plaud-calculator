# PLAUD 견적 웹앱

PLAUD AI 녹음기 도입의 **TCO(1년/3년)와 ROI(투자 회수기간)**를 입력 즉시 산출해 시각적으로 보여주는 웹앱입니다. 영업 담당 임원 시연·전달용.

## 기능

- 기기 구성(노트·노트Pro 수량) + 구독 플랜 + 기간 + VAT 입력 → 도입 총비용(TCO) 산출
- ROI 가정치(월 미팅 수·회의록 작성시간·시간당 인건비) 슬라이더 조절 → 월 절약액·투자 회수기간 산출
- 비용 구성 도넛 차트 + 회수기간 라디얼 게이지 + 큰 숫자 카운트업
- 인쇄 / PDF 저장(결과부만)

## 기술 스택

React 19 + Vite + TypeScript · Tailwind CSS · Framer Motion · ApexCharts · react-three-fiber(히어로 3D) · Vitest.

## 개발

```bash
npm install
npm run dev      # 로컬 개발 서버
npm test         # 단위 테스트 (pricing·calc·useQuote·NumberTicker)
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
npm run deploy   # dist/를 gh-pages 브랜치로 배포
```

## 단가 변경

단가·요금제·ROI 기본값은 **`src/data/pricing.ts` 한 파일만** 수정합니다. 계산 로직(`src/lib/calc.ts`)은 건드리지 않습니다.

기준: 2026-06 plaud.kr 검증. 노트 269,000원 / 노트 Pro 319,000원(정가, 확정).

## ⚠️ 추정·가정 표기

- **구독 요금·무료 한도(300분)는 추정** — 국내 동일 여부·원화 환산은 plaud.kr/파트너 견적으로 재확인 필요.
- **ROI는 가정 기반** — "회의록 수기작성 시간을 녹음→AI요약이 대체한다"는 가정의 절약액이며, 슬라이더로 조정 가능. 실제 효익은 현장 검증 필요.
- 한국어 AI 요약 품질은 별도 실측 검증 필요.

## 계산 규칙

- 하드웨어비(1회) = 노트수×269,000 + 노트Pro수×319,000
- 구독비 = 사용자수 × 플랜 연요금 × 기간(년)
- TCO = 하드웨어비 + 구독비 (VAT 토글 시 ×1.1)
- 월 절약액 = (월 미팅수 × 작성시간분 ÷ 60) × 시간당 인건비
- 회수기간(개월) = 하드웨어비 ÷ 월 절약액
