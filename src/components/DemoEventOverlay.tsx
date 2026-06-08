import { Activity, AlertTriangle, BrainCircuit, CheckCircle2, Users } from "lucide-react";
import type { Metrics } from "../types";

type Props = {
  active: boolean;
  stage: number;
  metrics: Metrics;
};

const events = [
  {
    title: "환자 유입 감지",
    body: "오늘 검사 예약 환자 1000명을 디지털 트윈에 배치합니다.",
    icon: Users,
    tone: "border-cyan/50 bg-cyan/15 text-cyan"
  },
  {
    title: "채혈실 병목 발생",
    body: "채혈실 대기열이 급증해 고정 순서 동선의 체류시간이 증가합니다.",
    icon: AlertTriangle,
    tone: "border-red/50 bg-red/15 text-red"
  },
  {
    title: "AI 경로 재계산",
    body: "대기열, 위치, 검사시간을 재평가해 환자별 추천 순서를 갱신합니다.",
    icon: BrainCircuit,
    tone: "border-cyan/50 bg-cyan/15 text-cyan"
  },
  {
    title: "환자 동선 재배치",
    body: "혼잡 검사실 집중을 낮추고 여유 검사실로 흐름을 분산합니다.",
    icon: Activity,
    tone: "border-yellow/50 bg-yellow/15 text-yellow"
  },
  {
    title: "운영 KPI 개선",
    body: "평균 체류시간, 대기시간, 병목 집중도가 개선된 결과를 산출합니다.",
    icon: CheckCircle2,
    tone: "border-green/50 bg-green/15 text-green"
  }
];

export function DemoEventOverlay({ active, stage, metrics }: Props) {
  if (!active || stage < 1) return null;
  const event = events[Math.min(stage - 1, events.length - 1)];
  const Icon = event.icon;
  const isResult = stage >= 5;

  return (
    <div className="pointer-events-none absolute inset-x-4 top-16 z-30 flex justify-center">
      <div className={`demo-event-overlay w-full ${isResult ? "max-w-2xl" : "max-w-xl"} rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl ${event.tone}`}>
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-bg/70">
            <Icon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide opacity-90">Demo Event {stage}/5</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">{event.title}</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-muted">{event.body}</p>
          </div>
        </div>
        {isResult && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ResultMetric label="체류시간 감소" value={`${metrics.reductionRate.toFixed(1)}%`} />
            <ResultMetric label="대기시간 감소" value={`${metrics.waitingReductionRate.toFixed(1)}%`} />
            <ResultMetric label="민원 감소 예측" value={`${metrics.complaintReduction.toFixed(1)}%`} />
          </div>
        )}
      </div>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-green/30 bg-bg/65 p-3 text-center">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-green">{value}</p>
    </div>
  );
}
