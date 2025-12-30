import React, { useState } from "react";
import { GoPencil } from "react-icons/go";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux';
import { updateUser } from '../Store/reducers/UserReducer';
import axios from "../config/axios"

const Dashboard = () => {
  const user = useSelector((state) => state.UserReducer);
  const [editMode, setEditMode] = useState(false);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user.fullName?.firstName || "",
      lastName: user.fullName?.lastName || "",
      phoneNumber: user.phoneNumber || "",
      email: user.email || "",
      alternateNumber: user.alternateNumber || "",
      pinCode: user.pinCode || "",
      address: user.address || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const updatedFields = {};
      const originalData = {
        firstName: user.fullName?.firstName,
        lastName: user.fullName?.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        alternateNumber: user.alternateNumber,
        pinCode: user.pinCode,
        address: user.address,
      };

      // Check which fields have changed
      Object.keys(data).forEach((key) => {
        if (data[key] !== originalData[key]) {
          updatedFields[key] = data[key];
        }
      });

      // Only proceed if there are changes
      if (Object.keys(updatedFields).length === 0) {
        alert('No changes detected');
        setEditMode(false);
        return;
      }

      // Send only the updated fields to the backend
      const response = await axios.patch(
        '/api/user/update-profile',
        updatedFields,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );

      if (response.data.success) {
          // Update the user state with the new data
          // You might want to dispatch an action to update the Redux store here
        dispatch(updateUser(updatedFields));
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-emerald-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-emerald-100 border-b px-6 py-4 flex items-center justify-between">
        <h1 className="font-PublicSans text-2xl md:text-4xl font-bold text-gray-800">
          Dashboard
        </h1>
        <div className="flex flex-col items-center gap-y-1">
          <button
            onClick={() => setEditMode(true)}
            className="flex gap-x-2 items-center bg-emerald-600 hover:bg-emerald-700 transition px-4 py-2 rounded-lg text-white shadow-lg shadow-zinc-400"
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
          className="bg-white shadow-xl shadow-black/40 rounded-2xl p-6 flex flex-col gap-y-6 border border-black/40"
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
                    ? "bg-white border-2 border-gray-500 focus:border-emerald-600"
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
                    ? "bg-white border-2 border-gray-500 focus:border-emerald-600"
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
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  validate: (v) =>
                    String(v).length === 10 || "Phone must be 10 digits",
                })}
                readOnly={!editMode}
                placeholder="Enter phone number..."
                className={`w-full px-4 py-3 rounded-lg border outline-none text-gray-800 transition ${
                  editMode
                    ? "bg-white border-2 border-gray-500 focus:border-emerald-600"
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
                    ? "bg-white border-2 border-gray-500 focus:border-emerald-600"
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
                {...register("alternateNumber")}
                readOnly={!editMode}
                placeholder="Enter alternate number..."
                className={`w-full px-4 py-3 rounded-lg border outline-none text-gray-800 transition ${
                  editMode
                    ? "bg-white border-2 border-gray-500 focus:border-emerald-600"
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
                {...register("pinCode", {
                  required: "Pin code is required",
                  validate: (v) =>
                    String(v).length === 6 || "Pin must be 6 digits",
                })}
                readOnly={!editMode}
                placeholder="Enter pin code..."
                className={`w-full px-4 py-3 rounded-lg border outline-none text-gray-800 transition ${
                  editMode
                    ? "bg-white border-2 border-gray-500 focus:border-emerald-600"
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
                  ? "bg-white border-2 border-gray-500 focus:border-emerald-600"
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
