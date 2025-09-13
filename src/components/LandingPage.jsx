import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination,Autoplay } from 'swiper/modules';
import axios from "../config/axios"
import { useEffect, useState } from 'react';
import calculateDiscountedPrice from '../utils/PercentageCalculate';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [products, setproducts] = useState([]);
  useEffect(() => {
    const fetchTopOffProduct = async ()=>{
      const res = await axios.get("/api/product/top-most-product");
      setproducts(res.data);
    }
    fetchTopOffProduct();
  }, [])
  
  return (
    <div className="w-full min-h-screen relative lg:pt-40">
      {/* Background image */}
      <img
        className="absolute top-0 left-0 w-full h-full object-cover brightness-70 -z-10"
        src="./BackGround.webp"
        alt="landing Photo"
      />

      {/* Centered Swiper */}
      <div className="absolute w-[90%] h-[40vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <Swiper
          slidesPerView={1}
          spaceBetween={100}
          pagination={{ clickable: true }}
          modules={[Pagination,Autoplay]}
           autoplay={{
            delay: 2500,
            disableOnInteraction: false,
             pauseOnMouseEnter: false,
          }}
           breakpoints={{
            640: { 
              slidesPerView: 1,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          loop={true} 
          className="w-full h-full"
          style={{ '--swiper-pagination-bottom': '10px', '--swiper-pagination-color': '#fff','--swiper-pagination-bullet-inactive-color': 'white', }} 
        >
          {products.map((items, i) => (
            <SwiperSlide key={i} className="group flex relative rounded-xl border-1 border-white/50 overflow-hidden items-center justify-center bg-white h-full">
            <Link to={`/product-dets/${items._id}`}>
              <div className='w-full h-full'>
              <img className='w-full h-full object-cover contrast-125 brightness-20 transition-all duration-200 group-hover:scale-105 group-hover:brightness-30' src={items.productPic} alt="" />
              </div>
              <div className='absolute w-full h-full flex flex-col items-center text-white font-Syne font-semibold justify-center gap-y-10 top-0 left-0 backdrop-blur-[3px]'>
                <h1 className='drop-shadow-white drop-shadow-xs text-center text-3xl 2xl:text-5xl px-4'>{items.name}</h1>
                 <p className='text-2xl 2xl:text-5xl font-ZenRegular'><del className='text-zinc-300'>₹{items.price}/-</del> ₹{calculateDiscountedPrice(items.price,items.off)}/- <sup className='text-green-600'>{items.off}%Off</sup></p>
              </div>
            </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default LandingPage;
