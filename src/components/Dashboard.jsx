import React, { useState } from "react";
import { GoPencil } from "react-icons/go";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const user = useSelector((state) => state.UserReducer);
  const [editMode, setEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user.fullName.firstName,
      lastName: user.fullName.lastName,
      phone: user.phoneNumber,
      email: user.email,
      Altphone: user.alternateNumber,
      pin: user.pinCode,
      address: user.address,
    },
  });

  const onSubmit = (data) => {
    console.log("Updated Profile:", data);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="font-PublicSans text-2xl md:text-4xl font-bold text-gray-800">
          Dashboard
        </h1>
        <div className="flex flex-col items-center gap-y-1">
          <button
            onClick={() => setEditMode(true)}
            className="flex gap-x-2 items-center bg-sky-600 hover:bg-sky-700 transition px-4 py-2 rounded-lg text-white shadow"
          >
            <GoPencil className="text-lg" />
            <span>Edit Profile</span>
          </button>
          {editMode && (
            <small className="text-red-500 font-medium text-xs">Edit Mode On</small>
          )}
        </div>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-scroll px-6 py-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-y-6"
        >
          {/* First + Last Name */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                {...register("firstName", {
                  required: "First Name is required",
                  minLength: { value: 2, message: "Minimum 2 characters" },
                  maxLength: { value: 20, message: "Maximum 20 characters" },
                })}
                readOnly={!editMode}
                placeholder="Enter first name..."
                className={`w-full px-4 py-3 rounded-lg border outline-none text-gray-800 transition ${
                  editMode
                    ? "bg-white border-gray-300 focus:ring-2 focus:ring-sky-400"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...register("lastName", {
                  required: "Last Name is required",
                  minLength: { value: 2, message: "Minimum 2 characters" },
                  maxLength: { value: 20, message: "Maximum 20 characters" },
                })}
                readOnly={!editMode}
                placeholder="Enter last name..."
                className={`w-full px-4 py-3 rounded-lg border outline-none text-gray-800 transition ${
                  editMode
                    ? "bg-white border-gray-300 focus:ring-2 focus:ring-sky-400"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Phone Number
              </label>
              <input
                type="number"
                {...register("phone", {
                  required: "Phone number is required",
                  validate: (v) =>
                    String(v).length === 10 || "Phone must be 10 digits",
                })}
                readOnly={!editMode}
                placeholder="Enter phone number..."
                className={`w-full px-4 py-3 rounded-lg border outline-none text-gray-800 transition ${
                  editMode
                    ? "bg-white border-gray-300 focus:ring-2 focus:ring-sky-400"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                    message: "Invalid email format",
                  },
                })}
                readOnly={!editMode}
                placeholder="Enter email..."
                className={`w-full px-4 py-3 rounded-lg border outline-none text-gray-800 transition ${
                  editMode
                    ? "bg-white border-gray-300 focus:ring-2 focus:ring-sky-400"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Alt Phone + Pin */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Alternate Number
              </label>
              <input
                type="number"
                {...register("Altphone")}
                readOnly={!editMode}
                placeholder="Enter alternate number..."
                className={`w-full px-4 py-3 rounded-lg border outline-none text-gray-800 transition ${
                  editMode
                    ? "bg-white border-gray-300 focus:ring-2 focus:ring-sky-400"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Pin Code
              </label>
              <input
                type="number"
                {...register("pin", {
                  required: "Pin code is required",
                  validate: (v) =>
                    String(v).length === 6 || "Pin must be 6 digits",
                })}
                readOnly={!editMode}
                placeholder="Enter pin code..."
                className={`w-full px-4 py-3 rounded-lg border outline-none text-gray-800 transition ${
                  editMode
                    ? "bg-white border-gray-300 focus:ring-2 focus:ring-sky-400"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
              {errors.pin && (
                <p className="text-red-500 text-sm mt-1">{errors.pin.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Address</label>
            <textarea
              {...register("address", {
                required: "Address is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
                maxLength: { value: 100, message: "Maximum 100 characters" },
              })}
              readOnly={!editMode}
              placeholder="Enter address..."
              className={`w-full resize-none h-32 px-4 py-3 rounded-lg border outline-none text-gray-800 transition ${
                editMode
                  ? "bg-white border-gray-300 focus:ring-2 focus:ring-sky-400"
                  : "bg-gray-100 cursor-not-allowed"
              }`}
            ></textarea>
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Buttons */}
          {editMode && (
            <div className="flex gap-4 mt-2">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium shadow transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  reset();
                }}
                className="w-full md:w-auto px-6 py-3 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-medium shadow transition"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
