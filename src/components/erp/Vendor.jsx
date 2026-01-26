import { useEffect, useState } from "react";
import axios from "../../config/axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

const Vendor = () => {
  const [vendors, setVendors] = useState([]);
  const [editId, setEditId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
  });

  // ================= FETCH =================
  const fetchVendors = async () => {
    try {
      const res = await axios.get("/api/vendor");
      setVendors(res.data.vendors || []);
    } catch {
      Swal.fire("Error", "Failed to fetch vendors", "error");
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // ================= HANDLERS =================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const closeModal = () => {
    setOpenModal(false);
    setEditId(null);
    setForm({
      name: "",
      companyName: "",
      phone: "",
      email: "",
      address: "",
      gstNumber: "",
    });
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`/api/vendor/${editId}`, form);
        Swal.fire("Updated!", "Vendor updated successfully", "success");
      } else {
        await axios.post("/api/vendor", form);
        Swal.fire("Added!", "Vendor added successfully", "success");
      }
      closeModal();
      fetchVendors();
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleEdit = (vendor) => {
    setForm(vendor);
    setEditId(vendor._id);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This vendor will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/api/vendor/${id}`);
      Swal.fire("Deleted!", "Vendor has been deleted.", "success");
      fetchVendors();
    } catch {
      Swal.fire("Error", "Failed to delete vendor", "error");
    }
  };

  // ================= SEARCH =================
  const filteredVendors = vendors.filter(
    (v) =>
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.includes(search)
  );

  // ================= UI =================
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-6">Vendor Management</h2>

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name or phone"
            className="border px-3 py-2 rounded-md w-full md:w-1/3 outline-none focus:border-2  focus:border-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpenModal(true)}
            className="bg-emerald-600 cursor-pointer text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition"
          >
            + Add Vendor
          </motion.button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-center uppercase">Name</th>
                <th className="p-3 border text-center uppercase">Company</th>
                <th className="p-3 border text-center uppercase">Phone</th>
                <th className="p-3 border text-center uppercase">GST</th>
                <th className="p-3 border text-center uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredVendors.map((v) => (
                  <motion.tr
                    key={v._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="p-3 border text-center font-bold uppercase">
                      {v.name}
                    </td>
                    <td className="p-3 border text-center italic uppercase ">
                      {v.companyName || "--------"}
                    </td>
                    <td className="p-3 border text-center uppercase">
                      {v.phone || "--------"}
                    </td>
                    <td className="p-3 border text-center uppercase">
                      {v.gstNumber || "--------"}
                    </td>
                    <td className="py-3 border text-center space-x-4">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(v)}
                        className="px-6 py-2 bg-emerald-600 cursor-pointer text-white rounded hover:bg-emerald-700"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(v._id)}
                        className="px-3 py-2 bg-rose-600 cursor-pointer text-white rounded hover:bg-rose-700"
                      >
                        Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-xl w-full max-w-4xl p-10"
            >
              <h3 className="text-xl font-semibold mb-6 uppercase">
                {editId ? "🖋 Edit Vendor" : "👷‍♂️ Add Vendor"}
              </h3>

              <div className="grid grid-cols-2 gap-10">
                {[
                  ["name", "Vendor Name"],
                  ["companyName", "Brand Name"],
                  ["phone", "Phone"],
                  ["email", "Email"],
                  ["gstNumber", "GST Number"],
                  ["address", "Address"],
                ].map(([key, label]) => (
                  <div key={key} className="flex flex-col gap-y-2">
                    <small className="font-bold">{label}</small>
                    <input
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      placeholder={label}
                      className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  {editId ? "Update" : "Save"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Vendor;
