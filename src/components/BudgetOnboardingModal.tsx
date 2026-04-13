import { useMemo, useState, type FormEvent } from "react";
import { ONBOARDING_LABELS, ONBOARDING_SLUGS } from "../types";

type Props = {
  open: boolean;
  onComplete: (payload: {
    currentBalanceUsd: number;
    budgets: Record<string, number>;
  }) => void | Promise<void>;
};

const DEFAULTS: Record<string, number> = {
  social: 400,
  work: 200,
  travel: 300,
  health: 150,
  other: 200,
};

const DEFAULT_TOTAL = ONBOARDING_SLUGS.reduce((s, c) => s + DEFAULTS[c], 0);

export function BudgetOnboardingModal({ open, onComplete }: Props) {
  const [balance, setBalance] = useState("320");
  const [totalTarget, setTotalTarget] = useState(String(DEFAULT_TOTAL));
  const [budgets, setBudgets] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const c of ONBOARDING_SLUGS) o[c] = String(DEFAULTS[c]);
    return o;
  });

  const parsed = useMemo(() => {
    const target = parseFloat(totalTarget);
    const parts: Record<string, number> = {};
    let sum = 0;
    for (const c of ONBOARDING_SLUGS) {
      const v = parseFloat(budgets[c] ?? "0");
      const n = Number.isFinite(v) && v >= 0 ? v : 0;
      parts[c] = n;
      sum += n;
    }
    return {
      target: Number.isFinite(target) ? target : NaN,
      parts,
      sum,
    };
  }, [totalTarget, budgets]);

  const splitError = useMemo(() => {
    if (!Number.isFinite(parsed.target) || parsed.target <= 0) {
      return "Enter a positive total monthly budget to split across categories.";
    }
    const diff = Math.abs(parsed.sum - parsed.target);
    if (diff > 0.02) {
      const sign = parsed.sum > parsed.target ? "over" : "under";
      return `Category amounts must add up to your total monthly budget ($${parsed.target.toFixed(2)}). They currently add to $${parsed.sum.toFixed(2)} — $${sign} by $${Math.abs(parsed.sum - parsed.target).toFixed(2)}.`;
    }
    return null;
  }, [parsed]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const b = parseFloat(balance);
    if (!Number.isFinite(b)) return;
    if (splitError) return;
    await onComplete({ currentBalanceUsd: b, budgets: parsed.parts });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--app-overlay)] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] shadow-2xl">
        <div className="border-b border-[var(--app-border)] px-6 py-5">
          <h2 id="onboarding-title" className="text-xl font-semibold text-[var(--app-text)]">
            Set up your finances
          </h2>
          <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
            Enter your starting balance, how much you want to budget per month in total, then split
            that amount across categories. The five category lines must add up exactly to your
            total.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-text-secondary)]">
              Current balance (USD)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded border border-[var(--app-border)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)]"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-text-secondary)]">
              Total monthly budget to split (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="w-full rounded border border-[var(--app-border)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)]"
              value={totalTarget}
              onChange={(e) => setTotalTarget(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-[var(--app-text-muted)]">
              Category budgets below must sum to this number (within one cent).
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--app-text-muted)]">
              Split by category
            </p>
            {ONBOARDING_SLUGS.map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                <label className="w-24 shrink-0 text-sm text-[var(--app-text-secondary)]">
                  {ONBOARDING_LABELS[cat]}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="flex-1 rounded border border-[var(--app-border)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)]"
                  value={budgets[cat]}
                  onChange={(e) =>
                    setBudgets((prev) => ({ ...prev, [cat]: e.target.value }))
                  }
                  required
                />
              </div>
            ))}
            <div
              className={`rounded border px-3 py-2 text-sm ${
                splitError && parsed.target > 0
                  ? "border-red-800 bg-red-950/40 text-red-200"
                  : "border-[var(--app-border)] bg-[var(--app-input)] text-[var(--app-text-secondary)]"
              }`}
              role="status"
            >
              <span className="text-[var(--app-text-muted)]">Sum of categories: </span>
              <span className="font-medium tabular-nums">${parsed.sum.toFixed(2)}</span>
              <span className="text-[var(--app-text-muted)]"> / target </span>
              <span className="font-medium tabular-nums">
                ${Number.isFinite(parsed.target) ? parsed.target.toFixed(2) : "—"}
              </span>
            </div>
          </div>

          {splitError && (
            <div
              className="rounded border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-100"
              role="alert"
            >
              {splitError}
            </div>
          )}

          <button
            type="submit"
            disabled={!!splitError}
            className="w-full rounded bg-[var(--app-accent)] py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save and continue
          </button>
        </form>
      </div>
    </div>
  );
}
