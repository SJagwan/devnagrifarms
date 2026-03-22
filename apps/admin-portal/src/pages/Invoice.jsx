import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../lib/api/requests";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const { data } = await adminAPI.getOrderInvoice(id);
      setInvoice(data.data);
    } catch {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const prevTitle = document.title;
    const invNum = invoice?.invoice_number?.replace(/\//g, "-") || "Invoice";
    const buyerName = invoice?.buyer?.name?.replace(/\s+/g, "_") || "Customer";
    document.title = `${invNum}_${buyerName}`;
    window.print();
    document.title = prevTitle;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <PageContainer>
        <PageHeader title="Invoice" subtitle="Invoice not found or order not eligible." />
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </PageContainer>
    );
  }

  if (!invoice.seller || !invoice.items || !invoice.summary) {
    return (
      <PageContainer>
        <PageHeader title="Invoice" subtitle="Incomplete invoice data." />
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </PageContainer>
    );
  }

  const { seller, buyer, items, summary, delivery = {} } = invoice;

  return (
    <PageContainer maxWidth="lg">
      {/* Screen-only header */}
      <div className="print:hidden">
        <PageHeader
          title={`Invoice ${invoice.invoice_number}`}
          onBack={() => navigate(`/orders/${invoice.order_id}`)}
          right={
            <Button onClick={handlePrint}>
              Download / Print
            </Button>
          }
        />
      </div>

      {/* Invoice Document */}
      <div id="invoice-print" className="bg-white rounded-lg shadow-sm border border-gray-200 print:shadow-none print:border-0 print:rounded-none">
        {/* Document Header */}
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <div className="text-center mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {invoice.document_type}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-6">
            {/* Seller */}
            <div>
              <h2 className="text-lg font-bold text-gray-900">{seller.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{seller.address}</p>
              <p className="text-sm text-gray-600">GSTIN: {seller.gstin}</p>
              <p className="text-sm text-gray-600">Phone: {seller.phone}</p>
              {seller.email && (
                <p className="text-sm text-gray-600">Email: {seller.email}</p>
              )}
            </div>

            {/* Invoice Meta */}
            <div className="sm:text-right">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Invoice No:</span> {invoice.invoice_number}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Date:</span>{" "}
                {new Date(invoice.invoice_date).toLocaleDateString("en-IN")}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Place of Supply:</span> {invoice.place_of_supply}
              </p>
              {delivery.slot && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Delivery Slot:</span>{" "}
                  <span className="capitalize">{delivery.slot}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="px-6 sm:px-8 py-4 border-b border-gray-200 bg-gray-50">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To / Deliver To</p>
          <p className="text-sm font-medium text-gray-900">{buyer.name}</p>
          {buyer.address_line_1 && <p className="text-sm text-gray-600">{buyer.address_line_1}</p>}
          {buyer.address_line_2 && <p className="text-sm text-gray-600">{buyer.address_line_2}</p>}
          <p className="text-sm text-gray-600">
            {[buyer.city, buyer.state, buyer.zip_code].filter(Boolean).join(", ")}
          </p>
          {buyer.phone && <p className="text-sm text-gray-600">Phone: {buyer.phone}</p>}
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taxable</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">GST</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 sm:px-6 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">
                    <div>{item.description}</div>
                    {(item.variant_type || item.variant_source) && (
                      <div className="text-xs text-gray-500">
                        {[item.variant_type, item.variant_source].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-gray-600 font-mono text-xs">{item.hsn_code}</td>
                  <td className="px-4 sm:px-6 py-3 text-right text-gray-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right text-gray-900">₹{item.unit_price.toFixed(2)}</td>
                  <td className="px-4 sm:px-6 py-3 text-right text-gray-900">₹{item.line_total.toFixed(2)}</td>
                  <td className="px-4 sm:px-6 py-3 text-right text-gray-600">
                    {item.tax_percent > 0 ? (
                      <div>
                        <div>₹{item.tax_amount.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-400">
                          CGST {item.cgst_rate}% + SGST {item.sgst_rate}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Exempt</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right font-medium text-gray-900">
                    ₹{item.total_price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="px-6 sm:px-8 py-6 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-sm">
              {summary.exempt_total > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Exempt Supply</span>
                  <span>₹{summary.exempt_total.toFixed(2)}</span>
                </div>
              )}
              {summary.taxable_total > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Taxable Supply</span>
                  <span>₹{summary.taxable_total.toFixed(2)}</span>
                </div>
              )}
              {summary.cgst_total > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>CGST</span>
                  <span>₹{summary.cgst_total.toFixed(2)}</span>
                </div>
              )}
              {summary.sgst_total > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>SGST</span>
                  <span>₹{summary.sgst_total.toFixed(2)}</span>
                </div>
              )}
              {summary.igst_total > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>IGST</span>
                  <span>₹{summary.igst_total.toFixed(2)}</span>
                </div>
              )}
              {summary.discount_total > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-₹{summary.discount_total.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-300">
                <span>Grand Total</span>
                <span>₹{summary.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Amount in words:</span>{" "}
              {summary.grand_total_in_words}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <p>Whether tax is payable on Reverse Charge: <span className="font-medium">No</span></p>
              {invoice.document_type === "Invoice-cum-Bill of Supply" && (
                <p className="mt-1">
                  This document serves as both a Tax Invoice (for taxable supplies) and a
                  Bill of Supply (for exempt supplies) as per Rule 46A of CGST Rules 2017.
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="font-medium text-gray-700">For {seller.name}</p>
              <p className="mt-4">Authorised Signatory</p>
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
        }
      `}</style>
    </PageContainer>
  );
}
