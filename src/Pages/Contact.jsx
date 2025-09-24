import React from "react";
import Navbar from "../components/Navbar";
import { useForm } from "react-hook-form";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Contact = () => {
    const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try{
        const res = await axios.post("/api/message/message-send", data);
        toast.success(res.data.msg);
        reset();
        navigate("/");
    } catch(err){
        toast.error(err.response.data.message);
    }
  };

  return (
    <>
    <Navbar />
    <div
      className="w-full min-h-screen relative bg-cover bg-center brightness-75 contrast-95"
      style={{ backgroundImage: "url('/BackGround.webp')" }} // make sure BackGround.webp is in public/
    >
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <div className="relative z-20 flex justify-center items-center py-20">
        <fieldset className="text-white border-black/50 bg-white/20 backdrop-blur-2xl shadow-2xl shadow-black/50 px-4 pt-2 pb-6 w-[90%] md:w-[50%] lg:w-[30%] rounded-lg">
          <legend className="text-center text-2xl px-2">Contact Us</legend>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-2">
            <fieldset className="border rounded-md">
              <legend className="px-2 ml-2">Name <span>*</span></legend>
              <input
                type="text"
                placeholder="John Doe..."
                className="w-full outline-none px-2 py-1 bg-transparent text-white placeholder-gray-300"
                {...register("name", { required: "Name is required" })}
              />
            </fieldset>
            {errors.name && <p className="text-white text-sm">{errors.name.message}</p>}
            <fieldset className="border rounded-md">
              <legend className="px-2 ml-2">Email <span>*</span></legend>
              <input
                type="email"
                placeholder="example@abc.com"
                className="w-full outline-none px-2 py-1 bg-transparent text-white placeholder-gray-300"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
              />
            </fieldset>
            {errors.email && <p className="text-white text-sm">{errors.email.message}</p>}
            <fieldset className="border rounded-md">
              <legend className="px-2 ml-2">Phone No.</legend>
              <input
                type="tel"
                placeholder="1234567890"
                className="w-full outline-none px-2 py-1 bg-transparent text-white placeholder-gray-300"
                {...register("phone", {
                  minLength: { value: 10, message: "Phone must be 10 digits" },
                  maxLength: { value: 10, message: "Phone must be 10 digits" },
                  pattern: { value: /^[0-9]+$/, message: "Only numbers allowed" },
                })}
              />
            </fieldset>
            {errors.phone && <p className="text-white text-sm">{errors.phone.message}</p>}
            <fieldset className="border rounded-md">
              <legend className="px-2 ml-2">Message <span>*</span></legend>
              <textarea
                placeholder="Write your message here..."
                className="w-full outline-none resize-none h-32 px-2 py-1 bg-transparent text-white placeholder-gray-300"
                {...register("message", { required: "Message is required" })}
              />
            </fieldset>
            {errors.message && <p className="text-white text-sm">{errors.message.message}</p>}
            <div className="flex flex-col lg:flex-row gap-x-4 gap-y-2 text-white">
              <button type="submit" className="w-full py-2 text-center bg-green-500 rounded-md">
                Send
              </button>
              <button
                type="button"
                onClick={() => reset()}
                className="w-full py-2 text-center bg-gray-600 rounded-md"
              >
                Reset
              </button>
            </div>
          </form>
        </fieldset>
      </div>
    </div>
    </>
  );
};

export default Contact;
