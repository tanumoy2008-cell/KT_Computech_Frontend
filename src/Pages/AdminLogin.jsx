import React, { useState } from 'react'
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import {useForm} from "react-hook-form";
import axios from "../config/axios";
import {useDispatch} from "react-redux"
import { login } from '../Store/reducers/AdminReducer';
import { useNavigate } from 'react-router-dom';
const AdminLogin = () => {
    const dispatch = useDispatch()
    const [passShow, setpassShow] = useState(false);
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState:{errors}
    } = useForm();

    const adminLogin = async (data)=>{
        const res = await axios.post("/api/admin/login", data);
        dispatch(login(res.data.hiddenDetsAdmin));
        navigate("/admin")
    }

  return (
    <div className='w-full h-screen bg-zinc-300 flex justify-center items-center'>
        <div className='bg-white px-10 py-15 rounded-lg w-[80%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[40%] 2xl:w-[30%] border-1 border-zinc-500'>
            <h1 className='font-Jura text-4xl font-bold mb-2 text-center'>Admin Login</h1>
            <p className='text-center font-PublicSans text-lg mb-5'>Wellcome Admin</p>
            <form onSubmit={handleSubmit(adminLogin)} className='flex flex-col gap-y-5'>
                <div>
                {errors.email && <p className='font-mono text-red-500'>{errors.email.message}</p>}
                <input
                {...register("email",{
                    required: "email is required",
                    pattern:{
                        value: "^[^\s@]+@[^\s@]+\.[^\s@]{2,}$",
                        message: "fill proper email"
                    }
                })}
                type="email" placeholder='Email. . .' className='border-2 invalid:border-rose-400 rounded border-zinc-500 outline-none w-full px-4 py-4' />
                </div>
                <div>
                {errors.password && <p className='font-mono text-red-500'>{errors.password.message}</p>}
                <div className='w-full flex items-center pr-5 rounded border-zinc-500 border-2'>
                    <input
                    {...register("password",{
                        required: "password is required",
                    })}
                    type={passShow ? "text" : "password"} placeholder='Company Password Change• • • • • • •' className='w-full outline-none border-none px-4 py-4'/>
                    {passShow ? <FaRegEye onClick={()=>setpassShow(false)} className='text-2xl cursor-pointer text-green-500' /> : <FaRegEyeSlash onClick={()=>setpassShow(true)} className='text-2xl cursor-pointer text-red-500' />}
                </div>
                </div>
                <button type='submit' className='bg-blue-500 py-3 font-PublicSans rounded text-2xl mt-4 text-white'>Login</button>
            </form>
            <div className='w-full py-2 mt-6 flex justify-end'>
                <abbr title="Forget password" className='no-underline'>
                <h1 className='w-fit font-PublicSans text-xl text-blue-700 cursor-pointer transition-colors duration-200 hover:text-sky-600'>Forget Password?</h1>
                </abbr>
            </div>
        </div>
    </div>
  )
}

export default AdminLogin