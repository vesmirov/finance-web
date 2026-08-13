import type { Plan, PlanCategory } from '../api/types';
import { fmtMarkup, fmtMoney, fmtNative } from '../lib/money';
import { slotHex } from '../lib/palette';
import type { CategoryActions } from '../lib/ui';
import ColorPopover from './ColorPopover';
import RowEditor from './RowEditor';
import RowView from './RowView';

interface CategoryBlockProps {
  cat: PlanCategory;
  plan: Plan;
  actions: CategoryActions;
}

export default function CategoryBlock({ cat, plan, actions }: CategoryBlockProps) {
  const hex = slotHex(cat.color);
  const renaming = actions.renamingCat === cat.id;
  return (
    <div className="block cat-block" style={{ borderLeftColor: hex }}>
      <div className="block-head">
        <span className="swatch-wrap">
          <button
            type="button"
            className="swatch"
            title="Category color"
            style={{ background: hex }}
            onClick={() => actions.onToggleSwatch(cat.id)}
          />
          {actions.swatchFor === cat.id && (
            <ColorPopover
              cat={cat}
              allCats={plan.categories}
              onPick={(slot) => actions.onPickColor(cat.id, slot)}
            />
          )}
        </span>
        {renaming ? (
          <input
            className="cat-rename"
            defaultValue={cat.name}
            autoFocus
            onBlur={(e) => actions.onRename(cat.id, e.currentTarget.value, false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') actions.onRename(cat.id, e.currentTarget.value, true);
            }}
          />
        ) : (
          <span
            className="cat-name"
            title="Click to rename"
            onClick={() => actions.onStartRename(cat.id)}
          >
            {cat.name}
          </span>
        )}
        <span className="spacer" />
        <span className="tot-label">total</span>
        <span className="tot-val">{fmtMoney(cat.total)}</span>
        <span className="tot-unit">{actions.unit}</span>
        <span className="cat-x" title="Delete category" onClick={() => actions.onDeleteCategory(cat)}>
          ✕
        </span>
      </div>
      <div className="rows">
        {cat.expenses.map((expense) => {
          const active =
            actions.activeRow?.scope === 'item' &&
            actions.activeRow.catId === cat.id &&
            actions.activeRow.id === expense.id;
          const missing =
            expense.missing_rate === true || plan.missing_rates.includes(expense.currency);
          if (active) {
            return (
              <RowEditor
                key={expense.id}
                variant="expense"
                name={expense.name}
                amount={expense.amount}
                currency={expense.currency}
                period={expense.period}
                pct={expense.markup_percent}
                usd={fmtMoney(expense.equivalent)}
                missing={missing}
                currencies={actions.currencies}
                onField={(field, value) => actions.onExpenseField(expense.id, field, value)}
                onDone={actions.onDeactivate}
                onDelete={() => actions.onDeleteExpense(cat.id, expense)}
              />
            );
          }
          return (
            <RowView
              key={expense.id}
              variant="expense"
              name={expense.name}
              nat={fmtNative(expense.amount) + ' ' + expense.currency}
              per={expense.period === 'annual' ? 'yr' : 'mo'}
              pctLabel={fmtMarkup(expense.markup_percent)}
              usd={fmtMoney(expense.equivalent)}
              missing={missing}
              onClick={() => actions.onActivate(cat.id, expense.id)}
            />
          );
        })}
        {cat.expenses.length === 0 && <div className="empty">Empty so far — add the first item.</div>}
        <div className="add-row" onClick={() => actions.onAddExpense(cat.id)}>
          <b>+</b> item
        </div>
      </div>
    </div>
  );
}
