import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MdEmail,
  MdPhoneAndroid,
  MdVerifiedUser,
  MdLock,
  MdVisibility, 
  MdVisibilityOff
} from "react-icons/md";
import { useSelector } from "react-redux";
import { selectDeliveryAgent } from "../Store/reducers/DeliveryReducer";

const DeliverySettings = () => {
  const agent = useSelector(selectDeliveryAgent);
  const [email, setEmail] = useState(agent?.email || "");
  const [phone, setPhone] = useState(agent?.phone || "");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = () => {
    console.log({ email, phone });
    // API call
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log({ currentPassword, newPassword });
    // API call
  };

  return (
    <div className="h-fit flex items-center justify-center text-white px-4">

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl p-8 rounded-2xl
                   bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-emerald-500 text-black rounded-xl text-3xl">
            <MdVerifiedUser />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-white/60 text-sm">
              Manage your contact info & security
            </p>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6">📞 Contact Details</h2>

          {/* EMAIL */}
          <div className="mb-5">
            <label className="block mb-2 text-sm text-white/60">
              Email Address
            </label>
            <div className="relative">
              <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/30
                           border border-white/20 outline-none
                           focus:ring-2 focus:ring-emerald-500 text-lg"
              />
            </div>
          </div>

          {/* PHONE */}
          <div className="mb-6">
            <label className="block mb-2 text-sm text-white/60">
              Phone Number
            </label>
            <div className="relative">
              <MdPhoneAndroid className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/40" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/30
                           border border-white/20 outline-none
                           focus:ring-2 focus:ring-emerald-500 text-lg"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full py-4 rounded-xl bg-emerald-500 text-black
                       font-bold text-lg shadow-lg shadow-emerald-500/40"
          >
            Save Contact Changes
          </button>
        </div>

        {/* PASSWORD */}
        <div>
          <h2 className="text-xl font-bold mb-6">🔐 Change Password</h2>

          {/* CURRENT */}
          <div className="mb-5">
            <label className="block mb-2 text-sm text-white/60">
              Current Password
            </label>

            <div className="relative">
              <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/40" />

              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-black/30
                          border border-white/20 outline-none
                          focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="button"
                onClick={() => setShowCurrentPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-white/50 hover:text-white transition"
              >
                {showCurrentPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>


          {/* NEW */}
          <div className="mb-5">
            <label className="block mb-2 text-sm text-white/60">
              New Password
            </label>

            <div className="relative">
              <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/40" />

              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-black/30
                          border border-white/20 outline-none
                          focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-white/50 hover:text-white transition"
              >
                {showNewPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>


          {/* CONFIRM */}
          <div className="mb-8">
            <label className="block mb-2 text-sm text-white/60">
              Confirm New Password
            </label>

            <div className="relative">
              <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/40" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-black/30
                          border border-white/20 outline-none
                          focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-white/50 hover:text-white transition"
              >
                {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>


          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleChangePassword}
            className="w-full py-4 rounded-xl bg-white text-black
                       font-bold text-lg shadow-lg"
          >
            Update Password
          </motion.button>
        </div>

        {/* SECURITY NOTE */}
        <p className="text-center text-white/40 text-sm mt-10">
          For security reasons, password changes require your current password.
        </p>
      </motion.div>
    </div>
  );
};

export default DeliverySettings;
