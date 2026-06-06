import type { ViewMode } from "../types";

type Props = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

export function ViewTabs({ value, onChange }: Props) {
  const tabs: Array<{ id: ViewMode; label: string }> = [
    { id: "patient", label: "환자 관점" },
    { id: "operations", label: "병원 운영 관점" }
  ];

  return (
    <div className="glass grid grid-cols-2 rounded-xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`h-10 rounded-lg text-sm font-bold transition ${
            value === tab.id ? "bg-cyan/20 text-cyan" : "text-muted hover:text-ink"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
