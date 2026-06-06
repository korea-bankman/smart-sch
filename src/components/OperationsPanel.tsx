import { AlertTriangle, BarChart3, Gauge, RotateCw, ShieldCheck } from "lucide-react";
import type { Metrics } from "../types";

type Props = {
  metrics: Metrics;
};

export function OperationsPanel({ metrics }: Props) {
  const items = [
    { label: "검사실 활용도", value: `${metrics.utilizationAfter.toFixed(1)}%`, sub: `기존 ${metrics.utilizationBefore.toFixed(1)}%`, icon: Gauge, tone: "text-cyan" },
    { label: "병목 검사실", value: metrics.bottleneckRooms.map((room) => room.name).join(", "), sub: "상위 3개 혼잡 지점", icon: AlertTriangle, tone: "text-red" },
    { label: "평균 회전율", value: `${metrics.averageTurnover.toFixed(1)}건/시`, sub: "검사실별 시간당 처리량", icon: RotateCw, tone: "text-green" },
    { label: "혼잡도 분산 효과", value: `${Math.max(0, metrics.queueVarianceBefore - metrics.queueVarianceAfter).toFixed(1)}`, sub: `${metrics.queueVarianceBefore.toFixed(1)} → ${metrics.queueVarianceAfter.toFixed(1)}`, icon: BarChart3, tone: "text-yellow" },
    { label: "예상 민원 감소율", value: `${metrics.complaintReduction.toFixed(1)}%`, sub: "체류/대기시간 개선 기반", icon: ShieldCheck, tone: "text-green" }
  ];

  return (
    <section className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">병원 운영 관점</h2>
        <span className="rounded-md border border-cyan/40 bg-cyan/10 px-2 py-1 text-xs font-bold text-cyan">Executive View</span>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-lg border border-line bg-panel2 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-muted">{item.label}</p>
                  <p className="mt-1 truncate text-lg font-bold text-ink">{item.value}</p>
                  <p className="mt-1 text-xs font-bold text-muted">{item.sub}</p>
                </div>
                <Icon className={`h-5 w-5 shrink-0 ${item.tone}`} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
