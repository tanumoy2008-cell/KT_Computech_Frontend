import { Outlet, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../config/axios"
import { useDispatch } from "react-redux";
import { logOut } from "../Store/reducers/AdminReducer";
import { toast } from "react-toastify";

const Admin = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
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
        const res = await axios.post("/api/admin/logout");
        dispatch(logOut());
        toast.success(res.data?.message);
        navigate("/");
      } catch (err) {
        toast.error("Something went wrong!");
      }
    } else {
      toast.info("Logout cancelled");
    }
  });
};


  return (
    <div className='relative w-full min-h-screen flex'>
        <div className='h-screen w-96 font-PublicSans text-4xl overflow-y-scroll'>
          <div className="flex flex-col gap-y-20 items-center justify-center py-10">
            <Link to="/admin" className='cursor-pointer font-Jura font-black mb-10 italic text-5xl w-full text-center'>KT Computech</Link>
            <Link to="/" className='cursor-pointer w-full text-center'>Home</Link>
            <Link to="/admin" className='cursor-pointer w-full text-center'>Product Add</Link>
            <Link to="/admin/product" className='cursor-pointer w-full text-center'>Products</Link>
            <Link to="/admin/billing" className='cursor-pointer w-full text-center'>Billing</Link>
            <Link to="/admin/pincode" className='cursor-pointer w-full text-center'>PinCodes</Link>
            <Link to="/admin/settings" className='cursor-pointer w-full text-center'>Setting</Link>
            <h1 onClick={logout} className='cursor-pointer w-full text-center'>LogOut</h1>
          </div>
        </div>
        <Outlet />
    </div>
  )
}

export default Admin