import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Cropper from "react-cropper";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";
import axios from "../config/axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const cropperRef = useRef(null);

  const [product, setProduct] = useState({});
  const [rawImage, setRawImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(null);

  const { register, handleSubmit, setValue, control, reset, watch } = useForm({
    defaultValues: {
      name: "",
      company: "",
      Subcategory: "",
      Maincategory: "",
      off: 0,
      price: null,
      stock: null,
      barcodes: [],
      productDescription: "",
      colorVariants: [],
    },
  });

  const colorVariants = watch("colorVariants") || [];
  const barcodes = watch("barcodes") || [];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/product-info/${id}`);
        const p = res.data;

        const formVariants = (p.colorVariants || []).map((cv) => ({
          Colorname: cv.Colorname || "", // required field
          colorCode: cv.colorCode || "#ffffff",
          stock: cv.stock || 0,
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
          price: p.price || null,
          stock: totalStock,
          barcodes: p.barcodes || [],
          productDescription:
            p.description && Array.isArray(p.description)
              ? `#${p.description.join(" #")}`
              : "",
          colorVariants: formVariants,
        });

        setProduct(p);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to fetch product details", "error");
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

  const removeVariantImage = (variantIndex, imgIndex) => {
    const updatedVariants = [...colorVariants];
    updatedVariants[variantIndex].images.splice(imgIndex, 1);
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
    // Validate Colorname for each variant
    for (let i = 0; i < data.colorVariants.length; i++) {
      if (!data.colorVariants[i].Colorname) {
        return Swal.fire("Error", `Colorname is required for variant ${i + 1}`, "error");
      }
    }

    const formData = new FormData();
    formData.append("id", id);
    ["name", "company", "Subcategory", "Maincategory", "off", "price"].forEach((key) => {
      if (data[key] !== product[key]) formData.append(key, data[key]);
    });

    const newDescriptions = data.productDescription.split("#").filter(Boolean);
    newDescriptions.forEach(desc => formData.append("productDescription", desc));

    const removedCodes = product.barcodes.filter(b => !data.barcodes.includes(b));
    removedCodes.forEach(code => formData.append("codesToRemove", code));
    data.barcodes.forEach(code => formData.append("codes", code));

    // Send colorVariants as JSON
    formData.append("colorVariants", JSON.stringify(data.colorVariants));

    // Append new images
    data.colorVariants.forEach(cv => {
      cv.images.forEach(img => {
        if (img.file) formData.append("files", img.file);
      });
    });

    try {
      const res = await axios.patch("/api/product/product-update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        Swal.fire("Updated!", "Product updated successfully.", "success");
        navigate("/admin/product");
      }
    } catch (err) {
      console.error("❌ Product update error:", err);
      Swal.fire("Error!", err.response?.data?.message || "Failed to update product.", "error");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-400 py-10 px-6 md:px-20">
      <form onSubmit={handleSubmit(formSubmit)} className="space-y-6">
        {/* Product Info */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">Product Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input {...register("name")} placeholder="Product Name" className="border rounded px-3 py-2 w-full" />
            <input {...register("company")} placeholder="Company" className="border rounded px-3 py-2 w-full" />
            <input {...register("Subcategory")} placeholder="Subcategory" className="border rounded px-3 py-2 w-full" />
            <input {...register("Maincategory")} placeholder="Maincategory" className="border rounded px-3 py-2 w-full" />
            <input {...register("off")} type="number" placeholder="Discount %" className="border rounded px-3 py-2 w-full" />
            <input {...register("price")} type="number" placeholder="Price" className="border rounded px-3 py-2 w-full" />
          </div>
        </div>

        {/* Barcodes */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
          <h2 className="text-xl font-semibold text-gray-700">Barcodes</h2>
          {barcodes.map((b, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={b}
                onChange={(e) => updateBarcode(i, e.target.value)}
                placeholder="Barcode"
                className="flex-1 border rounded px-3 py-2"
              />
              <button type="button" onClick={() => removeBarcode(i)} className="bg-red-500 px-3 py-1 rounded text-white">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addBarcode} className="bg-green-500 px-4 py-2 rounded text-white mt-2">Add Barcode</button>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
          <textarea {...register("productDescription")} placeholder="Description #..." className="w-full border rounded px-3 py-2 h-32" />
        </div>

        {/* Color Variants */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Color Variants</h2>
          {colorVariants.map((cv, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Variant {idx + 1}</span>
                <button type="button" onClick={() => removeColorVariant(idx)} className="bg-red-500 px-3 py-1 rounded text-white">Remove</button>
              </div>

              <input type="text" value={cv.Colorname} onChange={(e) => {
                const updated = [...colorVariants];
                updated[idx].Colorname = e.target.value;
                setValue("colorVariants", updated);
              }} placeholder="Color Name" className="border rounded px-3 py-2 w-full mb-2" />

              <div className="flex items-center gap-4">
                <input type="color" value={cv.colorCode} onChange={(e) => {
                  const updated = [...colorVariants];
                  updated[idx].colorCode = e.target.value;
                  setValue("colorVariants", updated);
                }} className="w-12 h-12 rounded-full border" />
                <input type="number" placeholder="Stock" value={cv.stock} onChange={(e) => {
                  const updated = [...colorVariants];
                  updated[idx].stock = Number(e.target.value);
                  setValue("colorVariants", updated);
                }} className="border rounded px-3 py-2 w-24" />
              </div>

              <div className="flex gap-2 flex-wrap mt-2">
                {cv.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded overflow-hidden border">
                    <img src={img.preview || img.url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeVariantImage(idx, i)} className="absolute top-0 right-0 bg-red-500 px-1 rounded text-white">X</button>
                  </div>
                ))}
                <div onClick={() => fileRef.current.click()} className="w-20 h-20 bg-gray-200 flex items-center justify-center cursor-pointer rounded text-gray-700">+ Add</div>
                <Controller name="file" control={control} render={({ field }) => (
                  <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleImageChange(e, idx)} className="hidden" />
                )} />
              </div>
            </div>
          ))}
          <button type="button" onClick={addColorVariant} className="bg-green-500 px-4 py-2 rounded text-white mt-2">Add Color Variant</button>
        </div>

        <button type="submit" className="bg-blue-500 px-6 py-3 text-white rounded-xl text-lg shadow-md hover:bg-blue-600">Update Product</button>
        <button type="button" onClick={() => navigate(-1)} className="bg-zinc-500 px-8 py-3 ml-5 text-white rounded-xl text-lg shadow-md hover:bg-zinc-700">Cancel</button>
      </form>

      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative w-[90vw] max-w-2xl bg-white rounded-lg p-4">
            <h2 className="text-gray-700 font-semibold mb-2">Crop Image</h2>
            <Cropper ref={cropperRef} src={rawImage} style={{ height: 400, width: "100%" }} aspectRatio={NaN} guides viewMode={1} background={false} autoCropArea={1} />
            <div className="flex justify-end mt-2">
              <button onClick={handleCropDone} className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductEditPage;
