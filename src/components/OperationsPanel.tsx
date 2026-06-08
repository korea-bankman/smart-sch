import { AlertTriangle, BarChart3, BellRing, Gauge, RotateCw, ShieldCheck } from "lucide-react";
import type { Metrics } from "../types";

type Props = {
  metrics: Metrics;
};

export function OperationsPanel({ metrics }: Props) {
  const alerts = [
    {
      title: `${metrics.busiestRoom.name} 병목 위험`,
      body: `${metrics.busiestRoom.queue}명 대기 중입니다. AI 재배치 권고가 필요합니다.`,
      severity: metrics.busiestRoom.queue >= 50 ? "critical" : "warning"
    },
    {
      title: "엘리베이터 지연 감지",
      body: `층간 이동 대기 ${metrics.elevatorQueue}명. 휠체어/고령자 우선 경로를 적용합니다.`,
      severity: metrics.elevatorQueue >= 20 ? "critical" : "info"
    },
    {
      title: "15분 후 혼잡 예측",
      body: `${metrics.bottleneckRooms.map((room) => room.name).join(", ")} 중심으로 대기열 증가가 예상됩니다.`,
      severity: "warning"
    }
  ];

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
      <div className="mt-4 rounded-xl border border-line bg-bg/50 p-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <BellRing className="h-4 w-4 text-cyan" />
            운영 알림센터
          </h3>
          <span className="rounded-md border border-yellow/40 bg-yellow/10 px-2 py-1 text-xs font-bold text-yellow">Live Alerts</span>
        </div>
        <div className="mt-3 grid gap-2">
          {alerts.map((alert) => (
            <article
              key={alert.title}
              className={`rounded-lg border p-3 ${
                alert.severity === "critical"
                  ? "border-red/50 bg-red/10"
                  : alert.severity === "warning"
                    ? "border-yellow/50 bg-yellow/10"
                    : "border-cyan/50 bg-cyan/10"
              }`}
            >
              <p className="text-sm font-bold text-ink">{alert.title}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-muted">{alert.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
