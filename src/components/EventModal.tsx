import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import type { UserCategoryDto } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultDay?: Date;
  defaultHour?: number;
  categories: UserCategoryDto[];
  onCreate: (payload: {
    title: string;
    dateStr: string;
    startTime: string;
    endTime: string;
    category: string;
    costOverride: string;
  }) => void | Promise<void>;
};

export function EventModal({
  open,
  onClose,
  defaultDay,
  defaultHour = 9,
  categories,
  onCreate,
}: Props) {
  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState(
    defaultDay ? format(defaultDay, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
  );
  const [startTime, setStartTime] = useState(
    `${String(defaultHour).padStart(2, "0")}:00`,
  );
  const [endTime, setEndTime] = useState(
    `${String(Math.min(defaultHour + 1, 23)).padStart(2, "0")}:00`,
  );
  const [category, setCategory] = useState(
    () => categories[0]?.slug ?? "social",
  );
  const [costOverride, setCostOverride] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onCreate({
        title: title.trim(),
        dateStr,
        startTime,
        endTime,
        category,
        costOverride: costOverride.trim(),
      });
      setTitle("");
      setCostOverride("");
      onClose();
    } catch {
      /* toast later */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--app-overlay)] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] shadow-2xl">
        <div className="border-b border-[var(--app-border)] px-5 py-4">
          <h2 id="event-modal-title" className="text-lg font-semibold text-[var(--app-text)]">
            New event
          </h2>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-text-secondary)]">Title</label>
            <input
              className="w-full rounded border border-[var(--app-border)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Social: Team dinner"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-text-secondary)]">Date</label>
            <input
              type="date"
              className="w-full rounded border border-[var(--app-border)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)]"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--app-text-secondary)]">Start</label>
              <input
                type="time"
                className="w-full rounded border border-[var(--app-border)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)]"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--app-text-secondary)]">End</label>
              <input
                type="time"
                className="w-full rounded border border-[var(--app-border)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)]"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-text-secondary)]">Category</label>
            <select
              className="w-full rounded border border-[var(--app-border)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Used to auto-estimate cost (override optional below).
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-text-secondary)]">
              Estimated cost (USD, optional)
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              className="w-full rounded border border-[var(--app-border)] bg-[var(--app-input)] px-3 py-2 text-sm text-[var(--app-text)]"
              value={costOverride}
              onChange={(e) => setCostOverride(e.target.value)}
              placeholder="Leave blank for category default"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-text)] hover:bg-[var(--app-panel-elevated)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[var(--app-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
