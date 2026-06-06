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
    </section>
  );
}
