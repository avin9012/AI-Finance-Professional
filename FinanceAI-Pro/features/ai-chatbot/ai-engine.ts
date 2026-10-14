// ──────────────────────────────────────────────
//  FinanceAI-Pro  ·  Local AI Response Engine
//  No external API required — pure keyword logic
// ──────────────────────────────────────────────

export interface FinancialContext {
  remainingAmount: number;
  incomeAmount: number;
  expensesAmount: number;
  categories: { name: string; value: number }[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);

const topCategory = (ctx: FinancialContext): string =>
  ctx.categories?.[0]?.name ?? 'N/A';

const savingsRate = (ctx: FinancialContext): string => {
  if (!ctx.incomeAmount) return '0%';
  const rate = ((ctx.remainingAmount / ctx.incomeAmount) * 100).toFixed(1);
  return `${rate}%`;
};

// ── Keyword → Response map ────────────────────
type ResponseFn = (ctx: FinancialContext) => string;

const RESPONSES: Array<{ keywords: string[]; fn: ResponseFn }> = [
  // ─── GREETING ─────────────────────────────
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'namaste', 'hii'],
    fn: (ctx) => `## 👋 Hello! I'm your FinanceAI Assistant

I've analysed your current financial snapshot:

| Metric | Value |
|--------|-------|
| 💰 Income | ${formatCurrency(ctx.incomeAmount)} |
| 💸 Expenses | ${formatCurrency(ctx.expensesAmount)} |
| 🏦 Balance | ${formatCurrency(ctx.remainingAmount)} |
| 📊 Savings Rate | ${savingsRate(ctx)} |

**What would you like to explore?** Here are some things I can help with:
- 📊 **Budgeting** tips personalised to your spending
- 💰 **Savings** strategies based on your income
- 📉 **Expense** reduction advice
- 🏦 **Investment** recommendations
- 📋 **Financial health** assessment
- 🎯 **Goal setting** and planning`,
  },

  // ─── BUDGET ───────────────────────────────
  {
    keywords: ['budget', 'budgeting', 'budgeted', 'plan my money', 'money plan'],
    fn: (ctx) => {
      const housing = formatCurrency(ctx.incomeAmount * 0.3);
      const food = formatCurrency(ctx.incomeAmount * 0.15);
      const savings = formatCurrency(ctx.incomeAmount * 0.2);
      const transport = formatCurrency(ctx.incomeAmount * 0.1);
      const entertainment = formatCurrency(ctx.incomeAmount * 0.05);
      const other = formatCurrency(ctx.incomeAmount * 0.2);
      return `## 📊 Personalised Budget Plan

Based on your monthly income of **${formatCurrency(ctx.incomeAmount)}**, here's a recommended 50/30/20 split:

### 🏠 Needs (50%)
| Category | Recommended | Notes |
|----------|-------------|-------|
| Housing / Rent | ${housing} | Keep under 30% of income |
| Food & Groceries | ${food} | Cook at home to save more |
| Transport | ${transport} | Consider public transport |

### 🎯 Wants (30%)
| Category | Recommended |
|----------|-------------|
| Entertainment | ${entertainment} |
| Dining Out | ${formatCurrency(ctx.incomeAmount * 0.08)} |
| Shopping | ${formatCurrency(ctx.incomeAmount * 0.07)} |

### 💰 Savings & Investments (20%)
- **Emergency Fund**: ${savings} → Aim for 6 months of expenses
- **Investments / SIP**: ${formatCurrency(ctx.incomeAmount * 0.1)}

> ⚡ **Your current spending**: ${formatCurrency(ctx.expensesAmount)} (${((ctx.expensesAmount / ctx.incomeAmount) * 100).toFixed(1)}% of income). Your top spending category is **${topCategory(ctx)}**.`;
    },
  },

  // ─── SAVINGS ──────────────────────────────
  {
    keywords: ['save', 'saving', 'savings', 'emergency fund', 'save money'],
    fn: (ctx) => {
      const currentSavings = ctx.remainingAmount;
      const targetEmergency = ctx.expensesAmount * 6;
      const monthsToGoal = Math.ceil(
        (targetEmergency - currentSavings) / (ctx.incomeAmount * 0.2)
      );
      return `## 💰 Savings Strategies for You

### 📈 Your Current Position
- **Current Balance**: ${formatCurrency(currentSavings)}
- **Monthly Savings Rate**: ${savingsRate(ctx)}
- **Emergency Fund Target**: ${formatCurrency(targetEmergency)} *(6× monthly expenses)*

### 🚀 Actionable Savings Tips

1. **Automate your savings** — Set up an auto-transfer of **${formatCurrency(ctx.incomeAmount * 0.2)}** on salary day
2. **Pay yourself first** — Treat savings like a non-negotiable expense
3. **High-yield savings** — Move idle money to a savings account earning 6–7% interest
4. **Cut your top expense** — Your biggest spend is **${topCategory(ctx)}** — even a 10% cut saves **${formatCurrency(ctx.expensesAmount * 0.1)}** monthly
5. **50/30/20 Rule** — Needs 50% · Wants 30% · Savings 20%

### 🎯 Goal Timeline
At your current pace, you can build a full emergency fund in approximately **${monthsToGoal > 0 ? monthsToGoal : 0} months**.

> 💡 **Pro Tip**: Even saving an extra ₹500/month compounds significantly over time!`;
    },
  },

  // ─── EXPENSES ─────────────────────────────
  {
    keywords: ['expense', 'expenses', 'spending', 'spend', 'cost', 'costs', 'cut', 'reduce'],
    fn: (ctx) => {
      const ratio = ctx.incomeAmount ? (ctx.expensesAmount / ctx.incomeAmount) * 100 : 0;
      const status = ratio > 80 ? '🔴 High' : ratio > 60 ? '🟡 Moderate' : '🟢 Healthy';
      const cats = ctx.categories?.slice(0, 3) ?? [];
      return `## 📉 Expense Analysis & Reduction Tips

### 📊 Spending Overview
- **Total Expenses**: ${formatCurrency(ctx.expensesAmount)}
- **Income Ratio**: ${ratio.toFixed(1)}% — **${status}**
- **Potential Monthly Savings**: ${formatCurrency(ctx.incomeAmount * 0.1)}

### 🔝 Top Spending Categories
${cats.length > 0 ? cats.map((c, i) => `${i + 1}. **${c.name}** — ${formatCurrency(c.value)}`).join('\n') : '- No category data available'}

### ✂️ Quick Wins to Cut Expenses

| Action | Potential Monthly Saving |
|--------|--------------------------|
| Cancel unused subscriptions | ${formatCurrency(500)} – ${formatCurrency(1500)} |
| Meal prep instead of eating out | ${formatCurrency(ctx.expensesAmount * 0.08)} |
| Switch to energy-efficient habits | ${formatCurrency(300)} – ${formatCurrency(800)} |
| Buy in bulk / compare prices | ${formatCurrency(ctx.expensesAmount * 0.05)} |
| Use cashback credit cards | ${formatCurrency(ctx.expensesAmount * 0.02)} |

> ⚡ **Focus area**: Your top category is **${topCategory(ctx)}**. Reducing it by just 15% saves **${formatCurrency(ctx.expensesAmount * 0.1)}/month**.`;
    },
  },

  // ─── INVESTMENT ───────────────────────────
  {
    keywords: ['invest', 'investment', 'investing', 'mutual fund', 'sip', 'stock', 'stocks', 'portfolio', 'equity', 'fd', 'fixed deposit'],
    fn: (ctx) => {
      const investable = ctx.remainingAmount * 0.6;
      return `## 📈 Investment Recommendations

### 💡 Based on Your Financial Health
- **Available to Invest**: ~${formatCurrency(investable)} *(60% of current balance)*
- **Risk Profile Tip**: Start conservative, grow with confidence

### 🗂️ Suggested Portfolio Allocation

| Asset Class | Allocation | Monthly SIP |
|-------------|------------|-------------|
| 🏦 Emergency FD / Liquid Fund | 20% | ${formatCurrency(investable * 0.2)} |
| 📊 Index Funds (Nifty 50) | 40% | ${formatCurrency(investable * 0.4)} |
| 💎 Mid/Small Cap Equity | 20% | ${formatCurrency(investable * 0.2)} |
| 🏠 Gold ETF / SGBs | 10% | ${formatCurrency(investable * 0.1)} |
| 🌍 International Funds | 10% | ${formatCurrency(investable * 0.1)} |

### 🚀 Top Beginner Strategies
1. **SIP in Index Funds** — Start with ₹500/month in Nifty 50
2. **PPF Account** — Tax-free, government-backed, 7.1% returns
3. **ELSS Funds** — Save tax under 80C + market-linked growth
4. **RD / FD** — Safe, guaranteed returns for short-term goals

> ⚠️ **Disclaimer**: This is general financial information, not personalised investment advice. Consult a SEBI-registered advisor for tailored recommendations.`;
    },
  },

  // ─── FINANCIAL HEALTH ─────────────────────
  {
    keywords: ['health', 'financial health', 'status', 'report', 'overview', 'how am i doing', 'analysis'],
    fn: (ctx) => {
      const ratio = ctx.incomeAmount ? (ctx.expensesAmount / ctx.incomeAmount) * 100 : 0;
      const score = Math.max(0, Math.min(100, Math.round(100 - ratio * 0.6 + (ctx.remainingAmount > 0 ? 20 : 0))));
      const grade = score >= 80 ? '🟢 Excellent' : score >= 60 ? '🟡 Good' : score >= 40 ? '🟠 Fair' : '🔴 Needs Attention';
      return `## 🏥 Financial Health Report

### 🎯 Overall Score: **${score}/100** — ${grade}

| Metric | Value | Status |
|--------|-------|--------|
| Monthly Income | ${formatCurrency(ctx.incomeAmount)} | ✅ |
| Monthly Expenses | ${formatCurrency(ctx.expensesAmount)} | ${ratio > 80 ? '⚠️ High' : '✅ OK'} |
| Net Balance | ${formatCurrency(ctx.remainingAmount)} | ${ctx.remainingAmount > 0 ? '✅ Positive' : '❌ Negative'} |
| Expense Ratio | ${ratio.toFixed(1)}% | ${ratio > 80 ? '⚠️' : '✅'} |
| Savings Rate | ${savingsRate(ctx)} | ${parseFloat(savingsRate(ctx)) >= 20 ? '✅ Great' : '⚠️ Improve'} |

### 📋 Key Insights
${ctx.remainingAmount > 0 ? '✅ You have a positive balance — great foundation!' : '❌ Your expenses exceed income — urgent action needed!'}
${ratio < 70 ? '✅ Expense ratio is healthy — you are living within means.' : '⚠️ Expenses are high — consider reviewing your budget.'}
${parseFloat(savingsRate(ctx)) >= 20 ? '✅ Savings rate above 20% — excellent financial discipline!' : '💡 Try to save at least 20% of income each month.'}

### 🎯 Next Steps
1. Review your **${topCategory(ctx)}** spending — it's your largest category
2. Build an emergency fund of ${formatCurrency(ctx.expensesAmount * 6)}
3. Start or increase SIP investments
4. Track daily expenses to find hidden leaks`;
    },
  },

  // ─── INCOME ───────────────────────────────
  {
    keywords: ['income', 'salary', 'earn', 'earning', 'revenue', 'passive income'],
    fn: (ctx) => `## 💵 Income Analysis & Growth Tips

### 📊 Your Current Income Breakdown
- **Total Income**: ${formatCurrency(ctx.incomeAmount)}
- **After Expenses**: ${formatCurrency(ctx.remainingAmount)}
- **Effective Take-Home Rate**: ${savingsRate(ctx)}

### 🚀 Ways to Increase Your Income

#### Active Income Streams
1. **Upskill & negotiate** — A 10–20% raise saves you years of cutting expenses
2. **Freelancing** — Offer skills on Upwork, Fiverr, Toptal
3. **Part-time consulting** — Monetise your expertise on weekends
4. **Tutoring / Teaching** — Teach subjects you know on Vedantu, Unacademy

#### Passive Income Streams
| Source | Potential Monthly Return |
|--------|--------------------------|
| Dividend Stocks | ${formatCurrency(ctx.incomeAmount * 0.03)} |
| REITs | ${formatCurrency(ctx.incomeAmount * 0.04)} |
| P2P Lending | ${formatCurrency(ctx.incomeAmount * 0.05)} |
| Digital Products | Unlimited |
| YouTube / Blog | Variable |

> 💡 **Goal**: Aim to have at least **2–3 income streams**. Your current savings of ${formatCurrency(ctx.remainingAmount)} can be the seed capital!`,
  },

  // ─── DEBT ─────────────────────────────────
  {
    keywords: ['debt', 'loan', 'emi', 'credit card', 'borrow', 'interest', 'mortgage'],
    fn: (ctx) => `## 🏦 Debt Management Strategy

### ⚡ Two Proven Payoff Methods

#### ❄️ Debt Avalanche (Best mathematically)
Pay minimums on all debts → Put extra money toward the **highest interest rate** debt first. Saves the most money long-term.

#### ⛄ Debt Snowball (Best psychologically)
Pay minimums on all debts → Put extra money toward the **smallest balance** first. Builds momentum and motivation.

### 📋 Your Debt Action Plan
1. **List all debts** — Write down every loan, EMI, credit card balance
2. **Negotiate interest rates** — Call your bank, often they reduce rates for good customers
3. **Stop adding debt** — Avoid new credit until existing debt is cleared
4. **Use your surplus** — You have **${formatCurrency(ctx.remainingAmount)}** monthly — allocate 50% to debt repayment
5. **Refinance** — Look for balance transfer options at lower rates

### 🎯 Healthy Debt Ratios
| Type | Healthy Limit |
|------|--------------|
| EMI-to-Income | < 40% |
| Credit Card Usage | < 30% of limit |
| Home Loan | < 3× annual income |

> 💡 Becoming debt-free gives you **${formatCurrency(ctx.incomeAmount)}+ per month** in financial freedom!`,
  },

  // ─── GOAL SETTING ─────────────────────────
  {
    keywords: ['goal', 'goals', 'target', 'plan', 'planning', 'dream', 'future', 'retire', 'retirement'],
    fn: (ctx) => {
      const monthly = ctx.remainingAmount;
      const fiveYear = monthly * 60 * 1.07 ** 5; // rough FV estimate
      return `## 🎯 Financial Goal Setting

### 🗺️ SMART Goal Framework
Goals must be **Specific, Measurable, Achievable, Relevant, Time-bound**.

### 🌟 Common Financial Goals & Timelines

| Goal | Amount Needed | Time (at ${formatCurrency(monthly)}/mo saved) |
|------|--------------|----------------------------------------|
| Emergency Fund | ${formatCurrency(ctx.expensesAmount * 6)} | ${Math.ceil((ctx.expensesAmount * 6) / monthly)} months |
| Dream Vacation | ${formatCurrency(100000)} | ${Math.ceil(100000 / monthly)} months |
| New Car (Down) | ${formatCurrency(200000)} | ${Math.ceil(200000 / monthly)} months |
| Home Down Payment | ${formatCurrency(1000000)} | ${Math.ceil(1000000 / monthly)} months |

### 📈 Power of Compound Growth
If you invest **${formatCurrency(monthly)}/month** for 5 years at 12% returns:
> **Estimated corpus: ${formatCurrency(Math.round(fiveYear))}**

### 🚀 Goal Achievement Steps
1. **Write your goals** — Put them somewhere visible
2. **Break into milestones** — Monthly & quarterly checkpoints
3. **Automate savings** — Remove human error from the equation
4. **Review quarterly** — Adjust as your income grows
5. **Celebrate wins** — Reward yourself on hitting milestones!`;
    },
  },

  // ─── TAX ──────────────────────────────────
  {
    keywords: ['tax', 'taxes', '80c', 'deduction', 'itr', 'income tax', 'tds', 'gst'],
    fn: (ctx) => `## 🧾 Tax Saving Strategies

### 💰 Key Tax Saving Sections (India)

| Section | Instrument | Max Deduction |
|---------|-----------|---------------|
| 80C | ELSS, PPF, EPF, LIC | ₹1,50,000 |
| 80D | Health Insurance | ₹25,000 – ₹50,000 |
| 80E | Education Loan Interest | No limit |
| 80G | Charitable Donations | 50–100% of donation |
| 24(b) | Home Loan Interest | ₹2,00,000 |
| 80CCD(1B) | NPS Extra Contribution | ₹50,000 |

### 🎯 With Your Income of ${formatCurrency(ctx.incomeAmount)}/month:
- **Annual Income**: ${formatCurrency(ctx.incomeAmount * 12)}
- **Potential 80C Savings**: ₹1,50,000 deduction
- **Potential NPS (80CCD)**: Additional ₹50,000 deduction
- **Total Potential Deductions**: ₹2,00,000+

### ✅ Quick Tax Tips
1. Invest ₹1.5L in ELSS (tax-saving mutual funds) each year
2. Buy health insurance — deductible under 80D
3. Open NPS account for extra ₹50k deduction
4. Keep all investment proofs handy for ITR filing
5. File ITR before July 31 every year

> 💡 Maximising deductions could save you **₹30,000 – ₹60,000** in taxes annually!`,
  },

  // ─── HELP ─────────────────────────────────
  {
    keywords: ['help', 'what can you do', 'commands', 'topics', 'guide', 'menu', 'options'],
    fn: () => `## 🤖 FinanceAI Assistant — Help Menu

I'm your personal financial advisor powered by your real transaction data. Here's everything I can help you with:

### 📚 Available Topics

| Topic | Keywords to Try |
|-------|-----------------|
| 💰 Budget Planning | "budget", "plan my money" |
| 🏦 Savings Tips | "save", "emergency fund" |
| 📉 Expense Analysis | "expenses", "spending", "reduce costs" |
| 📈 Investments | "invest", "SIP", "mutual fund", "stocks" |
| 🏥 Financial Health | "health", "overview", "report" |
| 💵 Income Growth | "income", "salary", "passive income" |
| 🏦 Debt Management | "debt", "EMI", "loan", "credit card" |
| 🎯 Goal Planning | "goal", "retirement", "future planning" |
| 🧾 Tax Saving | "tax", "80C", "deductions", "ITR" |

### 💬 Example Questions
- *"How should I budget my salary?"*
- *"Give me savings tips"*
- *"How can I reduce my expenses?"*
- *"Where should I invest my money?"*
- *"What's my financial health score?"*

Just type your question naturally and I'll respond! 🚀`,
  },

  // ─── THANK YOU ────────────────────────────
  {
    keywords: ['thank', 'thanks', 'thankyou', 'thank you', 'great', 'helpful', 'awesome', 'good'],
    fn: (ctx) => `## 😊 You're Welcome!

I'm glad I could help! Remember, financial success is a journey, not a destination.

### 🌟 Your Financial Snapshot Reminder
- **Balance**: ${formatCurrency(ctx.remainingAmount)}
- **Savings Rate**: ${savingsRate(ctx)}

### 💪 Keep Going!
- Review your budget **weekly**
- Check your spending **daily**
- Invest **consistently**
- Stay **patient** — wealth builds over time

Feel free to ask me anything else about your finances! 🚀`,
  },
];

