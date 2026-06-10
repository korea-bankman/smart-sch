import type { ExamId, Patient } from "../types";

export function hasSameExamOrder(left: ExamId[], right: ExamId[]) {
  return left.length === right.length && left.every((exam, index) => exam === right[index]);
}

export function getPatientRouteInsight(patient: Patient) {
  const sameOrder = hasSameExamOrder(patient.fixedOrder, patient.aiOrder);
  const rawSavedWaiting = Math.max(0, patient.before.waiting - patient.after.waiting);
  const rawSavedWalking = Math.max(0, patient.before.walking - patient.after.walking);
  const rawSavedTotal = Math.max(0, patient.before.total - patient.after.total);

  return {
    sameOrder,
    displayAfterTotal: sameOrder ? patient.before.total : patient.after.total,
    displayAfterWaiting: sameOrder ? patient.before.waiting : patient.after.waiting,
    displayAfterWalking: sameOrder ? patient.before.walking : patient.after.walking,
    savedWaiting: sameOrder ? 0 : rawSavedWaiting,
    savedWalking: sameOrder ? 0 : rawSavedWalking,
    savedTotal: sameOrder ? 0 : rawSavedTotal,
    statusLabel: sameOrder ? "기존 순서 유지" : "AI 순서 재배치",
    summary: sameOrder
      ? "검사 순서를 바꿔도 추가 절감이 크지 않아 기존 순서를 유지했습니다. 전체 KPI의 개선율은 병원 운영 단위의 대기열 완화 효과입니다."
      : "혼잡 검사실은 뒤로 미루고, 이동/대기/검사시간의 합이 가장 낮은 순서를 선택했습니다."
  };
}
