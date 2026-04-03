import { formatCurrency, type CategoryPoint, type MonthlyPoint } from "@/lib/finance";

interface InsightsPanelProps {
  monthlySeries: MonthlyPoint[];
  spendingByCategory: CategoryPoint[];
}

const getMonthlyComparison = (monthlySeries: MonthlyPoint[]) => {
  if (monthlySeries.length < 2) {
    return null;
  }

  const latest = monthlySeries[monthlySeries.length - 1];
  const previous = monthlySeries[monthlySeries.length - 2];
  const diff = latest.expense - previous.expense;

  return { latest, previous, diff };
};

export function InsightsPanel({ monthlySeries, spendingByCategory }: InsightsPanelProps) {
  const topSpending = spendingByCategory[0];
  const comparison = getMonthlyComparison(monthlySeries);
  const latestMonth = monthlySeries[monthlySeries.length - 1];
  const savingsRate =
    latestMonth && latestMonth.income > 0 ? Math.max(0, ((latestMonth.income - latestMonth.expense) / latestMonth.income) * 100) : null;

  return (
    <section className="rounded-2xl border border-slate-900/10 bg-white/85 p-6 shadow-[0_14px_40px_rgba(15,33,55,0.08)] backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Insights</h2>
        <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Quick Observations</span>
      </div>
      <div className="space-y-4 text-sm text-slate-700">
        <article className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Highest spending category</p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {topSpending ? `${topSpending.category} (${formatCurrency(topSpending.amount)})` : "No expense records yet"}
          </p>
        </article>
        <article className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Monthly comparison</p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {comparison
              ? `${comparison.latest.label} spending is ${formatCurrency(Math.abs(comparison.diff))} ${
                  comparison.diff >= 0 ? "higher" : "lower"
                } than ${comparison.previous.label}.`
              : "Need at least two months of data for comparison."}
          </p>
        </article>
        <article className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Savings signal</p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {savingsRate !== null ? `Estimated monthly savings rate is ${savingsRate.toFixed(1)}%.` : "No income data to compute savings rate."}
          </p>
        </article>
      </div>
    </section>
  );
}

