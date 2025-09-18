import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from "../config/axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Swal from 'sweetalert2';
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
const Products = () => {
    const admin = useSelector(state=> state.AdminReducer);
    const [product, setProduct] = useState([]);
    const [query, setQuery] = useState("");
    const [start, setStart] = useState(0);
    const [category, setCategory] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const limit = 11;

  const fetchData = async (reset = false) => {
    try {
      const res = await axios.get(
        `/api/product/productDetails?start=${
          reset ? 0 : start
        }&limit=${limit}&query=${query}&category=${category}`
      );
      setProduct((prev) =>
        reset ? res.data.product : [...prev, ...res.data.product]
      );
      setStart(res.data.nextStart || 0);
      setHasMore(res.data.hasMore);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [query, category]);

   useEffect(() => {
    const delay = setTimeout(() => {
      setIsLoading(true);
      setStart(0);
      fetchData(true); 
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const roleHandeler = ({id})=>{
    if(admin.role == "admin"){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Your are not Super Admin",
        footer: 'Contact with Super Admin'
      })
    } else {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async () => {
        console.log(id)
        const res = await axios.delete(`/api/product/product-delete/${id}`);
        if (res.status === 200) {
          Swal.fire({
            title: "Deleted!",
            text: res.data.message,
            icon: "success"
          });
          setProduct(prev => prev.filter(item=>item._id !== id))
        } else {
          toast.error(res.data.message);
        }
      });
    }
  }

  return (
    <div className='h-screen w-full bg-zinc-800 px-10 py-5 flex flex-col gap-y-5'>
        <div className='flex bg-white px-4 py-4 gap-x-4 rounded-lg'>
            <input  value={query}
          onChange={(e) => setQuery(e.target.value)} placeholder='Search by name. . .' className='w-[70%] border-1 px-4 py-2 outline-none rounded-md' type="text" />
            <select onChange={(e) => setCategory(e.target.value)} className='w-[30%] border-1 px-4 outline-none rounded-md'>
                <option value="">Select Category</option>
                <option value="Pencil">Pencil</option>
                <option value="Eraser">Eraser</option>
                <option value="Sharpner">Sharpner</option>
                <option value="Notebook">Notebook</option>
            </select>
        </div>
        <div className='w-full h-[85vh] py-4 px-4 rounded-md bg-white'>
            <div className='flex w-full bg-white font-bold gap-x-2 text-center mb-2 font-ArvoBold text-lg'>
                <h1 className='w-[40%] border-1 py-2 rounded bg-sky-200'>Name</h1>
                <h1 className='w-[40%] border-1 py-2 rounded bg-yellow-200'>Company</h1>
                <h1 className='w-[40%] border-1 py-2 rounded bg-orange-200'>Category</h1>
                <h1 className='w-[40%] border-1 py-2 rounded bg-violet-200'>Price</h1>
                <h1 className='w-[10%] border-1 py-2 rounded px-2 bg-green-200'>Edit</h1>
                <h1 className='w-[10%] border-1 py-2 rounded px-2 bg-red-200'>Delete</h1>
            </div>
          <div id="scrollableDiv" className="h-[75vh] overflow-auto flex flex-col gap-y-5">
            <InfiniteScroll
                dataLength={product.length}
                next={fetchData}
                hasMore={hasMore}
                loader={<h4 className="text-center">Loading more sets...</h4>}
                endMessage={<p className="text-center text-gray-800 font-mono text-lg">No more Product left!</p>}
                scrollableTarget="scrollableDiv"
                className='flex flex-col gap-y-2'
            >
                {product.map((p, i) => (
                <div key={i} className="flex w-full items-center gap-x-2 border-1 py-2 px-1 rounded">
                    <h1 className="w-[40%] text-center">{p.name}</h1>
                    <h1 className="w-[40%] text-center">{p.company}</h1>
                    <h1 className="w-[40%] text-center">{p.category}</h1>
                    <h1 className="w-[40%] text-center">{p.price}</h1>
                    <Link to={`/product-edit/${p._id}`} className="w-[10%] bg-sky-400 px-2 py-2 text-center text-white rounded-md cursor-pointer hover:bg-sky-600">Edit</Link>
                    <h1 onClick={()=> roleHandeler({id: p._id})} className="w-[10%] bg-red-400 px-2 py-2 text-center text-white rounded-md cursor-pointer hover:bg-red-600">Delete</h1>
                </div>
                ))}
            </InfiniteScroll>
            </div>
        </div>
    </div>
  )
}

export default Products