import {
  Editor,
  EditorProvider,
  Toolbar,
  BtnBold,
  BtnLink,
} from "react-simple-wysiwyg";
import { useInvoiceStore } from "@/store/invoiceStore";

export default function () {
  const payment = useInvoiceStore((state) => state.invoice.payment);
  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b bg-gray-50 px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-800">Payment Method</h3>
      </div>

      <EditorProvider>
        <Editor
          value={payment}
          onChange={(e) => updateInvoice("payment", e.target.value)}
          className="min-h-[250px]"
        >
          <Toolbar>

            <BtnBold />

            <BtnLink />

          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  );
}
