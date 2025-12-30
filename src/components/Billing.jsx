import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import Swal from "sweetalert2";
import { FaArrowRight } from "react-icons/fa6";
import { VscDebugContinue } from "react-icons/vsc";

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [customDiscount, setCustomDiscount] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [searchType, setSearchType] = useState("barcode");
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = React.useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const suggestionsTimerRef = React.useRef(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: ""
  });

  // 🖨️ QZ Tray
  const [printers, setPrinters] = useState([]);
  const [defaultPrinter, setDefaultPrinter] = useState("");
  const [qzStatus, setQzStatus] = useState("Loading...");
  const [qrUrl, setQrUrl] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      // Normalize discount/price fields from product object to avoid incorrect display
      const offVal =
        Number(
          product.off ??
            product.discount ??
            product.discountPercent ??
            product.discountPercentage ??
            0
        ) || 0;

      const basePrice =
        Number(
          product.UnitPrice ??
            product.unitPrice ??
            product.price ??
            product.mrp ??
            0
        ) || 0;

      const displayPrice =
        Math.round(basePrice * (1 - offVal / 100) * 100) / 100;

      const primaryBarcode =
        product.barcode ||
        (Array.isArray(product.barcodes) ? product.barcodes[0] : "") ||
        "";

      setProducts((prev) => [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          basePrice,
          price: displayPrice, // price after discount for quick display
          off: offVal,
          barcode: primaryBarcode,
          quantity: 1,
          colorVariants: product.colorVariants || [],
          // if backend gives matchedVariantId (SKU search), use that first
          selectedColorVariantId:
            product.matchedVariantId ||
            product.colorVariants?.[0]?._id ||
            null,
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
          endpoint = `/api/product/by-barcode/${encodeURIComponent(
            searchValue
          )}`;
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
          endpoint = `/api/product/by-barcode/${encodeURIComponent(
            searchValue
          )}`;
      }

      const res = await axios.get(endpoint);
      const productData = Array.isArray(res.data) ? res.data : [res.data];
      productData.forEach(addProductToList);
      setSearchValue("");
      // clear suggestions after explicit search
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (err) {
      console.error("Search failed:", err?.response?.data || err.message);
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Product not found!",
        "error"
      );
      setSearchValue("");
      searchInputRef.current?.focus();
    }
  };

  // --- Suggestions (debounced) for name, sku, and all ---
  useEffect(() => {
    // we only show suggestions for these search types
    if (!["name", "sku", "all"].includes(searchType)) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // clear previous timer
    if (suggestionsTimerRef.current) {
      clearTimeout(suggestionsTimerRef.current);
    }

    if (!searchValue || searchValue.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);

    suggestionsTimerRef.current = setTimeout(async () => {
      try {
        const term = encodeURIComponent(searchValue.trim());
        let endpoint = "";

        if (searchType === "name") {
          // name-specific endpoint
          endpoint = `/api/product/by-name/${term}`;
        } else {
          // sku & all use smart search (barcode+sku+name)
          endpoint = `/api/product/search/${term}`;
        }

        const res = await axios.get(endpoint);
        const list = Array.isArray(res.data) ? res.data : [res.data];
        setSuggestions(list.slice(0, 8)); // limit suggestions
        setShowSuggestions(true);
      } catch (err) {
        console.error("Suggestion fetch failed:", err?.response?.data || err);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);

    return () => {
      if (suggestionsTimerRef.current) {
        clearTimeout(suggestionsTimerRef.current);
      }
    };
  }, [searchValue, searchType]);

  const handleSuggestionClick = (prod) => {
    addProductToList(prod);
    setSearchValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const updateQuantity = (productId, quantity) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, quantity: Number(quantity) } : p
      )
    );
  };

  const updateColorVariant = (productId, colorVariantId) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId
          ? { ...p, selectedColorVariantId: colorVariantId }
          : p
      )
    );
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  // 💰 Calculations
  const subtotal = products.reduce((acc, p) => {
    const base = Number(p.basePrice ?? p.price) || 0;
    const off = Number(p.off) || 0;
    const discountedUnit =
      Math.round(base * (1 - off / 100) * 100) / 100;
    return acc + discountedUnit * (Number(p.quantity) || 0);
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
     setCustomerInfo({ name: "", phone: "" });
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

    // ===== HEADER =====
    r += "\x1B\x45\x01"; // Bold
    r += "\x1B\x61\x01"; // Center
    r += (saleData.shopName?.toUpperCase() || "") + "\n";
    r += "\x1B\x45\x00"; // Bold off
    if (saleData.address) r += center(saleData.address) + "\n";
    if (saleData.phone) r += center("Ph: " + saleData.phone) + "\n";
    r += "-".repeat(LINE_WIDTH) + "\n";
    r += "\x1B\x61\x00"; // Left align

    // Invoice number as normal text (top)
    r += "Invoice: " + (saleData.invoiceNo || "N/A") + "\n";
    r +=
      "Date: " +
      new Date().toLocaleDateString() +
      "  " +
      new Date().toLocaleTimeString() +
      "\n";
    r += "-".repeat(LINE_WIDTH) + "\n";

    // ===== ITEMS TABLE =====
    const ITEM_W = 22;
    const QTY_W = 6;
    const RATE_W = 8;
    const FINAL_W = 10;

    r += "\x1B\x45\x01"; // Bold table header
    r +=
      pad("Item", ITEM_W) +
      pad("Qty", QTY_W, true) +
      pad("Rate", RATE_W, true) +
      pad("Final", FINAL_W, true) +
      "\n";
    r += "\x1B\x45\x00"; // Bold off
    r += "-".repeat(LINE_WIDTH) + "\n";

    saleData.items.forEach((item) => {
      const name = pad(item.name || "", ITEM_W);
      const qty = pad(item.quantity || item.qty || 0, QTY_W, true);
      const rate = pad(
        (item.rate || item.price || 0).toFixed(2),
        RATE_W,
        true
      );
      const total = pad(
        (
          item.total ||
          (item.quantity || item.qty || 0) *
            (item.rate || item.price || 0)
        ).toFixed(2),
        FINAL_W,
        true
      );
      r += `${name}${qty}${rate}${total}\n`;
    });

    // ===== TOTALS =====
    r += "-".repeat(LINE_WIDTH) + "\n";
    r +=
      pad("Subtotal:", LINE_WIDTH - 10) +
      pad((saleData.subtotal || 0).toFixed(2), 10, true) +
      "\n";

    const discPercent = Number(saleData.discountPercent || 0);
    const discPercentValue = Number(saleData.discountPercentValue || 0);
    const discFlat = Number(saleData.discountAmount || 0);

    r +=
      pad(`Discount (${discPercent}%):`, LINE_WIDTH - 10) +
      pad(`-${discPercentValue.toFixed(2)}`, 10, true) +
      "\n";
    r +=
      pad("Discount (Flat):", LINE_WIDTH - 10) +
      pad(`-${discFlat.toFixed(2)}`, 10, true) +
      "\n";
    r += "-".repeat(LINE_WIDTH) + "\n";

    r += "\x1B\x45\x01"; // Bold total
    r +=
      pad("Total:", LINE_WIDTH - 10) +
      pad(
        (saleData.totalAfterDiscount || saleData.total || 0).toFixed(2),
        10,
        true
      ) +
      "\n";
    r += "\x1B\x45\x00";
    r += "-".repeat(LINE_WIDTH) + "\n";

    r += "Payment Mode: " + (saleData.paymentMode || "N/A") + "\n\n";

    // ===== FOOTER TEXT =====
    r += "\x1B\x61\x01"; // Center footer
    r += "\x1B\x45\x01";
    r += "*** THANK YOU - VISIT AGAIN ***\n";
    r += "\x1B\x45\x00";
    r += "\x1B\x61\x00"; // Back to left

    // ===== BARCODE AT THE END (ONLY SYMBOL, NO TEXT) =====
    const invoiceCode = (saleData.invoiceNo || "").toUpperCase().trim();
    let barcodeCmd = "";

    if (invoiceCode) {
      // Center barcode
      barcodeCmd += "\x1B\x61\x01";   // ESC a 1 -> center

      // No human readable text (HRI)
      barcodeCmd += "\x1D\x48\x00";   // GS H 0

      // Barcode height
      barcodeCmd += "\x1D\x68\x50";   // GS h 80 (0x50)

      // Module width
      barcodeCmd += "\x1D\x77\x02";   // GS w 2

      // --- Code128, function B ---
      // GS k m n d1..dn
      // m = 73 (0x49) -> CODE128
      const data = invoiceCode;                 // e.g. "KTC/25-26/000000096"
      const lenChar = String.fromCharCode(data.length); // n = length

      barcodeCmd += "\x1D\x6B\x49" + lenChar + data;

      // Gap after barcode & reset alignment
      barcodeCmd += "\n\n";
      barcodeCmd += "\x1B\x61\x00";   // ESC a 0 -> left
    }

    // ===== SEND TO PRINTER =====
    const escpos = [
      "\x1B\x40",   // init
      r,            // text part
      barcodeCmd,   // barcode at bottom
      "\n\n\n",     // extra feed
      "\x1D\x56\x00"// full cut
    ];

    await window.qz.print(config, escpos);
  } catch (err) {
    console.error(err);
    alert(
      "Print failed. Make sure QZ Tray is running and printer supports ESC/POS!"
    );
  }
};


