import { ClipboardCopy, Download, FileText } from "lucide-react";
import type { Metrics } from "../types";
import { minutes } from "../lib/ui";

type Props = {
  metrics: Metrics;
  demoStep: string;
};

export function ReportPanel({ metrics, demoStep }: Props) {
  const reportText = [
    "AI 기반 병원 디지털 트윈 환자 동선 최적화 시스템 결과 보고서",
    "",
    `AI 적용 전 평균 체류시간: ${minutes(metrics.beforeStay)}`,
    `AI 적용 후 평균 체류시간: ${minutes(metrics.averageStay)}`,
    `체류시간 감소율: ${metrics.reductionRate.toFixed(1)}%`,
    `평균 대기시간 감소율: ${metrics.waitingReductionRate.toFixed(1)}%`,
    `검사실 활용도 향상: ${metrics.utilizationIncreaseRate.toFixed(1)}%`,
    `예상 민원 감소율: ${metrics.complaintReduction.toFixed(1)}%`,
    `현재 병목 검사실: ${metrics.busiestRoom.name} (${metrics.busiestRoom.queue}명 대기)`,
    "",
    "요약: AI는 검사실 대기열, 위치, 평균 검사시간을 기반으로 총 체류시간이 가장 낮은 검사 순서를 추천합니다."
  ].join("\n");

  async function copyReport() {
    await navigator.clipboard.writeText(reportText);
  }

  function downloadReport() {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "smart-sch-ai-result-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <FileText className="h-4 w-4 text-cyan" />
          자동 결과 보고서
        </h2>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-bold text-muted md:inline">{demoStep || "실시간 계산"}</span>
          <button
            type="button"
            onClick={copyReport}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-panel2 px-2 text-xs font-bold text-muted hover:border-cyan hover:text-cyan"
          >
            <ClipboardCopy className="h-3.5 w-3.5" />
            복사
          </button>
          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-cyan/40 bg-cyan/10 px-2 text-xs font-bold text-cyan hover:bg-cyan/20"
          >
            <Download className="h-3.5 w-3.5" />
            TXT
          </button>
        </div>
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
