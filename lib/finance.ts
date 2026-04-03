export type UserRole = "viewer" | "admin";
export type TransactionType = "income" | "expense";

export type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
}

export interface Filters {
  search: string;
  category: "all" | string;
  type: "all" | TransactionType;
  sortBy: SortOption;
}

export interface MonthlyPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  balance: number;
}

export interface CategoryPoint {
  category: string;
  amount: number;
}

export const CURRENCY_CODE = "USD";

export const TRANSACTION_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Groceries",
  "Rent",
  "Utilities",
  "Travel",
  "Healthcare",
  "Dining",
  "Shopping",
  "Education"
] as const;

export const INITIAL_FILTERS: Filters = {
  search: "",
  category: "all",
  type: "all",
  sortBy: "date-desc"
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-001",
    date: "2026-01-05",
    description: "Monthly Salary",
    amount: 6400,
    category: "Salary",
    type: "income"
  },
  {
    id: "txn-002",
    date: "2026-01-09",
    description: "Apartment Rent",
    amount: 1800,
    category: "Rent",
    type: "expense"
  },
  {
    id: "txn-003",
    date: "2026-01-12",
    description: "Grocery Restock",
    amount: 290,
    category: "Groceries",
    type: "expense"
  },
  {
    id: "txn-004",
    date: "2026-01-21",
    description: "Utility Bill",
    amount: 140,
    category: "Utilities",
    type: "expense"
  },
  {
    id: "txn-005",
    date: "2026-02-02",
    description: "Monthly Salary",
    amount: 6400,
    category: "Salary",
    type: "income"
  },
  {
    id: "txn-006",
    date: "2026-02-08",
    description: "Mobile App Contract",
    amount: 1700,
    category: "Freelance",
    type: "income"
  },
  {
    id: "txn-007",
    date: "2026-02-11",
    description: "Domestic Flight",
    amount: 520,
    category: "Travel",
    type: "expense"
  },
  {
    id: "txn-008",
    date: "2026-02-17",
    description: "Pharmacy",
    amount: 120,
    category: "Healthcare",
    type: "expense"
  },
  {
    id: "txn-009",
    date: "2026-02-24",
    description: "Online Course",
    amount: 240,
    category: "Education",
    type: "expense"
  },
  {
    id: "txn-010",
    date: "2026-03-01",
    description: "Monthly Salary",
    amount: 6400,
    category: "Salary",
    type: "income"
  },
  {
    id: "txn-011",
    date: "2026-03-07",
    description: "ETF Dividend",
    amount: 380,
    category: "Investments",
    type: "income"
  },
  {
    id: "txn-012",
    date: "2026-03-10",
    description: "Supermarket",
    amount: 310,
    category: "Groceries",
    type: "expense"
  },
  {
    id: "txn-013",
    date: "2026-03-16",
    description: "Team Lunch",
    amount: 145,
    category: "Dining",
    type: "expense"
  },
  {
    id: "txn-014",
    date: "2026-03-22",
    description: "Electricity Bill",
    amount: 162,
    category: "Utilities",
    type: "expense"
  },
  {
    id: "txn-015",
    date: "2026-03-29",
    description: "Wardrobe Refresh",
    amount: 360,
    category: "Shopping",
    type: "expense"
  },
  {
    id: "txn-016",
    date: "2026-04-01",
    description: "Monthly Salary",
    amount: 6400,
    category: "Salary",
    type: "income"
  },
  {
    id: "txn-017",
    date: "2026-04-02",
    description: "Client Invoice",
    amount: 1250,
    category: "Freelance",
    type: "income"
  },
  {
    id: "txn-018",
    date: "2026-04-03",
    description: "Weekend Groceries",
    amount: 198,
    category: "Groceries",
    type: "expense"
  }
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY_CODE,
    maximumFractionDigits: 0
  }).format(amount);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));

export const getSummary = (transactions: Transaction[]) => {
  const income = transactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses
  };
};

const getMonthLabel = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", { month: "short" });
};

export const getMonthlySeries = (transactions: Transaction[], openingBalance = 12000): MonthlyPoint[] => {
  if (transactions.length === 0) {
    return [];
  }

  const grouped = new Map<string, { income: number; expense: number }>();

  for (const tx of transactions) {
    const monthKey = tx.date.slice(0, 7);
    const month = grouped.get(monthKey) ?? { income: 0, expense: 0 };
    if (tx.type === "income") {
      month.income += tx.amount;
    } else {
      month.expense += tx.amount;
    }
    grouped.set(monthKey, month);
  }

  const points = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, totals]) => ({
      key,
      label: getMonthLabel(key),
      income: totals.income,
      expense: totals.expense,
      net: totals.income - totals.expense,
      balance: 0
    }));

  let runningBalance = openingBalance;
  return points.map((point) => {
    runningBalance += point.net;
    return { ...point, balance: runningBalance };
  });
};

export const getExpenseBreakdown = (transactions: Transaction[]): CategoryPoint[] => {
  const map = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== "expense") {
      continue;
    }
    map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
  }

  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

export const getTopSpendingCategory = (transactions: Transaction[]) => {
  const [first] = getExpenseBreakdown(transactions);
  return first ?? null;
};

