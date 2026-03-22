import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api/requests";
import PageHeader from "../components/ui/PageHeader";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import {
  SELLER_DETAILS,
  getFinancialYear,
  calculateTax,
  determineDocumentType,
  numberToWords,
} from "../lib/invoiceUtils";

const EMPTY_ITEM = {
  description: "",
  hsn_code: "",
  quantity: 1,
  unit: "pcs",
  unit_price: 0,
  tax_percent: 0,
};

export default function InvoiceGenerator() {
  const [buyer, setBuyer] = useState({
    name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    zip_code: "",
  });

  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [dueDate, setDueDate] = useState("");

  // Product catalog for dropdown
  const [products, setProducts] = useState([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogVariants, setCatalogVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await adminAPI.getProducts({ limit: 100 });
      setProducts(data.data || []);
    } catch {
      // Interceptor handles error
    }
  };

  const loadVariants = async (productId) => {
    setLoadingVariants(true);
    try {
      const { data } = await adminAPI.getProductVariants(productId, { limit: 50 });
      setCatalogVariants(data.data || []);
    } catch {
      // Interceptor handles error
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleBuyerChange = (field, value) => {
    setBuyer((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addCustomItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addFromCatalog = (variant, product) => {
    const newItem = {
      description: `${product.name}${variant.type ? ` - ${variant.type}` : ""}${variant.source ? ` (${variant.source})` : ""}`,
      hsn_code: product.hsn_code || "",
      quantity: 1,
      unit: variant.unit || "pcs",
      unit_price: parseFloat(variant.price) || 0,
      tax_percent: parseFloat(product.default_tax) || 0,
    };
    setItems((prev) => [...prev, newItem]);
    setShowCatalog(false);
    setSelectedProduct(null);
    setCatalogVariants([]);
    setCatalogSearch("");
  };

  // --- Computed Invoice Data ---
  const computedItems = items
    .filter((item) => item.description && item.unit_price > 0)
    .map((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const taxPct = parseFloat(item.tax_percent) || 0;
      const lineTotal = qty * price;
      const tax = calculateTax(lineTotal, taxPct);
      return { ...item, quantity: qty, unit_price: price, tax_percent: taxPct, line_total: lineTotal, ...tax };
    });

  const exemptTotal = computedItems
    .filter((i) => i.tax_percent === 0)
    .reduce((sum, i) => sum + i.line_total, 0);
  const taxableTotal = computedItems
    .filter((i) => i.tax_percent > 0)
    .reduce((sum, i) => sum + i.line_total, 0);
  const cgstTotal = computedItems.reduce((sum, i) => sum + i.cgst_amount, 0);
  const sgstTotal = computedItems.reduce((sum, i) => sum + i.sgst_amount, 0);
  const totalTax = cgstTotal + sgstTotal;
  const grandTotal = computedItems.reduce((sum, i) => sum + i.total, 0);
  const documentType = computedItems.length > 0 ? determineDocumentType(computedItems) : "Tax Invoice";

  const fy = getFinancialYear(new Date(invoiceDate));
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const isFormValid = buyer.name.trim().length > 0 && computedItems.length > 0;

  const generateInvoiceNumber = () => {
    if (invoiceNumber) return invoiceNumber;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const num = `DF/MAN/${fy}/${dd}${hh}${mm}${ss}`;
    setInvoiceNumber(num);
    return num;
  };

  const handlePrint = () => {
    generateInvoiceNumber();
    const prevTitle = document.title;
    const safeName = buyer.name.trim().replace(/\s+/g, "_") || "Customer";
    document.title = `Invoice_${safeName}_${invoiceDate}`;
    requestAnimationFrame(() => {
      window.print();
      document.title = prevTitle;
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      !catalogSearch ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <PageContainer maxWidth="none">
      <PageHeader
        title="Invoice Generator"
        subtitle="Create GST-compliant invoices for offline orders"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-6 print:hidden">
          {/* Buyer Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Buyer Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                label="Customer Name"
                value={buyer.name}
                onChange={(e) => handleBuyerChange("name", e.target.value)}
                required
              />
              <TextField
                label="Phone"
                value={buyer.phone}
                onChange={(e) => handleBuyerChange("phone", e.target.value)}
              />
              <TextField
                label="Address Line 1"
                value={buyer.address_line_1}
                onChange={(e) => handleBuyerChange("address_line_1", e.target.value)}
              />
              <TextField
                label="Address Line 2"
                value={buyer.address_line_2}
                onChange={(e) => handleBuyerChange("address_line_2", e.target.value)}
              />
              <TextField
                label="City"
                value={buyer.city}
                onChange={(e) => handleBuyerChange("city", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="State"
                  value={buyer.state}
                  onChange={(e) => handleBuyerChange("state", e.target.value)}
                />
                <TextField
                  label="PIN Code"
                  value={buyer.zip_code}
                  onChange={(e) => handleBuyerChange("zip_code", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                label="Invoice Date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setPaymentStatus("paid"); setDueDate(""); }}
                    className={`flex-1 py-2 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      paymentStatus === "paid"
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("unpaid")}
                    className={`flex-1 py-2 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      paymentStatus === "unpaid"
                        ? "bg-amber-50 border-amber-500 text-amber-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Unpaid
                  </button>
                </div>
              </div>
            </div>
            {paymentStatus === "unpaid" && (
              <div className="mt-3">
                <TextField
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={invoiceDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Line Items</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowCatalog(true)}>
                  + From Catalog
                </Button>
                <Button size="sm" variant="outline" onClick={addCustomItem}>
                  + Custom Item
                </Button>
              </div>
            </div>

            {/* Catalog Picker Modal */}
            {showCatalog && (
              <div className="mb-4 border border-primary-200 rounded-lg p-4 bg-primary-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    {selectedProduct ? `Variants: ${selectedProduct.name}` : "Select Product"}
                  </h4>
                  <button
                    onClick={() => { setShowCatalog(false); setSelectedProduct(null); setCatalogVariants([]); setCatalogSearch(""); }}
                    className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {!selectedProduct ? (
                  <>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedProduct(p); loadVariants(p.id); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-primary-100 rounded cursor-pointer"
                        >
                          {p.name}
                          <span className="text-xs text-gray-500 ml-2">{p.category?.name || ""}</span>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <p className="text-sm text-gray-500 px-3 py-2">No products found</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {loadingVariants ? (
                      <p className="text-sm text-gray-500 px-3 py-2">Loading variants...</p>
                    ) : catalogVariants.length > 0 ? (
                      catalogVariants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => addFromCatalog(v, selectedProduct)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-primary-100 rounded cursor-pointer flex justify-between"
                        >
                          <span>{v.sku} — {v.quantity}{v.unit}{v.type ? ` (${v.type})` : ""}</span>
                          <span className="text-gray-600">₹{v.price}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 px-3 py-2">No variants found</p>
                    )}
                    <button
                      onClick={() => { setSelectedProduct(null); setCatalogVariants([]); }}
                      className="text-xs text-primary-600 hover:underline px-3 cursor-pointer"
                    >
                      ← Back to products
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500">Item {idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="col-span-2 sm:col-span-3">
                      <input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <input
                      placeholder="HSN Code"
                      value={item.hsn_code}
                      onChange={(e) => handleItemChange(idx, "hsn_code", e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex gap-1">
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                        className="px-1 py-1.5 border border-gray-300 rounded text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                      </select>
                    </div>
                    <input
                      type="number"
                      placeholder="Rate (₹)"
                      min="0"
                      step="0.01"
                      value={item.unit_price || ""}
                      onChange={(e) => handleItemChange(idx, "unit_price", e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="GST %"
                      min="0"
                      max="28"
                      step="0.5"
                      value={item.tax_percent || ""}
                      onChange={(e) => handleItemChange(idx, "tax_percent", e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex items-center text-sm text-gray-600">
                      = ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div>
          <div className="print:hidden mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Preview</h3>
            <Button onClick={handlePrint} disabled={!isFormValid}>
              Download / Print
            </Button>
          </div>

          <div id="invoice-print" className="bg-white rounded-lg shadow-sm border border-gray-200 print:shadow-none print:border-0 print:rounded-none">
            {/* Document Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="text-center mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {documentType}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{SELLER_DETAILS.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{SELLER_DETAILS.address}</p>
                  <p className="text-sm text-gray-600">GSTIN: {SELLER_DETAILS.gstin}</p>
                  <p className="text-sm text-gray-600">Phone: {SELLER_DETAILS.phone}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-gray-600"><span className="font-medium">Invoice No:</span> {invoiceNumber || <span className="italic text-gray-400">Auto on print</span>}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {new Date(invoiceDate).toLocaleDateString("en-IN")}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Place of Supply:</span> {SELLER_DETAILS.state} ({SELLER_DETAILS.state_code})</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment:</span>{" "}
                    <span className={paymentStatus === "paid" ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>
                      {paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </p>
                  {paymentStatus === "unpaid" && dueDate && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Due Date:</span> {new Date(dueDate).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Buyer */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
              <p className="text-sm font-medium text-gray-900">{buyer.name || "—"}</p>
              {buyer.address_line_1 && <p className="text-sm text-gray-600">{buyer.address_line_1}</p>}
              {buyer.address_line_2 && <p className="text-sm text-gray-600">{buyer.address_line_2}</p>}
              <p className="text-sm text-gray-600">
                {[buyer.city, buyer.state, buyer.zip_code].filter(Boolean).join(", ") || "—"}
              </p>
              {buyer.phone && <p className="text-sm text-gray-600">Phone: {buyer.phone}</p>}
            </div>

            {/* Line Items */}
            {computedItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">HSN</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Taxable</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">GST</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {computedItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-2 text-gray-900 font-medium">{item.description}</td>
                        <td className="px-4 py-2 text-gray-600 font-mono text-xs">{item.hsn_code || "-"}</td>
                        <td className="px-4 py-2 text-right">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-2 text-right">₹{item.unit_price.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">₹{item.line_total.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {item.tax_percent > 0 ? (
                            <div>
                              <div>₹{item.tax_amount.toFixed(2)}</div>
                              <div className="text-[10px] text-gray-400">CGST {item.cgst_rate}% + SGST {item.sgst_rate}%</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Exempt</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                Add items to see preview
              </div>
            )}

            {/* Summary */}
            {computedItems.length > 0 && (
              <div className="px-6 py-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-full sm:w-72 space-y-2 text-sm">
                    {exemptTotal > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Exempt Supply</span><span>₹{exemptTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {taxableTotal > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Taxable Supply</span><span>₹{taxableTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {cgstTotal > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>CGST</span><span>₹{cgstTotal.toFixed(2)}</span>
                      </div>
                    )}
                    {sgstTotal > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>SGST</span><span>₹{sgstTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-300">
                      <span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Amount in words:</span> {numberToWords(grandTotal)}
                  </p>
                </div>
                {notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Notes:</span> {notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <p>Whether tax is payable on Reverse Charge: <span className="font-medium">No</span></p>
                  {documentType === "Invoice-cum-Bill of Supply" && (
                    <p className="mt-1">
                      This document serves as both a Tax Invoice and a Bill of Supply as per Rule 46A of CGST Rules 2017.
                    </p>
                  )}
                </div>
                <div className="sm:text-right">
                  <p className="font-medium text-gray-700">For {SELLER_DETAILS.name}</p>
                  <p className="mt-4">Authorised Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { margin: 0; padding: 0; }
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 10mm;
            box-sizing: border-box;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </PageContainer>
  );
}
