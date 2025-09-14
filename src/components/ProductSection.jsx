import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard';
import axios from "../config/axios";
import { Link } from 'react-router-dom';

const ProductSection = () => {
  const [topProduct, settopProduct] = useState([])

  useEffect(()=>{
    const fetchTopProduct = async ()=>{
      const res = await axios.get("/api/product/top-product");
      settopProduct(res.data)
    }
    fetchTopProduct();
  },[])

  const categories = [
    {
      name:"School Stationery",
      pic:"/Categories/Study.avif",
      link: "/product/school"
    },
    {
      name:"Office Stationery",
      pic:"/Categories/Office.avif",
      link: "/product/office"
    },
    {
      name:"Art & Craft Itmes",
      pic:"/Categories/Art.avif",
      link: "/product/art"
    },
    {
      name:"Gift Items",
      pic:"/Categories/Gift.avif",
      link: "/product/gift"
    },
    {
      name: "House Hold Product",
      pic:"/Categories/House Hold.avif",
      link: "/product/house"
    },
  ]
  return (
    <div id='productSection' className='w-full min-h-screen px-10 py-10'>
      <div className='w-full flex flex-col gap-y-2'>
        <h1 className='text-center font-Syne text-5xl'>Categories</h1>
        <div className='flex items-center justify-center gap-4 flex-wrap lg:gap-x-5 xl:gap-x-20 2xl:gap-x-30 w-full py-10'>
        {categories.map((items,i)=>(
          <Link to={items.link} key={i} className='flex flex-col gap-y-2 items-center cursor-pointer'>
            <div className='w-30 h-30 lg:w-40 lg:h-40 xl:w-40 xl:h-40 2xl:w-40 2xl:h-40 rounded-full overflow-hidden border-black border-4'>
              <img className='w-full h-full object-cover' src={items.pic} alt="" />
            </div>
            <h1 className='lg:text-lg xl:text-lg 2xl:text-2xl font-semibold font-ZenRegular'>{items.name}</h1>
          </Link>
        ))}
        </div>
      </div>
        <h1 className='text-center mb-5 text-4xl font-Syne'>Our Top Product's</h1>
        <div className='grid md:grid-cols-2 md:grid-rows-4 lg:grid-cols-3 lg:grid-rows-3 xl:grid-cols-4 xl:grid-rows-2 2xl:grid-cols-4 2xl:grid-rows-2 justify-around content-center gap-5'>
        {topProduct.map((item,i)=>(
          <ProductCard data={item} key={i}/>
        ))}
        </div>
    </div>
  )
}

export default ProductSection