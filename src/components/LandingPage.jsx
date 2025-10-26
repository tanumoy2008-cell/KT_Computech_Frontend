import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import axios from "../config/axios";
import { useEffect, useState } from "react";
import calculateDiscountedPrice from "../utils/PercentageCalculate";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiShoppingBag, FiStar, FiTruck, FiShield, FiTag, FiShoppingCart, FiHeart } from "react-icons/fi";
import ProductCard from "./ProductCard";

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const categories = [
    {
      _id: '1',
      name: 'School Stationery',
      image: '/Categories/Study.avif',
      link: '/product/school',
    },
    {
      _id: '2',
      name: 'Office Stationery',
      image: '/Categories/Office.avif',
      link: '/product/office',
    },
    {
      _id: '3',
      name: 'Art & Craft',
      image: '/Categories/Art.avif',
      link: '/product/art',
    },
    {
      _id: '4',
      name: 'Gift Items',
      image: '/Categories/Gift.avif',
      link: '/product/gift',
    },
    {
      _id: '5',
      name: 'Household Products',
      image: '/Categories/House Hold.avif',
      link: '/product/house',
    }
  ];
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, topProductsRes] = await Promise.all([
          axios.get("/api/product/top-most-product"),
          axios.get("/api/product/top-product")
        ]);
        setProducts(productsRes.data);
        setTopProducts(topProductsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Add your subscription logic here
    console.log('Subscribed with:', email);
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Art Student',
      content: 'The quality of these art supplies is exceptional! The paper takes watercolor beautifully.',
      rating: 5
    },
    {
      id: 2,
      name: 'Rahul Mehta',
      role: 'Teacher',
      content: 'Great selection of classroom supplies. My students love the colorful stationery!',
      rating: 5
    },
    {
      id: 3,
      name: 'Ananya Patel',
      role: 'Calligraphy Artist',
      content: 'The brush pens are a dream to work with. Perfect for both beginners and professionals!',
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30 z-10"></div>
          <img
            src="./BackGround.webp"
            alt="Fashion Collection"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-6 z-10 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-PublicSans">
              Write Your Story with Style
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Discover premium stationery that inspires creativity. Quality tools for writing, drawing, and organizing your ideas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/product/all" 
                className="bg-white text-black hover:bg-gray-100 px-32 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                Shop Stationery <FiShoppingBag className="inline" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scrolling indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-8 h-14 border-2 border-white rounded-full flex justify-center p-1">
            <motion.div 
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ y: [0, 10] }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FiTruck size={32} />, title: 'Free Shipping', description: 'On orders over ₹499' },
              { icon: <FiShield size={32} />, title: 'Eco-Friendly', description: 'Sustainable materials' },
              { icon: <FiTag size={32} />, title: 'Student Discount', description: 'Special prices for students' }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-all duration-300"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-indigo-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Shop by Category</h2>
            <div className="w-16 h-1 bg-indigo-600 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">Browse our wide range of stationery categories</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16 xl:gap-20">
            {categories.map((category, index) => (
              <motion.div 
                key={category._id}
                className="group flex flex-col items-center w-32 sm:w-36 md:w-40"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2 }}
              >
                <Link to={category.link} className="flex flex-col items-center w-full">
                  <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-40 xl:h-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 shadow-md group-hover:shadow-lg transition-all duration-300 mb-3 overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Join thousands of satisfied students, artists, and professionals who trust our stationery.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                className="bg-white p-6 rounded-xl shadow-md"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i} 
                      className={`${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} w-5 h-5`} 
                      fill={i < testimonial.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold mr-3">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Creative</h2>
            <p className="text-indigo-100 mb-8">Subscribe for new arrivals, exclusive offers, and creative inspiration.</p>
            
            {isSubscribed ? (
              <motion.div 
                className="bg-green-500 text-white px-6 py-3 rounded-lg inline-block"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                Thank you for subscribing!
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 rounded-lg text-white border-2 border-white outline-none"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Top Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Top Products</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our most popular and trending stationery items</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {topProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Link to={`/product-dets/${product._id}`} className="block">
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={product.productPic}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.off > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {product.off}% OFF
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <button className="bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white p-2 rounded-full transition-colors">
                        <FiShoppingCart className="w-5 h-5" />
                      </button>
                      <button className="bg-white text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-full transition-colors">
                        <FiHeart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 h-12">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        {product.off > 0 && (
                          <span className="text-sm text-gray-400 line-through mr-2">
                            ₹{product.price}
                          </span>
                        )}
                        <span className="text-lg font-bold text-indigo-600">
                          ₹{calculateDiscountedPrice(product.price, product.off)}
                        </span>
                      </div>
                      <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={`w-4 h-4 ${i < 4 ? 'fill-current' : ''}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/shop" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-lg group"
            >
              View All Products
              <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
