import React, { useEffect, useState } from 'react'
import CartCard from './CartCard'
import {useSelector} from "react-redux"
const Cart = () => {
  const cart = useSelector(state => state.CartReducer)
  const [carts, setcarts] = useState(cart);
  useEffect(()=>{
    setcarts(cart);
  },[cart]);

  return (
    <div className='flex flex-col h-screen w-full px-10 py-5'>
      <div className='flex w-full justify-between items-center'>
      <h1 className='font-Syne text-2xl lg:text-6xl font-semibold'>Your Cart</h1>
      <button className='bg-black text-white px-10 py-2 font-ZenMeduim text-lg rounded-md'>Buy Now</button>
      </div>
      <div className='w-full mt-5 h-full overflow-y-scroll'>
        <div className='grid grid-cols-3 gap-5'>
        {carts.map((item,i)=>(<CartCard key={i} data={item} />))}
        </div>
      </div>
    </div>
  )
}

export default Cart;