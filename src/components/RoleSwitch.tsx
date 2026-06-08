import { Building2, MonitorCog, Smartphone } from "lucide-react";
import type { AudienceMode } from "../types";

type Props = {
  value: AudienceMode;
  onChange: (value: AudienceMode) => void;
};

const modes: Array<{ id: AudienceMode; label: string; description: string; icon: typeof MonitorCog }> = [
  {
    id: "simulation",
    label: "시뮬레이션",
    description: "공모전 발표자가 전체 효과를 설명하는 통합 화면",
    icon: MonitorCog
  },
  {
    id: "staff",
    label: "직원용 관제",
    description: "검사실 혼잡도, 병목, 운영 KPI 중심",
    icon: Building2
  },
  {
    id: "patient",
    label: "환자용 안내",
    description: "내 검사 순서, 예상 시간, 다음 이동 안내 중심",
    icon: Smartphone
  }
];

export function RoleSwitch({ value, onChange }: Props) {
  return (
    <section className="glass rounded-xl p-3">
      <div className="grid gap-2 lg:grid-cols-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const active = value === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={`flex min-h-[72px] items-center gap-3 rounded-lg border p-3 text-left transition ${
                active ? "border-cyan bg-cyan/15 text-ink" : "border-line bg-panel2 text-muted hover:border-cyan hover:text-ink"
              }`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${active ? "bg-cyan/20 text-cyan" : "bg-bg text-muted"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold">{mode.label}</span>
                <span className="mt-1 block text-xs font-semibold leading-5 text-muted">{mode.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
