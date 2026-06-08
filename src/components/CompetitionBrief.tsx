import { BadgeCheck, BrainCircuit, ClipboardList, PlayCircle } from "lucide-react";

type Props = {
  demoStep: string;
  demoStage: number;
  demoActive: boolean;
};

const demoStages = [
  "환자 1000명 생성",
  "채혈실 병목 발생",
  "AI 자동 개입",
  "환자 재배치",
  "KPI 개선 결과"
];

export function CompetitionBrief({ demoStep, demoStage, demoActive }: Props) {
  const items = [
    {
      icon: ClipboardList,
      title: "문제 정의",
      body: "후수납 병원에서 환자는 여러 검사실을 직접 이동하며, 고정 순서 때문에 대기와 혼잡이 누적됩니다."
    },
    {
      icon: BrainCircuit,
      title: "AI 개입 지점",
      body: "검사실 대기열, 위치, 평균 검사시간을 이용해 Total Time이 가장 낮은 검사 순서를 재계산합니다."
    },
    {
      icon: PlayCircle,
      title: "시연 방법",
      body: "Demo Mode를 누르면 1000명 생성, 채혈실 병목, AI 개입, 환자 재배치, KPI 개선이 자동 진행됩니다."
    },
    {
      icon: BadgeCheck,
      title: "제출 포인트",
      body: "3D 디지털 트윈, 환자 시뮬레이션, 혼잡도 Heatmap, Before/After KPI를 한 화면에서 검증합니다."
    }
  ];

  return (
    <section className="glass rounded-xl p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-cyan">Competition Judge Guide</p>
          <h2 className="mt-1 text-lg font-bold text-ink">심사위원이 바로 이해하는 발표용 데모 흐름</h2>
        </div>
        <div className="rounded-lg border border-green/40 bg-green/10 px-3 py-2 text-sm font-bold text-green">
          {demoStep || "대기 중: Demo Mode를 누르면 자동 시연이 시작됩니다"}
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {demoStages.map((stage, index) => {
          const stageNumber = index + 1;
          const active = demoActive && demoStage === stageNumber;
          const completed = demoStage > stageNumber || (!demoActive && demoStage >= demoStages.length);
          return (
            <div
              key={stage}
              className={`rounded-lg border p-3 ${
                active
                  ? "border-cyan bg-cyan/15"
                  : completed
                    ? "border-green/50 bg-green/10"
                    : "border-line bg-panel2"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${active ? "text-cyan" : completed ? "text-green" : "text-muted"}`}>STEP {stageNumber}</span>
                <span className={`h-2 w-2 rounded-full ${active ? "bg-cyan" : completed ? "bg-green" : "bg-muted/40"}`} />
              </div>
              <p className="mt-2 text-xs font-bold leading-5 text-ink">{stage}</p>
              {active && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg"><div className="demo-progress h-full rounded-full bg-cyan" /></div>}
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-lg border border-line bg-panel2 p-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-cyan" />
                <h3 className="text-sm font-bold text-ink">{item.title}</h3>
              </div>
              <p className="mt-2 text-xs font-semibold leading-5 text-muted">{item.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
