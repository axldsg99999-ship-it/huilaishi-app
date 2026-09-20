// Use the scene's active-time clock, never a wall-clock timeout.
export const ANSWER_DWELL = Object.freeze({ correct: 700, wrong: 2400, ending: 1400 });

export class AutoNext {
  pending = null;

  clear() { this.pending = null; }

  arm(battle) {
    this.clear();
    if (battle?.phase !== 'resolved' || !battle.last) return;
    this.pending = {
      battle, round: battle.round, result: battle.last,
      remaining: Math.max(battle.last.correct ? ANSWER_DWELL.correct : ANSWER_DWELL.wrong,
        battle.outcome ? ANSWER_DWELL.ending : 0),
    };
  }

  tick(dt, battle, blocked = false) {
    const pending = this.pending;
    if (!pending) return false;
    if (battle !== pending.battle || battle.phase !== 'resolved' ||
        battle.round !== pending.round || battle.last !== pending.result) {
      this.clear();
      return false;
    }
    if (blocked || battle.paused || !Number.isFinite(dt) || dt <= 0) return false;
    pending.remaining -= dt;
    if (pending.remaining > 0) return false;
    this.clear(); // Consume before advancing: no duplicate rounds or rewards.
    return true;
  }
}
