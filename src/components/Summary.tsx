import type { Plan } from '../api/types';
import { absString, fmtMoney, fmtShare, isNegative } from '../lib/money';
import type { StructBase } from '../lib/ui';
import Structure from './Structure';

interface SummaryProps {
  plan: Plan;
  base: StructBase;
  onBase: (base: StructBase) => void;
}

export default function Summary({ plan, base, onBase }: SummaryProps) {
  const negative = isNegative(plan.buffer);
  const bufAbs = fmtMoney(absString(plan.buffer));
  const bufLabel = (negative ? '−' : '') + bufAbs + ' ' + plan.target_currency;
  const bufNote = negative ? `short by ${bufAbs}` : `${fmtShare(plan.buffer_share)} of income`;
  return (
    <div className="summary">
      <div className="srow">
        <span className="slabel">Income</span>
        <span className="sval">{fmtMoney(plan.income_total)}</span>
      </div>
      <div className="srow">
        <span className="slabel">
          Expenses<span className="ssub">{fmtShare(plan.expenses_share)} of income</span>
        </span>
        <span className="sval sval-exp">{fmtMoney(plan.expenses_total)}</span>
      </div>
      <div className="srow">
        <span className="slabel">
          Savings<span className="ssub">{fmtShare(plan.savings_share)} of income</span>
        </span>
        <span className="sval sval-sav">{fmtMoney(plan.savings_total)}</span>
      </div>
      <div className="srow">
        <span className="slabel slabel-buf">
          Buffer<span className="ssub">{bufNote}</span>
        </span>
        <span className={negative ? 'sval sval-buf crit' : 'sval sval-buf good'}>{bufLabel}</span>
      </div>
      {plan.missing_rates.length > 0 && (
        <div className="srow-missing">
          no rate: {plan.missing_rates.join(', ')} — such rows count as 0
        </div>
      )}
      <Structure plan={plan} base={base} onBase={onBase} />
    </div>
  );
}
