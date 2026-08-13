import type { KeyboardEvent } from 'react';
import type { Period } from '../api/types';
import type { EditField } from '../lib/ui';

// Editor row: name/amount/currency/period (+markup for expense items).
// Text fields commit on blur; Enter commits and finishes; Esc deactivates
// globally (App). Every field change → PATCH → plan invalidation.

interface BaseProps {
  name: string;
  amount: string;
  currency: string;
  period: Period;
  currencies: string[];
  onField: (field: EditField, value: string) => void;
  onDone: () => void;
  onDelete: () => void;
}

type RowEditorProps =
  | (BaseProps & { variant: 'income' })
  | (BaseProps & { variant: 'expense'; pct: string; usd: string; missing: boolean });

export default function RowEditor(props: RowEditorProps) {
  const original = (field: EditField): string => {
    switch (field) {
      case 'name':
        return props.name;
      case 'amount':
        return props.amount;
      case 'currency':
        return props.currency;
      case 'period':
        return props.period;
      case 'markup_percent':
        return props.variant === 'expense' ? props.pct : '0';
    }
  };

  const commit = (field: EditField, raw: string) => {
    let value = raw;
    if (field === 'amount' || field === 'markup_percent') {
      value = raw.trim();
      if (value === '') value = '0';
    }
    if (value !== original(field)) props.onField(field, value);
  };

  const onKey = (field: EditField) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit(field, e.currentTarget.value);
      props.onDone();
    }
  };

  // The row's currency may be inactive (rate lost) — keep it in the select anyway.
  const currencyOptions = props.currencies.includes(props.currency)
    ? props.currencies
    : [props.currency, ...props.currencies];

  const currencySelect = (
    <select
      className="f f-sel"
      defaultValue={props.currency}
      onChange={(e) => commit('currency', e.currentTarget.value)}
    >
      {currencyOptions.map((code) => (
        <option key={code} value={code}>
          {code}
        </option>
      ))}
    </select>
  );

  const periodSelect = (
    <select
      className="f f-sel"
      defaultValue={props.period}
      onChange={(e) => commit('period', e.currentTarget.value)}
    >
      <option value="monthly">mo</option>
      <option value="annual">yr</option>
    </select>
  );

  const buttons = (
    <span className="rb-wrap">
      <button type="button" className="rb rb-ok" title="Done (Enter)" onClick={props.onDone}>
        ✓
      </button>
      <button
        type="button"
        className="rb rb-del"
        title={props.variant === 'income' ? 'Delete source' : 'Delete item'}
        onClick={props.onDelete}
      >
        ✕
      </button>
    </span>
  );

  if (props.variant === 'income') {
    return (
      <div className="ed-inc">
        <input
          className="f"
          defaultValue={props.name}
          autoFocus
          onBlur={(e) => commit('name', e.currentTarget.value)}
          onKeyDown={onKey('name')}
        />
        <input
          className="f f-num"
          defaultValue={props.amount}
          onBlur={(e) => commit('amount', e.currentTarget.value)}
          onKeyDown={onKey('amount')}
        />
        {currencySelect}
        {periodSelect}
        {buttons}
      </div>
    );
  }

  return (
    <div className="ed-exp">
      <input
        className="f f-ellipsis"
        defaultValue={props.name}
        title={props.name}
        autoFocus
        onBlur={(e) => commit('name', e.currentTarget.value)}
        onKeyDown={onKey('name')}
      />
      <input
        className="f f-num"
        defaultValue={props.amount}
        onBlur={(e) => commit('amount', e.currentTarget.value)}
        onKeyDown={onKey('amount')}
      />
      {currencySelect}
      {periodSelect}
      <span className="pct-wrap">
        +
        <input
          className="f f-pct"
          defaultValue={props.pct}
          onBlur={(e) => commit('markup_percent', e.currentTarget.value)}
          onKeyDown={onKey('markup_percent')}
        />
        %
      </span>
      <span
        className={props.missing ? 'exp-usd warn' : 'exp-usd'}
        title={props.missing ? 'No rate — this row counts as 0' : undefined}
      >
        {props.usd}
      </span>
      {buttons}
    </div>
  );
}
