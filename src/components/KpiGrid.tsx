import { Activity, AlertTriangle, Clock, Gauge, ShieldCheck, TrendingDown, Users } from "lucide-react";
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
    { label: "검사실 활용도 증가율", value: `${metrics.utilizationIncreaseRate.toFixed(1)}%`, sub: `${metrics.utilizationBefore.toFixed(1)}% → ${metrics.utilizationAfter.toFixed(1)}%`, icon: Gauge, tone: "text-yellow" },
    { label: "예상 민원 감소율", value: `${metrics.complaintReduction.toFixed(1)}%`, sub: "대기/체류 개선 기반", icon: ShieldCheck, tone: "text-green" },
    { label: "최혼잡 검사실", value: metrics.busiestRoom.name, sub: `${metrics.busiestRoom.queue}명 대기`, icon: AlertTriangle, tone: "text-red" }
  ];

  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4 2xl:grid-cols-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted">{card.label}</span>
              <Icon className={`h-5 w-5 ${card.tone}`} />
            </div>
            <p className="mt-3 truncate text-xl font-bold text-ink">{card.value}</p>
            <p className="mt-1 truncate text-xs font-bold text-muted">{card.sub}</p>
          </article>
        );
      })}
    </section>
  );
}
