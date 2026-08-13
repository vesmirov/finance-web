import type { Plan } from '../api/types';
import { slotHex } from '../lib/palette';
import type { StructBase } from '../lib/ui';

interface StructureProps {
  plan: Plan;
  base: StructBase;
  onBase: (base: StructBase) => void;
}

interface Segment {
  name: string;
  hex: string;
  pc: string;
  width: string;
}

// Purely presentational math on top of the plan's precomputed numbers: parseFloat
// is used only for strip widths and legend labels, never for money.
function num(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function buildLegend(plan: Plan, base: StructBase): Segment[] {
  const expenseCats = plan.categories.filter((c) => c.kind === 'expense' && num(c.total) > 0);
  const expT = num(plan.expenses_total);
  if (base === 'exp') {
    return expenseCats.map((c) => {
      const pc = expT > 0 ? ((num(c.total) / expT) * 100).toFixed(1) + '%' : '0%';
      return { name: c.name, hex: slotHex(c.color), pc, width: pc };
    });
  }
  const incT = num(plan.income_total);
  const savT = num(plan.savings_total);
  const buf = num(plan.buffer);
  const denom = Math.max(incT, expT + savT) || 1;
  const width = (v: number) => ((v / denom) * 100).toFixed(1) + '%';
  const pcInc = (v: number) => (incT > 0 ? ((v / incT) * 100).toFixed(1) + '%' : '0%');
  const legend: Segment[] = expenseCats.map((c) => ({
    name: c.name,
    hex: slotHex(c.color),
    pc: pcInc(num(c.total)),
    width: width(num(c.total)),
  }));
  if (savT > 0) legend.push({ name: 'Savings', hex: '#9dc0a2', pc: pcInc(savT), width: width(savT) });
  if (buf >= 0) legend.push({ name: 'Buffer', hex: '#6aab73', pc: pcInc(buf), width: width(buf) });
  else legend.push({ name: 'Overspend', hex: '#e66767', pc: pcInc(Math.abs(buf)), width: width(Math.abs(buf)) });
  return legend;
}

export default function Structure({ plan, base, onBase }: StructureProps) {
  const legend = buildLegend(plan, base);
  return (
    <div className="struct">
      <div className="struct-head">
        <span className="struct-label">Expense structure</span>
        <span className="spacer" />
        <span className="seg-toggle">
          <button
            type="button"
            className={base === 'exp' ? 'seg-btn on' : 'seg-btn'}
            title="Category shares of total expenses"
            onClick={() => onBase('exp')}
          >
            of expenses
          </button>
          <button
            type="button"
            className={base === 'inc' ? 'seg-btn on' : 'seg-btn'}
            title="Category shares of income"
            onClick={() => onBase('inc')}
          >
            of income
          </button>
        </span>
      </div>
      <div className="strip">
        {legend.map((seg) => (
          <span
            key={seg.name}
            className="strip-seg"
            title={`${seg.name} · ${seg.pc}`}
            style={{ background: seg.hex, width: seg.width }}
          />
        ))}
      </div>
      <div className="legend">
        {legend.map((seg) => (
          <span key={seg.name} className="legend-row">
            <span>
              <span className="legend-dot" style={{ background: seg.hex }} />
              {seg.name}
            </span>
            <span className="legend-pc">{seg.pc}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
