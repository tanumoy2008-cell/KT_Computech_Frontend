import React, { useEffect, useRef, useState } from "react";
import axios from "../config/axios";
import JsBarcode from "jsbarcode";
import { toast } from "react-toastify";

const STORAGE_KEY = "tspl_safe_scales_v3";
const DEFAULT_CALIB = {
  dpi: 203,
  offsetXmm: 0,
  offsetYmm: 0,
  labelOffsetYmm: 0, // vertical nudge for entire label (mm)
  barcodeOffsetXmm: 0, // horizontal nudge for barcode only (mm)
  barcodeOffsetYmm: 0, // vertical nudge for barcode only (mm) - fine tune
  moduleWidthDots: 2,
  barcodeHeightMM: 11,
  namePreset: "medium",
  nameCustomPx: 14,
  pricePreset: "small",
  priceCustomPx: 12,
  priceUnit: "Rs.",
  nameWeight: 700,
  priceWeight: 700,
  truncate: true,
  truncateLen: 40,
  numberFontSize: 12,
  speed: 3,
  density: 12,
  useFeedAfterLabel: true,
  useBitmapForText: true,
  bitmapThreshold: 180,
};

const mmToDots = (mm, dpi) => Math.round((mm / 25.4) * dpi);
const dotsToMm = (dots, dpi) => (dots / dpi) * 25.4;
// convert printer dots -> CSS px (assumes CSS reference 96ppi)
const dotsToCssPx = (dots, dpi) => Math.round(dots * (96 / dpi));

const loadCalib = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CALIB;
    return { ...DEFAULT_CALIB, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CALIB;
  }
};
const saveCalib = (c) => localStorage.setItem(STORAGE_KEY, JSON.stringify(c));

