import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  useAddCurrency,
  useAuthStatus,
  useCreateCategory,
  useCreateExpense,
  useCreateIncome,
  useCurrencies,
  useDeleteCategory,
  useDeleteExpense,
  useDeleteIncome,
  usePatchCategory,
  usePatchExpense,
  usePatchIncome,
  usePatchSettings,
  usePlan,
  useRates,
  useRemoveCurrency,
  useSettings,
} from '../api/hooks';
import type { CategoryKind, PlanCategory, PlanExpense, PlanIncome } from '../api/types';
import { fmtDayMonth, isFresh } from '../lib/dates';
import { firstFreeSlot } from '../lib/palette';
import type { ActiveRow, CategoryActions, EditField, StructBase, Tab, ToastState } from '../lib/ui';
import AdminScreen from './Admin';
import AuthScreen from './Auth';
import CategorySection from './CategorySection';
import ConfirmDialog from './ConfirmDialog';
import SettingsScreen from './Settings';
import Sources from './Sources';
import Summary from './Summary';
import Tabs from './Tabs';
import Toast from './Toast';

const SKIP_CONFIRM_KEY = 'finance:skip-delete-category-confirm';

// Gate: the app renders only with a live session.
// /admin is deliberately absent from the navigation — it is reachable only by
// typing the URL. On /admin everything (including the sign-in screen) switches
// to the high-contrast admin theme via a body class, so the token overrides in
// styles.css apply to the whole page. Authenticated non-admins are silently
// sent back to the plan.
export default function App() {
  const authQ = useAuthStatus();
  const onAdminRoute = useLocation().pathname.startsWith('/admin');
  useEffect(() => {
    document.body.classList.toggle('admin-theme', onAdminRoute);
    return () => document.body.classList.remove('admin-theme');
  }, [onAdminRoute]);
  if (authQ.isPending) {
    return (
      <div className="auth-wrap">
        <div className="loading">Loading…</div>
      </div>
    );
  }
  if (authQ.isError || authQ.data === undefined) {
    return (
      <div className="auth-wrap">
        <div className="auth-err">API is unreachable. Make sure the server is running and reload the page.</div>
      </div>
    );
  }
  if (authQ.data.needs_setup) return <AuthScreen needsSetup admin={onAdminRoute} />;
  if (!authQ.data.authenticated) return <AuthScreen needsSetup={false} admin={onAdminRoute} />;
  if (onAdminRoute) {
    if (!authQ.data.is_admin) return <Navigate to="/" replace />;
    return <AdminScreen selfLogin={authQ.data.login ?? ''} />;
  }
  return <Workspace />;
}

