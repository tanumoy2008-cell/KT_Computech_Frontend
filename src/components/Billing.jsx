import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import Swal from "sweetalert2";

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [customDiscount, setCustomDiscount] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [searchType, setSearchType] = useState("barcode");
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = React.useRef(null);

  // 🖨️ QZ Tray
  const [printers, setPrinters] = useState([]);
  const [defaultPrinter, setDefaultPrinter] = useState("");
  const [qzStatus, setQzStatus] = useState("Loading...");

  // 💵 Cash drawer
  const [cashGiven, setCashGiven] = useState("");
  const [changeToGive, setChangeToGive] = useState(0);

  // Wait for QZ Tray script
  const waitForQZ = () => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.qz) {
          clearInterval(interval);
          resolve(true);
        }
        attempts++;
        if (attempts > 100) {
          clearInterval(interval);
          reject("QZ Tray script not loaded!");
        }
      }, 100);
    });
  };

  // Initialize QZ Tray
  const initQZ = async () => {
    try {
      setQzStatus("Loading script...");
      await waitForQZ();
      setQzStatus("Connecting...");
      await window.qz.websocket.connect();
      setQzStatus("Connected");

      const availablePrinters = await window.qz.printers.find();
      setPrinters(availablePrinters);

      const savedPrinter = localStorage.getItem("defaultPrinter");
      if (savedPrinter && availablePrinters.includes(savedPrinter)) {
        setDefaultPrinter(savedPrinter);
      } else if (availablePrinters.length) {
        setDefaultPrinter(availablePrinters[0]);
      }
    } catch (err) {
      console.error(err);
      setQzStatus("Error");
      alert(err);
    }
  };

  useEffect(() => {
    initQZ();
    return () => {
      if (window.qz?.websocket?.isActive()) window.qz.websocket.disconnect();
    };
  }, []);

  const handlePrinterChange = (printer) => {
    setDefaultPrinter(printer);
    localStorage.setItem("defaultPrinter", printer);
  };

  // Product functions
  const addProductToList = (product) => {
    const existing = products.find((p) => p._id === product._id);
    if (existing) {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setProducts((prev) => [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          off: product.off || 0,
          barcode: product.barcode || "",
          quantity: 1,
          colorVariants: product.colorVariants || [],
          selectedColorVariantId: product.colorVariants?.[0]?._id || null,
        },
      ]);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    try {
      let endpoint = "";
      switch (searchType) {
        case "barcode":
          endpoint = `/api/product/by-barcode/${encodeURIComponent(searchValue)}`;
          break;
        case "name":
          endpoint = `/api/product/by-name/${encodeURIComponent(searchValue)}`;
          break;
        case "sku":
          endpoint = `/api/product/by-sku/${encodeURIComponent(searchValue)}`;
          break;
        case "all":
          endpoint = `/api/product/search/${encodeURIComponent(searchValue)}`;
          break;
        default:
          endpoint = `/api/product/by-barcode/${encodeURIComponent(searchValue)}`;
      }

      const res = await axios.get(endpoint);
      const productData = Array.isArray(res.data) ? res.data : [res.data];
      productData.forEach(addProductToList);
      setSearchValue("");
    } catch (err) {
      console.error("Search failed:", err?.response?.data || err.message);
      Swal.fire("Error", err?.response?.data?.message || "Product not found!", "error");
      setSearchValue("");
      searchInputRef.current?.focus();
    }
  };

  const updateQuantity = (productId, quantity) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, quantity: Number(quantity) } : p))
    );
  };

  const updateColorVariant = (productId, colorVariantId) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, selectedColorVariantId: colorVariantId } : p))
    );
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  // 💰 Calculations
  const subtotal = products.reduce((acc, p) => {
    const price = Number(p.price) || 0;
    const off = Number(p.off) || 0;
    const discounted = price * (1 - off / 100);
    return acc + discounted * (Number(p.quantity) || 0);
  }, 0);

  const discountAmount = customDiscount ? Number(customDiscount) || 0 : 0;
  const baseTotal = Math.max(0, subtotal - discountAmount);
  let discount = Number(discountPercent) || 0;
  if (discount < 0) discount = 0;
  if (discount > 100) discount = 100;
  const totalAmount = baseTotal * (1 - discount / 100);

  // 🧮 Cash Drawer Calculation
  const handleCashChange = (value) => {
    setCashGiven(value);
    const cashNum = parseFloat(value) || 0;
    const change = cashNum - totalAmount;
    setChangeToGive(change > 0 ? change : 0);
  };

  // Reset fields after print
  const resetBillingFields = () => {
    setProducts([]);
    setPaymentMode("Cash");
    setCustomDiscount("");
    setDiscountPercent(0);
    setSearchType("barcode");
    setSearchValue("");
    setCashGiven("");
    setChangeToGive(0);
  };

   // ===============================
  // PRINT RECEIPT FUNCTION
  // ===============================
  const printReceiptQZTray = async (saleData) => {
    try {
      if (!window.qz) return alert("QZ Tray is not loaded!");
      if (!window.qz.websocket?.isActive()) await window.qz.websocket.connect();
      if (!defaultPrinter) return alert("No printer selected!");

      const config = window.qz.configs.create(defaultPrinter);
      const LINE_WIDTH = 48;

      const pad = (text, length, alignRight = false) => {
        text = String(text ?? "");
        if (text.length >= length) return text.slice(0, length);
        return alignRight
          ? " ".repeat(length - text.length) + text
          : text + " ".repeat(length - text.length);
      };

      const center = (text) => {
        text = String(text ?? "");
        if (text.length >= LINE_WIDTH) return text.slice(0, LINE_WIDTH);
        const left = Math.floor((LINE_WIDTH - text.length) / 2);
        const right = LINE_WIDTH - text.length - left;
        return " ".repeat(left) + text + " ".repeat(right);
      };

      let r = "";
      r += "\x1B\x45\x01"; // Bold
      r += "\x1B\x61\x01"; // Center
      r += (saleData.shopName?.toUpperCase() || "") + "\n";
      r += "\x1B\x45\x00"; // Bold off
      if (saleData.address) r += center(saleData.address) + "\n";
      if (saleData.phone) r += center("Ph: " + saleData.phone) + "\n";
      r += "-".repeat(LINE_WIDTH) + "\n";
      r += "\x1B\x61\x00"; // Left align

      r += "Invoice: " + (saleData.invoiceNo || "N/A") + "\n";
      r +=
        "Date: " +
        new Date().toLocaleDateString() +
        "  " +
        new Date().toLocaleTimeString() +
        "\n";
      r += "-".repeat(LINE_WIDTH) + "\n";

      const ITEM_W = 22;
      const QTY_W = 6;
      const RATE_W = 8;
      const FINAL_W = 10;

      r += "\x1B\x45\x01"; // Bold table header
      r += pad("Item", ITEM_W) + pad("Qty", QTY_W, true) + pad("Rate", RATE_W, true) + pad("Final", FINAL_W, true) + "\n";
      r += "\x1B\x45\x00"; // Bold off
      r += "-".repeat(LINE_WIDTH) + "\n";

      saleData.items.forEach((item) => {
        const name = pad(item.name || "", ITEM_W);
        const qty = pad(item.quantity || item.qty || 0, QTY_W, true);
        const rate = pad((item.rate || item.price || 0).toFixed(2), RATE_W, true);
        const total = pad(
          ((item.total || (item.quantity || item.qty || 0) * (item.rate || item.price || 0)).toFixed(2)),
          FINAL_W,
          true
        );
        r += `${name}${qty}${rate}${total}\n`;
      });

      r += "-".repeat(LINE_WIDTH) + "\n";
      r += pad("Subtotal:", LINE_WIDTH - 10) + pad((saleData.subtotal || 0).toFixed(2), 10, true) + "\n";
      if (saleData.discountPercent > 0) {
        r += pad(`Discount (${saleData.discountPercent}%):`, LINE_WIDTH - 10) +
             pad(`-${(saleData.discountPercentValue || 0).toFixed(2)}`, 10, true) + "\n";
      }
      if (saleData.discountAmount > 0) {
        r += pad("Discount (Flat):", LINE_WIDTH - 10) +
             pad(`-${(saleData.discountAmount || 0).toFixed(2)}`, 10, true) + "\n";
      }
      r += "-".repeat(LINE_WIDTH) + "\n";
      r += "\x1B\x45\x01"; // Bold total
      r += pad("Total:", LINE_WIDTH - 10) + pad((saleData.totalAfterDiscount || saleData.total || 0).toFixed(2), 10, true) + "\n";
      r += "\x1B\x45\x00";
      r += "-".repeat(LINE_WIDTH) + "\n";
      r += "Payment Mode: " + (saleData.paymentMode || "N/A") + "\n\n";

      r += "\x1B\x61\x01"; // Center footer
      r += "\x1B\x45\x01";
      r += "*** THANK YOU - VISIT AGAIN ***\n";
      r += "\x1B\x45\x00";
      r += "\x1B\x61\x00";

      const escpos = ["\x1B\x40", r, "\n\n\n\n\n", "\x1D\x56\x00"];
      await window.qz.print(config, escpos);

    } catch (err) {
      console.error(err);
      alert("Print failed. Make sure QZ Tray is running and printer supports plain text!");
    }
  };


  // Create order (no change printed)
  const createOrder = async () => {
    if (!products.length) return Swal.fire("Error", "Add products first", "error");

    try {
      const res = await axios.post("/api/payment/create-offline-order", {
        products: products.map((p) => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          quantity: p.quantity,
          off: p.off,
          barcode: p.barcode,
          colorVariantId: p.selectedColorVariantId,
        })),
        paymentMode,
        clientTotal: Number(baseTotal.toFixed(2)),
        discountPercent: Number(discount),
        clientDiscountAmount: Number(discountAmount.toFixed(2)),
      });

      await printReceiptQZTray(res.data.saleDataForReceipt);
      Swal.fire("Success", "Order created successfully", "success");
      resetBillingFields();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="h-screen w-full bg-gray-100 px-8 py-6 flex flex-col gap-4">
      <div className="text-2xl font-bold text-gray-800 mb-2">Billing</div>

      {/* 🖨️ QZ Tray Status + Printer Selection */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <strong>QZ Tray Status:</strong>{" "}
          <span className={qzStatus === "Connected" ? "text-green-600" : "text-red-600"}>
            {qzStatus}
          </span>
          {qzStatus !== "Connected" && (
            <button
              onClick={initQZ}
              className="ml-4 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reconnect
            </button>
          )}
        </div>

        <div>
          <label className="font-semibold mr-2">Select Printer:</label>
          <select
            value={defaultPrinter}
            onChange={(e) => handlePrinterChange(e.target.value)}
            className="px-3 py-2 border rounded bg-white"
          >
            {printers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔍 Search */}
      <div className="flex gap-2 items-center mb-4">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-3 py-2 border rounded bg-white"
        >
          <option value="barcode">Barcode</option>
          <option value="name">Name</option>
          <option value="sku">SKU</option>
          <option value="all">All</option>
        </select>
        <input
          ref={searchInputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          placeholder={`Search by ${searchType}`}
          className="px-3 py-2 border rounded flex-1"
        />
        <button
          onClick={handleSearch}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Search
        </button>
      </div>

      {/* 🧾 Product Table */}
      <div className="overflow-x-auto bg-white rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Options</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Discount (%)</th>
              <th className="px-4 py-2">After Discount</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="text-center border-t">
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">
                  <select
                    value={p.selectedColorVariantId}
                    onChange={(e) => updateColorVariant(p._id, e.target.value)}
                    className="px-2 py-1 border rounded"
                  >
                    {p.colorVariants.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.Colorname} (Stock: {c.stock})
                      </option>
                    ))}
                  </select>
                </td>
                <td>₹{Number(p.price).toFixed(2)}</td>
                <td>{Number(p.off || 0).toFixed(1)}%</td>
                <td>
                  ₹{(Number(p.price) * (1 - Number(p.off || 0) / 100)).toFixed(2)}
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={p.quantity}
                    onChange={(e) => updateQuantity(p._id, e.target.value)}
                    className="w-16 px-2 py-1 text-center border rounded"
                  />
                </td>
                <td>
                  {(
                    (Number(p.price) * (1 - Number(p.off || 0) / 100)) *
                    p.quantity
                  ).toFixed(2)}
                </td>
                <td>
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🧮 Billing Summary + Cash Drawer */}
      <div className="flex flex-col gap-3 mt-4 bg-white px-4 py-4 rounded-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="font-semibold">Payment Mode:</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="ml-2 px-2 py-1 border rounded"
            >
              <option>Cash</option>
              <option>UPI</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Custom Discount (₹):</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              className="ml-2 w-28 px-2 py-1 border rounded"
            />
          </div>

          <div>
            <label className="font-semibold">Discount (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="ml-2 w-20 px-2 py-1 border rounded"
            />
          </div>
        </div>

        {/* 💵 Cash Drawer Section */}
        {paymentMode === "Cash" && (
          <div className="flex items-center gap-4 mt-3">
            <label className="font-semibold text-lg">Cash Given (₹):</label>
            <input
              type="number"
              value={cashGiven}
              onChange={(e) => handleCashChange(e.target.value)}
              className="w-32 px-2 py-1 border rounded text-lg"
              placeholder="Enter amount"
            />
            <span className="font-semibold text-lg text-green-700">
              Change: ₹{changeToGive.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mt-4 flex-wrap">
          <div className="font-bold text-lg">Subtotal: ₹{subtotal.toFixed(2)}</div>
          <div className="font-bold text-lg">Custom Discount: -₹{discountAmount.toFixed(2)}</div>
          <div className="font-bold text-lg">Total After Discount: ₹{totalAmount.toFixed(2)}</div>
          <button
            onClick={createOrder}
            className="bg-green-600 px-8 py-2 rounded text-white text-xl font-semibold hover:bg-green-700"
          >
            Pay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;