import type { Patient } from "../types";
import { examLabels } from "../data/hospital";
import { minutes } from "../lib/ui";

type Props = {
  patient: Patient | undefined;
  patients: Patient[];
  selectedPatientId: number;
  onSelect: (id: number) => void;
  onOpenDetail: () => void;
};

export function PatientRoutePanel({ patient, patients, selectedPatientId, onSelect, onOpenDetail }: Props) {
  return (
    <section className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">환자별 추천 경로</h2>
        <select
          value={selectedPatientId}
          onChange={(event) => onSelect(Number(event.target.value))}
          className="h-8 rounded-md border border-line bg-panel2 px-2 text-xs font-bold text-ink"
        >
          {patients.slice(0, 20).map((item) => (
            <option key={item.id} value={item.id}>
              #{item.id} {item.name}
            </option>
          ))}
        </select>
      </div>

      {patient && (
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-cyan/30 bg-cyan/10 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-cyan">선택 환자</p>
                <p className="mt-1 truncate text-xl font-bold text-ink">
                  #{patient.id} {patient.name}
                </p>
                <p className="mt-1 text-xs font-bold text-muted">{patient.age}세 · {patient.mode}</p>
              </div>
              <div className="rounded-lg border border-green/40 bg-green/10 px-3 py-2 text-right">
                <p className="text-xs font-bold text-muted">총 절감</p>
                <p className="text-lg font-bold text-green">{minutes(Math.max(0, patient.before.total - patient.after.total))}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenDetail}
              className="mt-3 h-9 w-full rounded-lg border border-cyan/40 bg-cyan/10 text-sm font-bold text-cyan hover:bg-cyan/20"
            >
              상세 근거 보기
            </button>
          </div>
          <RouteBox title="기존 고정 순서" order={patient.fixedOrder.map((exam) => examLabels[exam])} total={patient.before.total} tone="text-red" />
          <RouteBox title="AI 추천 순서" order={patient.aiOrder.map((exam) => examLabels[exam])} total={patient.after.total} tone="text-green" />
          <div className="grid grid-cols-2 gap-2">
            <MiniMetric label="대기 감소" value={minutes(Math.max(0, patient.before.waiting - patient.after.waiting))} />
            <MiniMetric label="이동 감소" value={minutes(Math.max(0, patient.before.walking - patient.after.walking))} />
          </div>
        </div>
      )}
    </section>
  );
}

function RouteBox({ title, order, total, tone }: { title: string; order: string[]; total: number; tone: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel2 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted">{title}</p>
        <p className={`text-sm font-bold ${tone}`}>{minutes(total)}</p>
      </div>
      <p className="mt-2 text-sm font-bold leading-6 text-ink">{order.join(" -> ")}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel2 p-3">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-cyan">{value}</p>
    </div>
  );
}
