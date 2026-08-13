import { useLogout } from '../api/hooks';
import type { Plan, RatesStatus, Settings } from '../api/types';
import { fmtDateTime } from '../lib/dates';
import { currencyLabel } from '../lib/palette';

interface SettingsScreenProps {
  settings: Settings | undefined;
  currencies: string[] | undefined;
  ratesStatus: RatesStatus | undefined;
  plan: Plan | undefined;
  onTarget: (code: string) => void;
  onRemoveCurrency: (code: string) => void;
  onAddCurrency: () => void;
}

export default function SettingsScreen(props: SettingsScreenProps) {
  const logout = useLogout();
  const { settings, plan } = props;

  const head = (
    <div className="plan-head">
      <span className="brand">Settings</span>
      <span className="spacer" />
      <button type="button" className="btn-ghost" onClick={() => logout.mutate()}>
        Sign out
      </button>
    </div>
  );

  if (!settings) {
    return (
      <section className="screen">
        {head}
        <div className="loading">Loading…</div>
      </section>
    );
  }

  const target = settings.target_currency;
  const tracked = props.currencies ?? [];
  const rates = props.ratesStatus?.rates ?? [];
  const fetchedAt = props.ratesStatus?.fetched_at ? props.ratesStatus.fetched_at : null;

  // Whether a currency is in use is visible from plan data: it is the target or appears in rows.
  const used = new Set<string>([target]);
  if (plan) {
    used.add(plan.target_currency);
    for (const income of plan.incomes) used.add(income.currency);
    for (const cat of plan.categories) for (const e of cat.expenses) used.add(e.currency);
  }

  return (
    <section className="screen">
      {head}

      <div className="block set-card">
        <div className="block-head">
          <span className="block-title">Calculation</span>
        </div>
        <div className="set-grid">
          <span className="set-label">Target currency</span>
          <select
            key={target}
            className="set-sel"
            defaultValue={target}
            onChange={(e) => props.onTarget(e.currentTarget.value)}
          >
            {tracked.map((code) => (
              <option key={code} value={code}>
                {currencyLabel(code)}
              </option>
            ))}
          </select>
          <span className="set-hint">All totals and equivalents are calculated in it.</span>
        </div>
      </div>

      <div className="block set-card">
        <div className="block-head">
          <span className="block-title">Tracked currencies</span>
        </div>
        <div className="chips">
          {tracked.map((code) => {
            const inUse = used.has(code);
            const title = inUse
              ? code === target
                ? 'target currency'
                : 'used by existing rows'
              : 'remove';
            return (
              <span key={code} className="chip">
                {code}{' '}
                <span
                  className={inUse ? 'chip-x off' : 'chip-x'}
                  title={title}
                  onClick={() => {
                    if (!inUse) props.onRemoveCurrency(code);
                  }}
                >
                  ✕
                </span>
              </span>
            );
          })}
          <span className="chip-add" title="Add a currency by ISO 4217 code" onClick={props.onAddCurrency}>
            + add
          </span>
        </div>
      </div>

      <div className="block set-card">
        <div className="block-head">
          <span className="block-title">Exchange rates</span>
        </div>
        <div className="rows">
          {rates.map((r) => (
            <div key={r.code} className="rate-row">
              <span>{r.code}</span>
              <span className="rate-val">{Number.parseFloat(r.rate).toFixed(4)}</span>
              <span className="rate-time">{fetchedAt === null ? '—' : fmtDateTime(fetchedAt)}</span>
            </div>
          ))}
          {rates.length === 0 && <div className="empty">No rates yet.</div>}
        </div>
        <div className="rates-note">
          Rates refresh automatically every 5 minutes. Rates by <u>Exchange Rate API</u>.
        </div>
      </div>
    </section>
  );
}
