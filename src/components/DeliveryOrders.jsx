import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MdQrCodeScanner,
  MdReceiptLong,
  MdCameraAlt,
  MdClose,
} from "react-icons/md";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { toast } from "react-toastify";
import axios from "../config/axios";

const DeliveryOrders = () => {
  /* ================= STATES ================= */
  const [scannerOpen, setScannerOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [scannedOrder, setScannedOrder] = useState(null);

  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const scanLockRef = useRef(false); // 🔐 prevent double scan

  /* ================= START SCANNER ================= */
  const startScanning = () => {
    scanLockRef.current = false;
    setScannerOpen(true);
  };

  /* ================= STOP SCANNER ================= */
  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScannerOpen(false);
  };

  /* ================= INIT SCANNER ================= */
  useEffect(() => {
    if (!scannerOpen || !videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();

    codeReader
      .decodeFromVideoDevice(null, videoRef.current, (result) => {
        if (result && !scanLockRef.current) {
          scanLockRef.current = true; // 🔒 lock

          const scanned = result.getText();
          setInvoiceNumber(scanned);
          stopScanning();

          setTimeout(() => {
            findOrder(scanned);
          }, 300);
        }
      })
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch(() => {
        toast.error("Camera access failed");
      });

    return () => stopScanning();
  }, [scannerOpen]);

  /* ================= FIND ORDER ================= */
  const findOrder = async (orderId) => {
    if (!orderId) {
      return toast.error("Invoice number required");
    }

    try {
      const res = await axios.post("/api/delivery/find-order", { orderId });

      // 🔑 normalize backend response
      const order = res.data?.data || res.data?.order || null;

      if (res.data.success && order) {
        setScannedOrder(order);
        setConfirmModalOpen(true);
      } else {
        toast.error("Order not found");
      }
    } catch (error) {
      console.error("Failed to find order:", error);
      toast.error("Failed to find order");
    }
  };

  /* ================= CONFIRM ORDER ================= */
  const confirmOrder = () => {
    toast.success("Order accepted");
    setConfirmModalOpen(false);
    setScannedOrder(null);
    setInvoiceNumber("");

    // 👉 call accept-order API here later
  };

  return (
    <div className="h-fit text-white">
      {/* HEADER */}
      <h1 className="text-4xl font-extrabold mb-2">📦 Orders</h1>
      <p className="text-white/60 mb-10">
        Scan barcode or enter invoice to accept order
      </p>

      {/* INPUT + SCAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
        {/* INVOICE INPUT */}
        <div className="p-8 rounded-2xl bg-white/10 border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-emerald-500 text-black rounded-xl text-3xl">
              <MdReceiptLong />
            </div>
            <h2 className="text-2xl font-bold">Invoice Number</h2>
          </div>

          <input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Scan or enter invoice number"
            className="w-full px-5 py-4 rounded-xl bg-black/30 border border-white/20
                       focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
          />

          <button
            onClick={() => findOrder(invoiceNumber)}
            className="mt-6 w-full py-4 rounded-xl bg-emerald-500 text-black font-bold"
          >
            Find Order
          </button>
        </div>

        {/* SCAN */}
        <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-emerald-500 text-black rounded-xl text-3xl">
              <MdQrCodeScanner />
            </div>
            <h2 className="text-2xl font-bold">Scan Bill Barcode</h2>
          </div>

          <div className="relative h-48 rounded-xl overflow-hidden border border-emerald-400 mb-6">
            {scannerOpen ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={stopScanning}
                  className="absolute top-2 right-2 bg-black/60 p-2 rounded-full"
                >
                  <MdClose />
                </button>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-white/60">
                📷 Camera Preview
              </div>
            )}
          </div>

          <button
            onClick={scannerOpen ? stopScanning : startScanning}
            className="w-full py-4 rounded-xl bg-emerald-500 text-black font-bold flex items-center justify-center gap-2"
          >
            <MdCameraAlt />
            {scannerOpen ? "Stop Scanning" : "Start Scanning"}
          </button>
        </div>
      </div>

      {/* ================= CONFIRM MODAL ================= */}
      {confirmModalOpen && scannedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 w-full max-w-lg rounded-2xl p-6 border border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">📦 Confirm Order</h2>
              <button onClick={() => setConfirmModalOpen(false)}>
                <MdClose />
              </button>
            </div>

            <div className="text-sm text-white/80 space-y-1">
              <p><b>Order:</b> {scannedOrder.orderNumber}</p>
              <p><b>Customer:</b> {scannedOrder.customer?.name}</p>
              <p><b>Payment:</b> {scannedOrder.paymentMode}</p>
            </div>

            <div className="mt-4 space-y-3 max-h-52 overflow-y-auto">
              {scannedOrder.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 bg-white/5 p-3 rounded-xl"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-white/60">
                      Qty {item.qty} • ₹{item.total}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{scannedOrder.total}</span>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white/10"
              >
                Cancel
              </button>

              <button
                onClick={confirmOrder}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold"
              >
                Confirm Order
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrders;
