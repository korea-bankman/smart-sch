import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Metrics } from "../types";

type Props = {
  metrics: Metrics;
};

export function ComparisonCharts({ metrics }: Props) {
  const beforeAfter = [
    { name: "대기시간", Before: metrics.beforeWaiting, After: metrics.averageWaiting },
    { name: "이동시간", Before: metrics.beforeWalking, After: metrics.averageWalking },
    { name: "체류시간", Before: metrics.beforeStay, After: metrics.averageStay }
  ];
  const effect = [
    { name: "혼잡도 분산 Before", value: metrics.queueVarianceBefore, color: "#ff5b5b" },
    { name: "혼잡도 분산 After", value: metrics.queueVarianceAfter, color: "#35d07f" },
    { name: "예상 민원 감소율", value: metrics.complaintReduction, color: "#28d3ff" }
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="glass rounded-xl p-4">
        <h2 className="text-sm font-bold text-ink">Before / After 비교</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <BarChart data={beforeAfter} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#243247" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#8fa2ba", fontSize: 12 }} />
              <YAxis tick={{ fill: "#8fa2ba", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#0d1421", border: "1px solid #243247", color: "#e7eef8" }} />
              <Bar dataKey="Before" fill="#ff5b5b" radius={[5, 5, 0, 0]} />
              <Bar dataKey="After" fill="#35d07f" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass rounded-xl p-4">
        <h2 className="text-sm font-bold text-ink">운영 효과 지표</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <BarChart data={effect} layout="vertical" margin={{ top: 10, right: 12, left: 22, bottom: 0 }}>
              <CartesianGrid stroke="#243247" strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: "#8fa2ba", fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#8fa2ba", fontSize: 12 }} width={120} />
              <Tooltip contentStyle={{ background: "#0d1421", border: "1px solid #243247", color: "#e7eef8" }} />
              <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                {effect.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
