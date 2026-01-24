import { Outlet, useNavigate, Link, Navigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { logout, fetchAdminProfile, selectIsAuthenticated, selectIsLoading, selectUser, selectError, clearError } from "../Store/reducers/AdminReducer";

const Admin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser);
  const error = useSelector(selectError);

  // Sidebar collapsed state (persisted)
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  const toggleSidebar = () => {
    setCollapsed((s) => {
      const next = !s;
      localStorage.setItem("adminSidebarCollapsed", next ? "true" : "false");
      return next;
    });
  };


  // Check authentication status and fetch profile on component mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token && !isAuthenticated) {
      dispatch(fetchAdminProfile());
    }
  }, [dispatch, isAuthenticated]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to Logout.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Log Out",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await dispatch(logout()).unwrap();
        toast.success("Successfully logged out");
        navigate("/admin/login");
      } catch (err) {
        toast.error(err || "Something went wrong during logout");
      }
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`h-screen bg-white shadow-lg fixed left-0 top-0 overflow-y-auto transition-all duration-300 ${
          collapsed ? "w-20" : "w-80"
        }`}>
        <div className="flex flex-col items-center py-6 px-3 h-full">
          <div className="w-full flex-col items-center justify-between px-2">
            <button
              onClick={toggleSidebar}
              className="hidden md:inline-flex items-center justify-center p-2 rounded hover:bg-gray-100">
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  collapsed ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor">
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <Link
              to="/admin"
              className={`cursor-pointer block mt-4 font-Jura font-black italic text-2xl text-gray-800 transition-colors ${
                collapsed ? "text-xl text-center w-full" : "mb-6 text-4xl"
              }`}>
              {collapsed ? (
                <span className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  KT
                </span>
              ) : (
                "KT Computech"
              )}
            </Link>
          </div>

          <div className="w-full mt-6 space-y-2 px-2 py-4 flex flex-col gap-y-2">
            <abbr title="Home" className="no-underline">
              <NavItem to="/" text="Home" icon="🏠" collapsed={collapsed} />
            </abbr>
            <abbr title="Product's Add" className="no-underline">
              <NavItem
                to="/admin/dashboard"
                text="Product Add"
                icon="🏗️"
                collapsed={collapsed}
              />
            </abbr>
            <abbr title="Product's" className="no-underline">
              <NavItem
                to="/admin/products"
                text="Products"
                icon="📦"
                collapsed={collapsed}
              />
            </abbr>
            <abbr title="Del. Agent ID's" className="no-underline">
              <NavItem
                to="/admin/deliveryId"
                text="Del. Agent ID"
                icon="📰"
                collapsed={collapsed}
              />
            </abbr>
            <abbr title="Order's" className="no-underline">
              <NavItem
                to="/admin/orders"
                text="Orders"
                icon="📝"
                collapsed={collapsed}
              />
            </abbr>
            <abbr title="Customer's" className="no-underline">
              <NavItem
                to="/admin/customers"
                text="Customers"
                icon="👥"
                collapsed={collapsed}
              />
            </abbr>
            <abbr title="Pincode's" className="no-underline">
              <NavItem
                to="/admin/pincode"
                text="Pincodes"
                icon="📍"
                collapsed={collapsed}
              />
            </abbr>
            <abbr title="Settings" className="no-underline">
              <NavItem
                to="/admin/settings"
                text="Settings"
                icon="⚙️"
                collapsed={collapsed}
              />
            </abbr>
            <abbr title="Accounting" className="no-underline">
              <NavItem
                to="/admin/accounting"
                text="Accounting"
                icon="⚙️"
                collapsed={collapsed}
              />
            </abbr>
            <abbr title="Product Barcode's" className="no-underline">
              <NavItem
                to="/admin/barcode"
                text="Barcode Print"
                icon="💲"
                collapsed={collapsed}
              />
            </abbr>
            <abbr title="Logout" className="no-underline">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center" : "justify-start"
                } gap-2 py-3 px-4 mt-6 text-lg text-red-600 hover:bg-red-50 rounded-lg transition-colors`}
                aria-label="Logout">
                <span>👋</span>
                {!collapsed && <span>Logout</span>}
              </button>
            </abbr>

            {user && (
              <div
                className={`mt-6 pt-4 border-t border-gray-200 ${
                  collapsed ? "flex justify-center" : ""
                }`}>
                <div
                  className={`flex items-center gap-3 ${
                    collapsed ? "" : "justify-start"
                  }`}>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {user.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  {!collapsed && (
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {user.name || "Admin"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.role || "Administrator"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-margin duration-300 ${
          collapsed ? "ml-20" : "ml-80"
        }`}>
        {/* Mobile toggle button */}
        <div className="md:hidden p-2">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-white rounded-full shadow">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor">
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

// Separate component for navigation items
const NavItem = ({ to, text, icon, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center text-lg rounded-lg transition-colors duration-300

      ${collapsed ? "justify-center px-0 w-12 h-12" : "gap-3 px-4 py-3 w-full"}

      ${
        isActive
          ? "bg-blue-300 text-white shadow-md shadow-zinc-400"
          : "text-gray-700 hover:bg-blue-200 hover:text-blue-700"
      }
    `}>
    <span className="text-xl">{icon}</span>

    {!collapsed && <span className="truncate">{text}</span>}
  </NavLink>
);


export default Admin;