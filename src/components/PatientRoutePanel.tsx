import type { Patient } from "../types";
import { examLabels } from "../data/hospital";
import { getPatientRouteInsight } from "../lib/patientInsights";
import { minutes } from "../lib/ui";

type Props = {
  patient: Patient | undefined;
  patients: Patient[];
  selectedPatientId: number;
  aiEnabled: boolean;
  onSelect: (id: number) => void;
  onOpenDetail: () => void;
};

export function PatientRoutePanel({ patient, patients, selectedPatientId, aiEnabled, onSelect, onOpenDetail }: Props) {
  const insight = patient ? getPatientRouteInsight(patient) : undefined;
  const activeSavedTotal = aiEnabled ? (insight?.savedTotal ?? 0) : 0;
  const activeSavedWaiting = aiEnabled ? (insight?.savedWaiting ?? 0) : 0;
  const activeSavedWalking = aiEnabled ? (insight?.savedWalking ?? 0) : 0;
  const activeAfterTotal = aiEnabled ? (insight?.displayAfterTotal ?? patient?.after.total ?? 0) : (patient?.before.total ?? 0);

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
                <p className="text-xs font-bold text-muted">{aiEnabled ? "총 절감" : "AI 미적용"}</p>
                <p className={`text-lg font-bold ${aiEnabled ? "text-green" : "text-muted"}`}>{minutes(activeSavedTotal)}</p>
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
          <RouteBox title={aiEnabled ? "AI 추천 순서" : "AI 추천 순서 (비활성)"} order={patient.aiOrder.map((exam) => examLabels[exam])} total={activeAfterTotal} tone={aiEnabled ? "text-green" : "text-muted"} />
          {(!aiEnabled || insight?.sameOrder) && (
            <div className={`rounded-lg border p-3 ${aiEnabled ? "border-cyan/30 bg-cyan/10" : "border-line bg-panel2"}`}>
              <p className={`text-xs font-bold ${aiEnabled ? "text-cyan" : "text-muted"}`}>{aiEnabled ? insight?.statusLabel : "AI 최적화가 꺼져 있어 기존 고정 순서 기준으로 표시합니다."}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-muted">
                {aiEnabled
                  ? "이 환자는 검사 순서가 같으므로 개인 경로 절감은 0분으로 표시합니다. 전체 개선율은 운영 단위의 대기열 완화 효과입니다."
                  : "AI 버튼을 다시 누르면 실시간 대기열 기반 추천 순서와 절감 시간이 활성화됩니다."}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <MiniMetric label="대기 감소" value={minutes(activeSavedWaiting)} />
            <MiniMetric label="이동 감소" value={minutes(activeSavedWalking)} />
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