// ── Fallback response ─────────────────────────
const fallbackResponse = (ctx: FinancialContext): string => {
  return `## 🤔 I'm not sure about that

I didn't quite catch that. Let me show you what I can help with:

**Your Quick Summary:**
- 💰 Income: ${formatCurrency(ctx.incomeAmount)}
- 💸 Expenses: ${formatCurrency(ctx.expensesAmount)}  
- 🏦 Balance: ${formatCurrency(ctx.remainingAmount)}

**Try asking me about:**
- 📊 "budget" — Get a personalised budget plan
- 💰 "savings" — Savings strategies
- 📉 "expenses" — Expense analysis
- 📈 "invest" — Investment advice
- 🏥 "health" — Financial health score
- 🎯 "goals" — Goal planning
- 🧾 "tax" — Tax saving tips

Type **"help"** to see all available topics!`;
};

// ── Main engine function ──────────────────────
export const getAIResponse = (
  message: string,
  ctx: FinancialContext
): string => {
  const lower = message.toLowerCase().trim();

  for (const entry of RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.fn(ctx);
    }
  }

  return fallbackResponse(ctx);
};

// ── Typing delay simulator ────────────────────
export const simulateTypingDelay = (): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(resolve, 800 + Math.random() * 1200)
  );

// ── Generate unique message ID ────────────────
export const generateId = (): string =>
  `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Suggested questions ────────────────────────
export const SUGGESTED_QUESTIONS = [
  '📊 How should I budget my salary?',
  '💰 Give me savings strategies',
  '📉 How can I reduce my expenses?',
  '📈 Where should I invest my money?',
  '🏥 What is my financial health score?',
  '🎯 Help me set financial goals',
  '🧾 How can I save on taxes?',
  '💵 How can I increase my income?',
];
