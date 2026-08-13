import { useMemo } from "react";
import {
  formatCurrency,
  calculateMilestoneBreakdown,
} from "@/utils/invoiceUtils";

const statusColors = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Current: "bg-blue-100 text-blue-700 border-blue-200",
  Paid: "bg-green-100 text-green-700 border-green-200",
  Completed: "bg-green-100 text-green-700 border-green-200",
  Overdue: "bg-red-100 text-red-700 border-red-200",
};

export default function MilestoneSummary({
  invoice,
  items = [],
  startIndex = 0,
  endIndex,
  showFooter = true,
}) {
  const { rows, dueThisInvoice, remaining } = useMemo(
    () => calculateMilestoneBreakdown(items, invoice),
    [items, invoice],
  );

  const symbol = invoice.currency?.symbol || "";
  const totalRows = rows.length;
  const from = Math.max(0, Math.min(startIndex, totalRows));
  const to = endIndex == null ? totalRows : Math.min(endIndex, totalRows);
  const visibleRows = rows.slice(from, to);

  return (
    <section className="px-8 py-3 md:px-14">
      <div className="my-4 border-t-[1.5px] border-slate-300" />

      <div className="border border-slate-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-950 to-blue-500 text-white">
              <th className="py-3 pl-4 text-left text-sm font-semibold">
                Milestone
              </th>
              <th className="py-3 text-right text-sm font-semibold">Price</th>
              <th className="py-3 text-right text-sm font-semibold">Tax</th>
              <th className="py-3 text-right text-sm font-semibold">Total</th>
              <th className="py-3 pr-4 text-center text-sm font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.index}
                className="border-t border-slate-200 hover:bg-transparent"
              >
                <td className="py-3 pl-4 align-top text-sm font-bold text-[#0A4A95]">
                  {row.label}
                </td>
                <td className="bg-slate-50 py-3 text-right align-top text-sm tabular-nums">
                  <span className="text-xs mr-0.5">{symbol}</span>
                  {formatCurrency(row.price)}
                </td>
                <td className="bg-slate-50 py-3 text-right align-top text-sm tabular-nums">
                  <span className="text-xs mr-0.5">{symbol}</span>
                  {formatCurrency(row.tax)}
                </td>
                <td className="py-3 text-right align-top text-sm font-semibold tabular-nums text-[#0A4A95]">
                  <span className="text-xs mr-0.5">{symbol}</span>
                  {formatCurrency(row.total)}
                </td>
                <td className="py-3 pr-4 text-center align-top">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      statusColors[row.status] ||
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr className="border-t border-slate-200">
                <td
                  colSpan={5}
                  className="py-3 text-center text-sm text-slate-500"
                >
                  No milestones available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showFooter && (
        <div
          data-ms-footer
          className="ml-auto mt-5 w-[280px] space-y-2 text-sm"
        >
          <div className="mt-5 flex justify-between overflow-hidden rounded-md bg-gradient-to-r from-[#1C3C75] from-[5%] to-[#1E90FF] to-[100%] px-4 py-2 text-white">
            <span className="font-bold">Due This Invoice</span>

            <span className="tabular-nums font-medium">
              <span className="mr-0.5 text-xs">{symbol}</span>
              {formatCurrency(dueThisInvoice)}
            </span>
          </div>
          <div className="flex justify-between gap-3 text-xs text-slate-500">
            <span>Remaining to be paid</span>
            <span className="tabular-nums">
              <span className="text-xs mr-0.5">{symbol}</span>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
