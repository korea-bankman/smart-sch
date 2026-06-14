import { Activity, Clock, Gauge, GitBranch, ShieldCheck, TimerReset, TrendingDown, Users, Workflow } from "lucide-react";
import type { Metrics } from "../types";
import { minutes } from "../lib/ui";

type Props = {
  metrics: Metrics;
};

export function KpiGrid({ metrics }: Props) {
  const cards = [
    { label: "현재 환자 수", value: `${metrics.currentPatients.toLocaleString()}명`, sub: "시뮬레이션 규모", icon: Users, tone: "text-cyan" },
    { label: "AI 적용 전 평균 체류시간", value: minutes(metrics.beforeStay), sub: "고정 검사 순서", icon: Clock, tone: "text-red" },
    { label: "AI 적용 후 평균 체류시간", value: minutes(metrics.averageStay), sub: "최적 추천 순서", icon: Activity, tone: "text-green" },
    { label: "체류시간 감소율", value: `${metrics.reductionRate.toFixed(1)}%`, sub: "Before 대비", icon: TrendingDown, tone: "text-green" },
    { label: "평균 대기시간 감소율", value: `${metrics.waitingReductionRate.toFixed(1)}%`, sub: `${minutes(metrics.beforeWaiting)} → ${minutes(metrics.averageWaiting)}`, icon: ShieldCheck, tone: "text-cyan" },
    { label: "AI 재배치 환자", value: `${metrics.patientsReassigned.toLocaleString()}명`, sub: `전체 ${metrics.reassignmentRate.toFixed(1)}% 경로 변경`, icon: GitBranch, tone: "text-cyan" },
    { label: "장기대기 위험 감소", value: `${metrics.riskReductionRate.toFixed(1)}%`, sub: `${metrics.riskPatientsBefore}명 → ${metrics.riskPatientsAfter}명`, icon: TimerReset, tone: "text-green" },
    { label: "검사실 처리효율 증가", value: `${metrics.throughputGain.toFixed(1)}%`, sub: `활용도 ${metrics.utilizationBefore.toFixed(1)}% → ${metrics.utilizationAfter.toFixed(1)}%`, icon: Gauge, tone: "text-yellow" },
    { label: "병목 완화율", value: `${metrics.bottleneckReliefRate.toFixed(1)}%`, sub: `혼잡 균형점수 ${metrics.queueBalanceScore.toFixed(0)}/100`, icon: Workflow, tone: "text-green" },
    { label: "예상 민원 감소율", value: `${metrics.complaintReduction.toFixed(1)}%`, sub: "대기/체류 개선 기반", icon: ShieldCheck, tone: "text-green" }
  ];

  return (
    <section className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className="glass rounded-xl p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-bold text-muted sm:text-xs">{card.label}</span>
              <Icon className={`h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${card.tone}`} />
            </div>
            <p className="mt-2 truncate text-lg font-black text-ink sm:text-xl">{card.value}</p>
            <p className="mt-0.5 truncate text-[11px] font-bold text-muted sm:text-xs">{card.sub}</p>
          </article>
        );
      })}
    </section>
  );
}
