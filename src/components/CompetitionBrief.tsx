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
  return (
    <section className="glass rounded-xl p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-cyan">Digital Twin Control Scenario</p>
          <h2 className="mt-1 text-lg font-bold text-ink">AI 환자 동선 최적화 운영 흐름</h2>
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
    </section>
  );
}
