import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from "../config/axios"
import { FaLongArrowAltLeft } from "react-icons/fa";
import calculateDiscountedPrice from '../utils/PercentageCalculate';
const ProductDets = () => {
  const navigate = useNavigate();
    const {id} = useParams();
    const [Product, setproduct] = useState({})
    const fetchData = async ()=>{
      const res = await axios.get(`/api/product/productDetail/${id}`);
      setproduct(res.data);
    }
    useEffect(()=>{
      fetchData()
    },[])
    console.log(Product.price,Product.off )
    const newPrice = calculateDiscountedPrice(Product.price,Product.off);
  return (
    <div id='productDets' className='w-full min-h-screen'>
      <button onClick={()=>navigate(-1)} className='fixed top-5 left-5 bg-black text-white rounded px-10 py-2 flex items-center gap-x-4'><FaLongArrowAltLeft />Back</button>
    {Object.keys(Product).length === 0 ? (        
        <div className='w-full pt-30 pb-10 px-5  md:px-25 lg:px-10 2xl:px-40'>
            <div className='flex flex-col items-start md:flex-col lg:flex-row xl:flex-row 2xl:flex-row gap-y-10 lg:gap-x-20 xl:gap-x-20 2xl:gap-x-40 lg:items-start xl:items-start 2xl:items-start'>
              <div className="flex flex-col gap-y-10 md:w-full lg:w-[80%] xl:w-[600px] 2xl:w-[750px]">
              <div className='w-full md:h-[500px] lg:h-[500px] xl:h-[500px] 2xl:h-[500px] overflow-hidden border rounded-lg group'>
                <img className='w-full h-full group-hover:scale-110 transition-scale animate-pulse object-cover duration-200' src="../imgBack.jpg" alt="no image" />
              </div>
              <div className="bg-amber-300 py-3 px-4 w-full rounded-lg border-amber-900 border-l-6 border-2">
                <h1 className="font-Syne font-semibold uppercase text-2xl">Note:</h1>
                <p className="font-ZenMeduim text-xl">We always try our best to deliver the product in the same color as shown in the images. However, due to availability, sometimes the color may vary. Rest assured, the product quality and features will remain the same. Thank you for your kind understanding. 🙏</p>
              </div>
              </div>
              <div className='flex flex-col items-start gap-y-5 w-full xl:w-[40%] md:gap-y-10 lg:gap-y-20 xl:gap-y-15 2xl:gap-y-20'>
              <h1 className='text-4xl sm:text-6xl md:text-7xl lg:text-5xl xl:text-5xl 2xl:text-7xl font-Syne opacity-30 font-semibold animate-pulse'>Product Name</h1>
              <div className="flex w-full gap-y-10 flex-col-reverse xl:flex-col" >
              <div className='flex flex-col gap-y-4'>
              {Array.from({length: 4}).map((_,i)=>(
                <p key={i} className='text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-Jura font-medium transition-all duration-200 cursor-pointer opacity-30 animate-pulse hover:font-bold'>※ Description</p>
              ))}
              </div>
              <div className="flex flex-col gap-y-5 md:flex-row w-full justify-center gap-x-4 text-white">
                <button className="bg-black px-20 py-4 rounded-full text-xl opacity-30 animate-pulse">Buy ₹00/-</button>
                <button className="bg-black px-20 py-4 rounded-full text-xl whitespace-nowrap opacity-30 animate-pulse">Add to Cart</button>
              </div>
              </div>
              </div>
            </div>
        </div> ) : (
            <div className='w-full pt-30 pb-10 px-5 md:px-25 lg:px-20 2xl:px-40'>
            <div className='flex flex-col items-start md:flex-col lg:flex-col xl:flex-row 2xl:flex-row gap-y-10 lg:gap-x-5 xl:gap-x-20 2xl:gap-x-40 lg:items-center xl:items-start 2xl:items-start'>
              <div className="flex flex-col gap-y-10 md:w-full lg:w-[80%] xl:w-[600px] 2xl:w-[750px]">
              <div className='w-full md:h-[500px] lg:h-[500px] xl:h-[500px] 2xl:h-[500px] overflow-hidden object-cover border rounded-lg group'>
                <img className='w-full h-full group-hover:scale-110 transition-scale duration-200' src={Product.productPic} alt={Product.name} />
              </div>
              <div className="bg-amber-300 py-3 px-4 w-full rounded-lg border-amber-900 border-l-6 border-2">
                <h1 className="font-Syne font-semibold uppercase text-2xl">Note:</h1>
                <p className="font-ZenMeduim text-xl">We always try our best to deliver the product in the same color as shown in the images. However, due to availability, sometimes the color may vary. Rest assured, the product quality and features will remain the same. Thank you for your kind understanding. 🙏</p>
              </div>
              </div>
              <div className='flex flex-col items-start gap-y-5 w-full xl:w-[40%] md:gap-y-10 lg:gap-y-20 xl:gap-y-15 2xl:gap-y-20'>
              <h1 className='text-4xl sm:text-6xl md:text-7xl lg:text-5xl xl:text-5xl 2xl:text-7xl font-Syne font-semibold'>{Product.name}</h1>
              <div className="flex w-full gap-y-10 flex-col-reverse xl:flex-col" >
                <p className='text-4xl'>{Product.off !== 0 && <del className='text-zinc-500'>₹{Product.price}/-</del>} ₹{newPrice}/- {Product.off !== 0 && <sup className='text-green-600'>{Product.off}%Off</sup>}</p>
              <div className='flex flex-col gap-y-4'>
              {Product.description && Product.description.map((item,i)=>(
                <p key={i} className='text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-Jura font-medium transition-all duration-200 cursor-pointer hover:font-bold'>※ {item}</p>
              ))}
              </div>
              <div className="flex flex-col gap-y-5 md:flex-row w-full justify-center gap-x-4 text-white">
                <button className="bg-black px-20 py-4 w-full rounded-full text-xl">Buy Now</button>
                <button className="bg-black px-20 py-4 w-full rounded-full whitespace-nowrap text-xl">Add to Cart</button>
              </div>
              </div>
              </div>
            </div>
        </div>
        )}

    </div>
  )
}

export default ProductDets