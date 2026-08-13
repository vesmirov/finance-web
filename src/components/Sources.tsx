import type { Plan, PlanIncome } from '../api/types';
import { fmtMoney, fmtNative } from '../lib/money';
import type { ActiveRow, EditField } from '../lib/ui';
import RowEditor from './RowEditor';
import RowView from './RowView';

interface SourcesProps {
  plan: Plan;
  currencies: string[];
  activeRow: ActiveRow | null;
  onActivate: (id: number) => void;
  onDeactivate: () => void;
  onField: (id: number, field: EditField, value: string) => void;
  onDelete: (income: PlanIncome) => void;
  onAdd: () => void;
}

export default function Sources(props: SourcesProps) {
  const { plan } = props;
  return (
    <div className="block">
      <div className="block-head">
        <span className="block-title">Sources</span>
        <span className="spacer" />
        <span className="tot-label">total</span>
        <span className="tot-val">{fmtMoney(plan.income_total)}</span>
        <span className="tot-unit">{plan.target_currency}/mo</span>
      </div>
      <div className="rows">
        {plan.incomes.map((income) => {
          const active = props.activeRow?.scope === 'inc' && props.activeRow.id === income.id;
          const missing = income.missing_rate === true || plan.missing_rates.includes(income.currency);
          if (active) {
            return (
              <RowEditor
                key={income.id}
                variant="income"
                name={income.name}
                amount={income.amount}
                currency={income.currency}
                period={income.period}
                currencies={props.currencies}
                onField={(field, value) => props.onField(income.id, field, value)}
                onDone={props.onDeactivate}
                onDelete={() => props.onDelete(income)}
              />
            );
          }
          const det =
            fmtNative(income.amount) +
            ' ' +
            income.currency +
            (income.period === 'annual' ? ' yr' : '');
          return (
            <RowView
              key={income.id}
              variant="income"
              name={income.name}
              det={det}
              usd={fmtMoney(income.equivalent)}
              missing={missing}
              onClick={() => props.onActivate(income.id)}
            />
          );
        })}
        <div className="add-row" onClick={props.onAdd}>
          <b>+</b> source
        </div>
      </div>
    </div>
  );
}
