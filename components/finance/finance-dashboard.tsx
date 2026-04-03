"use client";

import { useEffect, useMemo, useReducer, useState } from "react";

import { BalanceTrendChart } from "@/components/finance/balance-trend-chart";
import { InsightsPanel } from "@/components/finance/insights-panel";
import { SpendingBreakdown } from "@/components/finance/spending-breakdown";
import { SummaryCards } from "@/components/finance/summary-cards";
import {
  INITIAL_FILTERS,
  INITIAL_TRANSACTIONS,
  TRANSACTION_CATEGORIES,
  formatCurrency,
  formatDate,
  getExpenseBreakdown,
  getMonthlySeries,
  getSummary,
  type Filters,
  type SortOption,
  type Transaction,
  type TransactionType,
  type UserRole
} from "@/lib/finance";

interface TransactionFormState {
  date: string;
  description: string;
  amount: string;
  category: string;
  type: TransactionType;
}

interface FinanceState {
  role: UserRole;
  transactions: Transaction[];
  filters: Filters;
  editingTransactionId: string | null;
}

type FinanceAction =
  | { type: "set-role"; payload: UserRole }
  | { type: "set-filters"; payload: Partial<Filters> }
  | { type: "clear-filters" }
  | { type: "add-transaction"; payload: Transaction }
  | { type: "update-transaction"; payload: Transaction }
  | { type: "start-edit"; payload: string }
  | { type: "cancel-edit" };

const STORAGE_KEY = "finance-dashboard-state-v1";

const initialState: FinanceState = {
  role: "viewer",
  transactions: INITIAL_TRANSACTIONS,
  filters: INITIAL_FILTERS,
  editingTransactionId: null
};

const emptyFormState: TransactionFormState = {
  date: "",
  description: "",
  amount: "",
  category: "Salary",
  type: "income"
};

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case "set-role":
      return {
        ...state,
        role: action.payload,
        editingTransactionId: action.payload === "admin" ? state.editingTransactionId : null
      };
    case "set-filters":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case "clear-filters":
      return {
        ...state,
        filters: INITIAL_FILTERS
      };
    case "add-transaction":
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    case "update-transaction":
      return {
        ...state,
        editingTransactionId: null,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        )
      };
    case "start-edit":
      return {
        ...state,
        editingTransactionId: action.payload
      };
    case "cancel-edit":
      return {
        ...state,
        editingTransactionId: null
      };
    default:
      return state;
  }
}

function getInitialState(): FinanceState {
  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initialState;
    }
    const parsed = JSON.parse(stored) as Partial<FinanceState>;
    const transactions = Array.isArray(parsed.transactions) ? parsed.transactions : INITIAL_TRANSACTIONS;
    const role = parsed.role === "admin" ? "admin" : "viewer";

    return {
      role,
      transactions,
      filters: { ...INITIAL_FILTERS, ...(parsed.filters ?? {}) },
      editingTransactionId: null
    };
  } catch {
    return initialState;
  }
}

const makeTransactionId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `txn-${Date.now().toString(36)}`;

const isTransactionType = (value: string): value is TransactionType => value === "income" || value === "expense";
const isSortOption = (value: string): value is SortOption =>
  value === "date-desc" || value === "date-asc" || value === "amount-desc" || value === "amount-asc";

