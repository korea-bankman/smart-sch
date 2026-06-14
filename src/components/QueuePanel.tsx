import type { Room } from "../types";
import { congestionColor, congestionLabel } from "../lib/ui";

type Props = {
  rooms: Room[];
};

export function QueuePanel({ rooms }: Props) {
  const examRooms = rooms.filter((room) => room.type === "exam").sort((a, b) => b.queue - a.queue);
  const topRooms = examRooms.slice(0, 3);
  const totalQueue = examRooms.reduce((sum, room) => sum + room.queue, 0);

  return (
    <section className="glass rounded-xl p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">검사실별 대기열</h2>
        <span className="rounded-md border border-line bg-panel2 px-2 py-1 text-xs font-bold text-muted">총 {totalQueue}명</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {topRooms.map((room) => (
          <article key={room.id} className="rounded-lg border border-line bg-panel2 p-2.5">
            <p className="truncate text-xs font-bold text-muted">{room.name}</p>
            <p className="mt-1.5 text-lg font-bold" style={{ color: congestionColor(room.queue) }}>{room.queue}</p>
            <p className="mt-1 text-xs font-bold text-muted">{congestionLabel(room.queue)}</p>
          </article>
        ))}
      </div>
      <div className="mt-3 grid gap-1.5">
        {examRooms.map((room) => (
          <div key={room.id} className="rounded-lg border border-line bg-panel2 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full" style={{ background: congestionColor(room.queue) }} />
                  <p className="truncate text-sm font-bold text-ink">{room.name}</p>
                </div>
                <p className="mt-0.5 text-[11px] font-bold text-muted">{room.floor}층 · 평균 {room.examMinutes}분 · {congestionLabel(room.queue)}</p>
              </div>
              <p className="text-base font-bold" style={{ color: congestionColor(room.queue) }}>{room.queue}</p>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-bg">
              <div className="h-1 rounded-full" style={{ width: `${Math.min(100, room.queue * 2.3)}%`, background: congestionColor(room.queue) }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
