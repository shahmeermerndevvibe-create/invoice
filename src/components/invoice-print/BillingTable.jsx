import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, calculateItemRow } from "@/utils/invoiceUtils";

const BillingTable = ({ items = [], invoice = {} }) => {
  const minRows = 1;
  const emptyRows = Math.max(0, minRows - items.length);

  const statusColors = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Current: "bg-blue-100 text-blue-700 border-blue-200",
    Paid: "bg-green-100 text-green-700 border-green-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
    Overdue: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <section className="px-8 md:px-14">
      <div className="border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="bg-[#0A4A95] py-4 text-left font-semibold text-white">
                Title
              </TableHead>

              <TableHead className="bg-[#1E90FF] py-4 text-center font-semibold text-white">
                Qty
              </TableHead>

              <TableHead className="bg-[#0A4A95] py-4 text-center font-semibold text-white">
                Unit
              </TableHead>

              <TableHead className="bg-[#1E90FF] py-4 text-center font-semibold text-white">
                Rate
              </TableHead>

              <TableHead className="bg-[#0A4A95] py-4 text-center font-semibold text-white">
                Discount
              </TableHead>

              {invoice.contractType === "Milestones" && (
                <TableHead className="bg-[#1E90FF] py-4 text-center font-semibold text-white">
                  Status
                </TableHead>
              )}

              <TableHead className="bg-[#0A4A95] py-4 text-center font-semibold text-white">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item, index) => {
              const { netTotal, discountAmount } = calculateItemRow(item);
              const isCompletedMilestone = invoice.contractType === "Milestones" && item.status === "Completed";

              return (
                <TableRow
                  key={item.id || index}
                  className={`hover:bg-transparent`}
                >
                  <TableCell className="py-3 align-top">
                    <p className="text-lg font-bold break-words text-[#0A4A95]">
                      {item.product}
                    </p>
                    {item.description && (
                      <p className="mt-1 whitespace-pre-wrap break-words leading-6 text-black text-sm">
                        {item.description}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="bg-slate-50 align-top text-center py-4">
                    {item.qty}
                  </TableCell>

                  <TableCell className="align-top text-center py-4">
                    {item.unit || "-"}
                  </TableCell>

                  <TableCell className="bg-slate-50 align-top text-center py-4">
                    {formatCurrency(item.rate)}
                  </TableCell>

                  <TableCell className="bg-slate-50 align-top text-center py-4">
                    {discountAmount > 0
                      ? `-${formatCurrency(discountAmount)}`
                      : "-"}
                  </TableCell>

                  {invoice.contractType === "Milestones" && (
                    <TableCell className="align-top py-4 text-center">
                      {isCompletedMilestone ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Completed
                        </span>
                      ) : (
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusColors[item.status] ||
                            "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {item.status || "Pending"}
                        </span>
                      )}
                    </TableCell>
                  )}

                  <TableCell className="bg-slate-50 align-top text-center py-4 font-bold text-[#0A4A95]">
                    {formatCurrency(netTotal)}
                  </TableCell>
                </TableRow>
              );
            })}

            {Array.from({ length: emptyRows }).map((_, index) => (
              <TableRow key={`empty-${index}`} className="hover:bg-transparent">
                <TableCell className="h-16"></TableCell>
                <TableCell className="bg-slate-50"></TableCell>
                <TableCell></TableCell>
                <TableCell className="bg-slate-50"></TableCell>
                <TableCell></TableCell>
                {invoice.contractType === "Milestones" && (
                  <TableCell className="bg-slate-50"></TableCell>
                )}
                <TableCell className="bg-slate-50"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default BillingTable;
