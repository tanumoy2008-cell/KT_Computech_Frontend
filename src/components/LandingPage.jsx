import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import axios from "../config/axios";
import { useEffect, useState } from "react";
import calculateDiscountedPrice from "../utils/PercentageCalculate";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  const [products, setproducts] = useState([]);

  useEffect(() => {
    const fetchTopOffProduct = async () => {
      const res = await axios.get("/api/product/top-most-product");
      setproducts(res.data);
    };
    fetchTopOffProduct();
  }, []);

  return (
    <div className="w-full min-h-screen relative lg:pt-40">
      {/* Background image */}
      <img
        className="fixed top-0 left-0 w-full h-full object-cover brightness-70 -z-10"
        src="./BackGround.webp"
        alt="landing Photo"
      />

      {/* Centered Swiper */}
      <div className="absolute w-[95%] md:w-[90%] lg:w-[85%] h-[40vh] md:h-[50vh] lg:h-[60vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <Swiper
          key={products.length}
          slidesPerView={1}
          spaceBetween={30}
          pagination={{ clickable: true }}
          modules={[Pagination, Autoplay]}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pauseOnMouseEnter={true}
          breakpoints={{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 3 },
          }}
          loop={true}
          className="w-full h-full"
          style={{
            "--swiper-pagination-bottom": "10px",
            "--swiper-pagination-color": "#fff",
            "--swiper-pagination-bullet-inactive-color": "white",
          }}
        >
          {products.map((items, i) => (
            <SwiperSlide
              key={i}
              className="group flex relative rounded-2xl border border-white/50 overflow-hidden bg-white shadow-lg"
            >
              <Link to={`/product-dets/${items._id}`}>
                <motion.div
                  className="w-full h-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <img
                    className="w-full h-full object-cover contrast-125 brightness-75 transition-all duration-500 group-hover:scale-110 group-hover:brightness-50"
                    src={items.productPic}
                    alt={items.name}
                  />
                </motion.div>

                {/* Overlay Info */}
                <motion.div
                  className="absolute w-full h-full flex flex-col items-center text-white font-ArvoBold font-semibold justify-center gap-y-6 top-0 left-0 backdrop-blur-[3px] bg-black/70"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.h1
                    className="text-center text-xl sm:text-2xl lg:text-3xl 2xl:text-5xl px-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    {items.name}
                  </motion.h1>

                  <motion.p
                    className="text-lg sm:text-xl lg:text-2xl 2xl:text-4xl font-Geist"
                    whileHover={{ scale: 1.05 }}
                  >
                    {items.off !== 0 && (
                      <del className="text-zinc-300 mr-2">
                        ₹{items.price}/-
                      </del>
                    )}
                    ₹{calculateDiscountedPrice(items.price, items.off)}/-{" "}
                    {items.off !== 0 && (
                      <sup className="text-green-400">{items.off}%Off</sup>
                    )}
                  </motion.p>
                </motion.div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default LandingPage;
