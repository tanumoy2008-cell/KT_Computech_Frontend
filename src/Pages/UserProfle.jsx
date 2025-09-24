import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaShoppingCart,
  FaBoxOpen,
  FaHome,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { logOut } from "../Store/reducers/UserReducer";
import { useDispatch } from "react-redux";
import axios from "../config/axios";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/user" },
    { name: "Cart", icon: <FaShoppingCart />, path: "/user/cart" },
    { name: "Orders", icon: <FaBoxOpen />, path: "/user/order-history" },
    { name: "Home", icon: <FaHome />, path: "/" },
  ];
  const logout = async () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You want to Logout.",
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, Log Out",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await axios.post("/api/user/logout");
        navigate("/");
        dispatch(logOut());
        toast.success(res.data?.message);
      } catch (err) {
        toast.error("Something went wrong!");
      }
    } else {
      toast.info("Logout cancelled");
    }
  });
};


  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex flex-col justify-between h-screen w-[30%] lg:w-[25%] 2xl:w-[20%] bg-zinc-900 text-white shadow-xl">
        <div className="py-10 px-6">
          <h1 className="text-center text-2xl xl:text-3xl font-Inter font-extrabold tracking-wide">
            KT Computech
          </h1>
          <div className="flex flex-col gap-y-6 mt-12">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-x-4 px-4 py-3 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? "bg-gray-100 text-black font-semibold"
                    : "hover:bg-zinc-800"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="uppercase tracking-wide">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="px-6 py-6 border-t border-zinc-700">
          <button onClick={logout} className="flex items-center gap-x-3 px-4 py-3 rounded-lg w-full hover:bg-red-600 transition-colors">
            <FaSignOutAlt className="text-lg" />
            <span className="uppercase tracking-wide">Logout</span>
          </button>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 z-50 flex md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Dim background */}
        <div
          className="flex-1 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
        {/* Slide-in menu */}
        <div
          className={`w-[70%] bg-zinc-900 text-white shadow-xl flex flex-col justify-between transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="px-6 py-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-xl font-bold">KT Computech</h1>
              <button onClick={() => setIsOpen(false)}>
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="flex flex-col gap-y-6">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-x-4 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? "bg-gray-100 text-black font-semibold"
                      : "hover:bg-zinc-800"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="uppercase tracking-wide">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="px-6 py-6 border-t border-zinc-700">
            <button onClick={logout} className="flex items-center gap-x-3 px-4 py-3 rounded-lg w-full hover:bg-red-600 transition-colors">
              <FaSignOutAlt className="text-lg" />
              <span className="uppercase tracking-wide">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="h-full w-full md:w-[70%] lg:w-[75%] 2xl:w-[80%] px-5 md:px-10 lg:px-12">
        {/* Mobile navbar with hamburger */}
        <div className="fixed top-0 left-0 w-full md:hidden z-40 bg-white shadow">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-bold">KT Computech</h1>
            <button onClick={() => setIsOpen(true)}>
              <FaBars className="text-xl" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="pt-16 md:pt-0 h-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
