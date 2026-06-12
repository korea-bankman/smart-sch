import { AlertTriangle, Bot, Clapperboard, MonitorPlay, Play, RotateCcw, Shuffle, Users } from "lucide-react";
import type { Mode } from "../types";

type Props = {
  running: boolean;
  aiEnabled: boolean;
  emergency: boolean;
  demoActive: boolean;
  mode: Mode;
  onGenerate: () => void;
  onStart: () => void;
  onAi: () => void;
  onEmergency: () => void;
  onRandomQueue: () => void;
  onReset: () => void;
  onDemo: () => void;
  onPresentationMode: () => void;
  onMode: (mode: Mode) => void;
};

export function ControlDock(props: Props) {
  const modeGuide = {
    normal: {
      title: "일반 모드",
      body: "기본 보행 속도와 일반 엘리베이터 대기시간으로 동선을 계산합니다.",
      tone: "border-green/40 bg-green/10 text-green"
    },
    elderly: {
      title: "고령자 모드",
      body: "보행 속도를 늦게 잡고, 혼잡한 복도와 층간 이동 부담을 더 크게 반영합니다.",
      tone: "border-yellow/40 bg-yellow/10 text-yellow"
    },
    wheelchair: {
      title: "휠체어 모드",
      body: "엘리베이터 우선 경로에 긴 승강기 대기시간과 혼잡 회피 페널티를 추가합니다.",
      tone: "border-cyan/40 bg-cyan/10 text-cyan"
    }
  }[props.mode];

  const toolButtons = [
    { label: "환자 생성", icon: Users, onClick: props.onGenerate, active: false, title: "가상 환자 1000명 생성" },
    { label: props.running ? "시뮬레이션 정지" : "시뮬레이션 시작", icon: Play, onClick: props.onStart, active: props.running },
    { label: "AI", icon: Bot, onClick: props.onAi, active: props.aiEnabled, title: "AI 최적화 적용" },
    { label: "응급", icon: AlertTriangle, onClick: props.onEmergency, active: props.emergency, title: "응급환자 발생" },
    { label: "대기열", icon: Shuffle, onClick: props.onRandomQueue, active: false, title: "대기열 랜덤 변화" },
    { label: "리셋", icon: RotateCcw, onClick: props.onReset, active: false, title: "결과 리셋" }
  ];

  return (
    <section className="glass rounded-xl p-3">
      <div className="grid gap-3 xl:grid-cols-[1.25fr_1.5fr_1fr] xl:items-stretch">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <button
            type="button"
            onClick={props.onPresentationMode}
            className="flex min-h-[82px] items-center justify-center gap-3 rounded-xl border border-yellow/50 bg-yellow/15 px-4 text-left text-yellow transition hover:bg-yellow/20"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-bg/60">
              <MonitorPlay className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-base font-bold">Presentation Mode</span>
              <span className="mt-1 block text-xs font-semibold text-muted">발표 후 KPI 화면 자동 복귀</span>
            </span>
          </button>
          <button
            type="button"
            onClick={props.onDemo}
            className={`flex min-h-[82px] items-center justify-center gap-3 rounded-xl border px-4 text-left transition ${
              props.demoActive ? "border-green bg-green/15 text-green" : "border-cyan/50 bg-cyan/15 text-cyan hover:bg-cyan/20"
            }`}
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-bg/60">
              <Clapperboard className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-base font-bold">Demo Mode</span>
              <span className="mt-1 block text-xs font-semibold text-muted">병목 발생부터 AI 재배치까지 자동 실행</span>
            </span>
          </button>
        </div>

        <div className="rounded-xl border border-line bg-panel2 p-2">
          <div className="mb-2 px-1 text-xs font-bold text-muted">시뮬레이션 제어</div>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {toolButtons.map((button) => {
              const Icon = button.icon;
              return (
                <button
                  key={button.title ?? button.label}
                  type="button"
                  title={button.title ?? button.label}
                  onClick={button.onClick}
                  className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-bold transition ${
                    button.active ? "border-cyan bg-cyan/15 text-cyan" : "border-line bg-bg text-muted hover:border-cyan hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {button.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-panel2 p-2">
          <div className="mb-2 px-1 text-xs font-bold text-muted">환자 특수모드</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(["normal", "elderly", "wheelchair"] as Mode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => props.onMode(mode)}
                className={`h-10 rounded-lg border text-xs font-bold ${
                  props.mode === mode ? "border-green bg-green/15 text-green" : "border-line bg-bg text-muted hover:text-ink"
                }`}
              >
                {mode === "normal" ? "일반" : mode === "elderly" ? "고령자" : "휠체어"}
              </button>
            ))}
          </div>
          <div className={`mt-2 rounded-lg border px-2 py-1.5 ${modeGuide.tone}`}>
            <p className="truncate text-xs font-bold">{modeGuide.title}</p>
          </div>
        </div>
      </div>
      <details className="mt-2 rounded-lg border border-line bg-panel2 px-3 py-2">
        <summary className="cursor-pointer text-xs font-bold text-muted">선택 모드 계산 규칙</summary>
        <p className="mt-2 text-xs font-semibold leading-5 text-muted">{modeGuide.body}</p>
      </details>
    </section>
  );
}
