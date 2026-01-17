import { useEffect, useState } from "react";
import axios from "../../config/axios";
import SearchProduct from "./SearchProduct";
import VendorModal from "./VendorModel";
import { toast } from "react-toastify";
import { TiArrowUp } from "react-icons/ti";

const Purchase = () => {
  const [vendors, setVendors] = useState([]);
  const [showVendor, setShowVendor] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState(null);

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
  // FETCH VENDORS
  // ======================
  useEffect(() => {
    axios.get("/api/vendor/get").then((res) => {
      setVendors(res.data.data || []);
    });
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
    if (!items.length) return toast.error("Add items");

    if (invoice.purchaseMethod === "cheque" && !invoice.chequeNumber) {
      return toast.error("Enter cheque number");
    }

    const invoiceNumber =
      invoice.purchaseInvoice ||
      `INV-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

    try {
      for (const i of items) {
        await axios.post("/api/purchase-products/create", {
          ...invoice,
          purchaseInvoice: invoiceNumber,
          productId: i.productId,
          mrp: Number(i.mrp),
          purchasePrice: Number(i.purchasePrice),
          qty: i.qty,
          unit: i.unit,
          purchaseDiscount: i.purchaseDiscount,
          extraDiscount: i.extraDiscount,
          variantSku: i.variantSku,
          variantName: i.variantName,
          sellType: i.sellType,
          sellValue: i.sellValue,
          sellingPrice: i.sellingPrice,
          reorderLevel: i.reorderLevel,
        });
      }

      toast.success("Invoice saved");
      setItems([]);
    } catch (err) {
      toast.error("Failed to save invoice");
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-4">Purchase Entry</h1>

      {/* HEADER */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <input
          className="border p-2 outline-none"
          placeholder="Invoice #"
          value={invoice.purchaseInvoice}
          onChange={(e) =>
            setInvoice({ ...invoice, purchaseInvoice: e.target.value })
          }
        />

        <select
          className="border p-2 outline-none"
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

        {/* ✅ ADD / EDIT VENDOR */}
        <button
          className={`${
            invoice.vendorId ? "bg-amber-600" : "bg-emerald-600"
          } text-white rounded px-2 outline-none`}
          onClick={() => {
            const v = vendors.find((x) => x._id === invoice.vendorId);
            setVendorToEdit(v || null);
            setShowVendor(true);
          }}>
          {invoice.vendorId ? "Edit Vendor" : "+ Vendor"}
        </button>

        <select
          className="border p-2 outline-none"
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

        {/* ✅ CHEQUE NUMBER */}
        {invoice.purchaseMethod === "cheque" && (
          <input
            className="border p-2 outline-none"
            placeholder="Cheque Number"
            value={invoice.chequeNumber}
            onChange={(e) =>
              setInvoice({
                ...invoice,
                chequeNumber: e.target.value,
              })
            }
          />
        )}

        <input
          type="date"
          className="border p-2 outline-none"
          onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
        />
      </div>

      {/* ITEM ENTRY HEADER */}
      <div className="grid grid-cols-14 gap-2 bg-gray-100 p-2 text-xs font-semibold">
        <div>Product</div>
        <div>Variant</div>
        <div>Qty</div>
        <div>Unit</div>
        <div>MRP</div>
        <div>Purchase Price</div>
        <div>Sell Type</div>
        <div>Sell %</div>
        <div>Selling</div>
        <div>Comp %</div>
        <div>Vend %</div>
        <div>Profit</div>
        <div>Reorder Level</div>
      </div>

      {/* ITEM ENTRY */}
      <div className="grid grid-cols-14 gap-2 bg-gray-50 p-2">
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
                item.sellValue
              ),
              reorderLevel: p.reorderLevel || 0,
            });
            setProductVariants(p.colorVariants || []);
          }}
          clearSignal={searchClearSignal}
          initialValue={searchInitial}
        />

        {/* VARIANT */}
        <select
          className="border p-2 outline-none"
          value={item.variantSku || ""}
          onChange={(e) => {
            const sku = e.target.value || null;
            const v = productVariants.find(
              (x) => String(x.sku) === String(sku)
            );
            setItem({
              ...item,
              variantSku: sku,
              variantName: v?.Colorname || "",
            });
          }}>
          <option value="">Variant</option>
          {productVariants.map((v) => (
            <option key={v.sku} value={v.sku}>
              {v.Colorname}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="border p-2 outline-none"
          value={item.qty}
          onChange={(e) => setItem({ ...item, qty: +e.target.value })}
        />

        <input
          className="border p-2 outline-none"
          value={item.unit}
          onChange={(e) => setItem({ ...item, unit: e.target.value })}
        />

        {/* ✅ MRP DISPLAY */}
        <input
          type="number"
          className="border p-2 outline-none"
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
                item.sellValue
              ),
            });
          }}
        />

        <input
          type="number"
          className="border p-2 outline-none"
          placeholder="Purchase Price"
          value={item.purchasePrice}
          onChange={(e) => setItem({ ...item, purchasePrice: +e.target.value })}
        />

        <select
          className="border p-2 outline-none"
          value={item.sellType}
          onChange={(e) => {
            const type = e.target.value;
            setItem({
              ...item,
              sellType: type,
              sellingPrice: calculateSellingFromMRP(
                item.mrp,
                type,
                item.sellValue
              ),
            });
          }}>
          <option value="percentage">%</option>
          <option value="flat">₹</option>
        </select>

        <input
          type="number"
          className="border p-2 outline-none"
          placeholder={item.sellType === "percentage" ? "Sell %" : "Sell ₹"}
          value={item.sellValue}
          onChange={(e) => {
            const v = e.target.value;
            setItem({
              ...item,
              sellValue: v,
              sellingPrice: calculateSellingFromMRP(item.mrp, item.sellType, v),
            });
          }}
        />

        <input
          className="border p-2 bg-gray-100 outline-none"
          value={item.sellingPrice.toFixed(2)}
          readOnly
        />

        <input
          type="number"
          className="border p-2 outline-none"
          value={item.purchaseDiscount}
          onChange={(e) =>
            setItem({
              ...item,
              purchaseDiscount: +e.target.value,
            })
          }
        />

        <input
          type="number"
          className="border p-2 outline-none"
          value={item.extraDiscount}
          onChange={(e) =>
            setItem({
              ...item,
              extraDiscount: +e.target.value,
            })
          }
        />

        <div className="text-xs font-semibold outline-none font-PublicSans">
          ₹{calculateProfit(item).profitPerUnit} (
          {calculateProfit(item).profitPercent}%)
        </div>

        <input
          type="number"
          className="border p-2 outline-none"
          placeholder="Reorder Level"
          value={item.reorderLevel}
          onChange={(e) => setItem({ ...item, reorderLevel: +e.target.value })}
        />

        <button
          onClick={addItem}
          className="bg-green-600 outline-none text-white rounded">
          Add
        </button>
      </div>

      {/* TABLE */}
      {items.length > 0 && (
        <table className="w-full mt-6 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">Product</th>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">Variant</th>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">MRP</th>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">Purchase Price</th>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">Cost</th>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">Selling</th>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">Profit</th>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">Reorder Level</th>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">Qty</th>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">Total</th>
              <th className="border-r-1 p-2 font-Inter uppercase text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => {
              const { cost, profitPerUnit, profitPercent } = calculateProfit(i);

              return (
                <tr key={idx} className="text-center border-t">
                  <td className="border-r-1 text-sm">{i.productName}</td>
                  <td className="border-r-1 text-sm">{i.variantName || "-"}</td>
                  <td className="border-r-1 text-sm">₹{i.mrp}</td>
                  <td className="border-r-1 text-sm">₹{i.purchasePrice}</td>
                  <td className="border-r-1 text-sm">₹{cost}</td>
                  <td className="border-r-1 text-sm">₹{i.sellingPrice}</td>
                  <td
                    className={
                      profitPerUnit >= 0
                        ? "text-green-600 border-black border-r-1"
                        : "text-red-600 border-black border-r-1"
                    }>
                    {profitPerUnit > 0 ? (
                      <TiArrowUp className="inline mb-1 text-lg" />
                    ) : (
                      <TiArrowUp className="inline mb-1 text-lg rotate-180" />
                    )}
                    ₹{profitPerUnit} ({profitPercent}%)
                  </td>                  <td className="border-r-1">{i.reorderLevel}</td>                  <td className="border-r-1">{i.qty}</td>
                  <td className="font-semibold border-r-1 text-sm px-1">
                    ₹{(i.sellingPrice * i.qty).toFixed(2)}
                  </td>
                  <td className="p-2 flex justify-center gap-x-2">
                    <button
                      onClick={() => handleEditItem(idx)}
                      className="px-2 py-1 w-full bg-amber-500 cursor-pointer outline-none uppercase font-PublicSans text-white rounded transition-colors hover:bg-amber-700">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(idx)}
                      className="px-2 py-1 w-full bg-rose-500 outline-none cursor-pointer uppercase font-PublicSans text-white rounded transition-colors hover:bg-rose-700">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <button
        onClick={saveInvoice}
        className="mt-6 bg-black text-white px-4 py-2 rounded">
        Save Invoice
      </button>

      {showVendor && (
        <VendorModal
          vendor={vendorToEdit}
          onClose={() => setShowVendor(false)}
          onCreated={(v) => setVendors([v, ...vendors])}
        />
      )}
    </div>
  );
};

export default Purchase;
