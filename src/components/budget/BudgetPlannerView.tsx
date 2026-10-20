"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Plus,
  AlertTriangle,
  Trash2,
  PieChart as PieIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { Button, Badge, Card, Modal } from "@/components/ui";
import { logger } from "@/lib/logger";
import type { ExpenseEntity } from "@/types";

interface BudgetDetail {
  id: string;
  eventId: string;
  totalBudget: number;
  allocatedBudget: number;
  currency: string;
  notes?: string | null;
  categories?: { id: string; name: string; allocated: number; spent: number }[];
}

export function BudgetPlannerView({ eventId }: { eventId?: string }) {
  const [budget, setBudget] = useState<BudgetDetail | null>(null);
  const [expenses, setExpenses] = useState<ExpenseEntity[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [_loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Add Expense modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Venue & Permits");
  const [paidBy, setPaidBy] = useState("Alex Morgan");
  const [status, setStatus] = useState("paid");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchBudgetAndExpenses = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/expenses`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
        setBudget(data.budget);
        if (data.budget?.currency) setCurrency(data.budget.currency);
      }
    } catch (e) {
      logger.error("Failed to fetch budget and expenses", e);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchBudgetAndExpenses();
  }, [fetchBudgetAndExpenses]);

  const handleOpenAdd = () => {
    setTitle("");
    setAmount("");
    setCategory("Venue & Permits");
    setPaidBy("Alex Morgan");
    setStatus("paid");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setFormError(null);
    setAddModalOpen(true);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = Number(amount);
    if (!title.trim() || isNaN(parsed) || parsed <= 0) {
      setFormError("Please enter a valid title and a positive expense amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: parsed,
          category,
          paidBy,
          status,
          date,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add expense");
      }

      if (data.warning) {
        setWarningMessage(data.warning);
      }

      setAddModalOpen(false);
      fetchBudgetAndExpenses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add expense";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) fetchBudgetAndExpenses();
    } catch (e) {
      logger.error("Failed to delete expense", e);
    }
  };

  // Calculations
  const totalBudget = budget?.totalBudget || 50000;
  const totalSpent = expenses
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const isOverBudget = totalSpent > totalBudget;
  const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Aggregate category spending for chart
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    if (e.status === "paid") {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    }
  });

  const chartData = Object.entries(categoryTotals).map(([name, spent]) => ({
    name,
    spent,
  }));

  const COLORS = ["#8B5CF6", "#6366F1", "#F5C76B", "#EC4899", "#10B981", "#3B82F6"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Real-time Financial Guard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Budget Planner</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track allocated budget caps, monitor paid vs pending invoices, and prevent overspending.
          </p>
        </div>

        <Button variant="gold" size="sm" onClick={handleOpenAdd} className="shadow-lg shadow-amber-500/20">
          <Plus className="w-4 h-4" />
          <span>Log Expense</span>
        </Button>
      </div>

      {/* Over-budget Alert Banner */}
      {(isOverBudget || warningMessage) && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-rose-300">Budget Limit Warning!</p>
            <p className="mt-0.5">
              Current paid expenses ({currency} {totalSpent.toLocaleString()}) have exceeded your target budget ({currency} {totalBudget.toLocaleString()}) by {currency} {(totalSpent - totalBudget).toLocaleString()}.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-400">Total Budget</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {currency} {totalBudget.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Hard event cap</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium text-slate-400">Total Paid Out</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
            {currency} {totalSpent.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{utilization}% utilization</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium text-slate-400">Remaining Balance</p>
          <p className={`text-2xl sm:text-3xl font-extrabold mt-1 ${isOverBudget ? "text-rose-400" : "text-emerald-400"}`}>
            {currency} {remaining.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Available liquidity</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium text-slate-400">Invoices Tracked</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mt-1">
            {expenses.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {expenses.filter((e) => e.status === "paid").length} paid, {expenses.filter((e) => e.status === "pending").length} pending
          </p>
        </Card>
      </div>

      {/* Spending by Category Chart */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-violet-400" />
              <span>Category Spending Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Real-time expenditure across operations</p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2945" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171F35",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                    fontSize: "12px",
                  }}
                  formatter={(value: unknown) => [`${currency} ${Number(value).toLocaleString()}`, "Spent"]}
                />
                <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-500">
            No expenses logged yet.
          </div>
        )}
      </Card>

      {/* Expenses Table */}
      <div className="bg-[#171F35] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Expense Ledger</h3>
          <span className="text-xs text-slate-400">{expenses.length} Total Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#11182B] border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Title & Notes</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Paid By</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No expense records found. Click &quot;Log Expense&quot; above to add one.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{exp.title}</p>
                      {exp.notes && (
                        <p className="text-[11px] text-slate-400 font-normal">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="violet">{exp.category}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{exp.paidBy}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={exp.status === "paid" ? "success" : "neutral"}>
                        {exp.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                      {currency} {exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {addModalOpen && (
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Log Celebration Expense"
          description="Record an invoice or payment against this event."
        >
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label htmlFor="expense-title" className="block text-xs font-semibold text-slate-300 mb-1">
                Expense Title *
              </label>
              <input
                id="expense-title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Stage Sound Array Rental"
                className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expense-amount" className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({currency}) *
                </label>
                <input
                  id="expense-amount"
                  name="amount"
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="expense-category" className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  id="expense-category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Venue & Permits">Venue & Permits</option>
                  <option value="Stage, Sound & Lighting">Stage, Sound & Lighting</option>
                  <option value="Food & Beverage Stalls">Food & Beverage Stalls</option>
                  <option value="Artists & Headliners">Artists & Headliners</option>
                  <option value="Security & Medical Team">Security & Medical Team</option>
                  <option value="Branding, PR & Merch">Branding, PR & Merch</option>
                  <option value="Photography & Video">Photography & Video</option>
                  <option value="Decor & Flowers">Decor & Flowers</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expense-paid-by" className="block text-xs font-semibold text-slate-300 mb-1">
                  Paid By
                </label>
                <input
                  id="expense-paid-by"
                  name="paidBy"
                  type="text"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label htmlFor="expense-status" className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Status
                </label>
                <select
                  id="expense-status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="expense-date" className="block text-xs font-semibold text-slate-300 mb-1">
                Transaction Date
              </label>
              <input
                id="expense-date"
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label htmlFor="expense-notes" className="block text-xs font-semibold text-slate-300 mb-1">
                Notes / Invoice Number
              </label>
              <textarea
                id="expense-notes"
                name="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Invoice #, check details, receipt URL..."
                className="w-full bg-[#0B1020] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="sm" disabled={submitting}>
                {submitting ? "Saving..." : "Record Expense"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
