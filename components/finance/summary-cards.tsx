import { formatCurrency } from "@/lib/finance";

interface SummaryCardsProps {
  balance: number;
  income: number;
  expenses: number;
}

const cardClass =
  "rounded-2xl border border-slate-900/10 bg-white/80 p-5 shadow-[0_14px_40px_rgba(15,33,55,0.08)] backdrop-blur";

export function SummaryCards({ balance, income, expenses }: SummaryCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <article className={cardClass}>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Balance</p>
        <p className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(balance)}</p>
      </article>
      <article className={cardClass}>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Income</p>
        <p className="mt-3 text-2xl font-semibold text-emerald-600">{formatCurrency(income)}</p>
      </article>
      <article className={cardClass}>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Expenses</p>
        <p className="mt-3 text-2xl font-semibold text-rose-500">{formatCurrency(expenses)}</p>
      </article>
    </section>
  );
}

