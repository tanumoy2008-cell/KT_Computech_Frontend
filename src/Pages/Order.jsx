import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../config/axios";
import { motion } from "framer-motion";

const Order = () => {
  // Admin orders viewer
  const [orders, setOrders] = useState(
    Array.from({ length: 30 }).map((_, i) => ({
      _id: `orderid${i + 1}`,
      paymentMode: i % 2 === 0 ? "Cash" : "UPI",
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      total: 1700 + i * 10,
      orderNumber: `${1001 + i}`,
      items: [
        { name: "Product A", qty: 2, total: 200 },
        { name: "Product B", qty: 1, total: 100 },
        { name: "Product C", qty: 5, total: 500 },
        { name: "Product D", qty: 9, total: 900 },
      ],
      status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "Completed" : "Cancelled",
    }))
  );

  const [statusFilter, setStatusFilter] = useState("all"); // all | Pending | Completed
  const onlineOrders = orders.filter(
    (o) => o.paymentMode === "UPI" && (statusFilter === "all" || o.status === statusFilter)
  );
  const offlineOrders = orders.filter(
    (o) => o.paymentMode === "Cash" && (statusFilter === "all" || o.status === statusFilter)
  );

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const res = await axios.get("/api/order");
//         if (res.status === 200) setOrders(res.data.orders || []);
//       } catch (err) {
//         // silently ignore — API may not exist yet or requires auth
//       }
//     };
//     fetchOrders();
//   }, []);

  return (
    <div className="flex flex-col px-5 md:px-8 py-6 w-full min-h-screen">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="font-PublicSans text-3xl lg:text-4xl font-bold">All Orders</h1>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "Pending", label: "Pending" },
            { key: "Completed", label: "Completed" },
            { key: "Cancelled", label: "Cancelled" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1 rounded text-sm font-PublicSans ${statusFilter === f.key ? 'bg-amber-400 text-black' : 'bg-zinc-100 text-zinc-800'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-zinc-600">
          Online: <span className="font-semibold">{onlineOrders.length}</span> &nbsp;|&nbsp; Offline: <span className="font-semibold">{offlineOrders.length}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Online Orders Column */}
        <div className="flex flex-col gap-4 border-r pr-4 h-[85vh] relative overflow-y-auto">
          <h2 className="text-lg font-semibold text-center sticky top-0 bg-white">Online Orders (UPI)</h2>
          {onlineOrders.length === 0 ? (
            <p className="text-zinc-500 text-center">No online orders match the filter.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {onlineOrders.map((o, i) => (
                  <div key={o._id || i} className="p-3 border rounded-md bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">Order: {o.orderNumber}</div>
                        <div className="text-sm text-zinc-600">{new Date(o.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{o.total}</div>
                        <div className="text-sm text-zinc-600">{o.status}</div>
                        <button className="bg-sky-600 px-4 py-2 rounded tracking-wider text-white font-PublicSans font-semibold cursor-pointer hover:bg-sky-700">Order Details</button>
                      </div>
                    </div>
                    <div className="mt-2 border-t pt-2">
                      {o.items &&
                        o.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <div>{it.name} x {it.qty}</div>
                            <div>₹{it.total}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        {/* Offline Orders Column */}
        <div className="flex flex-col gap-4 h-[85vh] relative overflow-y-auto">
          <h2 className="text-lg font-semibold text-center sticky top-0 bg-white">Offline Orders (Cash)</h2>
          {offlineOrders.length === 0 ? (
            <p className="text-zinc-500 text-center">No offline orders match the filter.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {offlineOrders.map((o, i) => (
                  <div key={o._id || i} className="p-3 border rounded-md bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">Order: {o.orderNumber}</div>
                        <div className="text-sm text-zinc-600">{new Date(o.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{o.total}</div>
                        <div className="text-sm text-zinc-600">{o.status}</div>
                        <button className="bg-sky-600 px-4 py-2 rounded tracking-wider text-white font-PublicSans font-semibold cursor-pointer hover:bg-sky-700">Order Details</button>
                      </div>
                    </div>
                    <div className="mt-2 border-t pt-2">
                      {o.items &&
                        o.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <div>{it.name} x {it.qty}</div>
                            <div>₹{it.total}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;