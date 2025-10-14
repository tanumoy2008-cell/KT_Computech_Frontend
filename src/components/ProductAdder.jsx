import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Cropper from "react-cropper";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";
import axios from "../config/axios";
import { toast } from "react-toastify";

const ProductAdder = () => {
  const [totalProduct, setTotalProduct] = useState(0);
  const [preview, setPreview] = useState(null);
  const file = useRef(null);
  const [image, setImage] = useState("/imagePlaceholder.png");
  const [rawImage, setRawImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
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
      name: "",
      company: "",
      Subcategory: "",
      Maincategory: "",
      price: null,
      avatar: null,
      productDescription: [],
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

  // Barcode helpers (add, remove, update)
  const addBarcode = () => setValue("barcodes", [...barcodes, ""]);
  const removeBarcode = (index) => {
    const updated = barcodes.filter((_, i) => i !== index);
    setValue("barcodes", updated);
  };
  const updateBarcode = (index, value) => {
    const updated = [...barcodes];
    updated[index] = value;
    setValue("barcodes", updated);
  };

  // Submit form
  const formSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("company", data.company);
    formData.append("Subcategory", data.Subcategory);
    formData.append("Maincategory", data.Maincategory);
    formData.append("price", data.price);

    // Description
    data.productDescription
      .split("#")
      .filter(Boolean)
      .forEach((desc) => formData.append("productDescription", desc.trim()));

    // Barcodes (send as `codes` fields)
    if (data.barcodes && data.barcodes.length) {
      data.barcodes
        .map((c) => String(c).trim())
        .filter(Boolean)
        .forEach((code) => formData.append("codes", code));
    }

    if (data.avatar) formData.append("avatar", data.avatar);

    try {
      toast.info("Please wait, uploading product...");
      const res = await axios.post("/api/product/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      setImage("/imagePlaceholder.png");
      setPreview(null);
      setRawImage(null);
      reset();
      setTotalProduct((prev) => prev + 1);
    } catch (err) {
      toast.error("Failed to add product");
      console.error(err);
    }
  };

  return (
    <div className="h-screen w-full bg-zinc-800 px-10 py-5 flex flex-col gap-y-5">
      {/* Total Products */}
      <div className="w-full py-10 px-10 bg-white rounded-2xl text-5xl flex items-center justify-between">
        <h1 className="font-PublicSans uppercase font-semibold">
          Total Products
        </h1>
        <p className="font-Inter font-semibold">{totalProduct}</p>
      </div>

      {/* Product Adder */}
      <div className="w-full h-full py-6 px-10 bg-white rounded-2xl flex items-center gap-x-10">
        {/* Image Preview */}
        <div className="h-[55vh] overflow-hidden bg-zinc-300 border-10 border-zinc-400 border-dashed rounded-2xl w-[60%] flex items-center">
          <img
            onClick={() => file.current?.click()}
            src={preview || image}
            alt="avatar"
            className="object-contain object-center w-full h-full cursor-pointer"
          />
        </div>

        {/* File Input */}
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

        {/* Form */}
        <div className="h-full w-[40%]">
          <h1 className="text-center font-PublicSans text-4xl mb-2">
            Product Details
          </h1>
          <form onSubmit={handleSubmit(formSubmit)} className="flex flex-col gap-y-2">
            {/* Name */}
            <div>
              {errors.name && (
                <p className="font-mono text-red-500">{errors.name.message}</p>
              )}
              <input
                {...register("name", {
                  required: "Please fill the name",
                  minLength: { value: 2, message: "At least 2 characters" },
                  maxLength: { value: 50, message: "Max 50 characters" },
                })}
                placeholder="Product Name..."
                className="w-full outline-none border py-2 px-4 rounded-lg"
                type="text"
              />
            </div>

            {/* Company */}
            <div>
              {errors.company && (
                <p className="font-mono text-red-500">
                  {errors.company.message}
                </p>
              )}
              <input
                {...register("company", {
                  required: "Company name required",
                  minLength: { value: 2, message: "At least 2 characters" },
                  maxLength: { value: 50, message: "Max 50 characters" },
                })}
                placeholder="Company..."
                className="w-full outline-none border py-2 px-4 rounded-lg"
                type="text"
              />
            </div>

            {/* Subcategory */}
            <div>
              {errors.Subcategory && (
                <p className="font-mono text-red-500">
                  {errors.Subcategory.message}
                </p>
              )}
              <input
                {...register("Subcategory", {
                  required: "Subcategory required",
                  minLength: { value: 2, message: "At least 2 characters" },
                })}
                placeholder="Subcategory..."
                className="w-full outline-none border py-2 px-4 rounded-lg"
                type="text"
              />
            </div>

            {/* Maincategory */}
            <div>
              {errors.Maincategory && (
                <p className="font-mono text-red-500">
                  {errors.Maincategory.message}
                </p>
              )}
              <input
                {...register("Maincategory", {
                  required: "Maincategory required",
                  minLength: { value: 2, message: "At least 2 characters" },
                })}
                placeholder="Maincategory..."
                className="w-full outline-none border py-2 px-4 rounded-lg"
                type="text"
              />
            </div>

            {/* Price */}
            <div>
              {errors.price && (
                <p className="font-mono text-red-500">{errors.price.message}</p>
              )}
              <input
                {...register("price", {
                  required: "Price required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Minimum ₹1" },
                })}
                placeholder="Price in Rs..."
                className="w-full outline-none border py-2 px-4 rounded-lg"
                type="number"
              />
            </div>

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

            {/* Description */}
            <div>
              {errors.productDescription && (
                <p className="font-mono text-red-500">
                  {errors.productDescription.message}
                </p>
              )}
              <textarea
                {...register("productDescription", {
                  required: "At least one description required",
                })}
                placeholder="Product Description (use # between points)"
                className="w-full outline-none border py-2 px-4 h-40 rounded-lg resize-none"
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex gap-x-4">
              <button
                type="submit"
                className="w-full text-center py-3 outline-none rounded-lg text-white font-Jura uppercase text-2xl bg-sky-400 active:bg-sky-600"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setImage("/imagePlaceholder.png");
                  setPreview(null);
                  setRawImage(null);
                  reset();
                }}
                type="reset"
                className="w-full text-center py-3 outline-none rounded-lg text-white font-Jura uppercase text-2xl bg-red-400 active:bg-red-600"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Cropper Modal */}
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
              aspectRatio={NaN}
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

export default ProductAdder;