const safeText = (s) => String(s || "").replace(/"/g, "'");

const PRESET_TO_PX = {
  small: 10,
  medium: 14,
  large: 18,
  xlarge: 22,
};

export default function BarcodePrint() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [copies, setCopies] = useState(1);
  const [printers, setPrinters] = useState([]);
  const [defaultPrinter, setDefaultPrinter] = useState("");
  const [qzStatus, setQzStatus] = useState("Loading...");
  const [calib, setCalib] = useState(loadCalib());
  const svgRef = useRef(null);
  const searchRef = useRef(null);

  // preview image objects: { dataUrl, cssWidth, cssHeight }
  const [namePreview, setNamePreview] = useState(null);
  const [pricePreview, setPricePreview] = useState(null);
  const [barcodePreview, setBarcodePreview] = useState(null);
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => saveCalib(calib), [calib]);

  // QZ init
  useEffect(() => {
    const waitForQZ = () =>
      new Promise((resolve, reject) => {
        let attempts = 0;
        const i = setInterval(() => {
          if (window.qz) {
            clearInterval(i);
            resolve(true);
          }
          attempts++;
          if (attempts > 50) {
            clearInterval(i);
            reject(new Error("QZ Tray not loaded"));
          }
        }, 100);
      });

    const init = async () => {
      try {
        setQzStatus("Connecting...");
        await waitForQZ();
        if (window.qz?.security) {
          window.qz.security.setCertificatePromise((resolve) =>
            resolve(process.env.REACT_APP_QZ_CERTIFICATE || "")
          );
        }
        if (!window.qz.websocket?.isActive?.()) await window.qz.websocket.connect();
        setQzStatus("Connected");
        const found = await window.qz.printers.find();
        setPrinters(found || []);
        const saved = localStorage.getItem("barcodePrinter");
        setDefaultPrinter(saved && found?.includes(saved) ? saved : found?.[0] || "");
      } catch (err) {
        console.error("QZ init error:", err);
        setQzStatus("Error");
      }
    };

    if (window.qz) init();
    else window.addEventListener("qz:ready", init);

    return () => {
      window.removeEventListener("qz:ready", init);
      if (window.qz?.websocket?.isActive?.()) window.qz.websocket.disconnect();
    };
  }, []);

  // Product search
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error("Enter barcode or sku");
      return;
    }
    try {
      const res = await axios.get(`/api/product/by-barcode/${encodeURIComponent(searchValue)}`);
      const product = res.data?.data ? res.data.data : res.data;
      const barcodeVal =
        product?.barcode || (Array.isArray(product?.barcodes) && product.barcodes[0]) || product?.sku || "";
      setSelectedProduct({ ...product, barcode: String(barcodeVal) });
      setSearchValue("");
      searchRef.current?.focus();
    } catch (err) {
      console.error(err);
      toast.error("Product not found");
    }
  };

  // Keep old SVG-based JsBarcode so fallback works when barcodePreview not ready
  useEffect(() => {
    const code = selectedProduct?.barcode;
    if (!code || !svgRef.current) return;
    try {
      svgRef.current.innerHTML = "";
      const format = /^\d+$/.test(code) && code.length === 13 ? "EAN13" : "CODE128";
      const previewNumFont = Math.max(10, 8 + Math.round((calib.numberFontSize || 12) / 6));
      JsBarcode(svgRef.current, String(code), {
        format,
        width: Math.max(0.8, (calib.moduleWidthDots * (calib.dpi / 203)) * 0.9),
        height: 44,
        displayValue: true,
        fontSize: previewNumFont,
        margin: 2,
      });
    } catch (e) {
      console.error("JsBarcode err", e);
    }
  }, [selectedProduct, calib]);

  // ---------- Canvas -> 1-bit Bitmap helpers ----------
  const renderTextToCanvas = ({ text, fontPx, fontFamily = "Arial", dpi = 203, maxWidthDots }) => {
    const cssPpi = 96;
    const scale = dpi / cssPpi;
    const fontSizeDots = Math.max(1, Math.round(fontPx * scale));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const cw = maxWidthDots;
    const ch = Math.max(Math.round(fontSizeDots * 1.6), fontSizeDots + 4);

    canvas.width = cw;
    canvas.height = ch;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = "#000000";

    ctx.font = `${fontSizeDots}px ${fontFamily}`;
    ctx.textBaseline = "top";

    const metrics = ctx.measureText(text);
    const textW = Math.min(metrics.width, cw);
    let x = Math.max(0, Math.round((cw - textW) / 2));
    let y = Math.round((ch - fontSizeDots) / 2);

    if (metrics.width > cw) {
      const scaleX = cw / metrics.width;
      ctx.save();
      ctx.translate(0, 0);
      ctx.scale(scaleX, 1);
      ctx.fillText(text, 0, y);
      ctx.restore();
    } else {
      ctx.fillText(text, x, y);
    }

    return canvas;
  };

  // Render barcode to SVG via JsBarcode, then rasterize into a canvas sized in printer dots
  const renderBarcodeToCanvas = async ({ code, bcType, moduleWidth, barcodeHeightDots, targetWidthDots, dpi }) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", String(targetWidthDots));
    svg.setAttribute("height", String(barcodeHeightDots + 24)); // room for text under barcode

    try {
      JsBarcode(svg, String(code), {
        format: bcType,
        width: Math.max(0.8, moduleWidth),
        height: barcodeHeightDots,
        displayValue: true,
        margin: 0,
      });
    } catch (e) {
      console.error("JsBarcode preview error", e);
    }

    const svgXml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(unescape(encodeURIComponent(svgXml)));
    const img = new Image();
    img.crossOrigin = "anonymous";
    const src = "data:image/svg+xml;base64," + svg64;

    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidthDots;
        canvas.height = barcodeHeightDots + 24;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.onerror = (e) => {
        console.error("Barcode image load failed", e);
        resolve(null);
      };
      img.src = src;
    });
  };

  const canvasToTsplHex = (canvas, threshold = 180) => {
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext("2d");
    const img = ctx.getImageData(0, 0, w, h).data;

    const widthBytes = Math.ceil(w / 8);
    const rows = [];
    for (let y = 0; y < h; y++) {
      const rowBytes = new Uint8Array(widthBytes);
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = img[idx], g = img[idx + 1], b = img[idx + 2];
        const lum = (r * 0.299 + g * 0.587 + b * 0.114);
        const bit = lum < threshold ? 1 : 0;
        const byteIndex = Math.floor(x / 8);
        const bitIndex = 7 - (x % 8);
        if (bit) rowBytes[byteIndex] |= (1 << bitIndex);
      }
      rows.push(rowBytes);
    }

    let hex = "";
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let b = 0; b < row.length; b++) {
        const v = row[b];
        const hexByte = v.toString(16).padStart(2, "0").toUpperCase();
        hex += hexByte;
      }
    }

    return { widthBytes, height: h, hex };
  };

  // ---------- Generate preview bitmaps whenever product or calibration changes ----------
  useEffect(() => {
    let mounted = true;
    const makePreview = async () => {
      setPreviewReady(false);
      setNamePreview(null);
      setPricePreview(null);
      setBarcodePreview(null);

      if (!selectedProduct) return;

      const dpi = Number(calib.dpi || 203);
      const labelWmm = 50;
      const pwDots = mmToDots(labelWmm, dpi);

      const printableW = pwDots - 12;

      // Name canvas (dots)
      const namePreviewPx = calib.namePreset === "custom" ? Number(calib.nameCustomPx || 14) : PRESET_TO_PX[calib.namePreset];
      const nameCanvas = renderTextToCanvas({
        text: calib.truncate
          ? ((selectedProduct.name || "Product").length > (calib.truncateLen || 40)
              ? (selectedProduct.name || "Product").substring(0, calib.truncateLen - 1) + "…"
              : (selectedProduct.name || "Product"))
          : (selectedProduct.name || "Product"),
        fontPx: namePreviewPx,
        dpi,
        maxWidthDots: printableW,
      });

      // Price canvas (dots)
      const pricePreviewPx = calib.pricePreset === "custom" ? Number(calib.priceCustomPx || 12) : PRESET_TO_PX[calib.pricePreset];
      const priceCanvas = renderTextToCanvas({
        text: `${calib.priceUnit || "Rs."}${(selectedProduct.price || 0).toFixed(2)}`,
        fontPx: pricePreviewPx,
        dpi,
        maxWidthDots: printableW,
      });

      // Barcode canvas
      const code = String(selectedProduct.barcode || selectedProduct.sku || "000000000000");
      const bcType = /^\d+$/.test(code) && code.length === 13 ? "EAN13" : "CODE128";
      const modules = Math.max(60, code.length * 11);
      const moduleWidth = Math.max(1, Math.round(calib.moduleWidthDots || 2));
      const barcodeWidthDots = Math.max(120, modules * moduleWidth);
      const barcodeHeightDots = mmToDots(Number(calib.barcodeHeightMM || 11), dpi);

      const barcodeCanvas = await renderBarcodeToCanvas({
        code,
        bcType,
        moduleWidth: Math.max(0.8, moduleWidth),
        barcodeHeightDots,
        targetWidthDots: barcodeWidthDots,
        dpi,
      });

      if (!mounted) return;

      // convert canvas size (dots) -> css px
      const nameCssW = dotsToCssPx(nameCanvas.width, dpi);
      const nameCssH = dotsToCssPx(nameCanvas.height, dpi);
      const priceCssW = dotsToCssPx(priceCanvas.width, dpi);
      const priceCssH = dotsToCssPx(priceCanvas.height, dpi);
      const barcodeCssW = barcodeCanvas ? dotsToCssPx(barcodeCanvas.width, dpi) : 0;
      const barcodeCssH = barcodeCanvas ? dotsToCssPx(barcodeCanvas.height, dpi) : 0;

      setNamePreview({
        dataUrl: nameCanvas.toDataURL(),
        cssWidth: nameCssW,
        cssHeight: nameCssH,
      });
      setPricePreview({
        dataUrl: priceCanvas.toDataURL(),
        cssWidth: priceCssW,
        cssHeight: priceCssH,
      });
      setBarcodePreview(
        barcodeCanvas ? { dataUrl: barcodeCanvas.toDataURL(), cssWidth: barcodeCssW, cssHeight: barcodeCssH } : null
      );

      setPreviewReady(true);
    };

    makePreview();

    return () => {
      mounted = false;
    };
  }, [selectedProduct, calib]);

  // ---------- Print function (same pipeline) ----------
  const printTSPL = async () => {
    if (!selectedProduct) {
      toast.error("Select product");
      return;
    }
    try {
      if (!window.qz) throw new Error("QZ Tray not loaded");
      if (!window.qz.websocket?.isActive?.()) await window.qz.websocket.connect();
      if (!defaultPrinter) throw new Error("No printer selected");

      const dpi = Number(calib.dpi || 203);
      const labelWmm = 50;
      const labelHmm = 25;
      const gapmm = 3;

      const pwDots = mmToDots(labelWmm, dpi);
      const phDots = mmToDots(labelHmm, dpi);

      const offXdots = mmToDots(Number(calib.offsetXmm || 0), dpi);
      const offYdots = mmToDots(Number((calib.labelOffsetYmm ?? calib.offsetYmm) || 0), dpi);
      const barcodeOffXdots = mmToDots(Number(calib.barcodeOffsetXmm || 0), dpi);
      const barcodeOffYdots = mmToDots(Number(calib.barcodeOffsetYmm || 0), dpi);

      const nameYdots = mmToDots(2.6, dpi) + offYdots;
      const priceYdots = nameYdots + mmToDots(6.0, dpi);
      const barcodeYdots = priceYdots + mmToDots(6.5, dpi) + offYdots + barcodeOffYdots;

      const nameRaw = safeText((selectedProduct.name || "Product").substring(0, 240));
      const priceRaw = safeText(`${calib.priceUnit || "Rs."}${(selectedProduct.price || 0).toFixed(2)}`);
      const code = String(selectedProduct.barcode || selectedProduct.sku || "000000000000");
      const bcType = /^\d+$/.test(code) && code.length === 13 ? "EAN13" : "CODE128";

      const modules = Math.max(60, code.length * 11);
      const moduleWidth = Math.max(1, Math.round(calib.moduleWidthDots || 2));
      const barcodeWidthDots = modules * moduleWidth;
      let barcodeXdots = Math.round((pwDots - barcodeWidthDots) / 2) + offXdots + barcodeOffXdots;
      if (barcodeXdots < 4) barcodeXdots = 4;

      const sku = safeText(selectedProduct.sku || "");
      const skuXdots = 6 + offXdots;
      const skuYdots = Math.round(phDots - mmToDots(3.5, dpi) + offYdots);

      const tsplParts = [];
      tsplParts.push(`SIZE ${labelWmm} mm,${labelHmm} mm`);
      tsplParts.push(`GAP ${gapmm} mm,0`);
      tsplParts.push(`SPEED ${Number(calib.speed || 3)}`);
      tsplParts.push(`DENSITY ${Number(calib.density || 12)}`);
      tsplParts.push(`DIRECTION 1`);
      tsplParts.push(`CLS`);

      if (calib.useBitmapForText) {
        const printableW = pwDots - 12;
        const namePreviewPx = calib.namePreset === "custom" ? Number(calib.nameCustomPx || 14) : PRESET_TO_PX[calib.namePreset] || PRESET_TO_PX.medium;
        const pricePreviewPx = calib.pricePreset === "custom" ? Number(calib.priceCustomPx || 12) : PRESET_TO_PX[calib.pricePreset] || PRESET_TO_PX.small;

        const nameCanvas = renderTextToCanvas({
          text: calib.truncate && nameRaw.length > (calib.truncateLen || 40) ? nameRaw.substring(0, calib.truncateLen - 1) + "…" : nameRaw,
          fontPx: namePreviewPx,
          dpi,
          maxWidthDots: printableW,
        });
        const nameBmp = canvasToTsplHex(nameCanvas, Number(calib.bitmapThreshold || 180));
        const nameX = Math.max(4, Math.round((pwDots - nameCanvas.width) / 2) + offXdots);
        tsplParts.push(`BITMAP ${nameX},${nameYdots},${nameBmp.widthBytes},${nameBmp.height},1,${nameBmp.hex}`);

        const priceCanvas = renderTextToCanvas({
          text: priceRaw,
          fontPx: pricePreviewPx,
          dpi,
          maxWidthDots: printableW,
        });
        const priceBmp = canvasToTsplHex(priceCanvas, Number(calib.bitmapThreshold || 180));
        const priceX = Math.max(4, Math.round((pwDots - priceCanvas.width) / 2) + offXdots);
        tsplParts.push(`BITMAP ${priceX},${priceYdots},${priceBmp.widthBytes},${priceBmp.height},1,${priceBmp.hex}`);
      } else {
        const namePx = calib.namePreset === "custom" ? Number(calib.nameCustomPx || 14) : PRESET_TO_PX[calib.namePreset] || PRESET_TO_PX.medium;
        const pricePx = calib.pricePreset === "custom" ? Number(calib.priceCustomPx || 12) : PRESET_TO_PX[calib.pricePreset] || PRESET_TO_PX.small;
        const mulFromPx = (px) => Math.max(1, Math.round(px / 6));
        const nameMul = Math.max(1, Math.min(40, mulFromPx(namePx)));
        const priceMul = Math.max(1, Math.min(40, mulFromPx(pricePx)));

        let nameToPrint = nameRaw;
        if (calib.truncate) nameToPrint = nameRaw.length > (calib.truncateLen || 40) ? nameRaw.substring(0, calib.truncateLen - 1) + "…" : nameRaw;

        const approxNameWidth = Math.round(nameToPrint.length * (6 + nameMul));
        const nameXdots = Math.max(4, Math.round((pwDots - approxNameWidth) / 2) + offXdots);
        tsplParts.push(`TEXT ${nameXdots},${nameYdots},"0",0,${nameMul},${nameMul},"${nameToPrint}"`);

        const approxPriceWidth = Math.round(priceRaw.length * (6 + priceMul));
        const priceXdots = Math.max(4, Math.round((pwDots - approxPriceWidth) / 2) + offXdots);
        tsplParts.push(`TEXT ${priceXdots},${priceYdots},"0",0,${priceMul},${priceMul},"${priceRaw}"`);
      }

      if (sku) tsplParts.push(`TEXT ${skuXdots},${skuYdots},"0",90,1,1,"${sku}"`);

      const bcHeightDots = mmToDots(Number(calib.barcodeHeightMM || 11), dpi);
      const wide = Math.max(2, Math.round(moduleWidth * 2));
      tsplParts.push(`BARCODE ${barcodeXdots},${barcodeYdots},"${bcType}",${bcHeightDots},1,0,${moduleWidth},${wide},"${code}"`);

      tsplParts.push(`PRINT ${copies}`);
      if (calib.useFeedAfterLabel) tsplParts.push(`FEED 1`);

      const tspl = tsplParts.join("\n") + "\n";

      const config = window.qz.configs.create(defaultPrinter);
      await window.qz.print(config, [{ type: "raw", format: "plain", data: tspl }]);

      toast.success(`Sent TSPL to printer (${copies} copies).`);
    } catch (err) {
      console.error("TSPL print error:", err);
      toast.error(`Print failed: ${err?.message || err}`);
    }
  };

  const updateCalib = (patch) => {
    const next = { ...calib, ...patch };
    setCalib(next);
    saveCalib(next);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" && searchValue.trim()) handleSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchValue]);

  const previewNamePx = calib.namePreset === "custom" ? Number(calib.nameCustomPx || 14) : PRESET_TO_PX[calib.namePreset];
  const previewPricePx = calib.pricePreset === "custom" ? Number(calib.priceCustomPx || 12) : PRESET_TO_PX[calib.pricePreset];

  // local image path you uploaded (for visual comparison)
  const referenceImagePath = "/mnt/data/WhatsApp Image 2025-11-24 at 2.14.23 PM.jpeg";

  // --- compute CSS positions for preview using printer dpi and label offsets ---
  const computePreviewPositions = () => {
    const dpi = Number(calib.dpi || 203);
    const labelWmm = 50;
    const labelHmm = 25;
    const pwDots = mmToDots(labelWmm, dpi);
    const offYdots = mmToDots(Number((calib.labelOffsetYmm ?? calib.offsetYmm) || 0), dpi);
    const nameYdots = mmToDots(2.6, dpi) + offYdots;
    const priceYdots = nameYdots + mmToDots(6.0, dpi);
    const barcodeYdots = priceYdots + mmToDots(6.5, dpi) + offYdots + mmToDots(Number(calib.barcodeOffsetYmm || 0), dpi);
    const skuYdots = Math.round(mmToDots(labelHmm, dpi) - mmToDots(3.5, dpi) + offYdots);
    return {
      dpi,
      pwDots,
      nameYdots,
      priceYdots,
      barcodeYdots,
      skuYdots,
      leftPadCss: dotsToCssPx(mmToDots(6, dpi), dpi),
      nameTopCss: dotsToCssPx(nameYdots, dpi),
      priceTopCss: dotsToCssPx(priceYdots, dpi),
      barcodeTopCss: dotsToCssPx(barcodeYdots, dpi),
      skuBottomCss: dotsToCssPx(6, dpi),
    };
  };

  const pos = computePreviewPositions();

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">TSPL Barcode Printing — Bitmap-capable</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search */}
        <div className="bg-white rounded p-4 shadow">
          <h2 className="font-semibold mb-2">Product Search</h2>
          <div className="flex gap-2 mb-3">
            <input ref={searchRef} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Scan or type barcode" className="flex-1 px-3 py-2 border rounded" />
            <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
          </div>
          {selectedProduct ? (
            <div className="bg-gray-50 p-3 rounded border">
              <div className="font-medium">{selectedProduct.name}</div>
              <div className="text-sm text-gray-600">SKU: {selectedProduct.sku || "N/A"}</div>
              <div className="text-sm text-gray-600">Barcode: {selectedProduct.barcode || "N/A"}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No product selected</div>
          )}
          <div className="mt-3 text-xs text-gray-600">
            Ref image:
            <div className="mt-2">
              <img src={referenceImagePath} alt="reference" style={{ maxWidth: "100%", borderRadius: 6 }} />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded p-4 shadow">
          <h2 className="font-semibold mb-2">Label Preview (50×25 mm)</h2>

          <div
            style={{
              width: "50mm",
              height: "25mm",
              position: "relative",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {/* Name bitmap */}
            {namePreview ? (
              <img
                src={namePreview.dataUrl}
                alt="name"
                style={{
                  position: "absolute",
                  left: pos.leftPadCss + "px",
                  top: pos.nameTopCss + "px",
                  width: `${namePreview.cssWidth}px`,
                  height: `${namePreview.cssHeight}px`,
                  objectFit: "contain",
                }}
              />
            ) : (
              <div style={{ position: "absolute", left: pos.leftPadCss + "px", top: pos.nameTopCss + "px" }}>Product Name</div>
            )}

            {/* Price bitmap centered */}
            {pricePreview ? (
              <img
                src={pricePreview.dataUrl}
                alt="price"
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: pos.priceTopCss + "px",
                  width: `${pricePreview.cssWidth}px`,
                  height: `${pricePreview.cssHeight}px`,
                }}
              />
            ) : (
              <div style={{ position: "absolute", left: 0, right: 0, top: pos.priceTopCss + "px", textAlign: "center" }}>
                {selectedProduct ? `${calib.priceUnit || "Rs."}${(selectedProduct.price || 0).toFixed(2)}` : ""}
              </div>
            )}

            {/* Barcode bitmap */}
            {barcodePreview ? (
              <img
                src={barcodePreview.dataUrl}
                alt="barcode"
                style={{
                  position: "absolute",
                  left: pos.leftPadCss + "px",
                  top: pos.barcodeTopCss + "px",
                  width: `${barcodePreview.cssWidth}px`,
                  height: `${barcodePreview.cssHeight}px`,
                  objectFit: "contain",
                }}
              />
            ) : (
              <svg ref={svgRef} style={{ position: "absolute", left: pos.leftPadCss + "px", top: pos.barcodeTopCss + "px", height: 44 }} />
            )}

            {/* SKU */}
            <div style={{ position: "absolute", left: pos.leftPadCss + "px", bottom: pos.skuBottomCss + "px", fontSize: 9 }}>
              <small>{selectedProduct?.sku || ""}</small>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-600">
            Tip: enable <b>Use Bitmap for Name/Price</b> to print exact large fonts (bitmap).
          </div>
        </div>

        {/* Calibration & Print */}
        <div className="bg-white rounded p-4 shadow">
          <h2 className="font-semibold mb-2">Calibration & Print</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm">Printer</label>
              <select value={defaultPrinter} onChange={(e) => { setDefaultPrinter(e.target.value); localStorage.setItem("barcodePrinter", e.target.value); }} className="w-full px-2 py-2 border rounded">
                {printers.length ? printers.map(p => <option key={p} value={p}>{p}</option>) : <option value="">No printers found</option>}
              </select>
              <div className={`mt-1 text-xs ${qzStatus === "Connected" ? "text-green-600" : "text-red-600"}`}>Status: {qzStatus}</div>
            </div>

            <div>
              <label className="block text-sm">DPI: {calib.dpi}</label>
              <input type="range" min="203" max="300" step="1" value={calib.dpi} onChange={(e) => updateCalib({ dpi: Number(e.target.value) })} />
            </div>

            <div>
              <label className="block text-sm">Label vertical offset (mm): {calib.labelOffsetYmm}</label>
              <input type="range" min={-10} max={10} step={0.1} value={calib.labelOffsetYmm} onChange={(e) => updateCalib({ labelOffsetYmm: Number(e.target.value) })} />
              <div className="text-xs text-gray-500">Move the entire label (name, price, barcode, SKU) up/down (mm).</div>
            </div>

            <div>
              <label className="block text-sm">Barcode horizontal offset (mm): {calib.barcodeOffsetXmm}</label>
              <input type="range" min={-10} max={10} step={0.5} value={calib.barcodeOffsetXmm} onChange={(e) => updateCalib({ barcodeOffsetXmm: Number(e.target.value) })} />
              <div className="text-xs text-gray-500">Move barcode left/right independently (mm).</div>
            </div>

            <div>
              <label className="block text-sm">Barcode vertical offset (mm): {calib.barcodeOffsetYmm}</label>
              <input type="range" min={-10} max={10} step={0.5} value={calib.barcodeOffsetYmm} onChange={(e) => updateCalib({ barcodeOffsetYmm: Number(e.target.value) })} />
              <div className="text-xs text-gray-500">Fine-tune barcode up/down relative to label (mm).</div>
            </div>

            {/* rest of calibration controls (same as before) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">Name preset</label>
                <select value={calib.namePreset} onChange={(e) => updateCalib({ namePreset: e.target.value })} className="w-full px-2 py-2 border rounded">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">X-Large</option>
                  <option value="custom">Custom (px)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Name custom px</label>
                <input type="number" min="8" max="8000" value={calib.nameCustomPx} onChange={(e) => updateCalib({ nameCustomPx: Number(e.target.value), namePreset: 'custom' })} className="w-full px-2 py-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm">Price preset</label>
                <select value={calib.pricePreset} onChange={(e) => updateCalib({ pricePreset: e.target.value })} className="w-full px-2 py-2 border rounded">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">X-Large</option>
                  <option value="custom">Custom (px)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Price custom px</label>
                <input type="number" min="8" max="8000" value={calib.priceCustomPx} onChange={(e) => updateCalib({ priceCustomPx: Number(e.target.value), pricePreset: 'custom' })} className="w-full px-2 py-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm">Truncate name (preview):</label>
                <div className="flex gap-2 items-center">
                  <input id="truncate" type="checkbox" checked={calib.truncate} onChange={(e) => updateCalib({ truncate: e.target.checked })} />
                  <label htmlFor="truncate" className="text-sm">Enable</label>
                </div>
              </div>
              <div>
                <label className="block text-sm">Truncate length</label>
                <input type="number" min={10} max={240} value={calib.truncateLen} onChange={(e) => updateCalib({ truncateLen: Number(e.target.value) })} className="w-full px-2 py-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm">Name weight</label>
                <input type="number" min={100} max={900} step={100} value={calib.nameWeight} onChange={(e) => updateCalib({ nameWeight: Number(e.target.value) })} className="w-full px-2 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm">Price weight</label>
                <input type="number" min={100} max={900} step={100} value={calib.priceWeight} onChange={(e) => updateCalib({ priceWeight: Number(e.target.value) })} className="w-full px-2 py-2 border rounded" />
              </div>
            </div>

            <div>
              <label className="block text-sm">Use Bitmap for Name/Price</label>
              <div className="flex items-center gap-2">
                <input id="useBitmap" type="checkbox" checked={calib.useBitmapForText} onChange={(e) => updateCalib({ useBitmapForText: e.target.checked })} />
                <label htmlFor="useBitmap" className="text-sm">Exact rendering (recommended for huge fonts)</label>
              </div>
            </div>

            <div>
              <label className="block text-sm">Bitmap threshold (0-255): {calib.bitmapThreshold}</label>
              <input type="range" min="0" max="255" step="1" value={calib.bitmapThreshold} onChange={(e) => updateCalib({ bitmapThreshold: Number(e.target.value) })} />
            </div>

            <div>
              <label className="block text-sm">Module width (dots): {calib.moduleWidthDots}</label>
              <input type="range" min={1} max={6} step={1} value={calib.moduleWidthDots} onChange={(e) => updateCalib({ moduleWidthDots: Number(e.target.value) })} />
              <div className="text-xs text-gray-500">Start with 2. Increase to 3–4 if bars show white holes.</div>
            </div>

            <div>
              <label className="block text-sm">Barcode height (mm): {calib.barcodeHeightMM}</label>
              <input type="range" min="8" max="14" step="0.5" value={calib.barcodeHeightMM} onChange={(e) => updateCalib({ barcodeHeightMM: Number(e.target.value) })} />
            </div>

            <div>
              <label className="block text-sm">Number font scale (under barcode) (1–5): {Math.round((calib.numberFontSize || 12) / 4)}</label>
              <input type="range" min={1} max={5} step={1} value={Math.round((calib.numberFontSize || 12) / 4)} onChange={(e) => updateCalib({ numberFontSize: Number(e.target.value) * 4 })} />
            </div>

            <div>
              <label className="block text-sm">Print Speed: {calib.speed}</label>
              <input type="range" min="2" max="6" step="1" value={calib.speed} onChange={(e) => updateCalib({ speed: Number(e.target.value) })} />
            </div>

            <div>
              <label className="block text-sm">Density: {calib.density}</label>
              <input type="range" min="6" max="15" step={1} value={calib.density} onChange={(e) => updateCalib({ density: Number(e.target.value) })} />
            </div>

            <div className="flex items-center gap-2">
              <input id="feed" type="checkbox" checked={calib.useFeedAfterLabel} onChange={(e) => updateCalib({ useFeedAfterLabel: e.target.checked })} />
              <label htmlFor="feed" className="text-sm">Use feed-after-label fallback</label>
            </div>

            <div className="flex gap-2">
              <input type="number" min="1" value={copies} onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value || 1)))} className="w-20 px-2 py-1 border rounded" />
              <button onClick={printTSPL} disabled={!selectedProduct || !defaultPrinter || qzStatus !== "Connected"} className="flex-1 py-2 bg-green-600 text-white rounded disabled:opacity-50">Print Test Label</button>
              <button onClick={() => { setCalib(DEFAULT_CALIB); saveCalib(DEFAULT_CALIB); toast.info("Reset calibration"); }} className="py-2 px-3 border rounded">Reset</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Quick checklist:
        <ol className="list-decimal pl-5">
          <li>Driver: Graphics → <b>Dithering = None</b>.</li>
          <li>Driver: Options → uncheck "Use Current Printer Setting" for Darkness & Speed, set Darkness ≈ 8–12 and Speed = 3–4.</li>
          <li>Stock → <b>Labels With Gaps</b>, width 50 mm, height 25 mm, gap 3 mm.</li>
          <li>Recommended start: name = <b>Medium (14px)</b>, price = <b>Small (10px)</b>, moduleWidthDots = <b>2</b>, barcodeHeightMM = <b>11</b>, density = <b>12</b>, speed = <b>3</b>.</li>
        </ol>
        <p className="mt-1 text-xs">If text overlaps barcode or prints differently than preview: nudge <b>Label vertical offset (mm)</b> +/- 0.1 and re-print. Paste the <code>=== TSPL START ===</code> block here after a test print and I will tell the single numeric tweak needed.</p>
      </div>
    </div>
  );
}
