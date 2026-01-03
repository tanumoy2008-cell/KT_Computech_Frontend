import React, { useEffect, useRef, useState } from "react";
import axios from "../config/axios";
import JsBarcode from "jsbarcode";
import { toast } from "react-toastify";
import {env} from "../config/key"

const STORAGE_KEY = "tspl_safe_scales_v3";

const DEFAULT_CALIB = {
  dpi: 203,
  offsetXmm: 0,
  offsetYmm: 0,
  labelOffsetYmm: 0,
  barcodeOffsetXmm: 0,
  barcodeOffsetYmm: 0,
  moduleWidthDots: 2,
  barcodeHeightMM: 11,
  labelWidthMm: 50,
  labelHeightMm: 25,
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
  showHumanReadable: true,
  // NEW: header layout mode
  headerLayout: "row", // "row" = name|sku|price in one line, "column" = name / sku / price vertical
};

const mmToDots = (mm, dpi) => Math.round((mm / 25.4) * dpi);
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
  const [searchType, setSearchType] = useState("name");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const suggestionsTimerRef = useRef(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const [copies, setCopies] = useState(1);
  const [printers, setPrinters] = useState([]);
  const [defaultPrinter, setDefaultPrinter] = useState("");
  const [qzStatus, setQzStatus] = useState("Loading...");

  const [calib, setCalib] = useState(loadCalib());
  const svgRef = useRef(null);
  const searchRef = useRef(null);

  const [namePreview, setNamePreview] = useState(null);
  const [pricePreview, setPricePreview] = useState(null);
  const [skuPreview, setSkuPreview] = useState(null);
  const [barcodePreview, setBarcodePreview] = useState(null);

  useEffect(() => saveCalib(calib), [calib]);

  // ------------ QZ INIT ------------
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
            resolve(env.REACT_APP_QZ_CERTIFICATE || "")
          );
        }
        if (!window.qz.websocket?.isActive?.()) {
          await window.qz.websocket.connect();
        }

        setQzStatus("Connected");
        const found = await window.qz.printers.find();
        setPrinters(found || []);
        const saved = localStorage.getItem("barcodePrinter");
        setDefaultPrinter(
          saved && found?.includes(saved) ? saved : found?.[0] || ""
        );
      } catch (err) {
        console.error("QZ init error:", err);
        setQzStatus("Error");
      }
    };

    if (window.qz) init();
    else window.addEventListener("qz:ready", init);

    return () => {
      window.removeEventListener("qz:ready", init);
      if (window.qz?.websocket?.isActive?.()) {
        window.qz.websocket.disconnect();
      }
    };
  }, []);

  // keep selectedVariantId in sync
  useEffect(() => {
    if (!selectedProduct) {
      setSelectedVariantId(null);
      return;
    }
    if (
      Array.isArray(selectedProduct.colorVariants) &&
      selectedProduct.colorVariants.length > 0
    ) {
      const prefer =
        selectedProduct.matchedVariantId || selectedProduct.colorVariants[0]._id;
      setSelectedVariantId(prefer || null);
    }
  }, [selectedProduct]);

  // ------------ SEARCH ------------
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error("Enter search value");
      return;
    }
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
      const product = Array.isArray(res.data)
        ? res.data[0]
        : res.data?.data
        ? res.data.data
        : res.data;

      const barcodeVal =
        product?.barcode ||
        (Array.isArray(product?.barcodes) && product.barcodes[0]) ||
        product?.sku ||
        "";

      setSelectedProduct({ ...product, barcode: String(barcodeVal) });

      const matchVar =
        Array.isArray(product?.colorVariants) &&
        (product.matchedVariantId || product.colorVariants[0]?._id);
      setSelectedVariantId(matchVar || null);

      setSearchValue("");
      setSuggestions([]);
      setShowSuggestions(false);
      searchRef.current?.focus();
    } catch (err) {
      console.error(err);
      toast.error("Product not found");
    }
  };

  const handleSuggestionClick = (prod) => {
    const barcodeVal =
      prod?.barcode ||
      (Array.isArray(prod?.barcodes) && prod.barcodes[0]) ||
      prod?.sku ||
      "";
    setSelectedProduct({ ...prod, barcode: String(barcodeVal) });
    const matchVar =
      Array.isArray(prod?.colorVariants) &&
      (prod.matchedVariantId || prod.colorVariants[0]?._id);
    setSelectedVariantId(matchVar || null);
    setSearchValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  // suggestions (for name/sku/all)
  useEffect(() => {
    if (!["name", "sku", "all"].includes(searchType)) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (suggestionsTimerRef.current) clearTimeout(suggestionsTimerRef.current);

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
        if (searchType === "name") endpoint = `/api/product/by-name/${term}`;
        else endpoint = `/api/product/search/${term}`;

        const res = await axios.get(endpoint);
        const list = Array.isArray(res.data) ? res.data : [res.data];
        setSuggestions(list.slice(0, 8));
        setShowSuggestions(true);
      } catch (err) {
        console.error("Suggestion fetch failed:", err);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);

    return () => {
      if (suggestionsTimerRef.current) clearTimeout(suggestionsTimerRef.current);
    };
  }, [searchValue, searchType]);

  // svg fallback for barcode
  useEffect(() => {
    const code = selectedProduct?.barcode;
    if (!code || !svgRef.current) return;
    try {
      svgRef.current.innerHTML = "";
      const format =
        /^\d+$/.test(code) && code.length === 13 ? "EAN13" : "CODE128";
      const previewNumFont = Math.max(
        10,
        8 + Math.round((calib.numberFontSize || 12) / 6)
      );
      JsBarcode(svgRef.current, String(code), {
        format,
        width: Math.max(
          0.8,
          (calib.moduleWidthDots * (calib.dpi / 203)) * 0.9
        ),
        height: 44,
        displayValue: true,
        fontSize: previewNumFont,
        margin: 2,
      });
    } catch (e) {
      console.error("JsBarcode err", e);
    }
  }, [selectedProduct, calib]);

  // ------------ CANVAS HELPERS ------------
  const renderTextToCanvas = ({
    text,
    fontPx,
    fontFamily = "Arial",
    dpi = 203,
    maxWidthDots,
  }) => {
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

  const renderBarcodeToCanvas = async ({
    code,
    bcType,
    moduleWidth,
    barcodeHeightDots,
    targetWidthDots,
    dpi,
  }) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", String(targetWidthDots));
    svg.setAttribute("height", String(barcodeHeightDots + 24));

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
        const r = img[idx],
          g = img[idx + 1],
          b = img[idx + 2];
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const bit = lum < threshold ? 1 : 0;
        const byteIndex = Math.floor(x / 8);
        const bitIndex = 7 - (x % 8);
        if (bit) rowBytes[byteIndex] |= 1 << bitIndex;
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

  // ------------ PREVIEW (supports row/column layout) ------------
  useEffect(() => {
    let mounted = true;

    const makePreview = async () => {
      setNamePreview(null);
      setPricePreview(null);
      setSkuPreview(null);
      setBarcodePreview(null);

      if (!selectedProduct) return;

      const dpi = Number(calib.dpi || 203);
      const labelWmm = Number(calib.labelWidthMm || 50);
      const pwDots = mmToDots(labelWmm, dpi);
      const printableW = pwDots - 12;

      const priceUnit = calib.priceUnit || "Rs.";
      const priceText = `${priceUnit}${(selectedProduct.price || 0).toFixed(
        2
      )}`;

      const activeSkuVal =
        (selectedProduct.colorVariants &&
          selectedVariantId &&
          selectedProduct.colorVariants.find(
            (v) => v._id === selectedVariantId
          )?.sku) ||
        selectedProduct.sku ||
        "";

      const namePreviewPx =
        calib.namePreset === "custom"
          ? Number(calib.nameCustomPx || 14)
          : PRESET_TO_PX[calib.namePreset];
      const rawName = selectedProduct.name || "Product";
      const nameText =
        calib.truncate && rawName.length > (calib.truncateLen || 40)
          ? rawName.substring(0, calib.truncateLen - 1) + "…"
          : rawName;

      const nameCanvas = renderTextToCanvas({
        text: nameText.toUpperCase(),
        fontPx: namePreviewPx,
        dpi,
        maxWidthDots: printableW,
      });

      const pricePreviewPx =
        calib.pricePreset === "custom"
          ? Number(calib.priceCustomPx || 12)
          : PRESET_TO_PX[calib.pricePreset];
      const priceCanvas = renderTextToCanvas({
        text: priceText,
        fontPx: pricePreviewPx,
        dpi,
        maxWidthDots: printableW,
      });

      let skuCanvas = null;
      if (activeSkuVal) {
        skuCanvas = renderTextToCanvas({
          text: `SKU: ${activeSkuVal}`,
          fontPx: pricePreviewPx,
          dpi,
          maxWidthDots: printableW,
        });
      }

      const code = String(
        selectedProduct.barcode || selectedProduct.sku || "000000000000"
      );
      const bcType =
        /^\d+$/.test(code) && code.length === 13 ? "EAN13" : "CODE128";
      const modules = Math.max(60, code.length * 11);
      const moduleWidth = Math.max(1, Math.round(calib.moduleWidthDots || 2));
      const barcodeWidthDots = Math.max(120, modules * moduleWidth);
      const barcodeHeightDots = mmToDots(
        Number(calib.barcodeHeightMM || 11),
        dpi
      );

      const barcodeCanvas = await renderBarcodeToCanvas({
        code,
        bcType,
        moduleWidth: Math.max(0.8, moduleWidth),
        barcodeHeightDots,
        targetWidthDots: barcodeWidthDots,
        dpi,
      });

      if (!mounted) return;

      setNamePreview({
        dataUrl: nameCanvas.toDataURL(),
        cssWidth: dotsToCssPx(nameCanvas.width, dpi),
        cssHeight: dotsToCssPx(nameCanvas.height, dpi),
      });

      setPricePreview({
        dataUrl: priceCanvas.toDataURL(),
        cssWidth: dotsToCssPx(priceCanvas.width, dpi),
        cssHeight: dotsToCssPx(priceCanvas.height, dpi),
      });

      setSkuPreview(
        skuCanvas
          ? {
              dataUrl: skuCanvas.toDataURL(),
              cssWidth: dotsToCssPx(skuCanvas.width, dpi),
              cssHeight: dotsToCssPx(skuCanvas.height, dpi),
            }
          : null
      );

      setBarcodePreview(
        barcodeCanvas
          ? {
              dataUrl: barcodeCanvas.toDataURL(),
              cssWidth: dotsToCssPx(barcodeCanvas.width, dpi),
              cssHeight: dotsToCssPx(barcodeCanvas.height, dpi),
            }
          : null
      );
    };

    makePreview();

    return () => {
      mounted = false;
    };
  }, [selectedProduct, calib, selectedVariantId]);

  // ------------ PRINT (row/column) ------------
  const printTSPL = async () => {
    if (!selectedProduct) {
      toast.error("Select product");
      return;
    }
    try {
      if (!window.qz) throw new Error("QZ Tray not loaded");
      if (!window.qz.websocket?.isActive?.()) {
        await window.qz.websocket.connect();
      }
      if (!defaultPrinter) throw new Error("No printer selected");

      const dpi = Number(calib.dpi || 203);
      const labelWmm = Number(calib.labelWidthMm || 50);
      const labelHmm = Number(calib.labelHeightMm || 25);
      const gapmm = 3;

      const pwDots = mmToDots(labelWmm, dpi);
      const offXdots = mmToDots(Number(calib.offsetXmm || 0), dpi);
      const offYdots = mmToDots(
        Number((calib.labelOffsetYmm ?? calib.offsetYmm) || 0),
        dpi
      );
      const barcodeOffXdots = mmToDots(
        Number(calib.barcodeOffsetXmm || 0),
        dpi
      );
      const barcodeOffYdots = mmToDots(
        Number(calib.barcodeOffsetYmm || 0),
        dpi
      );

      // header line base
      const headerTopMm = 5.0;
      const skuOffsetMm = calib.headerLayout === "column" ? 3.0 : 0;
      const priceOffsetMm = calib.headerLayout === "column" ? 6.0 : 0;

      const headerYdots = mmToDots(headerTopMm, dpi) + offYdots;
      const skuYdots = headerYdots + mmToDots(skuOffsetMm, dpi);
      const priceYdots = headerYdots + mmToDots(priceOffsetMm, dpi);

      // barcode below text (a bit lower when stacked)
      const barcodeTopMm = calib.headerLayout === "column" ? 15.0 : 13.0;
      const barcodeYdots =
        mmToDots(barcodeTopMm, dpi) + offYdots + barcodeOffYdots;

      const rawName = (selectedProduct.name || "Product").substring(0, 240);
      let nameRaw = safeText(rawName).toUpperCase();
      if (calib.truncate && nameRaw.length > (calib.truncateLen || 40)) {
        nameRaw = nameRaw.substring(0, calib.truncateLen - 1) + "…";
      }

      const priceRaw = safeText(
        `${calib.priceUnit || "Rs."}${(selectedProduct.price || 0).toFixed(2)}`
      );

      const skuBase =
        (selectedProduct.colorVariants &&
          selectedVariantId &&
          selectedProduct.colorVariants.find(
            (v) => v._id === selectedVariantId
          )?.sku) ||
        selectedProduct.sku ||
        "";
      const skuDisplay = skuBase ? `SKU: ${safeText(String(skuBase))}` : "";

      const code = String(
        selectedProduct.barcode || selectedProduct.sku || "000000000000"
      );
      const bcType =
        /^\d+$/.test(code) && code.length === 13 ? "EAN13" : "CODE128";

      const modules = Math.max(60, code.length * 11);
      const moduleWidth = Math.max(1, Math.round(calib.moduleWidthDots || 2));
      const barcodeWidthDots = modules * moduleWidth;
      let barcodeXdots =
        Math.round((pwDots - barcodeWidthDots) / 2) +
        offXdots +
        barcodeOffXdots;
      if (barcodeXdots < 4) barcodeXdots = 4;

      const tsplParts = [];
      tsplParts.push(`SIZE ${labelWmm} mm,${labelHmm} mm`);
      tsplParts.push(`GAP ${gapmm} mm,0`);
      tsplParts.push(`SPEED ${Number(calib.speed || 3)}`);
      tsplParts.push(`DENSITY ${Number(calib.density || 12)}`);
      tsplParts.push(`DIRECTION 1`);
      tsplParts.push(`CLS`);

      if (calib.useBitmapForText) {
        const printableW = pwDots - 12;
        const namePreviewPx =
          calib.namePreset === "custom"
            ? Number(calib.nameCustomPx || 14)
            : PRESET_TO_PX[calib.namePreset] || PRESET_TO_PX.medium;
        const pricePreviewPx =
          calib.pricePreset === "custom"
            ? Number(calib.priceCustomPx || 12)
            : PRESET_TO_PX[calib.pricePreset] || PRESET_TO_PX.small;

        const marginDots = mmToDots(2, dpi);

        // NAME bitmap (left)
        const nameCanvas = renderTextToCanvas({
          text: nameRaw,
          fontPx: namePreviewPx,
          dpi,
          maxWidthDots: printableW,
        });
        const nameBmp = canvasToTsplHex(
          nameCanvas,
          Number(calib.bitmapThreshold || 180)
        );
        const nameX = offXdots + marginDots;
        tsplParts.push(
          `BITMAP ${nameX},${headerYdots},${nameBmp.widthBytes},${nameBmp.height},1,${nameBmp.hex}`
        );

        // PRICE bitmap (right or 3rd line)
        const priceCanvas = renderTextToCanvas({
          text: priceRaw,
          fontPx: pricePreviewPx,
          dpi,
          maxWidthDots: printableW,
        });
        const priceBmp = canvasToTsplHex(
          priceCanvas,
          Number(calib.bitmapThreshold || 180)
        );

        if (calib.headerLayout === "row") {
          const priceX =
            pwDots - priceCanvas.width - marginDots + offXdots;
          tsplParts.push(
            `BITMAP ${priceX},${headerYdots},${priceBmp.widthBytes},${priceBmp.height},1,${priceBmp.hex}`
          );
        } else {
          const priceX =
            Math.round((pwDots - priceCanvas.width) / 2) + offXdots;
          tsplParts.push(
            `BITMAP ${priceX},${priceYdots},${priceBmp.widthBytes},${priceBmp.height},1,${priceBmp.hex}`
          );
        }

        // SKU bitmap (center or 2nd line)
        if (skuDisplay) {
          const skuCanvas = renderTextToCanvas({
            text: skuDisplay,
            fontPx: pricePreviewPx,
            dpi,
            maxWidthDots: printableW,
          });
          const skuBmp = canvasToTsplHex(
            skuCanvas,
            Number(calib.bitmapThreshold || 180)
          );
          const skuX =
            Math.round((pwDots - skuCanvas.width) / 2) + offXdots;
          const skuY = calib.headerLayout === "row" ? headerYdots : skuYdots;
          tsplParts.push(
            `BITMAP ${skuX},${skuY},${skuBmp.widthBytes},${skuBmp.height},1,${skuBmp.hex}`
          );
        }
      } else {
        const namePx =
          calib.namePreset === "custom"
            ? Number(calib.nameCustomPx || 14)
            : PRESET_TO_PX[calib.namePreset] || PRESET_TO_PX.medium;
        const pricePx =
          calib.pricePreset === "custom"
            ? Number(calib.priceCustomPx || 12)
            : PRESET_TO_PX[calib.pricePreset] || PRESET_TO_PX.small;
        const mulFromPx = (px) => Math.max(1, Math.round(px / 6));
        const nameMul = Math.max(1, Math.min(40, mulFromPx(namePx)));
        const priceMul = Math.max(1, Math.min(40, mulFromPx(pricePx)));

        const marginDots = mmToDots(2, dpi);

        // NAME left
        const nameXdots = offXdots + marginDots;
        tsplParts.push(
          `TEXT ${nameXdots},${headerYdots},"0",0,${nameMul},${nameMul},"${nameRaw}"`
        );

        // PRICE
        if (calib.headerLayout === "row") {
          const approxPriceWidth = Math.round(
            priceRaw.length * (6 + priceMul)
          );
          const priceXdots =
            pwDots - approxPriceWidth - offXdots - marginDots;
          tsplParts.push(
            `TEXT ${priceXdots},${headerYdots},"0",0,${priceMul},${priceMul},"${priceRaw}"`
          );
        } else {
          const approxPriceWidth = Math.round(
            priceRaw.length * (6 + priceMul)
          );
          const priceXdots =
            Math.round((pwDots - approxPriceWidth) / 2) + offXdots;
          tsplParts.push(
            `TEXT ${priceXdots},${priceYdots},"0",0,${priceMul},${priceMul},"${priceRaw}"`
          );
        }

        // SKU centre
        if (skuDisplay) {
          const approxSkuWidth = Math.round(
            skuDisplay.length * (6 + priceMul)
          );
          const skuXdots =
            Math.round((pwDots - approxSkuWidth) / 2) + offXdots;
          const skuY = calib.headerLayout === "row" ? headerYdots : skuYdots;
          tsplParts.push(
            `TEXT ${skuXdots},${skuY},"0",0,${priceMul},${priceMul},"${skuDisplay}"`
          );
        }
      }

      const bcHeightDots = mmToDots(
        Number(calib.barcodeHeightMM || 11),
        dpi
      );
      const wide = Math.max(2, Math.round(moduleWidth * 2));
      const hri = calib.showHumanReadable ? 1 : 0;

      tsplParts.push(
        `BARCODE ${barcodeXdots},${barcodeYdots},"${bcType}",${bcHeightDots},${hri},0,${moduleWidth},${wide},"${code}"`
      );

      tsplParts.push(`PRINT ${copies}`);
      if (calib.useFeedAfterLabel) tsplParts.push(`FEED 1`);

      const tspl = tsplParts.join("\n") + "\n";

      const config = window.qz.configs.create(defaultPrinter);
      await window.qz.print(config, [
        { type: "raw", format: "plain", data: tspl },
      ]);

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

  // ------------ PREVIEW POSITIONS (with row/column support) ------------
  const computePreviewPositions = () => {
    const dpi = Number(calib.dpi || 203);
    const labelWmm = Number(calib.labelWidthMm || 50);
    const labelHmm = Number(calib.labelHeightMm || 25);
    const pwDots = mmToDots(labelWmm, dpi);
    const offYdots = mmToDots(
      Number((calib.labelOffsetYmm ?? calib.offsetYmm) || 0),
      dpi
    );

    const headerTopMm = 5.0;
    const skuOffsetMm = calib.headerLayout === "column" ? 3.0 : 0;
    const priceOffsetMm = calib.headerLayout === "column" ? 6.0 : 0;

    const headerYdots = mmToDots(headerTopMm, dpi) + offYdots;
    const skuYdots = headerYdots + mmToDots(skuOffsetMm, dpi);
    const priceYdots = headerYdots + mmToDots(priceOffsetMm, dpi);

    const barcodeTopMm = calib.headerLayout === "column" ? 15.0 : 13.0;
    const barcodeYdots =
      mmToDots(barcodeTopMm, dpi) +
      offYdots +
      mmToDots(Number(calib.barcodeOffsetYmm || 0), dpi);

    return {
      dpi,
      labelCssWidth: dotsToCssPx(pwDots, dpi),
      labelCssHeight: dotsToCssPx(mmToDots(labelHmm, dpi), dpi),
      headerTopCss: dotsToCssPx(headerYdots, dpi),
      skuTopCss: dotsToCssPx(skuYdots, dpi),
      priceTopCss: dotsToCssPx(priceYdots, dpi),
      barcodeTopCss: dotsToCssPx(barcodeYdots, dpi),
      leftPadCss: dotsToCssPx(mmToDots(2, dpi), dpi),
    };
  };

  const pos = computePreviewPositions();
  const PREVIEW_MAX_WIDTH = 220;
  const previewScale =
    pos.labelCssWidth > PREVIEW_MAX_WIDTH
      ? PREVIEW_MAX_WIDTH / pos.labelCssWidth
      : 1;

  const activeSku =
    (selectedProduct?.colorVariants &&
      selectedVariantId &&
      selectedProduct.colorVariants.find(
        (v) => v._id === selectedVariantId
      )?.sku) ||
    selectedProduct?.sku ||
    "";

  const skuTopCss =
    calib.headerLayout === "column" ? pos.skuTopCss : pos.headerTopCss;
  const priceTopCss =
    calib.headerLayout === "column" ? pos.priceTopCss : pos.headerTopCss;

  return (
    <div className="container mx-auto p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">
        TSPL Barcode Printing — Label Designer
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SEARCH */}
        <div className="bg-white rounded p-4 shadow min-w-0">
          <h2 className="font-semibold mb-2">Product Search</h2>
          <div className="relative mb-3">
            <div className="flex gap-2">
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
                ref={searchRef}
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
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded whitespace-nowrap"
              >
                Search
              </button>
            </div>

            {showSuggestions &&
              ["name", "sku", "all"].includes(searchType) && (
                <div className="absolute z-50 bg-white border rounded shadow-lg w-full mt-1 max-h-60 overflow-auto">
                  {suggestionsLoading ? (
                    <div className="p-2 text-sm text-gray-600">
                      Loading...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="p-2 text-sm text-gray-600">
                      No suggestions
                    </div>
                  ) : (
                    suggestions.map((s) => (
                      <div
                        key={s._id}
                        onMouseDown={() => handleSuggestionClick(s)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        <div className="font-medium">
                          {s.name}{" "}
                          {s.matchedSKU ? `(SKU: ${s.matchedSKU})` : ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.company || ""} —{" "}
                          {s.Subcategory || s.Maincategory || ""}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
          </div>

          {selectedProduct ? (
            <div className="bg-gray-50 p-3 rounded border space-y-2">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <div className="font-medium truncate">
                    {selectedProduct.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedProduct.company || ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    ₹{(selectedProduct.price || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Off: {Number(selectedProduct.off || 0).toFixed(1)}%
                  </div>
                </div>
              </div>

              {Array.isArray(selectedProduct.colorVariants) &&
                selectedProduct.colorVariants.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Variant:</label>
                    <select
                      value={selectedVariantId || ""}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      className="px-2 py-1 border rounded flex-1"
                    >
                      {selectedProduct.colorVariants.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.Colorname}{" "}
                          {v.sku ? `(SKU: ${v.sku})` : ""}{" "}
                          {v.stock ? ` - ${v.stock} in stock` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div>
                  SKU:{" "}
                  <span className="font-medium">
                    {activeSku || "N/A"}
                  </span>
                </div>
                <div>
                  Barcode:{" "}
                  <span className="font-medium">
                    {selectedProduct.barcode ||
                      (selectedProduct.barcodes &&
                        selectedProduct.barcodes[0]) ||
                      "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No product selected</div>
          )}
        </div>

        {/* PREVIEW */}
        <div className="bg-white rounded p-4 shadow min-w-0">
          <h2 className="font-semibold mb-2">
            Label Preview ({calib.labelWidthMm}×{calib.labelHeightMm} mm)
          </h2>

          <div className="flex justify-center">
            <div
              style={{
                width: PREVIEW_MAX_WIDTH,
                height: pos.labelCssHeight * previewScale + 8,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: pos.labelCssWidth,
                  height: pos.labelCssHeight,
                  position: "relative",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  overflow: "hidden",
                  background: "#fff",
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >
                {/* NAME (always top left) */}
                {namePreview ? (
                  <img
                    src={namePreview.dataUrl}
                    alt="name"
                    style={{
                      position: "absolute",
                      left: pos.leftPadCss + "px",
                      top: pos.headerTopCss + "px",
                      width: `${namePreview.cssWidth}px`,
                      height: `${namePreview.cssHeight}px`,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      left: pos.leftPadCss + "px",
                      top: pos.headerTopCss + "px",
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    PRODUCT NAME
                  </div>
                )}

                {/* SKU */}
                {skuPreview && activeSku ? (
                  <img
                    src={skuPreview.dataUrl}
                    alt="sku"
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: skuTopCss + "px",
                      width: `${skuPreview.cssWidth}px`,
                      height: `${skuPreview.cssHeight}px`,
                      objectFit: "contain",
                      textAlign: "center",
                    }}
                  />
                ) : activeSku ? (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: skuTopCss + "px",
                      fontSize: 10,
                      textAlign: "center",
                    }}
                  >
                    SKU: {activeSku}
                  </div>
                ) : null}

                {/* PRICE */}
                {pricePreview ? (
                  <img
                    src={pricePreview.dataUrl}
                    alt="price"
                    style={{
                      position: "absolute",
                      right: calib.headerLayout === "row"
                        ? pos.leftPadCss + "px"
                        : "50%",
                      transform:
                        calib.headerLayout === "row"
                          ? "none"
                          : "translateX(50%)",
                      top: priceTopCss + "px",
                      width: `${pricePreview.cssWidth}px`,
                      height: `${pricePreview.cssHeight}px`,
                      objectFit: "contain",
                      textAlign:
                        calib.headerLayout === "row" ? "right" : "center",
                    }}
                  />
                ) : selectedProduct ? (
                  <div
                    style={{
                      position: "absolute",
                      right: calib.headerLayout === "row"
                        ? pos.leftPadCss + "px"
                        : "50%",
                      transform:
                        calib.headerLayout === "row"
                          ? "none"
                          : "translateX(50%)",
                      top: priceTopCss + "px",
                      fontSize: 10,
                      textAlign:
                        calib.headerLayout === "row" ? "right" : "center",
                    }}
                  >
                    {(calib.priceUnit || "Rs.") +
                      (selectedProduct.price || 0).toFixed(2)}
                  </div>
                ) : null}

                {/* BARCODE */}
                {barcodePreview ? (
                  <img
                    src={barcodePreview.dataUrl}
                    alt="barcode"
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: pos.barcodeTopCss + "px",
                      width: `${barcodePreview.cssWidth}px`,
                      height: `${barcodePreview.cssHeight}px`,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <svg
                    ref={svgRef}
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: pos.barcodeTopCss + "px",
                      height: 44,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-600">
            Layout:{" "}
            {calib.headerLayout === "row" ? (
              <>
                <b>Name | SKU | Price</b> in one line, barcode below.
              </>
            ) : (
              <>
                <b>Name</b> then <b>SKU</b> then <b>Price</b> vertically,
                barcode below.
              </>
            )}
          </div>
        </div>

        {/* CALIBRATION & PRINT */}
        <div className="bg-white rounded p-4 shadow min-w-0">
          <h2 className="font-semibold mb-2">Calibration & Print</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm">Printer</label>
              <select
                value={defaultPrinter}
                onChange={(e) => {
                  setDefaultPrinter(e.target.value);
                  localStorage.setItem("barcodePrinter", e.target.value);
                }}
                className="w-full px-2 py-2 border rounded"
              >
                {printers.length ? (
                  printers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))
                ) : (
                  <option value="">No printers found</option>
                )}
              </select>
              <div
                className={`mt-1 text-xs ${
                  qzStatus === "Connected"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Status: {qzStatus}
              </div>
            </div>

            {/* NEW: header layout option */}
            <div>
              <label className="block text-sm">Header layout</label>
              <select
                value={calib.headerLayout}
                onChange={(e) =>
                  updateCalib({ headerLayout: e.target.value })
                }
                className="w-full px-2 py-2 border rounded"
              >
                <option value="row">Name | SKU | Price (one line)</option>
                <option value="column">
                  Name / SKU / Price (vertical)
                </option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Use <b>vertical</b> when you want price and SKU stacked like
                your other stickers.
              </p>
            </div>

            <div>
              <label className="block text-sm">DPI: {calib.dpi}</label>
              <input
                type="range"
                min="203"
                max="300"
                step="1"
                value={calib.dpi}
                onChange={(e) =>
                  updateCalib({ dpi: Number(e.target.value) })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">
                  Label width (mm): {calib.labelWidthMm}
                </label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={calib.labelWidthMm}
                  onChange={(e) =>
                    updateCalib({
                      labelWidthMm: Number(e.target.value),
                    })
                  }
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">
                  Label height (mm): {calib.labelHeightMm}
                </label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={calib.labelHeightMm}
                  onChange={(e) =>
                    updateCalib({
                      labelHeightMm: Number(e.target.value),
                    })
                  }
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm">
                Label vertical offset (mm): {calib.labelOffsetYmm}
              </label>
              <input
                type="range"
                min={-10}
                max={10}
                step={0.1}
                value={calib.labelOffsetYmm}
                onChange={(e) =>
                  updateCalib({
                    labelOffsetYmm: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm">
                Barcode horizontal offset (mm): {calib.barcodeOffsetXmm}
              </label>
              <input
                type="range"
                min={-10}
                max={10}
                step={0.5}
                value={calib.barcodeOffsetXmm}
                onChange={(e) =>
                  updateCalib({
                    barcodeOffsetXmm: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm">
                Barcode vertical offset (mm): {calib.barcodeOffsetYmm}
              </label>
              <input
                type="range"
                min={-10}
                max={10}
                step={0.5}
                value={calib.barcodeOffsetYmm}
                onChange={(e) =>
                  updateCalib({
                    barcodeOffsetYmm: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">Name preset</label>
                <select
                  value={calib.namePreset}
                  onChange={(e) =>
                    updateCalib({ namePreset: e.target.value })
                  }
                  className="w-full px-2 py-2 border rounded"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">X-Large</option>
                  <option value="custom">Custom (px)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Name custom px</label>
                <input
                  type="number"
                  min="8"
                  max="8000"
                  value={calib.nameCustomPx}
                  onChange={(e) =>
                    updateCalib({
                      nameCustomPx: Number(e.target.value),
                      namePreset: "custom",
                    })
                  }
                  className="w-full px-2 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm">Price preset</label>
                <select
                  value={calib.pricePreset}
                  onChange={(e) =>
                    updateCalib({ pricePreset: e.target.value })
                  }
                  className="w-full px-2 py-2 border rounded"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">X-Large</option>
                  <option value="custom">Custom (px)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Price custom px</label>
                <input
                  type="number"
                  min="8"
                  max="8000"
                  value={calib.priceCustomPx}
                  onChange={(e) =>
                    updateCalib({
                      priceCustomPx: Number(e.target.value),
                      pricePreset: "custom",
                    })
                  }
                  className="w-full px-2 py-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm">Truncate name</label>
              <div className="flex gap-2 items-center">
                <input
                  id="truncate"
                  type="checkbox"
                  checked={calib.truncate}
                  onChange={(e) =>
                    updateCalib({ truncate: e.target.checked })
                  }
                />
                <label htmlFor="truncate" className="text-sm">
                  Enable
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm">Truncate length</label>
              <input
                type="number"
                min={10}
                max={240}
                value={calib.truncateLen}
                onChange={(e) =>
                  updateCalib({
                    truncateLen: Number(e.target.value),
                  })
                }
                className="w-full px-2 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm">
                Use Bitmap for Name/Price
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="useBitmap"
                  type="checkbox"
                  checked={calib.useBitmapForText}
                  onChange={(e) =>
                    updateCalib({
                      useBitmapForText: e.target.checked,
                    })
                  }
                />
                <label htmlFor="useBitmap" className="text-sm">
                  Exact rendering (recommended)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm">
                Show barcode text (HRI)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="showHRI"
                  type="checkbox"
                  checked={calib.showHumanReadable}
                  onChange={(e) =>
                    updateCalib({
                      showHumanReadable: e.target.checked,
                    })
                  }
                />
                <label htmlFor="showHRI" className="text-sm">
                  Show digits under barcode
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm">
                Bitmap threshold: {calib.bitmapThreshold}
              </label>
              <input
                type="range"
                min="0"
                max="255"
                step="1"
                value={calib.bitmapThreshold}
                onChange={(e) =>
                  updateCalib({
                    bitmapThreshold: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm">
                Module width (dots): {calib.moduleWidthDots}
              </label>
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={calib.moduleWidthDots}
                onChange={(e) =>
                  updateCalib({
                    moduleWidthDots: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm">
                Barcode height (mm): {calib.barcodeHeightMM}
              </label>
              <input
                type="range"
                min="8"
                max="14"
                step="0.5"
                value={calib.barcodeHeightMM}
                onChange={(e) =>
                  updateCalib({
                    barcodeHeightMM: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm">
                Number font scale:{" "}
                {Math.round((calib.numberFontSize || 12) / 4)}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={Math.round((calib.numberFontSize || 12) / 4)}
                onChange={(e) =>
                  updateCalib({
                    numberFontSize: Number(e.target.value) * 4,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm">
                Print Speed: {calib.speed}
              </label>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={calib.speed}
                onChange={(e) =>
                  updateCalib({
                    speed: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm">
                Density: {calib.density}
              </label>
              <input
                type="range"
                min="6"
                max="15"
                step={1}
                value={calib.density}
                onChange={(e) =>
                  updateCalib({
                    density: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="feed"
                type="checkbox"
                checked={calib.useFeedAfterLabel}
                onChange={(e) =>
                  updateCalib({
                    useFeedAfterLabel: e.target.checked,
                  })
                }
              />
              <label htmlFor="feed" className="text-sm">
                Use feed-after-label
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={copies}
                onChange={(e) =>
                  setCopies(Math.max(1, parseInt(e.target.value || 1)))
                }
                className="w-20 px-2 py-1 border rounded"
              />
              <button
                onClick={printTSPL}
                disabled={
                  !selectedProduct ||
                  !defaultPrinter ||
                  qzStatus !== "Connected"
                }
                className="flex-1 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              >
                Print Test Label
              </button>
              <button
                onClick={() => {
                  setCalib(DEFAULT_CALIB);
                  saveCalib(DEFAULT_CALIB);
                  toast.info("Reset calibration");
                }}
                className="py-2 px-3 border rounded"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
