# AI 기반 병원 디지털 트윈 환자 동선 최적화 시스템

프론트엔드 단독 공모전 발표용 MVP입니다. 모든 데이터는 mock data이며 백엔드는 없습니다.

## 프로젝트 구조

```text
hospital-ai-frontend-mvp/
  package.json
  index.html
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  tsconfig.json
  public/
    floors/
      floor_1f.png
      floor_2f.png
  src/
    main.tsx
    App.tsx
    index.css
    types.ts
    data/
      hospital.ts
    lib/
      optimizer.ts
      simulation.ts
      ui.ts
    components/
      DigitalTwin.tsx
      KpiGrid.tsx
      ControlDock.tsx
      QueuePanel.tsx
      PatientRoutePanel.tsx
      ComparisonCharts.tsx
```

## 구현 기능

- 1층, 2층, 3층 3D 병원 플레이트
- 검사실 박스, 이름 라벨, 엘리베이터/계단 코어
- 혼잡도 히트맵: 초록 0~10명, 노랑 11~25명, 빨강 26명 이상
- 환자 100명 자동 생성
- 환자별 검사 2~4개 랜덤 배정
- 기존 고정 순서와 AI 추천 순서 비교
- Queue Optimization Engine
- 고령자 모드, 휠체어 모드, 응급환자 모드
- Before/After Recharts 시각화

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 다음 주소를 엽니다.

```text
http://localhost:5173
```

## 빌드

```bash
npm run build
npm run preview
```

## AI 최적화 알고리즘

실제 LLM은 사용하지 않습니다. 환자 검사 목록의 가능한 순열을 계산하고, 아래 목표 함수가 가장 작은 순서를 선택합니다.

```text
Total Time = Walking Time + Waiting Time + Exam Time
```

고령자 모드는 이동시간 가중치를 높이고, 휠체어 모드는 층간 이동에서 엘리베이터 경로를 우선합니다.
