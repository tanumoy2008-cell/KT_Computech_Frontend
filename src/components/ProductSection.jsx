import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard';
import axios from "../config/axios";

const ProductSection = () => {
  const [topProduct, settopProduct] = useState([])

  useEffect(()=>{
    const fetchTopProduct = async ()=>{
      const res = await axios.get("/api/product/top-product");
      settopProduct(res.data)
    }
    fetchTopProduct();
  },[])
  return (
    <div id='productSection' className='w-full min-h-screen px-10 py-10'>
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