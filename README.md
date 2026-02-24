# 💰 WealthWise — Personal Finance Tracker


[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6?logo=typescript)](https://www.typescriptlang.org)

WealthWise is an open-source personal finance tracker that helps you manage expenses, income, budgets, savings goals, and recurring transactions — all in one place.

## ✨ Features

- 📊 **Dashboard** — Overview of your financial health at a glance
- 💸 **Expense Tracking** — Log and categorize your spending
- 💰 **Income Management** — Track all sources of income
- 📋 **Budgets** — Set monthly budgets by category
- 🎯 **Savings Goals** — Set and track progress toward financial goals
- 🔄 **Recurring Transactions** — Automate repeating income and expenses
- 📈 **Analytics** — Visual charts and insights into your finances
- 📥 **Import** — Upload CSV/Excel files for AI-powered transaction analysis
- 🔐 **Authentication** — Secure email-based signup and login

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Database, Auth, Edge Functions)
- **Charts:** Recharts
- **State Management:** TanStack React Query

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features when applicable
- Update documentation as needed

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Recharts](https://recharts.org/) for data visualization
- [Lucide](https://lucide.dev/) for icons
