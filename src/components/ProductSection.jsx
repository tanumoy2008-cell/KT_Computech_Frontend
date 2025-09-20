import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../config/axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ProductSection = () => {
  const [topProduct, settopProduct] = useState([]);

  useEffect(() => {
    const fetchTopProduct = async () => {
      const res = await axios.get("/api/product/top-product");
      settopProduct(res.data);
    };
    fetchTopProduct();
  }, []);

  const categories = [
    {
      name: "School Stationery",
      pic: "/Categories/Study.avif",
      link: "/product/school",
    },
    {
      name: "Office Stationery",
      pic: "/Categories/Office.avif",
      link: "/product/office",
    },
    {
      name: "Art & Craft Items",
      pic: "/Categories/Art.avif",
      link: "/product/art",
    },
    {
      name: "Gift Items",
      pic: "/Categories/Gift.avif",
      link: "/product/gift",
    },
    {
      name: "House Hold Product",
      pic: "/Categories/House Hold.avif",
      link: "/product/house",
    },
  ];

  return (
    <div id="productSection" className="w-full min-h-screen px-5 md:px-10 py-10">
      {/* Categories Section */}
      <div className="w-full flex flex-col gap-y-4">
        <h1 className="text-center font-ArvoBold text-3xl md:text-5xl">
          Categories
        </h1>

        <motion.div
          className="flex items-center justify-center gap-4 flex-wrap lg:gap-x-10 xl:gap-x-20 w-full py-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          {categories.map((items, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { scale: 0.8, opacity: 0 },
                visible: { scale: 1, opacity: 1 },
              }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to={items.link}
                className="flex flex-col gap-y-2 items-center cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden border-black border-4 shadow-md"
                >
                  <img
                    className="w-full h-full object-cover brightness-80"
                    src={items.pic}
                    alt={items.name}
                  />
                </motion.div>
                <h1 className="text-sm md:text-lg lg:text-xl font-semibold font-Geist text-center">
                  {items.name}
                </h1>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Top Products Section */}
      <motion.h1
        className="text-center mb-5 text-2xl md:text-4xl font-ArvoBold"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Our Top Product's
      </motion.h1>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        {topProduct.map((item, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ProductCard data={item} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ProductSection;
