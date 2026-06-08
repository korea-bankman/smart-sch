import { X } from "lucide-react";
import type { Patient } from "../types";
import { examLabels } from "../data/hospital";
import { minutes } from "../lib/ui";

type Props = {
  patient: Patient | undefined;
  open: boolean;
  onClose: () => void;
};

export function PatientDetailModal({ patient, open, onClose }: Props) {
  if (!open || !patient) return null;

  const savedWaiting = Math.max(0, patient.before.waiting - patient.after.waiting);
  const savedWalking = Math.max(0, patient.before.walking - patient.after.walking);
  const savedTotal = Math.max(0, patient.before.total - patient.after.total);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <section className="glass w-full max-w-4xl rounded-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-cyan">Patient Explainability</p>
            <h2 className="mt-1 text-xl font-bold text-ink">
              #{patient.id} {patient.name} 환자 AI 추천 근거
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-panel2 text-muted hover:border-cyan hover:text-ink"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-3">
            <InfoCard label="환자 특성" value={`${patient.age}세 · ${modeLabel(patient.mode)}`} />
            <InfoCard label="당일 검사 목록" value={patient.exams.map((exam) => examLabels[exam]).join(", ")} />
            <InfoCard label="AI 판단 요약" value="혼잡 검사실은 뒤로 미루고, 이동/대기/검사시간의 합이 가장 낮은 순서를 선택했습니다." />
          </div>

          <div className="grid gap-3">
            <RouteCompare title="기존 고정 순서" order={patient.fixedOrder.map((exam) => examLabels[exam])} total={patient.before.total} tone="text-red" />
            <RouteCompare title="AI 추천 순서" order={patient.aiOrder.map((exam) => examLabels[exam])} total={patient.after.total} tone="text-green" />
            <div className="grid grid-cols-3 gap-3">
              <Metric label="대기 절감" value={minutes(savedWaiting)} />
              <Metric label="이동 절감" value={minutes(savedWalking)} />
              <Metric label="총 절감" value={minutes(savedTotal)} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function modeLabel(mode: Patient["mode"]) {
  if (mode === "elderly") return "고령자 모드";
  if (mode === "wheelchair") return "휠체어 모드";
  return "일반 모드";
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel2 p-4">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-ink">{value}</p>
    </div>
  );
}

function RouteCompare({ title, order, total, tone }: { title: string; order: string[]; total: number; tone: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel2 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-muted">{title}</p>
        <p className={`text-sm font-bold ${tone}`}>{minutes(total)}</p>
      </div>
      <p className="mt-2 text-base font-bold leading-7 text-ink">{order.join(" → ")}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg p-4">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-2 text-lg font-bold text-cyan">{value}</p>
    </div>
  );
}
