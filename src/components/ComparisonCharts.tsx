import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Metrics } from "../types";

type Props = {
  metrics: Metrics;
};

export function ComparisonCharts({ metrics }: Props) {
  const beforeAfter = [
    { name: "대기시간", Before: metrics.beforeWaiting, After: metrics.averageWaiting, saved: Math.max(0, metrics.beforeWaiting - metrics.averageWaiting) },
    { name: "이동시간", Before: metrics.beforeWalking, After: metrics.averageWalking, saved: Math.max(0, metrics.beforeWalking - metrics.averageWalking) },
    { name: "체류시간", Before: metrics.beforeStay, After: metrics.averageStay, saved: Math.max(0, metrics.beforeStay - metrics.averageStay) }
  ];
  const timeSummary = [
    { label: "체류 절감", value: `${Math.max(0, metrics.beforeStay - metrics.averageStay).toFixed(1)}분`, tone: "text-green" },
    { label: "대기 절감", value: `${Math.max(0, metrics.beforeWaiting - metrics.averageWaiting).toFixed(1)}분`, tone: "text-cyan" },
    { label: "감소율", value: `${metrics.reductionRate.toFixed(1)}%`, tone: "text-green" }
  ];
  const effect = [
    { name: "체류 감소", value: metrics.reductionRate, color: "#31c995" },
    { name: "대기 감소", value: metrics.waitingReductionRate, color: "#2f67b2" },
    { name: "병목 완화", value: metrics.bottleneckReliefRate, color: "#f0c94a" },
    { name: "장기대기 위험 감소", value: metrics.riskReductionRate, color: "#31c995" },
    { name: "민원 감소 예측", value: metrics.complaintReduction, color: "#8ab4ff" },
    { name: "처리효율 증가", value: metrics.throughputGain, color: "#a78bfa" }
  ];
  const operationSummary = [
    { label: "재배치", value: `${metrics.patientsReassigned.toLocaleString()}명` },
    { label: "위험군", value: `${metrics.riskPatientsBefore}→${metrics.riskPatientsAfter}명` },
    { label: "균형점수", value: `${metrics.queueBalanceScore.toFixed(0)}/100` }
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink">시간 지표 Before / After</h2>
            <p className="mt-1 text-xs font-semibold text-muted">고정 검사 순서 대비 AI 추천 순서의 평균 시간 변화</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {timeSummary.map((item) => (
              <div key={item.label} className="rounded-lg border border-line bg-panel2 px-2 py-1.5 text-center">
                <p className="text-[10px] font-bold text-muted">{item.label}</p>
                <p className={`text-xs font-black ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <BarChart data={beforeAfter} margin={{ top: 18, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#274569" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#9bb1cf", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9bb1cf", fontSize: 12 }} tickFormatter={(value) => `${value}분`} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}분`, ""]} contentStyle={{ background: "#0b1b34", border: "1px solid #274569", color: "#f2f7ff" }} />
              <Bar dataKey="Before" fill="#ef6363" radius={[6, 6, 0, 0]} barSize={22}>
                <LabelList dataKey="Before" position="top" formatter={(value: number) => `${value.toFixed(0)}분`} fill="#f2f7ff" fontSize={10} fontWeight={800} />
              </Bar>
              <Bar dataKey="After" fill="#31c995" radius={[6, 6, 0, 0]} barSize={22}>
                <LabelList dataKey="After" position="top" formatter={(value: number) => `${value.toFixed(0)}분`} fill="#f2f7ff" fontSize={10} fontWeight={800} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {beforeAfter.map((item) => (
            <div key={item.name} className="rounded-lg border border-green/30 bg-green/10 px-3 py-2">
              <p className="text-[10px] font-bold text-muted">{item.name} 절감</p>
              <p className="mt-1 text-sm font-black text-green">{item.saved.toFixed(1)}분</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink">운영성과지표</h2>
            <p className="mt-1 text-xs font-semibold text-muted">AI 개입 후 병원 운영 관점의 개선율</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {operationSummary.map((item) => (
              <div key={item.label} className="rounded-lg border border-line bg-panel2 px-2 py-1.5 text-center">
                <p className="text-[10px] font-bold text-muted">{item.label}</p>
                <p className="text-xs font-black text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <BarChart data={effect} layout="vertical" margin={{ top: 6, right: 30, left: 38, bottom: 0 }}>
              <CartesianGrid stroke="#274569" strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, "dataMax + 8"]} tick={{ fill: "#9bb1cf", fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9bb1cf", fontSize: 12 }} width={112} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "개선율"]} contentStyle={{ background: "#0b1b34", border: "1px solid #274569", color: "#f2f7ff" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                {effect.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                <LabelList dataKey="value" position="right" formatter={(value: number) => `${value.toFixed(1)}%`} fill="#f2f7ff" fontSize={11} fontWeight={800} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
