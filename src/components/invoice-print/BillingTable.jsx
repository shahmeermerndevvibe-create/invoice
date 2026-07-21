import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/invoiceUtils";

const BillingTable = ({ items = [] }) => {
  console.log("Items in BillingTable:", items); // Debugging line
  // Minimum rows to display
  const minRows = 1;
  const emptyRows = Math.max(0, minRows - items.length);

  return (
    <section className="px-8 md:px-14">
      <div className="border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="w-1/2 bg-[#0A4A95] py-4 text-left font-semibold text-white">
                Description
              </TableHead>

              <TableHead className="bg-[#1E90FF] py-4 text-center font-semibold text-white">
                Unit Price
              </TableHead>

              <TableHead className="bg-[#1E90FF] py-4 text-center font-semibold text-white">
                Quantity
              </TableHead>

              <TableHead className="bg-[#0A4A95] py-4 text-center font-semibold text-white">
                Total Price
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id || index} className="hover:bg-transparent">
                <TableCell className="py-3 align-top">
                  <p className="mb-2 text-xl font-bold text-[#0A4A95]">
                    {item.product}
                  </p>

                  <p className="text-black">
                    {item.description}
                  </p>
                </TableCell>

                <TableCell className="bg-slate-50 text-center">
                  {formatCurrency(item.rate)}
                </TableCell>

                <TableCell className="text-center">
                  {item.qty}
                </TableCell>

                <TableCell className="bg-slate-50 text-center font-bold text-[#0A4A95]">
                  {formatCurrency(Number(item.qty || 0) * Number(item.rate || 0))}
                </TableCell>
              </TableRow>
            ))}

            {Array.from({ length: emptyRows }).map((_, index) => (
              <TableRow
                key={`empty-${index}`}
                className="hover:bg-transparent"
              >
                <TableCell className="h-16"></TableCell>
                <TableCell className="bg-slate-50"></TableCell>
                <TableCell></TableCell>
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