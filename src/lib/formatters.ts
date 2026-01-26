export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatDateShort = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatMonth = (month: number, year: number): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1));
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const getMonthName = (month: number): string => {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2024, month - 1));
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    food: 'Food & Dining',
    travel: 'Travel',
    rent: 'Rent & Housing',
    shopping: 'Shopping',
    bills: 'Bills & Utilities',
    entertainment: 'Entertainment',
    health: 'Healthcare',
    education: 'Education',
    other: 'Other',
    salary: 'Salary',
    freelance: 'Freelance',
    bonus: 'Bonus',
    investment: 'Investment',
    gift: 'Gift',
  };
  return labels[category] || category;
};

export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    upi: 'UPI',
    bank: 'Bank Transfer',
    other: 'Other',
  };
  return labels[method] || method;
};

export const getSourceLabel = (source: string): string => {
  const labels: Record<string, string> = {
    salary: 'Salary',
    freelance: 'Freelance',
    bonus: 'Bonus',
    investment: 'Investment',
    gift: 'Gift',
    other: 'Other',
  };
  return labels[source] || source;
};
