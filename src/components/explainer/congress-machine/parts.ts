import * as k from "@/components/iso/iso-kit";
import type { Plan } from "@/components/iso/iso-kit";
import type { ProvinceMachine } from "./model";
import { BAR_REST, COIN_H, COIN_R, COLUMN_HALF, COLUMN_Y, COLUMN_Z, P, TRAY_H, TRAY_Y, TRAY_Z, columnX, levelOf } from "./view";

const columnPlan = (x: number): Plan => ({ x: x - COLUMN_HALF, y: COLUMN_Y - COLUMN_HALF, w: COLUMN_HALF * 2, d: COLUMN_HALF * 2, r: 1.5 });
// Notches closer than this to the socket would sit inside its bevel.
const LOWEST_NOTCH = 1.2;

export type ColumnPart = ReturnType<typeof partsOf>["columns"][number];

export function partsOf(province: ProvinceMachine) {
  const columns = province.columns.map((column, index) => {
    const plan = columnPlan(columnX(index));
    const ring = k.ringOf(plan, 4);
    const top = levelOf(column.share);
    const notches = Array.from({ length: column.seats + 1 }, (_, at) => at + 2)
      .map((divisor) => ({ divisor, z: levelOf(column.share / divisor) }))
      .filter(({ z }) => z - COLUMN_Z > LOWEST_NOTCH)
      .map(({ divisor, z }) => ({ divisor, d: k.ringSeam(ring, z, P) }));
    return {
      ...column,
      body: k.slabOf(plan, COLUMN_Z, top - COLUMN_Z, P, 4, 0.6),
      notches,
      collar: column.excluded ? k.slabOf(k.insetPlan(plan, -1.4), top - 1.6, 1.6, P, 4, 0.3) : null,
    };
  });
  const stacked = province.columns.map(() => 0);
  const coins = province.awards
    .map((award, index) => {
      const height = stacked[award.column]++;
      return { index, column: award.column, height, paths: k.cylinder(columnX(award.column), TRAY_Y, COIN_R, TRAY_Z + TRAY_H + height * COIN_H, COIN_H, P, 28, 0.25) };
    })
    .sort((a, b) => a.column - b.column || a.height - b.height);
  const levels = [BAR_REST, ...province.awards.map((award) => levelOf(award.share))];
  return { columns, coins, levels };
}
