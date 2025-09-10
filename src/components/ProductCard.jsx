import { Link } from "react-router-dom";
import axios from "../config/axios";
const ProductCard = ({data}) => {
  const clickHandel = async (id)=>{
    await axios.patch(`/api/product/click/${id}`);
  }
  return (
    <Link to={`/product-dets/${data._id}`} onClick={()=>clickHandel(data._id)}>
    <div className='w-full h-full bg-white border p-4 rounded flex flex-col gap-y-4 justify-between group'>
        <div className='w-full h-60 border overflow-hidden'>
        <img className='w-full h-full object-cover group-hover:scale-110 contrast-150 brightness-80 transition-all duration-200' src={data.productPic} alt="" />
        </div>
        <h1 className='text-center text-2xl font-Jura font-bold'>{data.name}</h1>
        <button className='bg-black py-4 text-white font-Jura text-xl text-center cursor-pointer'>
            ₹ {data.price}/-
        </button>
    </div>
    </Link>
  )
}

export default ProductCard