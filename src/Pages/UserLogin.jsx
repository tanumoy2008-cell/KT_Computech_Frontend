import React, { useState } from 'react'
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import {useForm} from "react-hook-form";
import axios from "../config/axios";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import Waiting from "../assets/Waiting.json";
import Lottie from "lottie-react";
const UserLogin = () => {
    const [passShow, setpassShow] = useState(false);
    const [LoaderShow, setLoaderShow] = useState(false);
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState:{errors}
    } = useForm();

    const userLogin = async (data)=>{
        try{
            setLoaderShow(true)
            const res = await axios.post("/api/user/login", data);
            localStorage.setItem("identifier", res.data.identifier);
            toast.success("OTP send success")
            navigate("/user/otp")
        } catch(err){
            toast.error(err.response.data.message)
            setLoaderShow(false)
        }
    }

  return (
    <div className='w-full h-screen bg-zinc-400 flex justify-center items-center'>
        {LoaderShow && <div className='w-full h-full flex items-center justify-center fixed top-0 left-0 bg-emerald-200/40 backdrop-blur-lg'>
            <Lottie
            animationData={Waiting}
            loop={true}
            className="w-[90vw] md:w-[70vw] lg:w-[60vw]"
            />
        </div>
        }
        <div className='bg-white px-10 py-15 rounded-lg w-[80%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[40%] 2xl:w-[30%] border-1 border-zinc-500'>
            <h1 className='font-Jura text-4xl font-bold mb-2 text-center text-emerald-800'>User Login</h1>
            <p className='text-center font-PublicSans text-lg mb-5'>Wellcome User</p>
            <form onSubmit={handleSubmit(userLogin)} className='flex flex-col gap-y-5'>
                <div>
                <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-emerald-700'>
                <legend className='ml-2 text-black/50 transition-colors duration-200 px-2 group-focus-within:text-black'>Email or Number</legend>
                <input
                {...register("identifier",{
                    required: "email or number is required",
                })}
                type="text" placeholder='Email or Number. . .' className='w-full py-2 px-2 outline-none border-none' />
                </fieldset>
                {errors.identifier && <p className='font-mono text-red-500'>{errors.identifier.message}</p>}
                </div>
                <div>
                <div>
                <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors pr-4 duration-200 focus-within:border-emerald-700'>
                    <legend className='ml-2 text-black/50 transition-colors duration-200 px-2 group-focus-within:text-black'>Password</legend>
                    <div className='w-full flex justify-between items-center'>
                    <input
                    {...register("password",{
                        required: "password is required",
                    })}
                    type={passShow ? "text" : "password"} placeholder='Password• • • • • • •' className='w-full py-2 px-2 outline-none border-none'/>
                    {passShow ? <FaRegEye onClick={()=>setpassShow(false)} className='text-2xl cursor-pointer text-emerald-700' /> : <FaRegEyeSlash onClick={()=>setpassShow(true)} className='text-2xl cursor-pointer text-red-500' />}
                    </div>
                </fieldset>
                </div>
                {errors.password && <p className='font-mono text-red-500'>{errors.password.message}</p>}
                </div>
                <button type='submit' className='bg-emerald-800 py-3 font-PublicSans uppercase tracking-wide rounded text-xl mt-4 text-white'>Login</button>
            </form>
            <div className='w-full py-2 mt-6 flex justify-between font-PublicSans text-lg'>
                <Link to="/user/register">
                <abbr title="Register" className='no-underline'>
                    <span className='text-emerald-700'>Register Now</span>
                </abbr>
                </Link>
                <abbr title="Forget password" className='no-underline'>
                <h1 className='w-fit  text-emerald-700 cursor-pointer transition-colors duration-200 hover:text-sky-600'>Forget Password?</h1>
                </abbr>
            </div>
        </div>
    </div>
  )
}

export default UserLogin