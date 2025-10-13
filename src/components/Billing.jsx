import React, { useState } from 'react';
import axios from '../config/axios';
import Swal from "sweetalert2";

const Billing = () => {
  const [barcode, setBarcode] = useState('');
  const [products, setProducts] = useState([]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [customDiscount, setCustomDiscount] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const fetchAndAddByBarcode = async (code) => {
    if (!code) return;
    try {
      const res = await axios.get(`/api/product/by-barcode/${encodeURIComponent(code)}`);
      const product = res.data;

      const existing = products.find(p => String(p.barcode) === String(code) || String(p._id) === String(product._id));
      if (existing) {
        setProducts(products.map(p => (String(p.barcode) === String(code) || String(p._id) === String(product._id)) ? { ...p, quantity: p.quantity + 1 } : p));
      } else {
        // normalize fields to match table
        const p = {
          name: product.name,
          price: product.price,
          off: product.off || 0, // percentage discount
          barcode: code,
          _id: product._id,
          quantity: 1,
        };
        setProducts(prev => [...prev, p]);
      }
      setBarcode('');
    } catch (err) {
      console.error('Barcode lookup failed', err?.response?.data || err.message);
      alert(err?.response?.data?.message || 'Product not found!');
    }
  }

  const updateQuantity = (barcode, quantity) => {
    setProducts(products.map(p => p.barcode === barcode ? { ...p, quantity: Number(quantity) } : p));
  };

  // custom total / discount are handled globally (not per-product)

  const deleteProduct = (barcode) => {
    setProducts(products.filter(p => p.barcode !== barcode));
  };

  // subtotal from product list using per-product discounts
  const subtotal = products.reduce((acc, p) => {
    const price = Number(p.price) || 0;
    const off = Number(p.off) || 0;
    const discounted = price * (1 - off / 100);
    return acc + discounted * (Number(p.quantity) || 0);
  }, 0);

  // base total: if a custom rupee discount is provided, subtract it from subtotal (clamped >= 0)
  const discountAmount = (customDiscount !== '' ? Number(customDiscount) || 0 : 0);
  const baseTotal = Math.max(0, subtotal - discountAmount);

  // clamp discountPercent between 0 and 100
  let discount = Number(discountPercent) || 0;
  if (discount < 0) discount = 0;
  if (discount > 100) discount = 100;

  const totalAmount = baseTotal * (1 - discount / 100);

  const createOrder = async ()=>{
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Pay it!"
      }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const res = await axios.post("/api/payment/create-offline-order", {products, paymentMode, clientTotal: Number(baseTotal.toFixed(2)), discountPercent: Number(discount), clientDiscountAmount: Number(discountAmount.toFixed(2))});

              // If UPI, server returns qrCode (data URL) and upiUri. Show in modal with copy button
              if (paymentMode === 'UPI' && res.data?.qrCode) {
                const { qrCode, upiUri } = res.data;

                const { value: action } = await Swal.fire({
                  title: 'Scan UPI QR to pay',
                  html: `<div style=\"display:flex;flex-direction:column;align-items:center;gap:10px;\">` +
                        `<img src=\"${qrCode}\" alt=\"UPI QR\" style=\"width:220px;height:220px;border-radius:8px;\"/>` +
                        `<div style=\"word-break:break-all;max-width:260px;font-size:12px;color:#444;\">${upiUri}</div>` +
                        `</div>`,
                  showCancelButton: true,
                  confirmButtonText: 'Copy UPI URI',
                  cancelButtonText: 'Close',
                  showCloseButton: false,
                  focusConfirm: false,
                });

                if (action === true || action === 'true') {
                  // try to copy upiUri
                  try {
                    await navigator.clipboard.writeText(upiUri);
                    Swal.fire('Copied!', 'UPI URI copied to clipboard.', 'success');
                  } catch (err) {
                    // fallback: show the URI in an input for manual copy
                    await Swal.fire({
                      title: 'Copy UPI URI',
                      input: 'text',
                      inputValue: upiUri,
                      showCancelButton: true,
                    });
                  }
                }
              } else {
                // For Cash or other non-UPI responses, just show success
                Swal.fire('Success', res.data?.message || 'Order created', 'success');
                setProducts([]);
              }
            } catch (error) {
              Swal.fire("Error!", "Failed to update product", "error");
              console.error(error);
            }
          }
      });
    } catch (err) {
      toast.error("Someting went wrong !");
      console.error(err);
    }
  }

  return (
    <div className='h-screen w-full bg-zinc-800 px-10 py-5 flex flex-col gap-y-5'>
      <div className="flex bg-white px-4 py-4 gap-x-4 rounded-lg items-center font-bold text-lg">
        Billing
      </div>

      <div className="flex gap-x-2">
        <input
          type="text"
          placeholder="Enter barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              fetchAndAddByBarcode(barcode);
            }
          }}
          className="px-3 py-2 rounded-md flex-1 bg-white outline-none"
        />
        {/* Add button removed - barcode will be searched on Enter */}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Discount (%)</th>
                <th className="px-4 py-2">Price after discount</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Delete</th>
              </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.barcode} className="text-center border-t">
                <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">₹{Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-2">{Number(p.off || 0).toFixed(1)}%</td>
                  <td className="px-4 py-2">₹{(Number(p.price || 0) * (1 - (Number(p.off || 0) / 100))).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="1"
                      value={p.quantity}
                      onChange={(e) => updateQuantity(p.barcode, e.target.value)}
                      className="w-16 px-2 py-1 text-center border rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    {(() => {
                        const price = Number(p.price) || 0;
                        const off = Number(p.off) || 0;
                        const discounted = price * (1 - off / 100);
                          return (discounted * p.quantity).toFixed(2);
                    })()}
                  </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteProduct(p.barcode)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-y-3 mt-4 bg-white px-4 py-4 rounded-lg">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-2">
            <label className="font-semibold">Payment Mode:</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option>Cash</option>
              <option>UPI</option>
            </select>
          </div>

          <div className="flex items-center gap-x-2">
            <label className="font-semibold">Custom Discount (₹, optional):</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              className="w-32 px-2 py-1 border rounded"
            />
          </div>

          <div className="flex items-center gap-x-2">
            <label className="font-semibold">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="w-20 px-2 py-1 border rounded"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="font-bold text-lg">Subtotal: ₹{subtotal.toFixed(2)}</div>
          <div className="font-bold text-lg">Custom discount: -₹{discountAmount.toFixed(2)}</div>
          <div className="font-bold text-lg">Total after discount: ₹{totalAmount.toFixed(2)}</div>
          <button onClick={createOrder} className='bg-green-600 px-20 py-2 rounded text-white text-xl font-PublicSans font-semibold'>Pay</button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
