import type { PlanCategory, PlanExpense } from '../api/types';

export type Tab = 'plan' | 'settings';

export type StructBase = 'exp' | 'inc';

export type ActiveRow =
  | { scope: 'inc'; id: number }
  | { scope: 'item'; catId: number; id: number };

export type EditField = 'name' | 'amount' | 'currency' | 'period' | 'markup_percent';

export interface ToastState {
  msg: string;
}

/** Props shared by the category sections and the blocks inside them. */
export interface CategoryActions {
  currencies: string[];
  unit: string; // "USD/mo"
  activeRow: ActiveRow | null;
  renamingCat: number | null;
  swatchFor: number | null;
  onActivate: (catId: number, id: number) => void;
  onDeactivate: () => void;
  onExpenseField: (id: number, field: EditField, value: string) => void;
  onDeleteExpense: (catId: number, expense: PlanExpense) => void;
  onAddExpense: (catId: number) => void;
  onStartRename: (id: number) => void;
  onRename: (id: number, name: string, done: boolean) => void;
  onToggleSwatch: (id: number) => void;
  onPickColor: (catId: number, slot: number) => void;
  onDeleteCategory: (cat: PlanCategory) => void;
}
