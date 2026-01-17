import { useState, useEffect } from "react";
import axios from "../../config/axios";
import { toast } from "react-toastify";

const VendorModal = ({ onClose, onCreated, vendor, onSaved, v }) => {
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
  });

  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name || "",
        companyName: vendor.companyName || "",
        phone: vendor.phone || "",
        email: vendor.email || "",
        address: vendor.address || "",
        gstNumber: vendor.gstNumber || "",
      });
    }
  }, [vendor]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name) return toast.error("Vendor name required");

    try {
      if (vendor && vendor._id) {
        const res = await axios.put(`/api/vendor/update/${vendor._id}`, form);
        toast.success("Vendor updated");
        if (onSaved) onSaved(res.data.data);
      } else {
        const res = await axios.post("/api/vendor/create", form);
        toast.success("Vendor created");
        if (onCreated) onCreated(res.data.data);
      }
      onClose();
    } catch (err) {
      toast.error("Unable to save vendor");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-5 w-[400px] rounded">
        <h2 className="font-bold text-lg mb-3">{vendor ? "Edit Vendor" : "Add Vendor"}</h2>

        {["name", "companyName", "phone", "email", "address", "gstNumber"].map(
          (f) => (
            <input
              key={f}
              name={f}
              placeholder={f}
              value={form[f]}
              onChange={handleChange}
              className="border p-2 w-full mb-2 rounded"
            />
          )
        )}

        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={submit}
            className="bg-green-600 text-white px-3 py-1 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorModal;
