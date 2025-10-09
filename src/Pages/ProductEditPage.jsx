import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
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
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAreaPixels, setCropAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState(null);

  const { register, handleSubmit, setValue, control, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      id: "",
      name: "",
      company: "",
      Subcategory: "",
      Maincategory: "",
      off: 0,
      price: null,
      barcodes: [], // updated for multiple barcodes
      stock: null,
      avatar: null,
      productDescription: [],
    }
  });

  const barcodes = watch("barcodes") || [];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/product-info/${id}`);
        const product = res.data;
        console.log(res.data)

        reset({
          id: product._id,
          name: product.name,
          company: product.company,
          Subcategory: product.Subcategory,
          Maincategory: product.Maincategory,
          off: product.off,
          price: product.price,
          productDescription: `#${product.description?.join(" #") || ""}`,
          stock: product.stock > 12 ? product.stock : 12,
          barcodes: product.barcodes?.map(b => b) || [], // set barcode values
        });

        setImage(product.productPic);
        setProduct(product);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id, reset]);

  const handleImageChange = (e) => {
    const fileObj = e.target.files[0];
    if (fileObj) {
      const imageURL = URL.createObjectURL(fileObj);
      setRawImage(imageURL);
      setShowCropper(true);
    }
  };

  const onCropComplete = (_, croppedAreaPixels) => {
    setCropAreaPixels(croppedAreaPixels);
  };

  const handleCropDone = async () => {
    const croppedBlob = await getCroppedImg(rawImage, cropAreaPixels);
    const croppedURL = URL.createObjectURL(croppedBlob);
    setPreview(croppedURL);
    const croppedFile = new File([croppedBlob], "avatar.avif", { type: "image/avif" });
    setValue("avatar", croppedFile, { shouldValidate: true });
    setShowCropper(false);
  };

  // Add a new empty barcode input
  const addBarcode = () => {
    setValue("barcodes", [...barcodes, ""]);
  };

  // Remove barcode by index
  const removeBarcode = (index) => {
    const updated = barcodes.filter((_, i) => i !== index);
    setValue("barcodes", updated);
  };

  // Update barcode value by index
  const updateBarcode = (index, value) => {
    const updated = [...barcodes];
    updated[index] = value;
    setValue("barcodes", updated);
  };

  const resetForm = () => {
    navigate(-1);
    setPreview(null);
    setRawImage(null);
  };

  const formSubmit = async (data) => {
    const formData = new FormData();
    formData.append("id", id);

    if (data.name && data.name !== Product.name) formData.append("name", data.name);
    if (data.company && data.company !== Product.company) formData.append("company", data.company);
    if (data.Subcategory && data.Subcategory !== Product.Subcategory) formData.append("Subcategory", data.Subcategory);
    if (data.Maincategory && data.Maincategory !== Product.Maincategory) formData.append("Maincategory", data.Maincategory);
    if (data.off && Number(data.off) !== Number(Product.off)) formData.append("off", data.off);
    if (data.price && Number(data.price) !== Number(Product.price)) formData.append("price", data.price);
    if (data.stock && Number(data.stock) !== Number(Product.stock)) formData.append("stock", data.stock);

    // Append barcodes array
    if (data.barcodes && JSON.stringify(data.barcodes) !== JSON.stringify(Product.barcodes?.map(b => b.code))) {
      data.barcodes.forEach(code => formData.append("codes", code));
    }

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
        denyButtonText: `Don't save`
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await axios.patch("/api/product/product-update", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.status === 200) {
              Swal.fire("Saved!", "", "success");
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
    <div className='h-screen w-full bg-zinc-800 px-10 py-5 flex flex-col gap-y-5'>
      <div className='w-full h-full py-6 px-10 bg-white rounded-2xl flex items-center gap-x-10'>
        <div className='h-[55vh] overflow-hidden bg-zinc-300 border-10 border-zinc-400 border-dashed rounded-2xl w-[50%] flex items-center'>
          <img
            onClick={() => file.current && file.current.click()}
            src={preview || image}
            alt="avatar"
            className="object-contain object-center w-full h-full"
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
              className="hidden text-sm"
            />
          )}
        />

        <div className='h-full w-[50%] overflow-auto'>
          <h1 className='text-center font-PublicSans text-4xl mb-2'>Product Details</h1>
          <form onSubmit={handleSubmit(formSubmit)} className='flex flex-col gap-y-6'>

            <div>
              {errors.name && <p className='font-mono text-red-500'>{errors.name.message}</p>}
              <input
                {...register("name", {
                  required: "Please fill the name",
                  minLength: {
                    value: 2,
                    message: "Product name must be at least 2 charecters"
                  },
                  maxLength: {
                    value: 50,
                    message: "Product name must be in between 50 charecters"
                  }
                })} placeholder='Product Name. . .' className='w-full outline-none border-1 py-2 px-4 rounded-lg' type="text" />
            </div>
            <div>
              {errors.company && <p className='font-mono text-red-500'>{errors.company.message}</p>}
              <input
                {...register("company", {
                  required: "Company name is required",
                  minLength: {
                    value: 2,
                    message: "Company name must be at least 2 charecters"
                  },
                  maxLength: {
                    value: 50,
                    message: "Company name must be in between 50 charecters"
                  }
                })}
                placeholder='Product Company. . .' className='w-full outline-none border-1 py-2 px-4 rounded-lg' type="text" />
            </div>
            <div>
              {errors.Subcategory && <p className='font-mono text-red-500'>{errors.Subcategory.message}</p>}
              <input
                {...register("Subcategory", {
                  required: "Subcategory name is required",
                  minLength: {
                    value: 2,
                    message: "Subcategory name must be at least 2 charecters"
                  },
                  maxLength: {
                    value: 50,
                    message: "Subcategory name must be in between 50 charecters"
                  }
                })}
                placeholder='Product Subcategory. . .' className='w-full outline-none border-1 py-2 px-4 rounded-lg' type="text" />
            </div>
            <div>
              {errors.Maincategory && <p className='font-mono text-red-500'>{errors.Maincategory.message}</p>}
              <input
                {...register("Maincategory", {
                  required: "Maincategory name is required",
                  minLength: {
                    value: 2,
                    message: "Maincategory name must be at least 2 charecters"
                  },
                  maxLength: {
                    value: 50,
                    message: "Maincategory name must be in between 50 charecters"
                  }
                })}
                placeholder='Product Maincategory. . .' className='w-full outline-none border-1 py-2 px-4 rounded-lg' type="text" />
            </div>
            <div>
              {errors.off && <p className='font-mono text-red-500'>{errors.off.message}</p>}
              <input
                {...register("off", {
                  validAsNumber: true,
                  maxLength: {
                    value: 2,
                    message: "off must be in between 0 to 99"
                  }
                })}
                placeholder='Product off. . .' className='w-full outline-none border-1 py-2 px-4 rounded-lg' type="text" />
            </div>
            <div>
              {errors.price && <p className='font-mono text-red-500'>{errors.price.message}</p>}
              <input
                {...register("price", {
                  required: "price name is required",
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: "Price must be at least 1 Rs."
                  },
                  max: {
                    value: 9999,
                    message: "Price must be less than 10000 Rs."
                  },
                  validate: (value) =>
                    !isNaN(value) && value > 0 || "Price must be a valid positive number"
                })}
                placeholder='Product Price in Rs./-' className='w-full outline-none border-1 py-2 px-4 rounded-lg' type="number" />
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
                    placeholder="Enter 13-digit barcode"
                    className="outline-none border-1 py-2 px-4 rounded-lg w-full"
                  />
                  <button type="button" onClick={() => removeBarcode(idx)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700">
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={addBarcode} className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">
                Add Barcode
              </button>
            </div>
            <div>
              {errors.stock && <p className='font-mono text-red-500'>{errors.stock.message}</p>}
              <input
                {...register("stock", {
                  required: "stock is required",
                  valueAsNumber: true,
                  min: {
                    value: 12,
                    message: "stock must be at least 12 pic's."
                  },
                  max: {
                    value: 500,
                    message: "stock must be less 500 pic's."
                  },
                })}
                placeholder='Product Stock. . . ' className='w-full outline-none border-1 py-2 px-4 rounded-lg' type="number" />
            </div>
            <div>
              {errors.productDescription && <p className='font-mono text-red-500'>{errors.productDescription.message}</p>}
              <textarea
                {...register("productDescription", {
                  required: "Minimum One Product description is required",
                })}
                placeholder='Product Description. . .(eg. #des1 #des2)' className='w-full outline-none text-xl border-1 py-2 px-4 h-50 rounded-lg resize-none'></textarea>
            </div>
            <div className='flex gap-x-4'>
              <button type="submit" className='w-full text-center py-3 outline-none rounded-lg text-white font-Jura uppercase text-2xl transition-colors duration-200 bg-green-400 active:bg-green-600'>Update</button>
              <button type='button' onClick={() => navigate("/admin/product")} className='w-full text-center py-3 outline-none rounded-lg text-white font-Jura uppercase text-2xl transition-colors duration-200 bg-zinc-400 active:bg-zinc-600'>Cancel</button>
            </div>
          </form>
        </div>
      </div>

      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative w-[90vw] max-w-2xl bg-zinc-900 rounded-lg p-4">
            <h2 className="mb-2 text-lg font-semibold text-[#FFF]">Crop your image</h2>
            <div className="relative w-full h-96">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={undefined}
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                initialCroppedAreaPercentages={{ x: 0, y: 0, width: 100, height: 100 }}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="w-full pr-10 text-white">
                <p>Zoom Level</p>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-4 
                    [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:bg-zinc-500 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:border-2 
                    [&::-webkit-slider-thumb]:border-white
                    [&::-moz-range-thumb]:bg-zinc-500
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full"
                />
              </div>
              <button
                className="px-4 py-1 text-black bg-white rounded cursor-pointer hover:bg-zinc-500"
                onClick={handleCropDone}>
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
