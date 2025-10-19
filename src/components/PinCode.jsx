import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const PinCode = () => {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addForm, setAddForm] = useState({ pincode: "" });
  const [updateForm, setUpdateForm] = useState({ pincode: "" });
  const [editingId, setEditingId] = useState(null);

  // 🔹 Fetch all pincodes
  const fetchPincodes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/pincode/show-all-pincode");
      setPincodes(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch pincodes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

  // 🔹 Add Form Handlers
  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.pincode.trim()) return toast.warning("Enter a valid pincode");

    try {
      await axios.post("/api/pincode/add", { pinCode: addForm.pincode });
      toast.success("Pincode added");
      setAddForm({ pincode: "" });
      fetchPincodes();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add pincode");
    }
  };

  // 🔹 Edit Handlers
  const handleEditClick = (pin) => {
    setEditingId(pin._id);
    setUpdateForm({ pincode: pin.pinCode });
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateForm.pincode.trim()) return toast.warning("Enter a valid pincode");

    try {
      await axios.put(`/api/pincode/update/${editingId}`, { pinCode: updateForm.pincode });
      toast.success("Pincode updated");
      setEditingId(null);
      setUpdateForm({ pincode: "" });
      fetchPincodes();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update pincode");
    }
  };

  // 🔹 Delete with SweetAlert
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This pincode will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/pincode/delete/${id}`);
        toast.success("Pincode deleted");
        fetchPincodes();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete pincode");
      }
    }
  };

  return (
    <div className="h-screen w-full bg-zinc-800 px-10 py-5 flex flex-col gap-y-5">
      {/* Header */}
      <div className="flex bg-white px-4 py-4 rounded-lg items-center justify-between">
        <h1 className="text-2xl font-semibold">📮 Pincode Manager</h1>
      </div>

      {/* Add Pincode Form */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-x-4">
        <input
          type="text"
          name="pincode"
          value={addForm.pincode}
          onChange={handleAddChange}
          placeholder="Enter Pincode"
          className="border border-gray-300 rounded px-3 py-2 w-60 text-center"
        />
        <button
          onClick={handleAddSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FaPlus /> Add
        </button>
      </div>

      {/* Pincode Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden flex-1 overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left sticky top-0">
            <tr>
              <th className="p-3 w-16">#</th>
              <th className="p-3">Pincode</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : pincodes.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-400">
                  No pincodes found
                </td>
              </tr>
            ) : (
              pincodes.map((pin, index) => (
                <tr
                  key={pin._id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-gray-600">{index + 1}</td>
                  <td className="p-3 font-medium">{pin.pinCode}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleEditClick(pin)}
                      className="text-blue-600 hover:text-blue-800 mx-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(pin._id)}
                      className="text-red-600 hover:text-red-800 mx-2"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Update Form */}
      {editingId && (
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-x-4 mt-4">
          <input
            type="text"
            name="pincode"
            value={updateForm.pincode}
            onChange={handleUpdateChange}
            placeholder="Update Pincode"
            className="border border-gray-300 rounded px-3 py-2 w-60 text-center"
          />
          <button
            onClick={handleUpdateSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Update
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setUpdateForm({ pincode: "" });
            }}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default PinCode;
