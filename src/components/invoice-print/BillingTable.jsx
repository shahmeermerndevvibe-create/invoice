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
                Unit Price
              </TableHead>

              <TableHead className="bg-[#0A4A95] py-4 text-center font-semibold text-white">
                Quantity
              </TableHead>

              <TableHead className="bg-[#1E90FF] py-4 text-center font-semibold text-white">
                Discount
              </TableHead>

              {invoice.contractType === "Milestones" && (
                <TableHead className="bg-[#0A4A95] py-4 text-center font-semibold text-white">
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
              const { discountAmount, netTotal } = calculateItemRow(item);

              return (
                <TableRow key={item.id || index} className="hover:bg-transparent">
                  <TableCell className="py-3 align-top">
                    <p className="text-lg font-bold text-[#0A4A95] break-words">
                      {item.product}
                    </p>
                    {item.description && (
                      <p className="mt-1 whitespace-pre-wrap break-normal leading-6 text-black text-sm">
                        {item.description}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="bg-slate-50 align-top text-center py-4">
                    {formatCurrency(item.rate)}
                  </TableCell>

                  <TableCell className="align-top text-center py-4">
                    {item.qty}
                  </TableCell>

                  <TableCell className="bg-slate-50 align-top text-center py-4 text-black">
                    {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : "-"}
                  </TableCell>

                  {invoice.contractType === "Milestones" && (
                    <TableCell className="align-top text-center py-4">
                      {item.status || "Pending"}
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
                {invoice.contractType === "Milestones" && <TableCell></TableCell>}
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
