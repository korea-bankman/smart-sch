import { FileText } from "lucide-react";
import type { Metrics } from "../types";
import { minutes } from "../lib/ui";

type Props = {
  metrics: Metrics;
  demoStep: string;
};

export function ReportPanel({ metrics, demoStep }: Props) {
  return (
    <section className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <FileText className="h-4 w-4 text-cyan" />
          자동 결과 보고서
        </h2>
        <span className="text-xs font-bold text-muted">{demoStep || "실시간 계산"}</span>
      </div>
      <div className="mt-4 rounded-lg border border-line bg-panel2 p-4 text-sm leading-7 text-ink">
        <p>
          AI 적용 전 평균 체류시간은 <b className="text-red">{minutes(metrics.beforeStay)}</b>이며,
          AI 적용 후 평균 체류시간은 <b className="text-green">{minutes(metrics.averageStay)}</b>입니다.
        </p>
        <p>
          전체 체류시간은 <b className="text-green">{metrics.reductionRate.toFixed(1)}%</b> 감소했고,
          평균 대기시간은 <b className="text-cyan">{metrics.waitingReductionRate.toFixed(1)}%</b> 감소했습니다.
        </p>
        <p>
          검사실 활용도는 <b className="text-yellow">{metrics.utilizationIncreaseRate.toFixed(1)}%</b> 향상되었고,
          예상 민원은 <b className="text-green">{metrics.complaintReduction.toFixed(1)}%</b> 감소할 것으로 예측됩니다.
        </p>
        <p>
          현재 병목 검사실은 <b className="text-red">{metrics.busiestRoom.name}</b>이며,
          AI는 환자 검사 순서를 재계산해 병목 집중을 완화합니다.
        </p>
      </div>
    </section>
  );
}
