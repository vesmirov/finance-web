// Types mirror the HTTP API contract (finance-api/internal/server — DTOs).

export interface AuthStatus {
  needs_setup: boolean;
  authenticated: boolean;
  login?: string; // present only when authenticated
  is_admin?: boolean; // present only when authenticated
}
// Money and shares are decimal strings; floats never appear on the frontend.

export type Period = 'monthly' | 'annual';
export type CategoryKind = 'expense' | 'saving';

// ── GET /api/plan ───────────────────────────────────────────────────────────

export interface PlanIncome {
  id: number;
  name: string;
  amount: string;
  currency: string;
  period: Period;
  monthly: string;
  equivalent: string;
  missing_rate?: boolean;
}

export interface PlanExpense {
  id: number;
  name: string;
  amount: string;
  currency: string;
  period: Period;
  day: number | null;
  markup_percent: string;
  monthly: string;
  equivalent: string;
  missing_rate?: boolean;
}

export interface PlanCategory {
  id: number;
  name: string;
  kind: CategoryKind;
  color: number; // palette slot 1..8
  total: string;
  share_of_income: string | null; // 4 decimals; null when income is zero
  expenses: PlanExpense[];
}

export interface Plan {
  target_currency: string;
  income_total: string;
  expenses_total: string;
  expenses_share: string | null;
  savings_total: string;
  savings_share: string | null;
  buffer: string;
  buffer_share: string | null;
  missing_rates: string[];
  incomes: PlanIncome[];
  categories: PlanCategory[];
}

// ── settings, currencies, rates ─────────────────────────────────────────────
// GET /api/currencies returns a plain string[] of tracked ISO 4217 codes.

export interface Settings {
  target_currency: string;
}

export interface Rate {
  code: string;
  rate: string; // target currency units per 1 unit of the currency
}

export interface RatesStatus {
  target: string;
  fetched_at: string; // ISO 8601 UTC; empty until the first server-side refresh
  rates: Rate[];
}

// ── admin (visible to admins only; the server answers 404 to others) ────────

export interface AdminUser {
  id: number;
  login: string;
  is_admin: boolean;
}

// ── CRUD response entities (POST returns the created object) ────────────────

export interface Income {
  id: number;
  name: string;
  amount: string;
  currency: string;
  period: Period;
  position: number;
}

export interface Expense {
  id: number;
  category_id: number;
  name: string;
  amount: string;
  currency: string;
  period: Period;
  day: number | null;
  markup_percent: string;
  position: number;
}

export interface Category {
  id: number;
  name: string;
  kind: CategoryKind;
  color: number;
  position: number;
}

// ── request bodies ──────────────────────────────────────────────────────────

export interface IncomeInput {
  name: string;
  amount: string;
  currency: string;
  period: Period;
}

export interface ExpenseInput extends IncomeInput {
  category_id: number;
  day?: number | null;
  markup_percent?: string;
}

export interface CategoryInput {
  name: string;
  kind: CategoryKind;
  color?: number;
}
