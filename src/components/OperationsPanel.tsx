import { AlertTriangle, BarChart3, BellRing, Gauge, GitBranch, RotateCw, ShieldCheck, TimerReset, UsersRound, Workflow } from "lucide-react";
import type { Metrics } from "../types";

type Props = {
  metrics: Metrics;
  variant?: "default" | "compact";
};

export function OperationsPanel({ metrics, variant = "default" }: Props) {
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
    },
    {
      title: "장기대기 위험군 모니터링",
      body: `120분 이상 체류 위험군이 ${metrics.riskPatientsBefore}명에서 ${metrics.riskPatientsAfter}명으로 감소했습니다.`,
      severity: metrics.riskPatientsAfter >= 50 ? "warning" : "info"
    }
  ];

  const items = [
    { label: "검사실 활용도", value: `${metrics.utilizationAfter.toFixed(1)}%`, sub: `기존 ${metrics.utilizationBefore.toFixed(1)}% · 효율 +${metrics.throughputGain.toFixed(1)}%`, icon: Gauge, tone: "text-cyan" },
    { label: "병목 검사실", value: metrics.bottleneckRooms.map((room) => room.name).join(", "), sub: "상위 3개 혼잡 지점", icon: AlertTriangle, tone: "text-red" },
    { label: "평균 회전율", value: `${metrics.averageTurnover.toFixed(1)}건/시`, sub: "검사실별 시간당 처리량", icon: RotateCw, tone: "text-green" },
    { label: "AI 재배치율", value: `${metrics.reassignmentRate.toFixed(1)}%`, sub: `${metrics.patientsReassigned.toLocaleString()}명 추천 순서 변경`, icon: GitBranch, tone: "text-cyan" },
    { label: "병목 완화율", value: `${metrics.bottleneckReliefRate.toFixed(1)}%`, sub: "최대 대기열 집중 완화", icon: Workflow, tone: "text-green" },
    { label: "장기대기 위험 감소", value: `${metrics.riskReductionRate.toFixed(1)}%`, sub: `${metrics.riskPatientsBefore}명 → ${metrics.riskPatientsAfter}명`, icon: TimerReset, tone: "text-green" },
    { label: "혼잡 균형 점수", value: `${metrics.queueBalanceScore.toFixed(0)}/100`, sub: `분산 ${metrics.queueVarianceBefore.toFixed(1)} → ${metrics.queueVarianceAfter.toFixed(1)}`, icon: BarChart3, tone: "text-yellow" },
    { label: "접근성 이동 부담", value: `${metrics.accessibilityDelay.toFixed(1)}분`, sub: "고령자·휠체어 추가 이동 부담", icon: UsersRound, tone: "text-cyan" },
    { label: "예상 민원 감소율", value: `${metrics.complaintReduction.toFixed(1)}%`, sub: "체류/대기시간 개선 기반", icon: ShieldCheck, tone: "text-green" }
  ];
  const visibleItems = variant === "compact"
    ? items.filter((item) => ["검사실 활용도", "AI 재배치율", "병목 완화율", "장기대기 위험 감소", "혼잡 균형 점수", "예상 민원 감소율"].includes(item.label))
    : items;
  const visibleAlerts = variant === "compact" ? alerts.slice(0, 2) : alerts;

  return (
    <section className={`glass rounded-xl ${variant === "compact" ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">병원 운영 관점</h2>
        <span className="rounded-md border border-cyan/40 bg-cyan/10 px-2 py-1 text-xs font-bold text-cyan">Executive View</span>
      </div>
      <div className={`mt-3 grid gap-2 ${variant === "compact" ? "" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-lg border border-line bg-panel2 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-muted">{item.label}</p>
                  <p className={`${variant === "compact" ? "mt-0.5 text-base" : "mt-1 text-lg"} truncate font-bold text-ink`}>{item.value}</p>
                  <p className="mt-1 text-xs font-bold text-muted">{item.sub}</p>
                </div>
                <Icon className={`h-5 w-5 shrink-0 ${item.tone}`} />
              </div>
            </article>
          );
        })}
      </div>
      <div className={`${variant === "compact" ? "mt-3" : "mt-4"} rounded-xl border border-line bg-bg/50 p-3`}>
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <BellRing className="h-4 w-4 text-cyan" />
            운영 알림센터
          </h3>
          <span className="rounded-md border border-yellow/40 bg-yellow/10 px-2 py-1 text-xs font-bold text-yellow">Live Alerts</span>
        </div>
        <div className="mt-3 grid gap-2">
          {visibleAlerts.map((alert) => (
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
