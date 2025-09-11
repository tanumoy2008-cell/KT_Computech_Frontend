import React, { memo, useState } from 'react'
import { IoMdMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { FaRegUserCircle } from "react-icons/fa";
import { HiMiniShoppingCart } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux"
import calculateDiscountedPrice from '../utils/PercentageCalculate';
import { IoTrash } from "react-icons/io5";
import { removeProductFromCart } from '../Store/reducers/CartReducer';
const Navbar = () => {
    const [MenuShow, setMenuShow] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [sidemenu, setsidemenu] = useState(false);
    const cart = useSelector(state=>state.CartReducer);
    const cancelItem = (id) => {
    dispatch(removeProductFromCart({ _id: id }));
  };
  return (
    <div className='w-full fixed bg-black text-white top-0 z-[999]'>
        <div className='w-full py-2 px-4 flex lg:hidden xl:hidden text-black 2xl:hidden items-center justify-between'>
            <div className={`absolute flex flex-col justify-center gap-y-10 top-0 transition-all duration-500 shadow-2xl shadow-black ${sidemenu ? "left-0" : "left-[105%]"} text-center text-4xl bg-white w-full h-screen z-[99]`}>
            <button onClick={()=>setsidemenu(false)} className='absolute top-5 left-5 font-Syne uppercase text-xl bg-black text-white px-10 py-2 rounded outline-none border-none'>Back</button>
            <Link to="/product/school" className='cursor-pointer py-2 px-2 hover:bg-zinc-300'>School Stationery</Link>
            <Link to="/product/office"  className='cursor-pointer py-2 px-2 hover:bg-zinc-300'>Office Stationery</Link>
            <Link to="/product/art" className='cursor-pointer py-2 px-2 hover:bg-zinc-300'>Art & Carft Items</Link>
            <Link to="/product/gift" className='cursor-pointer py-2 px-2 hover:bg-zinc-300'>Gift Items</Link>
            <Link to="/product/house"  className='cursor-pointer py-2 px-2 hover:bg-zinc-300'>House Hold Products</Link>
            <Link to="/product/all"  className='cursor-pointer py-2 px-2 hover:bg-zinc-300'>All Products</Link>
            </div>
            <div className='flex items-center gap-x-2'>
            <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400'>
                <img className='w-full h-full object-cover shadow-2xl' src="/Logo.webp" alt="logo" />
            </div>
                <h1 className='text-xl uppercase font-Syne font-semibold'>KT Computech</h1>
            </div>
            <div>
                <IoMdMenu onClick={()=>setMenuShow(true)} className='text-4xl text-white' />
            </div>
            <div className={`fixed transition-all duration-200 w-full h-screen top-0 ${ MenuShow ? "right-0" : "-right-[100%]"} bg-white`}>
                <IoClose onClick={()=>setMenuShow(false)} className='absolute top-10 right-10 text-5xl' />
                <div className='flex flex-col items-center justify-center gap-y-20 uppercase font-semibold tracking-wide text-5xl w-full h-full'>
                    <Link to="/user" >Profile</Link>
                    <Link to="/" >Home</Link>
                    <h1 onClick={()=>setsidemenu(true)}>Product</h1>
                    <h1>About</h1>
                    <h1>Contact Us</h1>
                </div>
            </div>
        </div>
        <div className='hidden lg:flex justify-between items-center w-full pl-10 md:pr-10 xl:pr-30 py-1'>
        <div className='w-20 h-20 overflow-hidden rounded-full border-2 border-amber-400'>
            <img className='w-full h-full object-cover shadow-2xl' src="/Logo.webp" alt="" />
        </div>
        <div className='flex font-ZenRegular text-center items-center md:text-xl xl:text-2xl'>
            <Link to="/" className='border-r w-50 cursor-pointer'>Home</Link>
            <div className='border-r w-50 cursor-pointer relative group'>
            <Link to={`/product/all`}>Product</Link>
            <div className='absolute top-[100%] left-0 bg-white text-black whitespace-nowrap hidden group-hover:flex flex-col'>
            <Link to="/product/school" className='cursor-pointer border-1 border-b-0 py-2 px-20 hover:bg-zinc-300'>School Stationery</Link>
            <Link to="/product/office"  className='cursor-pointer border-1 border-b-0 py-2 px-20 hover:bg-zinc-300'>Office Stationery</Link>
            <Link to="/product/art" className='cursor-pointer border-1 border-b-0 py-2 px-20 hover:bg-zinc-300'>Art & Carft Items</Link>
            <Link to="/product/gift" className='cursor-pointer border-1 border-b-0 py-2 px-20 hover:bg-zinc-300'>Gift Items</Link>
            <Link to="/product/house"  className='cursor-pointer border-1 py-2 px-20 hover:bg-zinc-300'>House Hold Products</Link>
            </div>
            </div>
            <h1 className='border-r w-50 cursor-pointer'>About</h1>
            <h1 className='cursor-pointer w-50'>Contact Us</h1>
            <div className='h-full flex ml-5 items-center gap-x-5'>
                <abbr title="Profile">
                <FaRegUserCircle onClick={()=>navigate("/user")} className='cursor-pointer' />
                </abbr>
                <div className="relative w-fit h-fit group py-2">
                {cart.length !== 0 && <small className="bg-red-600 absolute text-sm px-2 rounded-full -top-2 -right-3 leading-4 py-1">
                    {cart.length}
                </small>}
                <HiMiniShoppingCart className="cursor-pointer" />
                { cart.length > 0 ?
                    <div className="absolute right-0 p-2 hidden group-hover:flex flex-col gap-y-2 bg-white shadow-2xl shadow-black border-1 border-black/30">
                    <div className=' max-h-[40vh] overflow-y-auto'>
                    {cart.map((items, index) => (
                        <div
                        key={index}
                        className="w-full cursor-pointer border-1 flex p-2 items-center justify-between gap-x-4 rounded-md text-black border-black"
                    >
                        <div className="w-20 h-20 overflow-hidden rounded-md border-1">
                        <img
                            className="w-full h-full object-cover"
                            src={items.productPic}
                            alt=""
                        />
                        </div>
                        <div onClick={() => navigate(`/product-dets/${items._id}`)} className="flex flex-col items-start">
                        <p className="text-lg whitespace-nowrap">
                            {items.name.slice(0, 15)}...
                        </p>
                        <small>{calculateDiscountedPrice(items.price, items.off)}</small>
                        </div>
                        <button onClick={() => cancelItem(items._id)} className="bg-black cursor-pointer text-white h-20 w-20 rounded-md flex justify-center items-center text-3xl">
                        <IoTrash />
                        </button>
                    </div>
                    ))}
                    </div>
                <button onClick={()=>navigate("/user")} className='w-full py-2 cursor-pointer bg-black rounded-md font-Syne'>Buy Now</button>
                </div> : (
                    <div className="absolute right-0 py-2 px-4 text-black whitespace-nowrap hidden group-hover:flex flex-col gap-y-2 bg-white shadow-2xl shadow-black border-1 border-black/30">
                        <h1 className='text-lg font-Syne font-semibold lg:text-2xl'>No Product added in cart</h1>
                    </div>
                )}
                </div>
                </div>
            </div>
        </div>
        </div>
  )
}

export default memo(Navbar)