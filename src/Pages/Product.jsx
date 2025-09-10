import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "../config/axios";
import { useParams } from 'react-router-dom';

const Product = () => {
  const {Maincategory} = useParams();
     const [product, setProduct] = useState([]);
      const [query, setQuery] = useState("");
         const [start, setStart] = useState(0);
         const [Subcategory, setCategory] = useState("");
         const [hasMore, setHasMore] = useState(true);
         const [isLoading, setIsLoading] = useState(false);
         const limit = 12;

         const fetchData = async (reset = false) => {
             try {
               const res = await axios.get(
                 `/api/product/productSend?start=${
                   reset ? 0 : start
                 }&limit=${limit}&query=${query}&Maincategory=${Maincategory}&Subcategory=${Subcategory}`
               );
               setProduct((prev) =>
                 reset ? res.data.product : [...prev, ...res.data.product]
               );
               setStart(res.data.nextStart);
               setHasMore(res.data.hasMore);
               setIsLoading(false);
             } catch (err) {
               console.error("Failed to fetch:", err);
             }
           };
         
           useEffect(() => {
             fetchData(true);
           }, [query, Subcategory, Maincategory]);
         
            useEffect(() => {
             const delay = setTimeout(() => {
               setIsLoading(true);
               setStart(0);
               fetchData(true); 
             }, 300);
         
             return () => clearTimeout(delay);
           }, [query]);
  return (
    <div className='w-full h-screen pt-40 xl:pt-52'>
        <Navbar />
        <div className='flex flex-col fixed z-20 top-16 w-full gap-y-6 px-4 pt-8 pb-4 items-center font-Syne text-white bg-blue-950'>
            <input value={query}
          onChange={(e) => setQuery(e.target.value)} type="text" placeholder='search product here. . .' className='w-11/12 text-lg placeholder:text-zinc-700 py-2 rounded outline-none text-black px-4 bg-white' />
        <div className='w-full hidden xl:flex justify-around items-center text-xl'>
        <h1 onClick={()=> setCategory("")} className={`cursor-pointer px-4 ${Subcategory === "" && "border-b-2"}`}>All</h1>
        <h1 onClick={()=> setCategory("Pencil")} className={`cursor-pointer px-4 ${Subcategory === "Pencil" && "border-b-2"}`}>Pencil</h1>
        <h1 onClick={()=> setCategory("Eraser")} className={`cursor-pointer px-4 ${Subcategory === "Eraser" && "border-b-2"}`}>Eraser</h1>
        <h1 onClick={()=> setCategory("Sharpner")} className={`cursor-pointer px-4 ${Subcategory === "Sharpner" && "border-b-2"}`}>Sharpner</h1>
        <h1 onClick={()=> setCategory("notebook")} className={`cursor-pointer px-4 ${Subcategory === "notebook" && "border-b-2"}`}>NoteBook</h1>
        <h1 onClick={()=> setCategory("color")} className={`cursor-pointer px-4 ${Subcategory === "color" && "border-b-2"}`}>Colors</h1>
        <h1 onClick={()=> setCategory("pen")} className={`cursor-pointer px-4 ${Subcategory === "pen" && "border-b-2"}`}>Pen</h1>
        <h1 onClick={()=> setCategory("Pencil_Box")} className={`cursor-pointer px-4 ${Subcategory === "Pencil_Box" && "border-b-2"}`}>Bag & Pencil Box</h1>
        </div>
        </div>
        <div id="scrollDiv" className='w-full py-4 px-6 h-[77vh] overflow-y-auto'>
            <InfiniteScroll
                dataLength={product.length}
                next={fetchData}
                hasMore={hasMore}
                scrollableTarget="scrollDiv"
                loader={
                  Array.from({length: 8}).map((_,i) =>(<div key={i} className='w-full h-full animate-pulse bg-white border border-zinc-500 p-4 rounded flex flex-col gap-y-4 justify-between group'>
                      <div className='w-full h-60 border border-zinc-500 overflow-hidden bg-zinc-400'>
                      </div>
                      <h1 className='text-center text-2xl font-Jura font-bold bg-zinc-400 py-4 animate-pulse'></h1>
                      <button className='py-4 text-zinc-400 bg-zinc-400 font-Jura text-xl animate-pulse text-center cursor-pointer'>
                          ₹ 00/-
                      </button>
                  </div>))
                }
                endMessage={
                <div className='w-full h-full border flex items-center justify-center border-black overflow-hidden'>
                    <p className="text-center text-gray-800 font-mono text-xl">Sorry No more Product left!</p>
                </div>
              }
                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4'
            >
            {product.map((p, i) => (
                <ProductCard data={p} key={i}/>
            ))}
            </InfiniteScroll>
        </div>
    </div>
  )
}

export default Product