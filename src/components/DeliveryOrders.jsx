import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MdQrCodeScanner,
  MdReceiptLong,
  MdLocalShipping,
  MdDone,
  MdReplay,
  MdCameraAlt,
  MdClose,
} from "react-icons/md";
import { BrowserMultiFormatReader } from "@zxing/browser";

const DeliveryOrders = () => {
  const orders = [];
  const [filter, setFilter] = useState("all");

  /* ================= BARCODE STATES ================= */
  const [scannerOpen, setScannerOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const videoRef = useRef(null);
  const controlsRef = useRef(null); // ✅ store controls, NOT reader

  /* ================= START SCANNER ================= */
  const startScanning = () => {
    setScannerOpen(true);
  };

  /* ================= INIT ZXING AFTER VIDEO RENDER ================= */
  useEffect(() => {
    if (!scannerOpen || !videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();

    codeReader
      .decodeFromVideoDevice(
        null, // auto-select camera (back camera on mobile)
        videoRef.current,
        (result, err) => {
          if (result) {
            const scanned = result.getText();
            setInvoiceNumber(scanned);
            stopScanning();
          }
        }
      )
      .then((controls) => {
        controlsRef.current = controls; // ✅ correct
      })
      .catch((err) => {
        console.error(err);
        alert("Camera access failed");
      });

    return () => stopScanning();
  }, [scannerOpen]);

  /* ================= STOP SCANNER ================= */
  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop(); // ✅ THIS IS THE FIX
      controlsRef.current = null;
    }
    setScannerOpen(false);
  };

  /* ================= FILTER ================= */
  const statusConfig = {
    shipped: {
      label: "Shipped",
      color: "bg-amber-400/20 text-amber-400 border-amber-400/30",
      icon: <MdLocalShipping />,
    },
    completed: {
      label: "Completed",
      color: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30",
      icon: <MdDone />,
    },
    returned: {
      label: "Returned",
      color: "bg-red-400/20 text-red-400 border-red-400/30",
      icon: <MdReplay />,
    },
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <div className="h-fit text-white">
      {/* HEADER */}
      <h1 className="text-4xl font-extrabold mb-2">📦 Orders</h1>
      <p className="text-white/60 mb-10">
        Take new orders & track your delivery history
      </p>

      {/* TAKE ORDER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
        {/* INVOICE */}
        <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
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

          <button className="mt-6 w-full py-4 rounded-xl bg-emerald-500 text-black font-bold">
            Accept Order
          </button>
        </div>

        {/* SCAN */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/20
                        border border-emerald-500/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-emerald-500 text-black rounded-xl text-3xl">
              <MdQrCodeScanner />
            </div>
            <h2 className="text-2xl font-bold">Scan Bill Barcode</h2>
          </div>

          {/* CAMERA PREVIEW */}
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

                <div className="absolute inset-0 border-2 border-dashed border-emerald-400 m-6 rounded-lg pointer-events-none" />

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

      {filteredOrders.length === 0 && (
        <p className="text-center text-white/40 mt-10">
          No orders found for this status
        </p>
      )}
    </div>
  );
};

export default DeliveryOrders;
