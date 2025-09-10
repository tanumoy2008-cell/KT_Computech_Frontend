import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Dashbord from '../components/Dashbord';
import Cart from '../components/Cart';
import PlaceOrder from '../components/PlaceOrder';
import UserSettings from '../components/UserSettings';
import Navbar from '../components/Navbar';

const UserProfle = () => {

  const [tab, setTab] = useState("Dashbord");
  let content;
  switch (tab) {
    case "Dashbord":
      content = <Dashbord />;
      break;
    case "Cart":
      content = <Cart />;
      break;
    case "Place Order":
      content = <PlaceOrder />;
      break;
    case "Settings":
      content = <UserSettings />;
      break;
    default:
      content = <Dashbord />;
      break;
  }

  return (
    <div className='w-full min-h-screen flex'>
        <div className='min-h-screen hidden md:w-[40%] lg:w-[30%] 2xl:w-[25%] bg-black md:flex flex-col py-10 text-white font-Syne'>
            <h1 className='text-center text-4xl uppercase font-bold'>KT Computech</h1>
            <div className='flex flex-col gap-y-20 mt-30 uppercase text-3xl'>
                <h4 onClick={()=>setTab("Dashbord")} className='w-full text-center cursor-pointer'>Dashbord</h4>
                <h4 onClick={()=>setTab("Cart")} className='w-full text-center cursor-pointer'>Cart</h4>
                <h4 onClick={()=>setTab("Place Order")} className='w-full text-center cursor-pointer'>Place Order</h4>
                <h4 onClick={()=>setTab("Settings")} className='w-full text-center cursor-pointer'>Settings</h4>
                <Link to="/" className='w-full text-center cursor-pointer'>Home</Link>
                <h4 className='w-full text-center cursor-pointer'>LogOut</h4>
            </div>
        </div>
        <div className='h-full px-5 lg:px-0 xl:px-0 2xl:px-0 py-5 lg:py-0 xl:py-0 2xl:py-0 w-full md:w-[60%] lg:w-[70%] 2xl:w-[75%]'>
          <div className='fixed top-0 left-0 w-full md:hidden'>
            <Navbar />
          </div>
            {content}
        </div>
    </div>
  )
}

export default UserProfle