import { Outlet, useNavigate, Link, Navigate, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
    <div className='relative w-full min-h-screen flex bg-gray-50'>
      {/* Sidebar */}
      <div className='h-screen w-80 bg-white shadow-lg fixed left-0 top-0 overflow-y-auto'>
        <div className="flex flex-col items-center py-8 px-4">
          <Link to="/admin" className='cursor-pointer font-Jura font-black mb-12 italic text-4xl w-full text-center text-gray-800 hover:text-blue-600 transition-colors'>
            KT Computech
          </Link>
          
          <div className="w-full space-y-2">
            <NavItem to="/" text="Home" icon="🏠" />
            <NavItem to="/admin" text="Dashboard" icon="📊" />
            <NavItem to="/admin/products" text="Products" icon="📦" />
            <NavItem to="/admin/orders" text="Orders" icon="📝" />
            <NavItem to="/admin/customers" text="Customers" icon="👥" />
            <NavItem to="/admin/billing" text="Billing" icon="💳" />
            <NavItem to="/admin/pincode" text="Pincodes" icon="📍" />
            <NavItem to="/admin/settings" text="Settings" icon="⚙️" />
            <NavItem to="/admin/accounting" text="Accounting" icon="⚙️" />
            <NavItem to="/admin/barcode" text="Barcode Print" icon="💲" />
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-8 text-lg text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span>👋</span>
              <span>Logout</span>
            </button>
            
            {user && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {user.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{user.name || 'Admin'}</p>
                    <p className="text-sm text-gray-500">{user.role || 'Administrator'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 ml-80 p-8">
        <Outlet />
      </div>
    </div>
  );
};

// Separate component for navigation items
const NavItem = ({ to, text, icon }) => (
  <Link
    to={to}
    className="flex items-center gap-3 py-3 px-4 text-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
  >
    <span className="text-xl">{icon}</span>
    <span>{text}</span>
  </Link>
);

export default Admin;