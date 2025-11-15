import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Cropper from "react-cropper";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";
import axios from "../config/axios";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiX, FiDollarSign, FiTag, FiLayers, FiInfo, FiPackage, FiCode } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20 }
};

const ProductAdder = () => {
  const [totalProduct, setTotalProduct] = useState(0);
  const [currentCrop, setCurrentCrop] = useState(null); 
  const [rawImage, setRawImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [colorVariants, setColorVariants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      company: "",
      Subcategory: "",
      Maincategory: "",
      price: "",
      productDescription: "",
      off: "",
      barcodes: [],
    },
  });

  const barcodes = watch("barcodes") || [];

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get("/api/product/product-count", {
          headers: { 'x-admin-token': token }
        });
        setTotalProduct(res.data);
      } catch (error) {
        console.error('Error fetching product count:', error);
        toast.error('Failed to fetch product count. Please try again.');
      }
    };
    
    fetchProductCount();
  }, []);

  const handleAddVariantImage = (variantIndex) => {
    fileInputRef.current?.click();
    setCurrentCrop(variantIndex);
  };

  const handleImageChange = (e) => {
    const fileObj = e.target.files[0];
    if (!fileObj) return;
    setRawImage(URL.createObjectURL(fileObj));
    setShowCropper(true);
  };

  const handleCropDone = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || currentCrop === null) return;

    cropper.getCroppedCanvas({ width: 500, height: 500 }).toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `image_${Date.now()}.avif`, { type: "image/avif" });
      const preview = URL.createObjectURL(blob);

      setColorVariants((prev) => {
        const updated = [...prev];
        if (!updated[currentCrop].images) {
          updated[currentCrop].images = [];
        }
        updated[currentCrop].images.push({ file, preview });
        return updated;
      });

      setRawImage(null);
      setShowCropper(false);
    }, "image/avif", 0.9);
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setColorVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].images.splice(imageIndex, 1);
      return updated;
    });
  };

  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      { name: "", colorCode: "#ffffff", stock: 0, images: [] },
    ]);
  };

  const removeColorVariant = (index) => {
    setColorVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addBarcode = () => setValue("barcodes", [...barcodes, ""]);
  
  const removeBarcode = (idx) => setValue("barcodes", barcodes.filter((_, i) => i !== idx));
  
  const updateBarcode = (idx, val) => {
    const updated = [...barcodes];
    updated[idx] = val;
    setValue("barcodes", updated);
  };

  const formSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      // Convert number fields to numbers
      const processedData = {
        ...data,
        price: data.price ? Number(data.price) : 0,
        off: data.off ? Number(data.off) : 0,
      };
      
      // Add basic product info
      Object.entries(processedData).forEach(([key, value]) => {
        if (key !== 'barcodes' && value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Add variants with number conversion
      const variantsForBackend = colorVariants.map((cv) => ({
        Colorname: cv.name,
        colorCode: cv.colorCode,
        stock: cv.stock ? Number(cv.stock) : 0,
      }));
      formData.append("colorVariants", JSON.stringify(variantsForBackend));

      // Add images
      colorVariants.forEach((variant) => {
        if (variant.images) {
          variant.images.forEach((img) => {
            formData.append("files", img.file);
          });
        }
      });

      // Add barcodes
      barcodes.filter(Boolean).forEach((code) => formData.append("barcodes", code));
      const token = localStorage.getItem('adminToken');
      const res = await axios.post("/api/product/add", formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'x-admin-token': token
        },
      });

      toast.success(res.data.message || "Product added successfully!");
      reset();
      setColorVariants([]);
      setTotalProduct(prev => prev + 1);
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error(err.response?.data?.message || "Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header with Stats */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Product Management</h1>
              <p className="text-blue-100">Add and manage your products with ease</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-sm text-blue-100">Total Products</p>
              <p className="text-3xl font-bold">{totalProduct}</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <AnimatePresence mode="wait">
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiPackage className="mr-2" />
                Add New Product
              </h2>
              <p className="text-gray-500 mt-1">Fill in the details below to add a new product</p>
            </div>

            <form onSubmit={handleSubmit(formSubmit)} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Product Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                      <FiInfo className="mr-2" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                          type="text"
                          {...register("name", { required: "Product name is required" })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Premium T-Shirt"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand/Company</label>
                        <input
                          type="text"
                          {...register("company", { required: "Company is required" })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.company ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Nike"
                        />
                        {errors.company && (
                          <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register("price", { required: "Price is required" })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.price ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          {...register("off")}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.off ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0"
                        />
                        {errors.off && (
                          <p className="mt-1 text-sm text-red-600">{errors.off.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                      <FiLayers className="mr-2" />
                      Category
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
                        <input
                          type="text"
                          {...register("Maincategory", { required: "Main category is required" })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.Maincategory ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Clothing"
                        />
                        {errors.Maincategory && (
                          <p className="mt-1 text-sm text-red-600">{errors.Maincategory.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                        <input
                          type="text"
                          {...register("Subcategory", { required: "Subcategory is required" })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.Subcategory ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., T-Shirts"
                        />
                        {errors.Subcategory && (
                          <p className="mt-1 text-sm text-red-600">{errors.Subcategory.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                      <FiInfo className="mr-2" />
                      Description
                    </h3>
                    <textarea
                      {...register("productDescription", { required: "Product description is required" })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px] ${
                        errors.productDescription ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter detailed product description..."
                    />
                    {errors.productDescription && (
                      <p className="mt-1 text-sm text-red-600">{errors.productDescription.message}</p>
                    )}
                  </div>
                </div>

                {/* Right Column - Variants and Images */}
                <div className="space-y-6">
                  {/* Color Variants */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold flex items-center text-gray-700">
                        <FiLayers className="mr-2" />
                        Color Variants
                      </h3>
                      <button
                        type="button"
                        onClick={addColorVariant}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <FiPlus className="h-3 w-3 mr-1" /> Add Variant
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {colorVariants.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <FiLayers className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                          <p>No variants added yet</p>
                          <p className="text-sm mt-1">Click 'Add Variant' to get started</p>
                        </div>
                      ) : (
                        colorVariants.map((cv, idx) => (
                          <motion.div 
                            key={idx}
                            variants={fadeIn}
                            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-700">Variant {idx + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeColorVariant(idx)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="Remove variant"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                            {/* Color Variant Form */}
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
                                  <input
                                    type="text"
                                    value={cv.name}
                                    onChange={(e) => {
                                      const newVariants = [...colorVariants];
                                      newVariants[idx].name = e.target.value;
                                      setColorVariants(newVariants);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Red"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Code</label>
                                  <div className="flex items-center">
                                    <input
                                      type="color"
                                      value={cv.colorCode}
                                      onChange={(e) => {
                                        const newVariants = [...colorVariants];
                                        newVariants[idx].colorCode = e.target.value;
                                        setColorVariants(newVariants);
                                      }}
                                      className="h-10 w-10 rounded border border-gray-300 mr-2"
                                    />
                                    <input
                                      type="text"
                                      value={cv.colorCode}
                                      onChange={(e) => {
                                        const newVariants = [...colorVariants];
                                        newVariants[idx].colorCode = e.target.value;
                                        setColorVariants(newVariants);
                                      }}
                                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={cv.stock}
                                  onChange={(e) => {
                                    const newVariants = [...colorVariants];
                                    newVariants[idx].stock = parseInt(e.target.value) || 0;
                                    setColorVariants(newVariants);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Quantity in stock"
                                />
                              </div>

                              {/* Image Upload */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Product Images
                                </label>
                                <div className="flex flex-wrap gap-3">
                                  {cv.images?.map((img, imgIdx) => (
                                    <div key={imgIdx} className="relative group">
                                      <img
                                        src={img.preview}
                                        alt={`Variant ${idx + 1} - ${imgIdx + 1}`}
                                        className="w-20 h-20 object-cover rounded-md border border-gray-200"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeVariantImage(idx, imgIdx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove image"
                                      >
                                        <FiX className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => handleAddVariantImage(idx)}
                                    className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-colors"
                                  >
                                    <FiPlus className="h-6 w-6 mb-1" />
                                    <span className="text-xs">Add Image</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Barcodes */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold flex items-center text-gray-700">
                        <FiCode className="mr-2" />
                        Barcodes / SKUs
                      </h3>
                      <button
                        type="button"
                        onClick={addBarcode}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <FiPlus className="h-3 w-3 mr-1" /> Add Barcode
                      </button>
                    </div>

                    <div className="space-y-2">
                      {barcodes.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-2">No barcodes added yet</p>
                      ) : (
                        barcodes.map((barcode, barcodeIdx) => (
                          <div key={barcodeIdx} className="flex items-center">
                            <input
                              type="text"
                              value={barcode}
                              onChange={(e) => updateBarcode(barcodeIdx, e.target.value)}
                              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter barcode or SKU"
                            />
                            <button
                              type="button"
                              onClick={() => removeBarcode(barcodeIdx)}
                              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-r-md"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Product...
                      </span>
                    ) : (
                      'Add Product'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* Image Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Crop Image</h3>
              <button
                type="button"
                onClick={() => {
                  setShowCropper(false);
                  setRawImage(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="w-full h-96">
                <Cropper
                  ref={cropperRef}
                  src={rawImage}
                  style={{ height: '100%', width: '100%' }}
                  aspectRatio={NaN}
                  viewMode={1}
                  guides={true}
                  minCropBoxHeight={100}
                  minCropBoxWidth={100}
                  background={false}
                  responsive={true}
                  autoCropArea={0.8}
                  checkOrientation={false}
                />
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
              <button
                type="button"
                onClick={() => {
                  setShowCropper(false);
                  setRawImage(null);
                }}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropDone}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Crop & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAdder;