export function FinanceDashboard() {
  const [state, dispatch] = useReducer(financeReducer, initialState, getInitialState);
  const [formState, setFormState] = useState<TransactionFormState>(emptyFormState);
  const [error, setError] = useState<string>("");

  const editingTransaction = useMemo(
    () => state.transactions.find((transaction) => transaction.id === state.editingTransactionId) ?? null,
    [state.transactions, state.editingTransactionId]
  );

  useEffect(() => {
    if (!editingTransaction) {
      setFormState(emptyFormState);
      return;
    }
    setFormState({
      date: editingTransaction.date,
      description: editingTransaction.description,
      amount: String(editingTransaction.amount),
      category: editingTransaction.category,
      type: editingTransaction.type
    });
  }, [editingTransaction]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        role: state.role,
        transactions: state.transactions,
        filters: state.filters
      })
    );
  }, [state.role, state.transactions, state.filters]);

  const summary = useMemo(() => getSummary(state.transactions), [state.transactions]);
  const monthlySeries = useMemo(() => getMonthlySeries(state.transactions), [state.transactions]);
  const spendingByCategory = useMemo(() => getExpenseBreakdown(state.transactions), [state.transactions]);

  const categories = useMemo(
    () => Array.from(new Set([...TRANSACTION_CATEGORIES, ...state.transactions.map((transaction) => transaction.category)])).sort(),
    [state.transactions]
  );

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = state.filters.search.trim().toLowerCase();

    const filtered = state.transactions.filter((transaction) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        transaction.description.toLowerCase().includes(normalizedSearch) ||
        transaction.category.toLowerCase().includes(normalizedSearch);
      const matchesType = state.filters.type === "all" || transaction.type === state.filters.type;
      const matchesCategory = state.filters.category === "all" || transaction.category === state.filters.category;

      return matchesSearch && matchesType && matchesCategory;
    });

    return filtered.sort((a, b) => {
      switch (state.filters.sortBy) {
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "date-desc":
          return b.date.localeCompare(a.date);
        case "amount-asc":
          return a.amount - b.amount;
        case "amount-desc":
          return b.amount - a.amount;
        default:
          return 0;
      }
    });
  }, [state.transactions, state.filters]);

  const handleFormChange = (key: keyof TransactionFormState, value: string) => {
    setFormState((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(formState.amount);
    const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;

    if (!formState.date || !formState.description.trim() || !formState.category.trim() || !isValidAmount) {
      setError("Please fill all fields with valid values.");
      return;
    }

    const payload: Transaction = {
      id: editingTransaction?.id ?? makeTransactionId(),
      date: formState.date,
      description: formState.description.trim(),
      amount: parsedAmount,
      category: formState.category.trim(),
      type: formState.type
    };

    if (editingTransaction) {
      dispatch({ type: "update-transaction", payload });
    } else {
      dispatch({ type: "add-transaction", payload });
    }

    setFormState(emptyFormState);
    setError("");
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <section className="animate-rise rounded-3xl border border-slate-900/10 bg-white/55 p-6 shadow-[0_22px_70px_rgba(8,34,65,0.13)] backdrop-blur-md sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-slate-900/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
              Finance Dashboard
            </p>
            <h1 className="mt-3 font-display text-3xl text-slate-900 sm:text-4xl">MoneyFlow Control Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Track your financial health, monitor spending patterns, and review insights from a single place.
            </p>
          </div>

          <label className="w-full max-w-[220px] text-sm font-medium text-slate-700">
            Active Role
            <select
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-emerald-300 transition focus:ring-2"
              value={state.role}
              onChange={(event) => dispatch({ type: "set-role", payload: event.target.value as UserRole })}
            >
              <option value="viewer">Viewer (Read only)</option>
              <option value="admin">Admin (Can add or edit)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="mt-6 animate-rise [animation-delay:120ms]">
        <SummaryCards balance={summary.balance} income={summary.income} expenses={summary.expenses} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="animate-rise [animation-delay:180ms]">
          <BalanceTrendChart points={monthlySeries} />
        </div>
        <div className="animate-rise [animation-delay:240ms]">
          <SpendingBreakdown items={spendingByCategory} />
        </div>
      </section>

      <section className="mt-6 animate-rise [animation-delay:300ms]">
        <InsightsPanel monthlySeries={monthlySeries} spendingByCategory={spendingByCategory} />
      </section>

      <section className="mt-6 animate-rise rounded-2xl border border-slate-900/10 bg-white/85 p-6 shadow-[0_14px_40px_rgba(15,33,55,0.08)] backdrop-blur [animation-delay:360ms]">
        <h2 className="text-xl font-semibold text-slate-900">Transactions</h2>
        <p className="mt-1 text-sm text-slate-600">Search, filter, and sort transaction records.</p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={state.filters.search}
            onChange={(event) => dispatch({ type: "set-filters", payload: { search: event.target.value } })}
            placeholder="Search description or category"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 transition focus:ring-2"
          />

          <select
            value={state.filters.type}
            onChange={(event) => {
              const nextType = event.target.value;
              dispatch({
                type: "set-filters",
                payload: { type: isTransactionType(nextType) ? nextType : "all" }
              });
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 transition focus:ring-2"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={state.filters.category}
            onChange={(event) => dispatch({ type: "set-filters", payload: { category: event.target.value } })}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 transition focus:ring-2"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={state.filters.sortBy}
            onChange={(event) => {
              const sortBy = event.target.value;
              dispatch({
                type: "set-filters",
                payload: { sortBy: isSortOption(sortBy) ? sortBy : "date-desc" }
              });
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 transition focus:ring-2"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {state.role === "admin" && (
          <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{editingTransaction ? "Edit Transaction" : "Add Transaction"}</h3>
              {editingTransaction && (
                <button
                  type="button"
                  className="text-sm font-medium text-slate-600 underline decoration-dotted underline-offset-4"
                  onClick={() => dispatch({ type: "cancel-edit" })}
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <input
                type="date"
                value={formState.date}
                onChange={(event) => handleFormChange("date", event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 transition focus:ring-2"
              />
              <input
                type="text"
                value={formState.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
                placeholder="Description"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 transition focus:ring-2"
              />
              <input
                type="number"
                min="1"
                value={formState.amount}
                onChange={(event) => handleFormChange("amount", event.target.value)}
                placeholder="Amount"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 transition focus:ring-2"
              />
              <select
                value={formState.category}
                onChange={(event) => handleFormChange("category", event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 transition focus:ring-2"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={formState.type}
                onChange={(event) => handleFormChange("type", event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-300 transition focus:ring-2"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {editingTransaction ? "Save Changes" : "Add Transaction"}
            </button>
          </form>
        )}

        {state.transactions.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No transactions available yet.
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No transactions match current filters.
            <button
              type="button"
              className="ml-2 font-semibold text-slate-700 underline decoration-dotted underline-offset-4"
              onClick={() => dispatch({ type: "clear-filters" })}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Description</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium text-right">Amount</th>
                  {state.role === "admin" && <th className="px-3 py-3 font-medium text-right">Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-slate-100 text-slate-700">
                    <td className="px-3 py-3">{formatDate(transaction.date)}</td>
                    <td className="px-3 py-3">{transaction.description}</td>
                    <td className="px-3 py-3">{transaction.category}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          transaction.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-medium">
                      <span className={transaction.type === "income" ? "text-emerald-700" : "text-rose-600"}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    {state.role === "admin" && (
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => dispatch({ type: "start-edit", payload: transaction.id })}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