function Workspace() {
  const planQ = usePlan();
  const settingsQ = useSettings();
  const currenciesQ = useCurrencies();
  const ratesQ = useRates();

  const createIncome = useCreateIncome();
  const patchIncome = usePatchIncome();
  const deleteIncome = useDeleteIncome();
  const createExpense = useCreateExpense();
  const patchExpense = usePatchExpense();
  const deleteExpense = useDeleteExpense();
  const createCategory = useCreateCategory();
  const patchCategory = usePatchCategory();
  const deleteCategory = useDeleteCategory();
  const patchSettings = usePatchSettings();
  const addCurrency = useAddCurrency();
  const removeCurrency = useRemoveCurrency();

  const [tab, setTab] = useState<Tab>('plan');
  const [activeRow, setActiveRow] = useState<ActiveRow | null>(null);
  const [renamingCat, setRenamingCat] = useState<number | null>(null);
  const [swatchFor, setSwatchFor] = useState<number | null>(null);
  const [structBase, setStructBase] = useState<StructBase>('exp');
  const [confirmCat, setConfirmCat] = useState<PlanCategory | null>(null);
  const [skipConfirm, setSkipConfirm] = useState(() => localStorage.getItem(SKIP_CONFIRM_KEY) === '1');
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | null>(null);

  // Esc closes the row editor, the rename input and the palette (as in the prototype).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveRow(null);
        setRenamingCat(null);
        setSwatchFor(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const plan = planQ.data;
  const target = plan?.target_currency ?? settingsQ.data?.target_currency ?? 'USD';
  const trackedCurrencies = currenciesQ.data ?? [];

  // ── error toasts ──
  const showToast = (msg: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ msg });
    toastTimer.current = window.setTimeout(() => setToast(null), 6000);
  };
  const errToast = (err: unknown) => {
    showToast('Error: ' + (err instanceof Error ? err.message : String(err)));
  };

  // ── sources ──
  const handleAddIncome = async () => {
    try {
      const created = await createIncome.mutateAsync({
        name: '',
        amount: '0',
        currency: target,
        period: 'monthly',
      });
      setActiveRow({ scope: 'inc', id: created.id });
      setRenamingCat(null);
    } catch (err) {
      errToast(err);
    }
  };
  const handleIncomeField = (id: number, field: EditField, value: string) => {
    patchIncome.mutate({ id, patch: { [field]: value } }, { onError: errToast });
  };
  const handleDeleteIncome = (income: PlanIncome) => {
    setActiveRow(null);
    deleteIncome.mutate(income.id, { onError: errToast });
  };

  // ── items ──
  const handleAddExpense = async (catId: number) => {
    try {
      const created = await createExpense.mutateAsync({
        category_id: catId,
        name: '',
        amount: '0',
        currency: target,
        period: 'monthly',
        markup_percent: '0',
      });
      setActiveRow({ scope: 'item', catId, id: created.id });
      setRenamingCat(null);
    } catch (err) {
      errToast(err);
    }
  };
  const handleExpenseField = (id: number, field: EditField, value: string) => {
    patchExpense.mutate({ id, patch: { [field]: value } }, { onError: errToast });
  };
  const handleDeleteExpense = (_catId: number, expense: PlanExpense) => {
    setActiveRow(null);
    deleteExpense.mutate(expense.id, { onError: errToast });
  };

  // ── categories ──
  const handleAddCategory = async (kind: CategoryKind) => {
    try {
      const usedSlots = (plan?.categories ?? []).map((c) => c.color);
      const created = await createCategory.mutateAsync({
        name: kind === 'saving' ? 'New savings' : 'New category',
        kind,
        color: firstFreeSlot(usedSlots),
      });
      setRenamingCat(created.id);
      setActiveRow(null);
    } catch (err) {
      errToast(err);
    }
  };
  const handleRename = (id: number, name: string, done: boolean) => {
    const cat = plan?.categories.find((c) => c.id === id);
    const next = name.trim();
    if (cat && next !== '' && next !== cat.name) {
      patchCategory.mutate({ id, patch: { name: next } }, { onError: errToast });
    }
    if (done) setRenamingCat(null);
  };
  const handlePickColor = (catId: number, slot: number) => {
    const cats = plan?.categories ?? [];
    if (cats.some((c) => c.color === slot && c.id !== catId)) return;
    const cat = cats.find((c) => c.id === catId);
    if (cat && cat.color !== slot) {
      patchCategory.mutate({ id: catId, patch: { color: slot } }, { onError: errToast });
    }
    setSwatchFor(null);
  };
  const performDeleteCategory = (cat: PlanCategory) => {
    setConfirmCat(null);
    setActiveRow(null);
    setRenamingCat(null);
    setSwatchFor(null);
    deleteCategory.mutate(cat.id, { onError: errToast });
  };
  const handleDeleteCategory = (cat: PlanCategory) => {
    if (skipConfirm) performDeleteCategory(cat);
    else setConfirmCat(cat);
  };
  const handleSkipConfirm = (skip: boolean) => {
    setSkipConfirm(skip);
    localStorage.setItem(SKIP_CONFIRM_KEY, skip ? '1' : '0');
  };

  // ── settings ──
  const handleTarget = (code: string) => {
    patchSettings.mutate({ target_currency: code }, { onError: errToast });
  };
  const handleRemoveCurrency = (code: string) => {
    removeCurrency.mutate(code, { onError: errToast });
  };
  const handleAddCurrency = () => {
    const raw = window.prompt('Currency code (ISO 4217, e.g. EUR):');
    if (!raw) return;
    const code = raw.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      showToast('Currency code must be three Latin letters');
      return;
    }
    addCurrency.mutate(code, { onError: errToast });
  };

  // ── rates freshness indicator (display-only; rates refresh server-side) ──
  const fetchedAt = ratesQ.data?.fetched_at ? ratesQ.data.fetched_at : null;
  const fresh = isFresh(fetchedAt);
  const ratesLabel = fetchedAt === null ? 'rates —' : `rates as of ${fmtDayMonth(fetchedAt)}`;

  const actions: CategoryActions = {
    currencies: trackedCurrencies,
    unit: `${target}/mo`,
    activeRow,
    renamingCat,
    swatchFor,
    onActivate: (catId, id) => {
      setActiveRow({ scope: 'item', catId, id });
      setRenamingCat(null);
    },
    onDeactivate: () => setActiveRow(null),
    onExpenseField: handleExpenseField,
    onDeleteExpense: handleDeleteExpense,
    onAddExpense: (catId) => void handleAddExpense(catId),
    onStartRename: (id) => {
      setRenamingCat(id);
      setActiveRow(null);
    },
    onRename: handleRename,
    onToggleSwatch: (id) => setSwatchFor((cur) => (cur === id ? null : id)),
    onPickColor: handlePickColor,
    onDeleteCategory: handleDeleteCategory,
  };

  return (
    <div className="wrap">
      <Tabs tab={tab} onTab={setTab} />

      {tab === 'plan' && (
        <section className="screen">
          <div className="plan-head">
            <span className="brand">Finance</span>
            <span className="spacer" />
            <span className="head-meta">
              <span className={fresh ? 'fresh ok' : 'fresh stale'}>{ratesLabel}</span>
              <span>{target}</span>
            </span>
          </div>
          {plan ? (
            <div className="plan-grid">
              <div>
                <div className="zone">Summary</div>
                <div className="left-col">
                  <Summary plan={plan} base={structBase} onBase={setStructBase} />
                  <Sources
                    plan={plan}
                    currencies={trackedCurrencies}
                    activeRow={activeRow}
                    onActivate={(id) => {
                      setActiveRow({ scope: 'inc', id });
                      setRenamingCat(null);
                    }}
                    onDeactivate={() => setActiveRow(null)}
                    onField={handleIncomeField}
                    onDelete={handleDeleteIncome}
                    onAdd={() => void handleAddIncome()}
                  />
                </div>
              </div>
              <div className="right-col">
                <CategorySection
                  label="Expense categories"
                  labelClass="zone zone-right"
                  addLabel="+ expense category"
                  kind="expense"
                  plan={plan}
                  actions={actions}
                  onAddCategory={(kind) => void handleAddCategory(kind)}
                />
                <CategorySection
                  label="Savings"
                  labelClass="zone zone-sav"
                  addLabel="+ savings category"
                  kind="saving"
                  plan={plan}
                  actions={actions}
                  onAddCategory={(kind) => void handleAddCategory(kind)}
                />
              </div>
            </div>
          ) : planQ.isError ? (
            <div className="loading">
              Failed to load the plan: {planQ.error instanceof Error ? planQ.error.message : 'error'}
            </div>
          ) : (
            <div className="loading">Loading…</div>
          )}
        </section>
      )}

      {tab === 'settings' && (
        <SettingsScreen
          settings={settingsQ.data}
          currencies={currenciesQ.data}
          ratesStatus={ratesQ.data}
          plan={plan}
          onTarget={handleTarget}
          onRemoveCurrency={handleRemoveCurrency}
          onAddCurrency={handleAddCurrency}
        />
      )}

      {confirmCat !== null && (
        <ConfirmDialog
          name={confirmCat.name}
          skip={skipConfirm}
          onSkip={handleSkipConfirm}
          onNo={() => setConfirmCat(null)}
          onYes={() => performDeleteCategory(confirmCat)}
        />
      )}

      {toast !== null && <Toast msg={toast.msg} />}
    </div>
  );
}
