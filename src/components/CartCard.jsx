import React from 'react'
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { useDispatch } from 'react-redux';
import { addQuantity, reduceQuantity, removeProductFromCart } from '../Store/reducers/CartReducer';

const CartCard = ({ data }) => {
  const dispatch = useDispatch();

  const increaseQuantity = (id) => {
    dispatch(addQuantity({ _id: id }));
  };

  const decreaseQuantity = (id) => {
    dispatch(reduceQuantity({ _id: id }));
  };

  const cancelItem = (id) => {
    dispatch(removeProductFromCart({ _id: id }));
  };

  return (
    <div className='w-full rounded-lg flex gap-y-4 flex-col p-4 border'>
      <div className='w-full h-60 border rounded-md overflow-hidden bg-red-400'>
        <img
          className='w-full h-full object-cover'
          src={data.productPic}
          alt={data.name}
        />
      </div>
      <h1 className='text-2xl leading-5 font-ArvoBold'>{data.name}</h1>
      <div className='flex w-full rounded-md overflow-hidden border'>
        <button
          onClick={() => decreaseQuantity(data._id)}
          className='bg-black text-white w-[20%] px-4 py-2 flex items-center justify-center cursor-pointer active:bg-zinc-500 transition-all duration-300 border-r-1'
        >
          <RiSubtractFill />
        </button>
        <input
          readOnly
          className='bg-white w-[60%] px-4 py-2 text-xl font-Geist font-semibold text-center outline-none'
          value={data.quantity}
          type='number'
        />

        <button
          onClick={() => increaseQuantity(data._id)}
          className='bg-black text-white w-[20%] px-4 py-2 flex items-center justify-center cursor-pointer active:bg-zinc-500 transition-all duration-300 border-l-1'
        >
          <IoMdAdd />
        </button>
      </div>
      <button
        onClick={() => cancelItem(data._id)}
        className='bg-black text-white py-3 font-ArvoBold text-xl rounded-md'
      >
        Cancel
      </button>
    </div>
  )
}

export default CartCard
