import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import axios from "../config/axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiTag,
} from "react-icons/fi";
import ProductCard from "../components/ProductCard";

const LandingPage = () => {
  const [offers, setOffers] = useState([]);
  const [popular, setPopular] = useState([]);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, popularRes] = await Promise.all([
          axios.get("/api/product/top-most-product"),
          axios.get("/api/product/top-product"),
        ]);
        setOffers(offersRes.data);
        setPopular(popularRes.data);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };
    fetchData();
  }, []);
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    setEmail("");
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-black text-white">
        <img
          src="/BackGround.webp"
          alt="Stationery Background"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="relative z-10 text-center max-w-3xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Write Your Story with Style
          </motion.h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-8">
            Discover premium stationery that inspires creativity and helps you
            organize your ideas beautifully.
          </p>
          <Link
            to="/product/all"
            className="bg-white text-emerald-700 hover:bg-gray-100 px-20 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition"
          >
            Shop Now <FiShoppingBag />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-zinc-300">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <FiTruck size={32} />,
              title: "Free Delivery",
              desc: "On orders over ₹499",
            },
            {
              icon: <FiShield size={32} />,
              title: "Eco-Friendly",
              desc: "Sustainable products",
            },
            {
              icon: <FiTag size={32} />,
              title: "Student Discount",
              desc: "Exclusive academic offers",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 rounded-xl shadow-sm hover:shadow-md transition bg-gray-50"
            >
              <div className="text-emerald-700 mb-3 flex justify-center">
                {f.icon}
              </div>
              <h3 className="font-semibold text-xl mb-1">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Offers with Swiper + ProductCard */}
      <section className="py-16 bg-zinc-300">
        <div className="container mx-auto px-6 pb-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Top Offers</h2>
            <div className="w-16 h-1 bg-emerald-600 mx-auto my-3 rotate-6"></div>
            <p className="text-gray-600">
              Grab the best deals on stationery essentials.
            </p>
          </motion.div>

          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={25}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-10"
          >
            {offers.map((p) => (
              <SwiperSlide key={p._id} className="mb-10">
                <ProductCard data={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16 bg-zinc-300">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Popular Picks</h2>
            <div className="w-16 h-1 bg-emerald-600 mx-auto my-3 rotate-6"></div>
            <p className="text-gray-600">
              Our most loved and trending stationery products.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popular.map((p, i) => (
              <motion.div
                key={p._id}
                variants={fadeIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <ProductCard data={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-emerald-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-indigo-100 mb-8">
              Subscribe to get updates on new arrivals and special offers.
            </p>

            {isSubscribed ? (
              <div className="bg-green-500 px-6 py-3 rounded-lg inline-block">
                Thank you for subscribing!
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-lg outline-none border-2 border-white flex-grow"
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-emerald-800 px-6 py-3 rounded-lg font-semibold outline-none cursor-pointer hover:bg-gray-300 transition"
                >
                  Subscribe
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
