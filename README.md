# AI 기반 병원 디지털 트윈 환자 동선 최적화 시스템

의료AI 공모전 제출용 프론트엔드 단독 MVP입니다.

후수납 병원 환경에서 환자가 병원에 도착하면 자동 체크인되고, 당일 검사 목록과 검사실별 실시간 대기열을 기반으로 총 체류시간이 가장 짧아지는 검사 순서를 추천하는 웹 기반 시뮬레이터입니다.

이 프로젝트는 실제 병원 시스템 연동 버전이 아니라, 공모전 발표와 기술 검증을 위한 mock data 기반 프로토타입입니다. 실제 LLM은 사용하지 않으며, 규칙 기반 Queue Optimization Engine으로 동작합니다.

## 핵심 기능

- 3D 병원 디지털 트윈
- 1층/2층 중심 병원 공간 시각화
- 검사실 위치, 엘리베이터 코어, 복도 안내선, 검사실 입구 표시
- 채혈실, 영상의학센터 등 주요 검사실 혼잡도 Heatmap
- 환자 1000명 시뮬레이션
- 대표 환자 아바타 이동 애니메이션
- 기존 고정 검사 순서와 AI 추천 순서 비교
- 직원용 운영 관제 화면
- 환자용 모바일 안내 화면
- 고령자 모드, 휠체어 모드, 응급환자 모드
- Before/After KPI 대시보드
- Presentation Mode 자동 발표 시연
- 자동 결과 보고서 패널

## 문제 정의

후수납 병원에서는 환자가 여러 검사실을 직접 이동합니다. 병원이 정한 고정 검사 순서대로 이동하면 특정 검사실에 환자가 몰리고, 대기시간과 체류시간이 증가합니다.

이 MVP는 검사실별 대기인원, 평균 검사시간, 위치 좌표, 환자 검사 목록을 이용해 환자별 검사 순서를 재계산합니다.

## AI 최적화 방식

실제 LLM은 사용하지 않습니다.

환자별 남은 검사 목록에 대해 가능한 검사 순서를 비교하고, 아래 목표 함수가 가장 낮은 순서를 추천합니다.

```text
Total Time = Walking Time + Waiting Time + Exam Time
```

계산 요소:

- 검사실 현재 대기인원
- 검사실 평균 검사시간
- 검사실 위치 및 층 정보
- 환자 현재 위치
- 층간 이동 및 엘리베이터 대기
- 고령자/휠체어 이동 가중치

Before 모델은 고정 검사 순서로 병목에 진입하는 상황을 가정합니다.

After 모델은 AI가 혼잡 검사실 진입을 늦추고, 대기가 짧은 검사부터 진행하도록 재배치하는 상황을 가정합니다.

## 화면 구성

### 1. 시뮬레이션 화면

- 3D 병원 디지털 트윈
- 현재 환자 수
- 평균 대기시간
- 평균 체류시간
- 체류시간 감소율
- 검사실 활용도 증가율
- 예상 민원 감소율
- 검사실별 대기열
- 환자별 추천 경로
- Before/After 비교 차트

### 2. 직원용 화면

- 검사실 혼잡순위
- 60분/120분 이상 장기대기 환자 수
- 선택 환자 검색
- AI 추천 경로 승인
- AI 권고 사유
- 병목 검사실, 선시행 권고 검사실, 예상 절감 효과 표시

### 3. 환자용 화면

- 다음 검사 안내
- 현재 위치
- 예상 도착 시간
- 예상 체류시간
- 이동시간
- 절감 시간
- 엘리베이터/접근성 안내
- 보호자 공유
- 도착 확인

### 4. Presentation Mode

공모전 발표용 자동 시연 모드입니다.

버튼 클릭 후 다음 흐름이 자동으로 재생됩니다.

```text
병원 혼잡
-> 직원 감지
-> AI 최적화
-> 환자 안내
-> 3D 이동
-> 운영 개선
-> 최종 요약
```

Presentation Mode 종료 후에는 KPI 대시보드로 자동 복귀합니다.

## 기술 스택

- React
- TypeScript
- Vite
- Tailwind CSS
- Three.js
- React Three Fiber
- Drei
- Recharts
- lucide-react

백엔드는 없습니다. 모든 데이터는 프론트엔드 mock data로 실행됩니다.

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
      patientInsights.ts
      simulation.ts
      ui.ts
    components/
      CinematicDemo.tsx
      DigitalTwin.tsx
      ControlDock.tsx
      KpiGrid.tsx
      StaffModeScreen.tsx
      PatientModeScreen.tsx
      PatientCompanionPanel.tsx
      QueuePanel.tsx
      OperationsPanel.tsx
      PatientRoutePanel.tsx
      PatientDetailModal.tsx
      ReportPanel.tsx
      ComparisonCharts.tsx
      DemoEventOverlay.tsx
      RoleSwitch.tsx
      ViewTabs.tsx
```

## 실행 방법

### 1. 프로젝트 폴더로 이동

```bash
cd hospital-ai-frontend-mvp
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:5173
```

또는

```text
http://localhost:5173
```

## 빌드 방법

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

빌드 결과물을 로컬에서 미리 확인하려면 아래 명령어를 실행합니다.

```bash
npm run preview
```

기본 preview 주소:

```text
http://127.0.0.1:4174
```

## 발표 시연 추천 순서

1. 메인 화면에서 KPI 대시보드와 3D 병원 디지털 트윈을 보여줍니다.
2. `Presentation Mode`를 실행해 문제 상황부터 AI 개입, 환자 안내, 운영 개선까지 자동 시연합니다.
3. 직원용 화면으로 이동해 AI 권고 사유와 병목 검사실 판단을 설명합니다.
4. 환자용 화면으로 이동해 실제 환자가 받는 검사 안내와 접근성 지원을 보여줍니다.
5. 다시 시뮬레이션 화면으로 돌아와 Before/After KPI와 자동 결과 보고서를 설명합니다.

## 데이터 및 한계

- 모든 환자, 검사실, 대기열 데이터는 mock data입니다.
- 실제 EMR, OCS, PACS, 병원 키오스크, BLE Beacon, WiFi 시스템과 연동하지 않습니다.
- 본 MVP는 공모전 발표용 프로토타입이며, 실제 병원 도입 시에는 병원별 공간 데이터, 검사실 처리량, 개인정보 보호, 시스템 연동 검증이 필요합니다.
- 표시되는 감소율과 체류시간은 시뮬레이션 가정에 따른 데모 결과입니다.

## 확장 가능성

- 실제 병원 예약/접수 시스템 연동
- BLE/WiFi 기반 실시간 위치 추정
- 검사실별 실시간 대기열 API 연동
- 환자군별 이동성 모델 고도화
- 30분 후 혼잡도 예측 모델
- 직원용 권고 승인/거절 로그 분석
- 병원 운영 정책별 what-if 시뮬레이션

## 제출 참고

공모전 제출 시에는 아래 항목을 함께 제출하는 것을 권장합니다.

- 프로젝트 소스 코드 전체
- `README.md`
- 빌드 결과물 `dist/`
- 발표용 보고서 또는 요약 PDF
- 실행 화면 캡처 이미지

