import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Cropper from "react-cropper";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";
import axios from "../config/axios";
import { toast } from "react-toastify";

const ProductAdder = () => {
  const [totalProduct, setTotalProduct] = useState(0);
  const [currentCrop, setCurrentCrop] = useState(null); 
  const [rawImage, setRawImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [colorVariants, setColorVariants] = useState([]); // color variant objects
  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      company: "",
      Subcategory: "",
      Maincategory: "",
      price: null,
      productDescription: "",
      barcodes: [],
    },
  });

  const barcodes = watch("barcodes") || [];

  useEffect(() => {
    const fetchProductCount = async () => {
      const res = await axios.get("/api/product/product-count");
      setTotalProduct(res.data);
    };
    fetchProductCount();
  }, []);

  // Open file selector for a specific variant
  const handleAddVariantImage = (variantIndex) => {
    fileInputRef.current?.click();
    setCurrentCrop(variantIndex);
  };

  // Handle file select
  const handleImageChange = (e) => {
    const fileObj = e.target.files[0];
    if (!fileObj) return;
    setRawImage(URL.createObjectURL(fileObj));
    setShowCropper(true);
  };

  // Crop image and attach to colorVariant
  const handleCropDone = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || currentCrop === null) return;

    cropper.getCroppedCanvas({ width: 500, height: 500 }).toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `image_${Date.now()}.avif`, { type: "image/avif" });
      const preview = URL.createObjectURL(blob);

      setColorVariants((prev) => {
        const updated = [...prev];
        updated[currentCrop].images.push({ file, preview });
        return updated;
      });

      setRawImage(null);
      setShowCropper(false);
    }, "image/avif", 0.9);
  };

  // Remove image from a variant
  const removeVariantImage = (variantIndex, imageIndex) => {
    setColorVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].images.splice(imageIndex, 1);
      return updated;
    });
  };

  // Add new color variant
  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      { name: "", colorCode: "#ffffff", stock: 0, images: [] },
    ]);
  };

  // Remove a color variant
  const removeColorVariant = (index) => {
    setColorVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Update barcode
  const addBarcode = () => setValue("barcodes", [...barcodes, ""]);
  const removeBarcode = (idx) => setValue("barcodes", barcodes.filter((_, i) => i !== idx));
  const updateBarcode = (idx, val) => {
    const updated = [...barcodes];
    updated[idx] = val;
    setValue("barcodes", updated);
  };

  // Submit form
const formSubmit = async (data) => {
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("company", data.company);
    formData.append("Subcategory", data.Subcategory);
    formData.append("Maincategory", data.Maincategory);
    formData.append("price", data.price);
    formData.append("productDescription", data.productDescription);
    formData.append("off", data.off || 0);

    // ✅ Prepare colorVariants for backend
    const variantsForBackend = colorVariants.map((cv) => ({
      Colorname: cv.name,
      colorCode: cv.colorCode,
      stock: cv.stock,
    }));

    // ✅ Send all variant info as one JSON string
    formData.append("colorVariants", JSON.stringify(variantsForBackend));

    // ✅ Attach all images in one array "files"
    colorVariants.forEach((variant) => {
      variant.images.forEach((img) => {
        formData.append("files", img.file);
      });
    });

    // ✅ Barcodes
    barcodes.filter(Boolean).forEach((c) => formData.append("codes", c));

    toast.info("Uploading product...");
    const res = await axios.post("/api/product/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success(res.data.message);
    reset();
    setColorVariants([]);
    setTotalProduct((prev) => prev + 1);
  } catch (err) {
    console.error("❌ Product add error:", err);
    toast.error("Failed to add product");
  }
};


  return (
    <div className="h-screen w-full bg-zinc-800 px-10 py-5 flex flex-col gap-y-5 overflow-auto">
      {/* Total Products */}
      <div className="w-full py-10 px-10 bg-white rounded-2xl text-5xl flex items-center justify-between">
        <h1 className="font-PublicSans uppercase font-semibold">Total Products</h1>
        <p className="font-Inter font-semibold">{totalProduct}</p>
      </div>

      <div className="w-full py-6 px-10 bg-white rounded-2xl flex flex-col gap-y-6">
        <h1 className="text-3xl font-bold text-center">Add Product</h1>

        {/* Product Form */}
        <form onSubmit={handleSubmit(formSubmit)} className="flex flex-col gap-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Color Variants */}
            <div className="flex-1 h-[65vh] overflow-y-scroll flex flex-col gap-y-4">
              <h2 className="text-xl font-semibold">Color Variants</h2>
              {colorVariants.map((cv, idx) => (
                <div key={idx} className="bg-zinc-200 p-4 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold">Variant {idx + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeColorVariant(idx)}
                      className="bg-red-500 px-2 py-1 rounded text-white"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Color Name"
                    value={cv.name}
                    onChange={(e) => {
                      const updated = [...colorVariants];
                      updated[idx].name = e.target.value;
                      setColorVariants(updated);
                    }}
                    className="border px-2 py-1 rounded w-full"
                  />
                  <input
                    type="color"
                    value={cv.colorCode}
                    onChange={(e) => {
                      const updated = [...colorVariants];
                      updated[idx].colorCode = e.target.value;
                      setColorVariants(updated);
                    }}
                    className="w-16 h-10"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={cv.stock}
                    onChange={(e) => {
                      const updated = [...colorVariants];
                      updated[idx].stock = Number(e.target.value);
                      setColorVariants(updated);
                    }}
                    className="border px-2 py-1 rounded w-24"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cv.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20">
                        <img src={img.preview} alt="variant" className="w-full h-full object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removeVariantImage(idx, i)}
                          className="absolute top-0 right-0 bg-red-500 px-1 text-white rounded"
                        >
                          X
                        </button>
                      </div>
                    ))}
                    <div
                      onClick={() => handleAddVariantImage(idx)}
                      className="w-20 h-20 bg-gray-300 flex items-center justify-center rounded cursor-pointer"
                    >
                      + Add
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addColorVariant}
                className="bg-green-500 px-4 py-2 rounded text-white mt-2 w-40"
              >
                Add Variant
              </button>
            </div>

            {/* Right: Basic Info */}
            <div className="flex-1 flex flex-col gap-y-2">
              <input
                {...register("name", { required: "Product name required" })}
                placeholder="Product Name"
                className="border px-2 py-1 rounded w-full"
              />
              <input
                {...register("company", { required: "Company required" })}
                placeholder="Company"
                className="border px-2 py-1 rounded w-full"
              />
              <input
                {...register("Subcategory", { required: "Subcategory required" })}
                placeholder="Subcategory"
                className="border px-2 py-1 rounded w-full"
              />
              <input
                {...register("Maincategory", { required: "Maincategory required" })}
                placeholder="Maincategory"
                className="border px-2 py-1 rounded w-full"
              />
              <input
                {...register("price", { required: "Price required", valueAsNumber: true, min: 1 })}
                placeholder="Price"
                type="number"
                className="border px-2 py-1 rounded w-full"
              />

              {/* Barcodes */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="font-bold">Barcodes</label>
                {barcodes.map((code, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => updateBarcode(idx, e.target.value)}
                      placeholder="Barcode"
                      className="border px-2 py-1 rounded w-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeBarcode(idx)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBarcode}
                  className="bg-green-500 px-4 py-1 rounded text-white"
                >
                  Add Barcode
                </button>
              </div>

              <textarea
                {...register("productDescription", { required: true })}
                placeholder="Description"
                className="border px-2 py-1 rounded w-full h-32 mt-2 resize-none"
              />

              <button
                type="submit"
                className="bg-sky-500 text-white px-4 py-2 rounded mt-2 w-full hover:bg-sky-600"
              >
                Add Product
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative w-[90vw] max-w-2xl bg-zinc-900 rounded-lg p-4">
            <h2 className="text-white mb-2 text-lg font-semibold">Crop Image</h2>
            <Cropper
              ref={cropperRef}
              src={rawImage}
              style={{ height: 400, width: "100%" }}
              aspectRatio={1}
              guides
              viewMode={1}
              background={false}
              autoCropArea={1}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleCropDone}
                className="bg-white px-4 py-2 rounded text-black hover:bg-gray-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Controller
        name="file"
        control={control}
        render={({ field }) => (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        )}
      />
    </div>
  );
};

export default ProductAdder;
