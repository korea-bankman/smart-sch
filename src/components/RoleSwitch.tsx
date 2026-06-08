import { Building2, MonitorCog, Smartphone } from "lucide-react";
import type { AudienceMode } from "../types";

type Props = {
  value: AudienceMode;
  onChange: (value: AudienceMode) => void;
};

const modes: Array<{ id: AudienceMode; label: string; icon: typeof MonitorCog }> = [
  {
    id: "simulation",
    label: "시뮬레이션",
    icon: MonitorCog
  },
  {
    id: "staff",
    label: "직원용 관제",
    icon: Building2
  },
  {
    id: "patient",
    label: "환자용 안내",
    icon: Smartphone
  }
];

export function RoleSwitch({ value, onChange }: Props) {
  return (
    <div className="inline-flex w-full rounded-xl border border-line bg-panel2 p-1 xl:w-auto">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const active = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition xl:flex-none ${
              active ? "bg-cyan/15 text-cyan shadow-[0_0_0_1px_rgba(40,211,255,0.25)]" : "text-muted hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
