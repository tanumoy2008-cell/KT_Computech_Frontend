import { Link, Outlet } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Cart from '../components/Cart';
import PlaceOrder from '../components/PlaceOrder';
import Navbar from '../components/Navbar';

const UserProfle = () => {

  return (
    <div className='w-full min-h-screen flex'>
        <div className='min-h-screen hidden md:w-[40%] lg:w-[30%] 2xl:w-[25%] bg-black md:flex flex-col py-10 tracking-wider text-white font-ArvoRegular'>
            <h1 className='text-center xl:text-4xl 2xl:text-4xl uppercase font-Geist font-black'>KT Computech</h1>
            <div className='flex flex-col xl:gap-y-10 2xl:gap-y-20 mt-10 2xl:mt-20 uppercase text-3xl'>
                <Link to="/user" className='w-full text-center cursor-pointer'>Dashboard</Link>
                <Link to="/user/cart" className='w-full text-center cursor-pointer'>Cart</Link>
                <Link to="/user/order-history" className='w-full text-center cursor-pointer'>Place Order</Link>
                <Link to="/" className='w-full text-center cursor-pointer'>Home</Link>
                <h4 className='w-full text-center cursor-pointer'>LogOut</h4>
            </div>
        </div>
        <div className='h-full px-5 lg:px-0 xl:px-0 2xl:px-0 py-5 lg:py-0 xl:py-0 2xl:py-0 w-full md:w-[60%] lg:w-[70%] 2xl:w-[75%]'>
          <div className='fixed top-0 left-0 w-full md:hidden'>
            <Navbar />
          </div>
            <Outlet />
        </div>
    </div>
  )
}

export default UserProfle