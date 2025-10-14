import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Cropper from "react-cropper";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";
import axios from "../config/axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [Product, setProduct] = useState({});
  const [preview, setPreview] = useState(null);
  const file = useRef(null);
  const [image, setImage] = useState("/imagePlaceholder.png");
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const cropperRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      id: "",
      name: "",
      company: "",
      Subcategory: "",
      Maincategory: "",
      off: 0,
      price: null,
      barcodes: [],
      stock: null,
      avatar: null,
      productDescription: [],
    },
  });

  const barcodes = watch("barcodes") || [];

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/product-info/${id}`);
        const product = res.data;

        reset({
          id: product._id,
          name: product.name,
          company: product.company,
          Subcategory: product.Subcategory,
          Maincategory: product.Maincategory,
          off: product.off,
          price: product.price,
          productDescription: `#${product.description?.join(" #") || ""}`,
          stock: product.stock,
          barcodes: product.barcodes?.map((b) => b) || [],
        });

        setImage(product.productPic);
        setProduct(product);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id, reset]);

  // Handle file select
  const handleImageChange = (e) => {
    const fileObj = e.target.files[0];
    if (fileObj) {
      const imageURL = URL.createObjectURL(fileObj);
      setRawImage(imageURL);
      setShowCropper(true);
    }
  };

  // Handle crop done
  const handleCropDone = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    cropper.getCroppedCanvas({ width: 500, height: 500 }).toBlob(
      (blob) => {
        if (blob) {
          const croppedURL = URL.createObjectURL(blob);
          setPreview(croppedURL);
          const croppedFile = new File([blob], "avatar.avif", {
            type: "image/avif",
          });
          setValue("avatar", croppedFile, { shouldValidate: true });
          setShowCropper(false);
        }
      },
      "image/avif",
      0.9
    );
  };

  // Add a new barcode
  const addBarcode = () => setValue("barcodes", [...barcodes, ""]);

  // Remove barcode by index
  // Track removed codes to send to backend (existing product barcodes)
  const [removedCodes, setRemovedCodes] = useState([]);

  // Remove barcode by index with SweetAlert confirmation if it was an existing barcode
  const removeBarcode = (index) => {
    const codeAtIndex = barcodes[index];
    const existingCodes = (Product.barcodes || []).map((b) => String(b?.code ?? b).trim()).filter(Boolean);

    // If the code is one of the existing codes, confirm with SweetAlert
    if (existingCodes.includes(String(codeAtIndex).trim())) {
      Swal.fire({
        title: 'Remove barcode? ',
        text: `This barcode (${codeAtIndex}) will be deleted from the product. Are you sure?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          const updated = barcodes.filter((_, i) => i !== index);
          setValue('barcodes', updated);
          // Add to removedCodes (avoid duplicates)
          setRemovedCodes((prev) => {
            const val = String(codeAtIndex).trim();
            return prev.includes(val) ? prev : [...prev, val];
          });
          Swal.fire('Removed!', 'Barcode will be deleted on update.', 'success');
        }
      });
    } else {
      // Non-existing/new barcode — just remove without confirmation
      const updated = barcodes.filter((_, i) => i !== index);
      setValue('barcodes', updated);
    }
  };

  // Update barcode by index
  const updateBarcode = (index, value) => {
    const updated = [...barcodes];
    updated[index] = value;
    setValue("barcodes", updated);
  };

  // Navigate back and reset
  const resetForm = () => {
    navigate(-1);
    setPreview(null);
    setRawImage(null);
  };

  // Form submit
  const formSubmit = async (data) => {
    const formData = new FormData();
    formData.append("id", id);

    if (data.name && data.name !== Product.name)
      formData.append("name", data.name);
    if (data.company && data.company !== Product.company)
      formData.append("company", data.company);
    if (data.Subcategory && data.Subcategory !== Product.Subcategory)
      formData.append("Subcategory", data.Subcategory);
    if (data.Maincategory && data.Maincategory !== Product.Maincategory)
      formData.append("Maincategory", data.Maincategory);
    if (data.off && Number(data.off) !== Number(Product.off))
      formData.append("off", data.off);
    if (data.price && Number(data.price) !== Number(Product.price))
      formData.append("price", data.price);
    if (data.stock && Number(data.stock) !== Number(Product.stock))
      formData.append("stock", data.stock);

    // Handle new barcodes and removed barcodes
    if (data.barcodes) {
      const incoming = data.barcodes.map((c) => String(c).trim()).filter(Boolean);
      const existing = (Product.barcodes || [])
        .map((b) => String(b?.code ?? b).trim())
        .filter(Boolean);

      const newCodes = incoming.filter((code) => !existing.includes(code));
      const removedFromCompare = existing.filter((code) => !incoming.includes(code));

      // Append new codes
      newCodes.forEach((code) => formData.append("codes", code));

      // Combine removed codes from the UI (confirmed removals) and manual edits
      const combinedRemoved = Array.from(new Set([...(removedCodes || []), ...removedFromCompare]));
      combinedRemoved.forEach((code) => formData.append("codesToRemove", code));
    }

    // Description
    const newDescriptions = data.productDescription
      .split("#")
      .filter(Boolean)
      .map((desc) => desc.trim());
    if (JSON.stringify(newDescriptions) !== JSON.stringify(Product.description)) {
      newDescriptions.forEach((desc) => formData.append("productDescription", desc));
    }

    if (data.avatar) formData.append("avatar", data.avatar);

    try {
      Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await axios.patch("/api/product/product-update", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.status === 200) {
              Swal.fire("Saved!", "", "success");
              // Clear tracked removed codes
              setRemovedCodes([]);
              resetForm();
            }
          } catch (error) {
            Swal.fire("Error!", "Failed to update product", "error");
            console.error(error);
          }
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
          resetForm();
        }
      });
    } catch (err) {
      toast.error("Failed to update product");
      console.error(err);
    }
  };

  return (
    <div className="h-screen w-full bg-zinc-800 px-10 py-5 flex flex-col gap-y-5">
      <div className="w-full h-full py-6 px-10 bg-white rounded-2xl flex items-center gap-x-10">
        {/* IMAGE PREVIEW */}
        <div className="h-[55vh] overflow-hidden bg-zinc-300 border-10 border-zinc-400 border-dashed rounded-2xl w-[50%] flex items-center">
          <img
            onClick={() => file.current && file.current.click()}
            src={preview || image}
            alt="avatar"
            className="object-contain object-center w-full h-full cursor-pointer"
          />
        </div>

        <Controller
          name="avatar"
          control={control}
          render={({ field }) => (
            <input
              ref={file}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          )}
        />

        {/* FORM */}
        <div className="h-full w-[50%] overflow-auto">
          <h1 className="text-center font-PublicSans text-4xl mb-2">
            Product Details
          </h1>

          <form onSubmit={handleSubmit(formSubmit)} className="flex flex-col gap-y-6">
            {/* NAME */}
            <div>
              {errors.name && <p className="font-mono text-red-500">{errors.name.message}</p>}
              <input
                {...register("name", { required: "Please fill the name" })}
                placeholder="Product Name..."
                className="w-full outline-none border py-2 px-4 rounded-lg"
                type="text"
              />
            </div>

            {/* COMPANY */}
            <div>
              {errors.company && (
                <p className="font-mono text-red-500">{errors.company.message}</p>
              )}
              <input
                {...register("company", { required: "Company is required" })}
                placeholder="Company..."
                className="w-full outline-none border py-2 px-4 rounded-lg"
                type="text"
              />
            </div>

            {/* CATEGORY FIELDS */}
            <input
              {...register("Subcategory", { required: "Subcategory is required" })}
              placeholder="Subcategory..."
              className="w-full outline-none border py-2 px-4 rounded-lg"
              type="text"
            />
            <input
              {...register("Maincategory", { required: "Maincategory is required" })}
              placeholder="Maincategory..."
              className="w-full outline-none border py-2 px-4 rounded-lg"
              type="text"
            />

            {/* OFF / PRICE / STOCK */}
            <input
              {...register("off")}
              placeholder="Discount (%)"
              className="w-full outline-none border py-2 px-4 rounded-lg"
              type="number"
            />
            <input
              {...register("price", { required: "Price required" })}
              placeholder="Price (Rs)"
              className="w-full outline-none border py-2 px-4 rounded-lg"
              type="number"
            />
            <input
              {...register("stock", { required: "Stock required" })}
              placeholder="Stock..."
              className="w-full outline-none border py-2 px-4 rounded-lg"
              type="number"
            />

            {/* BARCODE INPUTS */}
            <div className="flex flex-col gap-y-2">
              <label className="font-bold">Barcodes</label>
              {barcodes.map((code, idx) => (
                <div key={idx} className="flex gap-x-2 items-center">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => updateBarcode(idx, e.target.value)}
                    placeholder="Enter barcode"
                    className="outline-none border py-2 px-4 rounded-lg w-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeBarcode(idx)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addBarcode}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Barcode
              </button>
            </div>

            {/* DESCRIPTION */}
            <textarea
              {...register("productDescription")}
              placeholder="Product Description (use # between points)"
              className="w-full outline-none border py-2 px-4 h-40 rounded-lg resize-none"
            ></textarea>

            <div className="flex gap-x-4">
              <button
                type="submit"
                className="w-full text-center py-3 rounded-lg text-white font-Jura uppercase text-2xl bg-green-500 active:bg-green-700"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/product")}
                className="w-full text-center py-3 rounded-lg text-white font-Jura uppercase text-2xl bg-gray-500 active:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CROPPER MODAL */}
      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative w-[90vw] max-w-2xl bg-zinc-900 rounded-lg p-4">
            <h2 className="mb-2 text-lg font-semibold text-white">
              Crop your image
            </h2>
            <Cropper
              ref={cropperRef}
              src={rawImage}
              style={{ height: 400, width: "100%" }}
              aspectRatio={1}
              guides={true}
              viewMode={1}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCropDone}
                className="px-4 py-2 bg-white text-black rounded hover:bg-zinc-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductEditPage;
