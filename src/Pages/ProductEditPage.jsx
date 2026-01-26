import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Cropper from "react-cropper";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";
import axios from "../config/axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { upsertProduct as upsertPublic } from "../Store/reducers/ProductReducer";
import { upsertProduct as upsertAdmin } from "../Store/reducers/AdminProductReducer";
import { BiData } from "react-icons/bi";
import { MdBarcodeReader } from "react-icons/md";
import { LiaAudioDescriptionSolid } from "react-icons/lia";
import { AiFillProduct } from "react-icons/ai";

const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRefs = useRef([]);
  const cropperRef = useRef(null);

  const [product, setProduct] = useState({});
  const [rawImage, setRawImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceModalIndex, setPriceModalIndex] = useState(null);
  const [priceBatches, setPriceBatches] = useState([]);
  const [priceBatchesLoading, setPriceBatchesLoading] = useState(false);

  const { register, handleSubmit, setValue, control, reset, watch } = useForm({
    defaultValues: {
      name: "",
      company: "",
      Subcategory: "",
      Maincategory: "",
      off: 0,
      stock: null,
      barcodes: [],
      productDescription: "",
      colorVariants: [],
    },
  });

  const colorVariants = watch("colorVariants") || [];
  const barcodes = watch("barcodes") || [];
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/product-info/${id}`);
        // Support both response shapes: { data: product } and product
        const p = res.data?.data || res.data;

        const formVariants = (p.colorVariants || []).map((cv) => ({
          Colorname: cv.Colorname || "", // required field
          colorCode: cv.colorCode || "#ffffff",
          stock: cv.stock || 0,
          sku: cv.sku,
          lastPurchasePrice: cv.lastPurchasePrice ?? null,
          avgPurchasePrice: cv.avgPurchasePrice ?? null,
          images: (cv.images || []).map((img, idx) => ({
            url: img,
            public_id: cv.imagePublicIds?.[idx] || null,
          })),
        }));

        const totalStock =
          formVariants.reduce((acc, cv) => acc + (cv.stock || 0), 0) || p.stock || 0;

        reset({
          name: p.name || "",
          company: p.company || "",
          Subcategory: p.Subcategory || "",
          Maincategory: p.Maincategory || "",
          off: p.off || 0,
          stock: totalStock,
          barcodes: p.barcodes || [],
          productDescription:
            p.description && Array.isArray(p.description)
              ? `#${p.description.join(" #")}`
              : "",
          colorVariants: formVariants,
        });

        setProduct(p);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to fetch product details", "error");
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, reset]);

  const handleImageChange = (e, variantIndex) => {
    const fileObj = e.target.files[0];
    if (!fileObj) return;
    setRawImage(URL.createObjectURL(fileObj));
    setCurrentVariantIndex(variantIndex);
    setShowCropper(true);
  };

  const handleCropDone = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    cropper.getCroppedCanvas({ width: 500, height: 500 }).toBlob((blob) => {
      if (blob && currentVariantIndex !== null) {
        const croppedURL = URL.createObjectURL(blob);
        const croppedFile = new File([blob], `image_${Date.now()}.avif`, { type: "image/avif" });
        const updatedVariants = [...colorVariants];
        updatedVariants[currentVariantIndex].images.push({ file: croppedFile, preview: croppedURL });
        setValue("colorVariants", updatedVariants);
        setShowCropper(false);
        setRawImage(null);
        setCurrentVariantIndex(null);
      }
    }, "image/avif", 0.9);
  };

  const formatPrice = (v) => {
    if (v === null || v === undefined) return "-";
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(v));
    } catch (e) {
      return `₹${Number(v).toFixed(2)}`;
    }
  };

  const openPriceModal = (index) => {
    setPriceModalIndex(index);
    setPriceModalOpen(true);

    // fetch batches for this variant
    const v = colorVariants[index] || {};
    const sku = v.sku;
    setPriceBatches([]);
    setPriceBatchesLoading(true);
    axios
      .get(`/api/purchase-products/batches/${id}${sku ? `?sku=${sku}` : ""}`)
      .then((res) => {
        setPriceBatches(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch batches:", err);
        setPriceBatches([]);
      })
      .finally(() => setPriceBatchesLoading(false));
  };

  const closePriceModal = () => {
    setPriceModalIndex(null);
    setPriceModalOpen(false);
  };

  const removeVariantImage = (variantIndex, imgIndex) => {
    const updatedVariants = [...colorVariants];
    const removedImage = updatedVariants[variantIndex].images[imgIndex];
    updatedVariants[variantIndex].images.splice(imgIndex, 1);

    // Add removed image id to a shared removedImages array on the colorVariants payload
    if (removedImage?.public_id) {
      const arr = [...(updatedVariants.removedImages || [])];
      arr.push(removedImage.public_id);
      updatedVariants.removedImages = arr;
    }

    setValue("colorVariants", updatedVariants);
  };

  const addColorVariant = () => {
    setValue("colorVariants", [
      ...colorVariants,
      { Colorname: "", colorCode: "#ffffff", stock: 0, images: [] },
    ]);
  };

  const removeColorVariant = (index) => {
    const updated = [...colorVariants];
    updated.splice(index, 1);
    setValue("colorVariants", updated);
  };

  const addBarcode = () => setValue("barcodes", [...barcodes, ""]);
  const removeBarcode = (index) => {
    const updated = [...barcodes];
    updated.splice(index, 1);
    setValue("barcodes", updated);
  };
  const updateBarcode = (index, value) => {
    const updated = [...barcodes];
    updated[index] = value;
    setValue("barcodes", updated);
  };

  const formSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      // Validate color variants
      for (let i = 0; i < data.colorVariants.length; i++) {
        if (!data.colorVariants[i].Colorname) {
          return Swal.fire("Error", `Colorname is required for variant ${i + 1}`, "error");
        }
      }

      const formData = new FormData();
      formData.append("id", id);
      
      // Add basic fields
      ["name", "company", "Subcategory", "Maincategory", "off"].forEach((key) => {
        if (data[key] !== product[key]) formData.append(key, data[key]);
      });

      // Handle descriptions
      const newDescriptions = data.productDescription.split("#").filter(Boolean);
      formData.delete("productDescription"); // Clear any existing
      newDescriptions.forEach(desc => formData.append("productDescription", desc.trim()));

      // Handle barcodes
      const removedCodes = product.barcodes?.filter(b => !data.barcodes.includes(b)) || [];
      removedCodes.forEach(code => formData.append("codesToRemove", code));
      data.barcodes?.forEach(code => formData.append("codes", code));

      // Handle removed images
      if (data.colorVariants.removedImages) {
        data.colorVariants.removedImages.forEach(id => {
          formData.append("imagesToRemove", id);
        });
      }

      // Prepare color variants data
      const variantsToSend = data.colorVariants.map(variant => {
        // Only include existing images (URL strings) in the images array
        const images = variant.images
          .filter(img => typeof img === 'string' || img.url)
          .map(img => typeof img === 'string' ? img : img.url);
        
        // Extract public_ids from existing images
        const imagePublicIds = variant.images
          .filter(img => img.public_id)
          .map(img => img.public_id);

        return {
          Colorname: variant.Colorname,
          colorCode: variant.colorCode || '#ffffff',
          stock: Number(variant.stock) || 0,
          images: images,
          imagePublicIds: imagePublicIds
        };
      });

      formData.append("colorVariants", JSON.stringify(variantsToSend));

      // Add new image files
      data.colorVariants.forEach((cv, idx) => {
        cv.images.forEach(img => {
          if (img?.file) {
            formData.append("files", img.file);
          }
        });
      });

      const res = await axios.patch("/api/product/product-update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        Swal.fire("Success", "Product updated successfully", "success");
        // Try to extract updated product from common response shapes
        const updated = res.data?.newProduct || res.data?.updatedProduct || res.data?.product || res.data;
        if (updated && updated._id) {
          try {
            dispatch(upsertPublic(updated));
            dispatch(upsertAdmin(updated));
          } catch (e) {
            console.warn("Failed to upsert product into store", e);
          }
        }
        navigate("/admin/products");
      }
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to update product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-6 md:px-20 text-slate-800">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-6 w-1/3 bg-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 animate-pulse" />
            <div className="h-40 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 animate-pulse" />
          </div>
          <div className="h-32 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white py-4 px-6 md:px-10 text-slate-800">
      <form
        onSubmit={handleSubmit(formSubmit)}
        className="space-y-6"
        aria-live="polite">
        {/* Product Info */}
        <div className="bg-white p-6 rounded-2xl shadow-xl space-y-4 border border-slate-300">
          <h2 className="text-2xl flex gap-x-1 font-semibold pb-2 text-slate-800 uppercase italic border-b-4 border-zinc-400 border-double w-fit px-4">
            <BiData className="mt-1 h-7 w-7" />
            {product.name} Basic info
          </h2>
          <p className="text-sm text-slate-500">Basic details and pricing</p>
          <div className="flex gap-6 mt-2 items-center">
            <div className="text-sm text-slate-600">Last purchase price: <span className="font-medium">{formatPrice(product?.lastPurchasePrice)}</span></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <label className="flex flex-col text-sm text-gray-700">
              <span className="mb-1">Product Name</span>
              <input
                {...register("name")}
                placeholder="Product Name"
                className="border border-slate-400 rounded-lg px-3 py-2 w-full bg-zinc-200 outline-none focus:bg-white transition duration-300"
              />
            </label>
            <label className="flex flex-col text-sm text-gray-700">
              <span className="mb-1">Company</span>
              <input
                {...register("company")}
                placeholder="Company"
                className="border border-slate-400 rounded-lg px-3 py-2 w-full bg-zinc-200 outline-none focus:bg-white transition duration-300"
              />
            </label>
            <label className="flex flex-col text-sm text-gray-700">
              <span className="mb-1">Subcategory</span>
              <input
                {...register("Subcategory")}
                placeholder="Subcategory"
                className="border border-slate-400 rounded-lg px-3 py-2 w-full bg-zinc-200 outline-none focus:bg-white transition duration-300"
              />
            </label>
            <label className="flex flex-col text-sm text-gray-700">
              <span className="mb-1">Maincategory</span>
              <input
                {...register("Maincategory")}
                placeholder="Maincategory"
                className="border border-slate-400 rounded-lg px-3 py-2 w-full bg-zinc-200 outline-none focus:bg-white transition duration-300"
              />
            </label>
            <label className="flex flex-col text-sm text-gray-700">
              <span className="mb-1">Discount %</span>
              <input
                {...register("off")}
                type="number"
                placeholder="Discount %"
                className="border border-slate-400 rounded-lg px-3 py-2 w-full bg-zinc-200 outline-none focus:bg-white transition duration-300"
              />
            </label>
          </div>
        </div>

        {/* Barcodes */}
        <div className="bg-white p-6 rounded-2xl shadow-xl space-y-3 border border-slate-300">
          <h2 className="text-xl font-semibold border-b-4 uppercase italic px-4 pb-2 border-double w-fit border-zinc-400 text-slate-800 flex gap-x-1">
            <MdBarcodeReader className="mt-1 h-6 w-6" />
            Barcode's
          </h2>
          <p className="text-sm text-slate-500">
            Add or remove barcodes for this product
          </p>
          {barcodes.map((b, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={b}
                onChange={(e) => updateBarcode(i, e.target.value)}
                placeholder="Barcode"
                className="flex-1 border border-slate-400 rounded-lg px-3 py-2 bg-zinc-200 outline-none focus:bg-white transition duration-300"
              />
              <button
                type="button"
                onClick={() => removeBarcode(i)}
                className="bg-rose-500 px-3 py-1 rounded text-white hover:bg-rose-600 transition">
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addBarcode}
            className="bg-emerald-500 px-4 py-2 rounded-lg text-white mt-2 hover:bg-emerald-600 transition">
            Add Barcode
          </button>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-300">
          <h2 className="text-xl font-semibold text-slate-700 border-b-4 border-double border-zinc-400 px-4 pb-2 flex gap-x-1 w-fit italic uppercase mb-2">
            <LiaAudioDescriptionSolid className="mt-1 w-7 h-7" />
            Description
          </h2>
          <textarea
            {...register("productDescription")}
            placeholder="Description #..."
            className="w-full border border-slate-400 rounded-lg px-3 py-2 h-32 bg-zinc-200 resize-none outline-none focus:bg-white transition duration-300"
          />
        </div>

        {/* Color Variants */}
        <div className="bg-white p-6 rounded-2xl shadow-xl space-y-4 border border-slate-300">
          <h2 className="text-xl font-semibold flex gap-x-1 border-b-4 border-double border-zinc-400 uppercase italic w-fit px-4 pb-2 text-slate-700">
            <AiFillProduct className="mt-1 w-7 h-7" />
            Color Variants
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {colorVariants.map((cv, idx) => (
              <div
                key={idx}
                className="bg-white border border-black/30 shadow-xl w-full p-4 rounded-xl space-y-3 ring-1 ring-slate-100 transition-transform duration-500 hover:-translate-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">
                    Variant {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeColorVariant(idx)}
                    className="bg-rose-500 px-3 py-1 rounded text-white hover:bg-rose-600 transition">
                    Remove
                  </button>
                </div>

                <input
                  type="text"
                  value={cv.Colorname}
                  onChange={(e) => {
                    const updated = [...colorVariants];
                    updated[idx].Colorname = e.target.value;
                    setValue("colorVariants", updated);
                  }}
                  placeholder="Color Name"
                  className="rounded-lg border border-slate-400 px-3 py-2 w-full mb-2 bg-zinc-200 outline-none focus:bg-white transition duration-300"
                />

                <div className="flex items-center gap-4">
                  <div className="w-full h-12 overflow-hidden border-2 px-1 py-1 border-zinc-300">
                    <input
                      type="color"
                      value={cv.colorCode}
                      onChange={(e) => {
                        const updated = [...colorVariants];
                        updated[idx].colorCode = e.target.value;
                        setValue("colorVariants", updated);
                      }}
                      className="w-full h-full"
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={cv.stock}
                    readOnly
                    className="rounded-lg border border-slate-400 px-3 py-2 w-full bg-zinc-200 outline-none focus:bg-white transition duration-300"
                  />
                </div>
                {cv.lastPurchasePrice !== null && (
                  <div className="text-sm text-slate-600">
                    <div>Last purchase price: {formatPrice(cv.lastPurchasePrice)}</div>
                    {cv.avgPurchasePrice !== null && (
                      <div>Avg purchase cost: {formatPrice(cv.avgPurchasePrice)}</div>
                    )}
                  </div>
                )}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => openPriceModal(idx)}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      View price details
                    </button>
                  </div>

                <div className="flex gap-2 flex-wrap mt-2 items-center">
                  {cv.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded overflow-hidden border">
                      <img
                        src={img.preview || img.url}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantImage(idx, i)}
                        className="absolute top-1 right-1 bg-rose-500 px-2 rounded text-white">
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    aria-label={`Add image for variant ${idx + 1}`}
                    onClick={() => fileRefs.current[idx]?.click()}
                    className="w-20 h-20 bg-white border-2 border-dashed border-slate-400 flex items-center justify-center cursor-pointer rounded text-slate-600 hover:bg-slate-200 transition">
                    + Add
                  </button>
                  <Controller
                    name={`file-${idx}`}
                    control={control}
                    render={({ field }) => (
                      <input
                        ref={(el) => (fileRefs.current[idx] = el)}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, idx)}
                        className="hidden"
                      />
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addColorVariant}
            className="bg-emerald-500 px-4 py-2 rounded-lg text-white mt-2 hover:bg-emerald-600 transition">
            Add Color Variant
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            className={`flex items-center gap-3 ${
              isSubmitting
                ? "bg-emerald-400 cursor-wait"
                : "bg-emerald-600 hover:bg-teal-700"
            } px-6 py-3 text-white rounded-xl text-lg shadow transition`}>
            {isSubmitting && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
            <span>{isSubmitting ? "Updating..." : "Update Product"}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-slate-500 px-6 py-3 text-white rounded-xl text-lg shadow hover:bg-slate-600 transition">
            Cancel
          </button>
        </div>
      </form>

      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-[90vw] max-w-2xl bg-white rounded-2xl p-4 ring-1 ring-slate-200 shadow-lg">
            <h2 className="text-slate-700 font-semibold mb-2">Crop Image</h2>
            <Cropper
              ref={cropperRef}
              src={rawImage}
              style={{ height: 400, width: "100%" }}
              aspectRatio={NaN}
              guides
              viewMode={1}
              background={false}
              autoCropArea={1}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleCropDone}
                className="px-4 py-2 bg-teal-600 rounded text-white hover:bg-teal-700 transition">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {priceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="w-[90vw] max-w-md bg-white rounded-2xl p-6 ring-1 ring-slate-200 shadow-lg">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">Price details</h3>
              <button onClick={closePriceModal} className="text-slate-500 hover:text-slate-800">✕</button>
            </div>
            <div className="mt-4 text-sm text-slate-700 space-y-3">
              {priceModalIndex === null ? (
                <div>No variant selected</div>
              ) : (
                (() => {
                  const v = colorVariants[priceModalIndex] || {};
                  return (
                    <div>
                      <div className="font-medium text-slate-800">
                        {v.Colorname || `Variant ${priceModalIndex + 1}`}
                      </div>
                      <div className="mt-2">SKU: {v.sku ?? "—"}</div>
                      <div className="mt-2">
                        Last purchase price: {formatPrice(v.lastPurchasePrice)}
                      </div>
                      <div>
                        Average purchase cost: {formatPrice(v.avgPurchasePrice)}
                      </div>
                      {product?.lastPurchasePrice !== undefined && (
                        <div className="mt-3 text-sm text-slate-600">
                          Overall last purchase price:{" "}
                          {formatPrice(product.lastPurchasePrice)}
                        </div>
                      )}

                      <div className="mt-4">
                        <h4 className="font-medium">Purchase batches</h4>
                        {priceBatchesLoading ? (
                          <div className="text-sm text-slate-500">
                            Loading...
                          </div>
                        ) : priceBatches.length === 0 ? (
                          <div className="text-sm text-slate-500">
                            No batches found
                          </div>
                        ) : (
                          <ul className="mt-2 max-h-48 overflow-auto divide-y">
                            {priceBatches.map((b) => (
                              <li key={b._id} className="py-2 text-sm">
                                <div className="flex justify-between">
                                  <div className="text-slate-800">
                                    {b.purchaseInvoice || "—"}
                                  </div>
                                  <div className="text-slate-600">
                                    {typeof b.date === "string"
                                      ? b.date
                                      : new Date(b.Date).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-slate-600">
                                  Price: {formatPrice(b.purchasePrice)} • Qty:{" "}
                                  {b.qty} • Remaining: {b.remainingQty}
                                </div>
                                <div className="text-slate-500">
                                  Vendor:{" "}
                                  {b.vendorId?.name || b.vendorId || "—"}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={closePriceModal} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductEditPage;
