import { Search } from "lucide-react";

const DATE_OPTIONS = [
  { label: "All Time", value: "" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "Custom", value: "custom" },
];

export default function InvoiceHistoryFilters({
  search,
  preset,
  customFrom,
  customTo,
  onSearchChange,
  onPresetChange,
  onCustomDateChange,
}) {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:px-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by invoice number, customer, or email..."
          value={search}
          onChange={onSearchChange}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        <select
          value={preset}
          onChange={onPresetChange}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {DATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomDateChange("from", e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-xs"
            />
            <span className="text-xs text-gray-500">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => onCustomDateChange("to", e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}
