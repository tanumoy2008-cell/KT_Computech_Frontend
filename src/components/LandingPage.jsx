import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import Lottie from "lottie-react";
import topProductAnimation from "../assets/TopProductAnimation.json";
import calculateDiscountedPrice from "../utils/PercentageCalculate";

const LandingPage = () => {
  const navigate = useNavigate();
  const [topProduct, setTopProduct] = useState({});

  useEffect(() => {
    const fetchTopProduct = async () => {
      const product = await axios.get("/api/product/top-most-product");
      setTopProduct(product.data);
    };
    fetchTopProduct();
  }, []);

  const newPrice = calculateDiscountedPrice(topProduct.price, topProduct.off);

  return (
    <div className="w-full min-h-screen relative lg:pt-40">
      {/* Background image */}
      <img
        className="absolute top-0 left-0 w-full h-full object-cover brightness-70 -z-10"
        src="./20250828_1512_Colorful Cartoon Notebooks_remix_01k3r0rwy8e1natft20qsqzaz2.webp"
        alt="landing Photo"
      />

      {/* Overlay content */}
      <div className="w-full h-full flex flex-col lg:flex-row gap-y-5 px-10 py-20 lg:py-0 gap-x-10 justify-center items-center">
        {/* Top Product Card */}
        <div className="w-[90%] lg:w-[40%] h-[50vh] lg:h-[60vh] relative border rounded-xl overflow-hidden">
          <img
            className="w-full h-full object-cover contrast-125 brightness-20 animate-wiggle"
            src={topProduct.productPic}
            alt={topProduct.name}
          />
          <div className="w-full h-full flex flex-col gap-y-5 items-center justify-center text-white backdrop-blur-[2px] absolute top-0 left-0 z-20">
            <h1 className="text-4xl 2xl:text-5xl font-Syne text-center">
              {topProduct.name}
            </h1>
            <p className="text-3xl font-ZenMeduim">
              {topProduct.off !== 0 && (
                <del className="text-zinc-200">₹{topProduct.price}/-</del>
              )}{" "}
              ₹{newPrice}/-{" "}
              {topProduct.off !== 0 && (
                <sup className="text-green-400 font-semibold">
                  {topProduct.off}%Off
                </sup>
              )}
            </p>
            <button
              onClick={() => navigate(`/product-dets/${topProduct._id}`)}
              className="bg-white text-black font-Syne text-2xl cursor-pointer rounded-full mt-10 px-20 py-2"
            >
              Buy Now
            </button>
            <Lottie
              animationData={topProductAnimation}
              loop={true}
              className="scale-110 top-[70%] lg:scale-100 lg:top-1/2 absolute left-2/3"
            />
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white w-[90%] lg:w-[60%] px-6 py-4 rounded-xl drop-shadow-2xl flex flex-col items-center gap-y-2 md:gap-y-8 md:py-10 md:px-20 xl:gap-y-5 xl:px-20 xl:py-15 2xl:gap-y-10 2xl:px-30 2xl:py-20">
          <h1 className="text-[2.2rem] text-center md:text-5xl xl:text-7xl 2xl:text-6xl font-Syne uppercase font-bold">
            KT Computech
          </h1>
          <p className="text-center text-xl tracking-tight leading-9 lg:leading-14 md:text-2xl xl:text-3xl 2xl:text-2xl font-medium capitalize font-ZenRegular">
            One Stop Solution For School Items, Office Items, Gift Items, Craft
            Items, Household Products, Print, Xerox, Lamination, Recharge,
            Spiral Binding, Online Khajna Payment, Holding Tax Payments,
            Electric Bill Payment, Water Bill Payment And Many More.
          </p>
          <Link
            to="/product/all"
            className="text-2xl font-Jura font-semibold py-2 mt-4 border-b-2 px-4 rounded transition-colors duration-500 hover:bg-black hover:text-white md:text-4xl xl:text-4xl 2xl:text-4xl cursor-pointer"
          >
            view product
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
