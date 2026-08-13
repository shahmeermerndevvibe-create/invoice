import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import InvoicePrint from "@/components/invoice-print/InvoicePrint";

const currency = { symbol: "R" };
const inv = {
  currency, discountType: "amount", discount: 0, taxType: "amount", tax: 0,
  invoiceDate: "2026-01-01", contractType: "Milestones", documentType: "Quotation", milestoneNumber: 3,
  notes: "<p>Payment due within 30 days of acceptance.</p>",
};

function it(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i, product: `Item ${i + 1}`,
    description: "Standard setup and configuration service.",
    qty: 1, unit: "unit", rate: 5000, status: ["Completed", "Current", "Pending"][i % 3],
  }));
}

function App() {
  const [res, setRes] = useState([]);
  useEffect(() => {
    const t = setTimeout(() => {
      setRes([9, 12].map((n) => ({
        n,
        pages: [...document.querySelectorAll(`[data-case="n${n}"] .invoice-page`)].map((p, i) => {
          const table = p.querySelector("table");
          const ms = table ? [...table.querySelectorAll("tbody tr")].map(tr => tr.querySelector("td span")?.textContent).filter(x => x && !x.includes("unit")) : [];
          const hasMsHead = table ? [...table.querySelectorAll("thead th")].some(th => th.textContent.trim() === "Milestone") : false;
          return { page: i, hasMsHead, mCells: ms, rows: table ? table.querySelectorAll("tbody tr").length : 0 };
        }),
      })));
    }, 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <div>
      <pre style={{ position: "fixed", top: 0, left: 0, background: "#fff", padding: 8, fontSize: 11, zIndex: 999, border: "1px solid #999" }}>{JSON.stringify(res, null, 1)}</pre>
      {[9, 12].map((n) => (
        <div key={n} data-case={`n${n}`}>
          <h3 style={{ fontSize: 12, margin: "30px 0 4px" }}>MILESTONE QUOTATION / {n} items</h3>
          <InvoicePrint invoice={inv} items={it(n)} allItems={it(n)} subtotal={5000*n} total={5000*n} balanceDue={0} taxAmount={0} discountAmount={0} itemDiscountsTotal={0} />
        </div>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
