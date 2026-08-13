import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type {
  AdminUser,
  AuthStatus,
  Category,
  CategoryInput,
  Expense,
  ExpenseInput,
  Income,
  IncomeInput,
  Plan,
  RatesStatus,
  Settings,
} from './types';

// ── auth ────────────────────────────────────────────────────────────────────

export function useAuthStatus() {
  return useQuery({ queryKey: ['auth'], queryFn: () => api.get<AuthStatus>('/api/auth/status') });
}

export interface Credentials {
  login: string;
  password: string;
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Credentials) => api.post<{ ok: boolean }>('/api/auth/login', body),
    onSuccess: () => void qc.invalidateQueries(),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: boolean }>('/api/auth/logout'),
    onSuccess: () => qc.clear(),
  });
}

// ── queries ─────────────────────────────────────────────────────────────────

export function usePlan() {
  return useQuery({ queryKey: ['plan'], queryFn: () => api.get<Plan>('/api/plan') });
}

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: () => api.get<Settings>('/api/settings') });
}

export function useCurrencies() {
  return useQuery({ queryKey: ['currencies'], queryFn: () => api.get<string[]>('/api/currencies') });
}

export function useRates() {
  return useQuery({ queryKey: ['rates'], queryFn: () => api.get<RatesStatus>('/api/rates') });
}

// ── mutations (each invalidates ['plan']) ───────────────────────────────────

function useInvalidate(keys: string[][]) {
  const qc = useQueryClient();
  return () => {
    for (const key of keys) {
      void qc.invalidateQueries({ queryKey: key });
    }
  };
}

export type PatchBody = Record<string, string | number | null>;

export function useCreateIncome() {
  const invalidate = useInvalidate([['plan']]);
  return useMutation({
    mutationFn: (input: Partial<IncomeInput>) => api.post<Income>('/api/incomes', input),
    onSuccess: invalidate,
  });
}

export function usePatchIncome() {
  const invalidate = useInvalidate([['plan']]);
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: PatchBody }) =>
      api.patch<{ ok: boolean }>(`/api/incomes/${id}`, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteIncome() {
  const invalidate = useInvalidate([['plan']]);
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/incomes/${id}`),
    onSuccess: invalidate,
  });
}

export function useCreateExpense() {
  const invalidate = useInvalidate([['plan']]);
  return useMutation({
    mutationFn: (input: ExpenseInput) => api.post<Expense>('/api/expenses', input),
    onSuccess: invalidate,
  });
}

export function usePatchExpense() {
  const invalidate = useInvalidate([['plan']]);
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: PatchBody }) =>
      api.patch<{ ok: boolean }>(`/api/expenses/${id}`, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteExpense() {
  const invalidate = useInvalidate([['plan']]);
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/expenses/${id}`),
    onSuccess: invalidate,
  });
}

export function useCreateCategory() {
  const invalidate = useInvalidate([['plan']]);
  return useMutation({
    mutationFn: (input: CategoryInput) => api.post<Category>('/api/categories', input),
    onSuccess: invalidate,
  });
}

export function usePatchCategory() {
  const invalidate = useInvalidate([['plan']]);
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: PatchBody }) =>
      api.patch<{ ok: boolean }>(`/api/categories/${id}`, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidate([['plan']]);
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/categories/${id}`),
    onSuccess: invalidate,
  });
}

export function usePatchSettings() {
  // Changing the target currency changes rates and all equivalents — refresh everything.
  const invalidate = useInvalidate([['plan'], ['settings'], ['currencies'], ['rates']]);
  return useMutation({
    mutationFn: (patch: PatchBody) => api.patch<{ ok: boolean }>('/api/settings', patch),
    onSuccess: invalidate,
  });
}

export function useAddCurrency() {
  const invalidate = useInvalidate([['plan'], ['currencies'], ['rates']]);
  return useMutation({
    mutationFn: (code: string) => api.post<{ code: string }>('/api/currencies', { code }),
    onSuccess: invalidate,
  });
}

export function useRemoveCurrency() {
  const invalidate = useInvalidate([['plan'], ['currencies'], ['rates']]);
  return useMutation({
    mutationFn: (code: string) => api.del(`/api/currencies/${code}`),
    onSuccess: invalidate,
  });
}

// ── admin (the server answers 404 to non-admins) ────────────────────────────

export function useAdminUsers(enabled: boolean) {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get<AdminUser[]>('/api/admin/users'),
    enabled,
  });
}

export interface AdminUserInput {
  login: string;
  password: string;
  is_admin: boolean;
}

export function useAdminCreateUser() {
  const invalidate = useInvalidate([['admin-users']]);
  return useMutation({
    mutationFn: (body: AdminUserInput) => api.post<AdminUser>('/api/admin/users', body),
    onSuccess: invalidate,
  });
}

export function useAdminDeleteUser() {
  const invalidate = useInvalidate([['admin-users']]);
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/admin/users/${id}`),
    onSuccess: invalidate,
  });
}

export function useAdminResetPassword() {
  const invalidate = useInvalidate([['admin-users']]);
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      api.post<{ ok: boolean }>(`/api/admin/users/${id}/password`, { password }),
    onSuccess: invalidate,
  });
}
