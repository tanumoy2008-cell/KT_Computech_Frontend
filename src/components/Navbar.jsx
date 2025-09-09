import React, { memo, useState } from 'react'
import { IoMdMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { FaRegUserCircle } from "react-icons/fa";
import { HiMiniShoppingCart } from "react-icons/hi2";
const Navbar = () => {
    const [MenuShow, setMenuShow] = useState(false);
    const navigate = useNavigate()
    const [sidemenu, setsidemenu] = useState(false)
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
                <HiMiniShoppingCart />
            </div>
        </div>
        </div>
    </div>
  )
}

export default memo(Navbar)