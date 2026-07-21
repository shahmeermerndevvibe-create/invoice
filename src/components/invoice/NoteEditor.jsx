import {
  Editor,
  EditorProvider,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnStrikeThrough,
  BtnBulletList,
  BtnNumberedList,
  BtnLink,
  BtnUndo,
  BtnRedo,
  BtnClearFormatting,
} from "react-simple-wysiwyg";
import { useInvoiceStore } from "@/store/invoiceStore";

export default function NoteEditor() {
  const notes = useInvoiceStore((state) => state.invoice.notes);
  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b bg-gray-50 px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-800">Notes & Terms</h3>
      </div>

      <EditorProvider>
        <Editor
          value={notes}
          onChange={(e) => updateInvoice("notes", e.target.value)}
        >
          <Toolbar>
            <BtnUndo />
            <BtnRedo />

            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />

            <BtnBulletList />
            <BtnNumberedList />

            <BtnLink />

            <BtnClearFormatting />
          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  );
}