// Create order (no change printed)
const createOrder = async (extra = {}) => {
  if (isProcessing) return;

  if (!products.length) {
    return Swal.fire("Error", "Add products first", "error");
  }

  // Optional customer validation (NON-blocking)
  if (
    extra.customer?.phone &&
    !/^[6-9]\d{9}$/.test(extra.customer.phone)
  ) {
    return Swal.fire(
      "Invalid Phone",
      "Please enter a valid 10-digit mobile number",
      "warning"
    );
  }

  setIsProcessing(true);

  // Prepare payload
  const payload = {
    products: products.map((p) => ({
      _id: p._id,
      name: p.name,
      price: p.basePrice ?? p.price,
      quantity: p.quantity,
      off: p.off,
      barcode: p.barcode,
      colorVariantId: p.selectedColorVariantId,
    })),
    paymentMode,
    discountPercent: Number(discount),
    clientDiscountAmount: Number(discountAmount.toFixed(2)),
    ...(extra.customer ? { customer: extra.customer } : {}),
  };

  try {
    // =====================
    // UPI FLOW
    // =====================
    if (paymentMode === "UPI") {
      const res = await axios.post(
        "/api/payment/create-offline-order",
        payload
      );

      const qr =
        res?.data?.qrCode ||
        res?.data?.qr ||
        res?.data?.qr_url ||
        res?.data?.payment_qr;

      const upiUri =
        res?.data?.upiUri || res?.data?.upi_uri || null;

      const orderId =
        res?.data?.order?._id || res?.data?.order?.id || null;

      if (orderId) setCreatedOrderId(orderId);

      if (qr) {
        setQrUrl(qr);
        setShowQrModal(true);
      } else if (upiUri) {
        setQrUrl("");
        setShowQrModal(true);
        Swal.fire(
          "Info",
          "UPI URI returned. Please copy it from the modal.",
          "info"
        );
      } else {
        Swal.fire(
          "Error",
          "UPI payment initiation failed.",
          "error"
        );
      }

      return; // stop flow here for UPI
    }

    // =====================
    // CASH FLOW
    // =====================
    const res = await axios.post(
      "/api/payment/create-offline-order",
      payload
    );

    await printReceiptQZTray(res.data.saleDataForReceipt);

    Swal.fire("Success", "Order created successfully", "success");

    resetBillingFields();
  } catch (err) {
    console.error(err);
    Swal.fire(
      "Error",
      err?.response?.data?.message || "Something went wrong",
      "error"
    );
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="min-h-screen w-full bg-gray-200 px-8 py-6 flex flex-col gap-4">
      <div className="text-2xl font-bold text-gray-800 mb-2">Billing</div>

      {/* 🖨️ QZ Tray Status + Printer Selection */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <strong>QZ Tray Status:</strong>{" "}
          <span
            className={
              qzStatus === "Connected" ? "text-emerald-600" : "text-red-600"
            }>
            {qzStatus}
          </span>
          {qzStatus !== "Connected" && (
            <button
              onClick={initQZ}
              className="ml-4 px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">
              Reconnect
            </button>
          )}
        </div>

        <div>
          <label className="font-semibold mr-2">Select Printer:</label>
          <select
            value={defaultPrinter}
            onChange={(e) => handlePrinterChange(e.target.value)}
            className="px-3 py-2 border rounded bg-white outline-none">
            {printers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔍 Search */}
      <div className="relative flex gap-2 items-center mb-4">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-3 py-2 border rounded bg-white outline-none">
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
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          onFocus={() => {
            if (suggestions.length) setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={`Search by ${searchType}`}
          className="px-3 py-2 border rounded outline-none focus:border-emerald-500 flex-1"
        />
        <button
          onClick={handleSearch}
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
          Search
        </button>
        {/* Suggestions dropdown (name / sku / all) */}
        {showSuggestions && ["name", "sku", "all"].includes(searchType) && (
          <div
            className="absolute z-50 bg-white border rounded shadow-lg max-h-60 overflow-auto"
            style={{ left: 0, right: 0, top: "100%", marginTop: "6px" }}>
            {suggestionsLoading ? (
              <div className="p-2 text-sm text-gray-600">Loading...</div>
            ) : suggestions.length === 0 ? (
              <div className="p-2 text-sm text-gray-600">No suggestions</div>
            ) : (
              suggestions.map((s) => (
                <div
                  key={s._id}
                  onMouseDown={() => handleSuggestionClick(s)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                  <div className="font-medium">
                    {s.name} {s.matchedSKU ? `(SKU: ${s.matchedSKU})` : ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    {s.company} — {s.Subcategory || s.Maincategory || ""}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 🧾 Product Table */}
      <div className="bg-white border border-zinc-500 shadow-lg shadow-zinc-300">
        <table className="min-w-full table-auto">
          <thead className="bg-zinc-700 text-white">
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
            {products.map((p, i) => (
              <tr
                key={p._id}
                className={`text-center border-t ${
                  i % 2 === 0 ? "bg-zinc-100/80" : "bg-zinc-200/80"
                }`}>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">
                  <select
                    value={p.selectedColorVariantId}
                    onChange={(e) => updateColorVariant(p._id, e.target.value)}
                    className="px-2 py-1 border rounded">
                    {p.colorVariants.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.Colorname} (Stock: {c.stock})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  {p.off > 0 ? (
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-gray-500 line-through">
                        ₹{Number(p.basePrice).toFixed(2)}
                      </div>
                      <div className="font-semibold">
                        ₹{Number(p.price).toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <div className="font-semibold">
                      ₹{Number(p.price).toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{Number(p.off || 0).toFixed(1)}%</td>
                <td className="px-4 py-2">₹{Number(p.price).toFixed(2)}</td>
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
                  {(Number(p.price) * Number(p.quantity || 0)).toFixed(2)}
                </td>
                <td>
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
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
              className="ml-2 px-2 py-1 border rounded">
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
            <span className="font-semibold text-lg text-emerald-700">
              Change: ₹{changeToGive.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mt-4 flex-wrap">
          <div className="font-bold text-lg">
            Subtotal: ₹{subtotal.toFixed(2)}
          </div>
          <div className="font-bold text-lg">
            Custom Discount: -₹{discountAmount.toFixed(2)}
          </div>
          <div className="font-bold text-lg">
            Total After Discount: ₹{totalAmount.toFixed(2)}
          </div>
          <button
            disabled={isProcessing}
            onClick={() => setShowCustomerModal(true)}
            className="bg-emerald-600 px-8 py-2 rounded text-white text-xl font-semibold hover:bg-emerald-700">
            Pay
          </button>
        </div>
      </div>

      {/* UPI QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">UPI Payment</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-gray-600 px-2 py-1 rounded hover:bg-gray-100">
                Close
              </button>
            </div>

            {qrUrl ? (
              <div className="flex flex-col items-center">
                <img src={qrUrl} alt="UPI QR" className="max-w-full h-auto" />
                <p className="mt-2 text-sm text-gray-600">
                  Scan this QR with your UPI app to pay.
                </p>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-700">
                <div className="break-all text-xs text-gray-800">
                  No QR was returned by the server. If a UPI URI was returned,
                  copy it from the server response.
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={async () => {
                  if (!createdOrderId)
                    return Swal.fire("Error", "Order ID missing", "error");
                  try {
                    setIsProcessing(true);
                    const resp = await axios.post("/api/payment/mark-paid", {
                      orderId: createdOrderId,
                      method: "UPI",
                    });
                    if (resp.data?.success) {
                      const saleData = resp.data.saleDataForReceipt;
                      if (saleData) await printReceiptQZTray(saleData);
                      Swal.fire(
                        "Success",
                        "Payment confirmed and receipt printed",
                        "success"
                      );
                      setShowQrModal(false);
                      resetBillingFields();
                    } else {
                      Swal.fire(
                        "Error",
                        resp.data?.message || "Failed to mark paid",
                        "error"
                      );
                    }
                  } catch (err) {
                    console.error("Confirm paid error:", err);
                    Swal.fire(
                      "Error",
                      err?.response?.data?.message ||
                        "Failed to confirm payment",
                      "error"
                    );
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
                {isProcessing ? "Processing..." : "Confirm Paid & Print"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-3">
              Customer Information (Optional)
            </h3>
            <label htmlFor="customer-name">Customer Name</label>
            <input
              type="text"
              id="customer-name"
              placeholder="Customer Name"
              value={customerInfo.name}
              onChange={(e) =>
                setCustomerInfo((p) => ({ ...p, name: e.target.value }))
              }
              className="w-full mb-3 px-3 py-2 border rounded"
            />

            <label htmlFor="customer-phone">Phone Number</label>
            <input
              type="tel"
              id="customer-phone"
              placeholder="Phone Number"
              value={customerInfo.phone}
              onChange={(e) =>
                setCustomerInfo((p) => ({ ...p, phone: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-100 flex items-center gap-2"
                onClick={() => setShowCustomerModal(false)}>
                <FaArrowRight className="rotate-180" />
                Back
              </button>
              <button
                onClick={() => {
                  setShowCustomerModal(false);
                  createOrder(); // walk-in
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100 flex items-center gap-2">
                Skip
                <FaArrowRight />
              </button>

              <button
                onClick={() => {
                  setShowCustomerModal(false);
                  createOrder({
                    customer: {
                      name: customerInfo.name || null,
                      phone: customerInfo.phone || null,
                    },
                  });
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center gap-2">
                Save & Continue
                <VscDebugContinue />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
