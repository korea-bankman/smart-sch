import type { Room } from "../types";
import { congestionColor, congestionLabel } from "../lib/ui";

type Props = {
  rooms: Room[];
};

export function QueuePanel({ rooms }: Props) {
  const examRooms = rooms.filter((room) => room.type === "exam").sort((a, b) => b.queue - a.queue);

  return (
    <section className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">검사실별 대기열</h2>
        <span className="text-xs font-bold text-muted">실시간 mock data</span>
      </div>
      <div className="mt-4 grid gap-3">
        {examRooms.map((room) => (
          <div key={room.id} className="rounded-lg border border-line bg-panel2 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <i className="h-3 w-3 rounded-full" style={{ background: congestionColor(room.queue) }} />
                  <p className="truncate text-sm font-bold text-ink">{room.name}</p>
                </div>
                <p className="mt-1 text-xs font-bold text-muted">{room.floor}층 · 평균 {room.examMinutes}분 · {congestionLabel(room.queue)}</p>
              </div>
              <p className="text-xl font-bold" style={{ color: congestionColor(room.queue) }}>{room.queue}명</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-bg">
              <div className="h-2 rounded-full" style={{ width: `${Math.min(100, room.queue * 2.3)}%`, background: congestionColor(room.queue) }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
