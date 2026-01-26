import { useEffect, useState } from "react";
import axios from "../../config/axios";
import SearchProduct from "./SearchProduct";
import { toast } from "react-toastify";
import { TiArrowUp } from "react-icons/ti";

const Purchase = () => {
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);

  // Filters
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterVendorId, setFilterVendorId] = useState("");
  const [filterInvoice, setFilterInvoice] = useState("");

  const [items, setItems] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [searchClearSignal, setSearchClearSignal] = useState(0);
  const [searchInitial, setSearchInitial] = useState("");

  const [invoice, setInvoice] = useState({
    purchaseInvoice: "",
    vendorId: "",
    purchaseMethod: "cash",
    chequeNumber: "", // ✅ NEW
    date: "",
  });

  const [item, setItem] = useState({
    productId: "",
    productName: "",
    mrp: 0, // ✅ MRP
    purchasePrice: 0, // COST
    qty: 1,
    unit: "pic's",
    purchaseDiscount: 0,
    extraDiscount: 0,
    variantSku: null,
    variantName: "",
    sellType: "percentage",
    sellValue: 20,
    sellingPrice: 0,
    reorderLevel: 0,
  });

  // ======================
  // CALCULATIONS
  // ======================

  const calculateProfit = (i) => {
    const cost = calculateEffectiveCost(
      i.purchasePrice,
      i.purchaseDiscount,
      i.extraDiscount
    );
    const sell = Number(i.sellingPrice || 0);
    const profitPerUnit = +(sell - cost).toFixed(2);
    const profitPercent =
      sell > 0 ? +((profitPerUnit / sell) * 100).toFixed(2) : 0;

    return { cost, profitPerUnit, profitPercent };
  };

  // ======================
  // FETCH VENDORS
  // ======================
  useEffect(() => {
    axios.get("/api/vendor").then((res) => {
      setVendors(res.data.vendors || []);
    });
  }, []);

  // ======================
  // FETCH PURCHASES
  // ======================
  const fetchPurchases = async (opts = {}) => {
    try {
      const params = {};
      // allow passing overrides via opts
      const sDate = opts.startDate ?? filterStartDate;
      const eDate = opts.endDate ?? filterEndDate;
      const vId = opts.vendorId ?? filterVendorId;
      const invoice = opts.invoice ?? filterInvoice;

      if (sDate) params.startDate = sDate;
      if (eDate) params.endDate = eDate;
      if (vId) params.vendorId = vId;
      if (invoice) params.invoice = invoice.trim();

      const res = await axios.get("/api/purchase-products/get-all", { params });
      setPurchases(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch purchases");
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // ======================
  // CALCULATIONS
  // ======================
  const calculateSellingFromMRP = (mrp, type, value) => {
    const m = Number(mrp || 0);
    const v = Number(value || 0);
    if (!m) return 0;

    return type === "percentage"
      ? +(m * (1 - v / 100)).toFixed(2)
      : +(m - v).toFixed(2);
  };


   const calculateEffectiveCost = (mrp, d1, d2) => {
     let p = Number(mrp || 0);
     p *= 1 - Number(d1 || 0) / 100;
     p *= 1 - Number(d2 || 0) / 100;
     return +p.toFixed(2);
   };

  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
    // Populate the form with purchase data
    setInvoice({
      purchaseInvoice: purchase.purchaseInvoice,
      vendorId: purchase.vendorId,
      purchaseMethod: purchase.purchaseMethod,
      chequeNumber: purchase.chequeNumber || "",
      date: purchase.date,
    });
    setItem({
      productId: purchase.productId,
      productName: purchase.productName,
      mrp: purchase.mrp,
      purchasePrice: purchase.purchasePrice,
      qty: purchase.qty,
      unit: purchase.unit,
      purchaseDiscount: purchase.purchaseDiscount,
      extraDiscount: purchase.extraDiscount,
      variantSku: purchase.variantSku,
      variantName: purchase.variantName,
      sellType: purchase.sellType,
      sellValue: purchase.sellValue,
      sellingPrice: purchase.sellingPrice,
      reorderLevel: purchase.reorderLevel,
    });
    setItems([{
      productId: purchase.productId,
      productName: purchase.productName,
      mrp: purchase.mrp,
      purchasePrice: purchase.purchasePrice,
      qty: purchase.qty,
      unit: purchase.unit,
      purchaseDiscount: purchase.purchaseDiscount,
      extraDiscount: purchase.extraDiscount,
      variantSku: purchase.variantSku,
      variantName: purchase.variantName,
      sellType: purchase.sellType,
      sellValue: purchase.sellValue,
      sellingPrice: purchase.sellingPrice,
      reorderLevel: purchase.reorderLevel,
    }]);
    setSearchInitial(purchase.productName);
    // Fetch product variants if needed
    axios.get(`/api/product/get/${purchase.productId}`).then((res) => {
      setProductVariants(res.data.colorVariants || []);
    });
    setShowModal(true);
  };

  const handleDeletePurchase = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase?")) return;
    try {
      await axios.delete(`/api/purchase-products/delete/${id}`);
      toast.success("Purchase deleted");
      fetchPurchases();
    } catch (err) {
      toast.error("Failed to delete purchase");
    }
  };

  const handleAddNew = () => {
    setEditingPurchase(null);
    setInvoice({
      purchaseInvoice: "",
      vendorId: "",
      purchaseMethod: "cash",
      chequeNumber: "",
      date: "",
    });
    setItem({
      productId: "",
      productName: "",
      mrp: 0,
      purchasePrice: 0,
      qty: 1,
      unit: "pic's",
      purchaseDiscount: 0,
      extraDiscount: 0,
      variantSku: null,
      variantName: "",
      sellType: "percentage",
      sellValue: 20,
      sellingPrice: 0,
      reorderLevel: 0,
    });
    setSearchInitial("");
    setProductVariants([]);
    setSearchClearSignal((s) => s + 1);
    setItems([]);
    setShowModal(true);
  };

  // ======================
  // ACTIONS
  // ======================
  const addItem = () => {
    if (!item.productId) return toast.error("Select product");
    if (!item.mrp) return toast.error("Enter MRP");
    if (!invoice.vendorId) return toast.error("Select vendor");

    setItems((prev) => [...prev, item]);

    setItem({
      productId: "",
      productName: "",
      mrp: "",
      purchasePrice: 0,
      qty: 1,
      unit: "pic's",
      purchaseDiscount: 0,
      extraDiscount: 0,
      variantSku: null,
      variantName: "",
      sellType: "percentage",
      sellValue: 20,
      sellingPrice: 0,
      reorderLevel: 0,
    });

    setProductVariants([]);
    setSearchClearSignal((s) => s + 1);
    setSearchInitial("");
  };

  const handleEditItem = (index) => {
    const it = items[index];
    setItems((prev) => prev.filter((_, i) => i !== index));
    setItem(it);
    setSearchInitial(it.productName);
  };

  const handleDeleteItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const saveInvoice = async () => {
    if (!invoice.vendorId) return toast.error("Select vendor");
    if (items.length === 0) return toast.error("Add at least one product");

    if (invoice.purchaseMethod === "cheque" && !invoice.chequeNumber) {
      return toast.error("Enter cheque number");
    }

    const invoiceNumber =
      invoice.purchaseInvoice ||
      `INV-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

    try {
      for (const it of items) {
        const payload = {
          ...invoice,
          purchaseInvoice: invoiceNumber,
          productId: it.productId,
          mrp: Number(it.mrp),
          purchasePrice: Number(it.purchasePrice),
          qty: it.qty,
          unit: it.unit,
          purchaseDiscount: it.purchaseDiscount,
          extraDiscount: it.extraDiscount,
          variantSku: it.variantSku,
          variantName: it.variantName,
          sellType: it.sellType,
          sellValue: it.sellValue,
          sellingPrice: it.sellingPrice,
          reorderLevel: it.reorderLevel,
        };

        if (editingPurchase) {
          await axios.put(`/api/purchase-products/update/${editingPurchase._id}`, payload);
        } else {
          await axios.post("/api/purchase-products/create", payload);
        }
      }
      toast.success(editingPurchase ? "Purchase updated" : "Purchase created");
      setShowModal(false);
      fetchPurchases();
    } catch (err) {
      toast.error("Failed to save purchase");
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="min-h-screen bg-gray-200 rounded-lg p-6">
      <div className="max-w-8xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Previous Purchases
          </h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            New Purchase
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg mb-4 flex flex-col md:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm text-gray-600 mr-2">From</label>
            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="border px-2 py-1 rounded" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm text-gray-600 mr-2">To</label>
            <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="border px-2 py-1 rounded" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm text-gray-600 mr-2">Vendor</label>
            <select value={filterVendorId} onChange={(e) => setFilterVendorId(e.target.value)} className="border px-2 py-1 rounded">
              <option value="">All Vendors</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm text-gray-600 mr-2">Invoice</label>
            <input type="text" value={filterInvoice} onChange={(e) => setFilterInvoice(e.target.value)} placeholder="Invoice# or partial" className="border px-2 py-1 rounded" />
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => fetchPurchases()} className="px-4 py-2 bg-emerald-600 text-white rounded">Filter</button>
            <button onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterVendorId(''); setFilterInvoice(''); fetchPurchases({ startDate: '', endDate: '', vendorId: '', invoice: '' }); }} className="px-4 py-2 bg-gray-200 rounded">Clear</button>
          </div>
        </div>

        {/* PURCHASES TABLE */}
        <div className="bg-white p-2 rounded-lg w-full shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-center font-PublicSans">
              <thead className="bg-gray-100 text-sm">
                <tr>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    Invoice
                  </th>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    Variant
                  </th>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    MRP
                  </th>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    Purchase Price
                  </th>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    Cost
                  </th>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    Selling
                  </th>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    Profit
                  </th>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    Qty
                  </th>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="border border-gray-300 p-3 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => {
                  const { cost, profitPerUnit, profitPercent } =
                    calculateProfit(p);
                  return (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">
                        {p.purchaseInvoice}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {p.productName}
                      </td>
                      <td className="border border-gray-300 uppercase p-3">
                        {p.variantName || "-"}
                      </td>
                      <td className="border border-gray-300 p-3 font-semibold">₹{p.mrp}</td>
                      <td className="border border-gray-300 p-3 font-semibold">
                        ₹{p.purchasePrice}
                      </td>
                      <td className="border border-gray-300 p-3">₹{cost}</td>
                      <td className="border border-gray-300 p-3">
                        ₹{p.sellingPrice}
                      </td>
                      <td
                        className={`border border-gray-300 p-3 ${profitPerUnit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {profitPerUnit > 0 ? (
                          <TiArrowUp className="inline mr-1" />
                        ) : (
                          <TiArrowUp className="inline mr-1 rotate-180" />
                        )}
                        ₹{profitPerUnit} ({profitPercent}%)
                      </td>
                      <td className="border border-gray-300 p-3">{p.qty}</td>
                      <td className="border border-gray-300 p-3 font-semibold">
                        ₹{(p.sellingPrice * p.qty).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPurchase(p)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePurchase(p._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingPurchase ? "Edit Purchase" : "New Purchase"}
              </h2>

              {/* HEADER */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Invoice Number
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated if empty"
                    value={invoice.purchaseInvoice}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        purchaseInvoice: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Vendor
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={invoice.vendorId}
                    onChange={(e) =>
                      setInvoice({ ...invoice, vendorId: e.target.value })
                    }>
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={invoice.purchaseMethod}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        purchaseMethod: e.target.value,
                        chequeNumber: "",
                      })
                    }>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="credit">Credit</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                {invoice.purchaseMethod === "cheque" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Cheque Number
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter cheque number"
                      value={invoice.chequeNumber}
                      onChange={(e) =>
                        setInvoice({
                          ...invoice,
                          chequeNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={invoice.date}
                    onChange={(e) =>
                      setInvoice({ ...invoice, date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* ITEM ENTRY FORM */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Product
                  </label>
                  <SearchProduct
                    onSelect={(p) => {
                      setItem({
                        ...item,
                        productId: p._id,
                        productName: p.name,
                        mrp: p.price,
                        purchasePrice: p.lastPurchasePrice || 0,
                        sellingPrice: calculateSellingFromMRP(
                          p.price,
                          item.sellType,
                          item.sellValue,
                        ),
                        reorderLevel: p.reorderLevel || 0,
                      });
                      setProductVariants(p.colorVariants || []);
                    }}
                    clearSignal={searchClearSignal}
                    initialValue={searchInitial}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Variant
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.variantSku || ""}
                    onChange={(e) => {
                      const sku = e.target.value || null;
                      const v = productVariants.find(
                        (x) => String(x.sku) === String(sku),
                      );
                      setItem({
                        ...item,
                        variantSku: sku,
                        variantName: v?.Colorname || "",
                      });
                    }}>
                    <option value="">Select Variant</option>
                    {productVariants.map((v) => (
                      <option key={v.sku} value={v.sku}>
                        {v.Colorname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.qty}
                    onChange={(e) => setItem({ ...item, qty: +e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Unit
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.unit}
                    onChange={(e) => setItem({ ...item, unit: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    MRP
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MRP"
                    value={item.mrp}
                    onChange={(e) => {
                      const mrp = e.target.value;
                      setItem({
                        ...item,
                        mrp,
                        sellingPrice: calculateSellingFromMRP(
                          mrp,
                          item.sellType,
                          item.sellValue,
                        ),
                      });
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Purchase Price"
                    value={item.purchasePrice}
                    onChange={(e) =>
                      setItem({ ...item, purchasePrice: +e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Sell Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.sellType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setItem({
                        ...item,
                        sellType: type,
                        sellingPrice: calculateSellingFromMRP(
                          item.mrp,
                          type,
                          item.sellValue,
                        ),
                      });
                    }}>
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {item.sellType === "percentage" ? "Sell %" : "Sell ₹"}
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.sellValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      setItem({
                        ...item,
                        sellValue: v,
                        sellingPrice: calculateSellingFromMRP(
                          item.mrp,
                          item.sellType,
                          v,
                        ),
                      });
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Selling Price
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    value={item.sellingPrice.toFixed(2)}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Purchase Discount (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.purchaseDiscount}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        purchaseDiscount: +e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Extra Discount (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.extraDiscount}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        extraDiscount: +e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Profit
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm font-semibold">
                    ₹{calculateProfit(item).profitPerUnit} (
                    {calculateProfit(item).profitPercent}%)
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Reorder Level"
                    value={item.reorderLevel}
                    onChange={(e) =>
                      setItem({ ...item, reorderLevel: +e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-center mb-4">
                <button
                  onClick={addItem}
                  className="bg-emerald-600 cursor-pointer text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors">
                  Add Product
                </button>
              </div>

              {items.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Added Products</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 p-2">
                            Product
                          </th>
                          <th className="border border-gray-300 p-2">
                            Variant
                          </th>
                          <th className="border border-gray-300 p-2">Qty</th>
                          <th className="border border-gray-300 p-2">MRP</th>
                          <th className="border border-gray-300 p-2">
                            Purchase Price
                          </th>
                          <th className="border border-gray-300 p-2">Cost</th>
                          <th className="border border-gray-300 p-2">
                            Selling Price
                          </th>
                          <th className="border border-gray-300 p-2">Profit</th>
                          <th className="border border-gray-300 p-2">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, index) => {
                          const { cost, profitPerUnit, profitPercent } =
                            calculateProfit(it);
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 p-2">
                                {it.productName}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {it.variantName || "-"}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {it.qty}
                              </td>
                              <td className="border border-gray-300 p-2">
                                ₹{it.mrp}
                              </td>
                              <td className="border border-gray-300 p-2">
                                ₹{it.purchasePrice}
                              </td>
                              <td className="border border-gray-300 p-2">
                                ₹{cost}
                              </td>
                              <td className="border border-gray-300 p-2">
                                ₹{it.sellingPrice}
                              </td>
                              <td
                                className={`border border-gray-300 p-2 ${profitPerUnit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                ₹{profitPerUnit} ({profitPercent}%)
                              </td>
                              <td className="border border-gray-300 p-2">
                                <button
                                  onClick={() => handleEditItem(index)}
                                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-1">
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(index)}
                                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={saveInvoice}
                  className="bg-emerald-600 cursor-pointer text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors mr-2">
                  {editingPurchase ? "Update" : "Save"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 cursor-pointer text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchase;
