import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdDashboard, MdSettings, MdLocalShipping } from "react-icons/md";
import { FaPowerOff } from "react-icons/fa6";
import { HiMenuAlt3 } from "react-icons/hi";
import { TbBrandGoogleHome } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { selectDeliveryAgent, logout } from "../Store/reducers/DeliveryReducer";
import AgentVerificationModal from "../components/AgentVerificationModal";

const Delivery = () => {
  const [open, setOpen] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const agent = useSelector(selectDeliveryAgent);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menu = [
    { to: "/delivery/dashboard", label: "Dashboard", icon: <MdDashboard /> },
    { to: "/delivery/orders", label: "Orders", icon: <MdLocalShipping /> },
    { to: "/delivery/settings", label: "Settings", icon: <MdSettings /> },
    { to: "/", label: "Home", icon: <TbBrandGoogleHome /> },
  ];

  /* ----------------------------------
     HANDLE VERIFICATION STATUS
  ---------------------------------- */
  useEffect(() => {
    if (!agent) return;

    if (agent.verificationStatus !== "verified") {
      setShowVerificationModal(true);
    } else {
      setShowVerificationModal(false);
    }
  }, [agent]);

  const handleVerificationClose = () => {
    setShowVerificationModal(false);
    navigate("/");
  };

  /* ----------------------------------
     LOGOUT
  ---------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("deliveryToken");
    dispatch(logout());
    navigate("/delivery-login");
  };

  /* ----------------------------------
     BLOCK UI UNTIL VERIFIED
  ---------------------------------- */
  if (!agent) return null;

  return (
    <>
      {/* 🔒 VERIFICATION MODAL */}
      {showVerificationModal && (
        <AgentVerificationModal
          status={agent.verificationStatus}
          onClose={handleVerificationClose}
          rejectionReason={agent.rejectionReason}
          reuploadReason={agent.reuploadReason}
        />
      )}

      {/* 🚫 DO NOT RENDER DASHBOARD UNTIL VERIFIED */}
      {agent.verificationStatus !== "verified" ? null : (
        <div className="w-full h-screen flex bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white overflow-hidden">

          {/* SIDEBAR */}
          <AnimatePresence>
            {open && (
              <motion.aside
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="w-72 h-full bg-white/10 backdrop-blur-xl border-r border-white/10 shadow-2xl fixed z-40"
              >
                {/* PROFILE */}
                <div className="p-6 border-b border-white/10 mt-20">
                  <p className="text-xs tracking-widest uppercase text-emerald-400">
                    Delivery Agent
                  </p>
                  <h1 className="text-2xl font-bold mt-1 truncate">
                    {agent.name}
                  </h1>
                </div>

                {/* MENU */}
                <nav className="mt-6 flex flex-col gap-3 px-4">
                  {menu.map((item) => (
                    <NavLink key={item.to} to={item.to}>
                      {({ isActive }) => (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer
                          ${
                            isActive
                              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                              : "text-white/70 hover:bg-white/10"
                          }`}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-lg font-semibold">
                            {item.label}
                          </span>
                        </motion.div>
                      )}
                    </NavLink>
                  ))}
                </nav>

                {/* LOGOUT */}
                <div className="absolute bottom-6 w-full px-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl
                               bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white
                               transition-all font-bold"
                  >
                    <FaPowerOff />
                    Logout
                  </motion.button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* TOGGLE BUTTON */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(!open)}
            className="fixed top-6 left-6 z-50 bg-emerald-500 text-black p-3 rounded-full shadow-xl shadow-emerald-500/40"
          >
            <HiMenuAlt3 className="text-2xl" />
          </motion.button>

          {/* MAIN CONTENT */}
          <main
            className={`flex-1 transition-all duration-300 ${
              open ? "ml-72" : "ml-0"
            }`}
          >
            <div
              className={`h-full overflow-y-auto transition-all duration-200
                px-4 pt-20 pb-4
                ${open ? "2xl:p-4" : "2xl:pl-24 2xl:pr-4"}
                2xl:pt-4`}
            >
              <Outlet />
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default Delivery;
