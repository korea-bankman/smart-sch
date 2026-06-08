import { AlertTriangle, Bot, Clapperboard, Play, RotateCcw, Shuffle, Users } from "lucide-react";
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

  const buttons = [
    { label: "환자 1000명 생성", icon: Users, onClick: props.onGenerate, active: false },
    { label: props.running ? "시뮬레이션 정지" : "시뮬레이션 시작", icon: Play, onClick: props.onStart, active: props.running },
    { label: "AI 최적화 적용", icon: Bot, onClick: props.onAi, active: props.aiEnabled },
    { label: "응급환자 발생", icon: AlertTriangle, onClick: props.onEmergency, active: props.emergency },
    { label: "대기열 랜덤 변화", icon: Shuffle, onClick: props.onRandomQueue, active: false },
    { label: "Demo Mode", icon: Clapperboard, onClick: props.onDemo, active: props.demoActive },
    { label: "결과 리셋", icon: RotateCcw, onClick: props.onReset, active: false }
  ];

  return (
    <section className="glass rounded-xl p-3">
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-7">
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.label}
              type="button"
              onClick={button.onClick}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                button.active ? "border-cyan bg-cyan/15 text-cyan" : "border-line bg-panel2 text-muted hover:border-cyan hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              {button.label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {(["normal", "elderly", "wheelchair"] as Mode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => props.onMode(mode)}
            className={`h-9 rounded-lg border text-sm font-bold ${
              props.mode === mode ? "border-green bg-green/15 text-green" : "border-line bg-panel2 text-muted"
            }`}
          >
            {mode === "normal" ? "일반 모드" : mode === "elderly" ? "고령자 모드" : "휠체어 모드"}
          </button>
        ))}
      </div>
      <div className={`mt-3 rounded-lg border px-3 py-2 ${modeGuide.tone}`}>
        <p className="text-sm font-bold">{modeGuide.title} 계산 규칙</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-muted">{modeGuide.body}</p>
      </div>
    </section>
  );
}
