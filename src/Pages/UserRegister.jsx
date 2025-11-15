import {Link, useNavigate} from 'react-router-dom';
import {useForm} from "react-hook-form";
import { ImEyeBlocked } from "react-icons/im";
import { ImEye } from "react-icons/im";
import { useState } from 'react';
import axios from "../config/axios";
import { toast } from "react-toastify";
const UserRegister = () => {
    const navigate = useNavigate();
    const [view, setview] = useState(false);
    const {register, handleSubmit, formState:{errors}} = useForm();
    const submitHandel = async ( data ) =>{
        try{
            const res = await axios.post("/api/user/register", data);
            localStorage.setItem("identifier", res.data.identifier);
            toast.success("OTP send success")
            navigate("/user/otp")
        } catch(err){
            toast.error(err.response.data.message)
        }
    }
  return (
    <div className='w-full min-h-screen flex bg-zinc-400 justify-center items-center py-10 md:py-0'>
        <form onSubmit={handleSubmit(submitHandel)} className='flex flex-col bg-white gap-4 border-1 rounded-md items-center border-black/50 w-[80%] md:w-[85%] lg:w-[70%] py-10 px-4 lg:px-15'>
            <h1 className='text-4xl text-center leading-10 font-PublicSans font-semibold w-full text-emerald-800'>Wellcome to KTC Store</h1>
            <p className='font-PublicSans leading-0 mt-3 text-xl font-semibold uppercase'>Register Yourself</p>
            <div className='flex w-full flex-col gap-y-4'>
                <div className='w-full flex flex-col md:flex-row gap-y-4 gap-x-4'>
                    <div className='w-full'>
                        <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-emerald-700'>
                            <legend className='ml-4 px-1 text-black/50 transition-colors duration-200 group-focus-within:text-black'>First Name <span className='text-rose-500'>*</span></legend>
                            <input 
                            {...register("firstName",{
                                required: "First name is required.",
                                min:{
                                    value: 2,
                                    message: "firstname atleast hold 2 charecter"
                                },
                                max:{
                                    value: 25,
                                    message: "firstname must be in 25 charecter"
                                }
                            })}
                            placeholder='eg(John. . .)' type="text" className='w-full py-2 px-2 outline-none border-none' />
                        </fieldset>
                {errors.firstName && <p>{errors.firstName.message}</p>}
                    </div>
                    <div className='w-full'>
                        <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-emerald-700'>
                            <legend className='ml-4 px-1 text-black/50 transition-colors duration-200 group-focus-within:text-black'>Last Name <span className='text-rose-500'>*</span></legend>
                            <input 
                            {...register("lastName",{
                                required: "Last name is required.",
                                min:{
                                    value: 2,
                                    message: "lastname atleast hold 2 charecter"
                                },
                                max:{
                                    value: 25,
                                    message: "lastname must be in 25 charecter"
                                }
                            })}
                            type="text" placeholder='eg(Doe. . .)' className='w-full py-2 px-2 outline-none border-none' />
                        </fieldset>
                {errors.lastName && <p>{errors.lastName.message}</p>}
                    </div>
                </div>
                <div className='w-full flex flex-col md:flex-row gap-y-4 gap-x-4'>
                    <div className='w-full'>
                        <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-emerald-700'>
                            <legend className='ml-4 px-1 text-black/50 transition-colors duration-200 group-focus-within:text-black'>Email <span className='text-rose-500'>*</span></legend>
                            <input 
                            {...register("email",{
                                required: "Email is required.",
                                pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                                message: "Enter a valid email address."
                                },
                                minLength: {
                                value: 5,
                                message: "Email must be at least 5 characters."
                                },
                                maxLength: {
                                value: 50,
                                message: "Email must not exceed 50 characters."
                                }
                            })}
                            placeholder='eg(example@email.com)' type="email" className='w-full py-2 px-2 outline-none border-none' />
                        </fieldset>
                {errors.email && <p>{errors.email.message}</p>}
                    </div>
                    <div className='w-full'>
                        <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-emerald-700'>
                            <legend className='ml-4 px-1 text-black/50 transition-colors duration-200 group-focus-within:text-black'>Password <span className='text-rose-500'>*</span></legend>
                            <div className='flex items-center pr-4'>
                            <input 
                            {...register("password", {
                                required: "Password is required.",
                                minLength: {
                                value: 8,
                                message: "Password must be at least 8 characters."
                                },
                                maxLength: {
                                value: 20,
                                message: "Password must not exceed 20 characters."
                                },
                                pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message: "Password must include uppercase, lowercase, number, and special character."
                                }
                            })}
                            type={view ? "text" : "password"} placeholder='••••••••'  className='w-full py-2 px-2 outline-none border-none' />
                            {view ? <ImEye className='text-emerald-700' onClick={()=>setview(false)} /> : <ImEyeBlocked className='text-rose-600' onClick={()=>setview(true)} /> }
                            </div>
                        </fieldset>
                    {errors.password && <p>{errors.password.message}</p>}
                    </div>
                </div>
                <div className='w-full flex flex-col md:flex-row gap-y-4 gap-x-4'>
                    <div className='w-full'>
                        <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-emerald-700'>
                            <legend className='ml-4 px-1 text-black/50 transition-colors duration-200 group-focus-within:text-black'>Phone Number <span className='text-rose-500'>*</span></legend>
                            <input 
                            {...register("number",{
                            required: "Phone number is required.",
                                minLength: {
                                value: 10,
                                message: "Phone number must be at least 10 digits."
                                },
                                maxLength: {
                                value: 15,
                                message: "Phone number must not exceed 15 digits."
                                },
                                pattern: {
                                value: /^[0-9]+$/,
                                message: "Only digits are allowed."
                                }
                            })}
                            placeholder='##########' type="tel" className='w-full py-2 px-2 outline-none border-none' />
                        </fieldset>
                {errors.number && <p>{errors.number.message}</p>}
                    </div>
                    <div className='w-full'>
                        <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-emerald-700'>
                            <legend className='ml-4 px-1 text-black/50 transition-colors duration-200 group-focus-within:text-black'>Alternate Phone Number</legend>
                            <input 
                            {...register("altnumber",{
                                minLength: {
                                value: 10,
                                message: "Phone number must be at least 10 digits."
                                },
                                maxLength: {
                                value: 15,
                                message: "Phone number must not exceed 15 digits."
                                },
                                pattern: {
                                value: /^[0-9]+$/,
                                message: "Only digits are allowed."
                                }
                            })}
                            placeholder='##########' type="number" className='w-full py-2 px-2 outline-none border-none' />
                        </fieldset>
                    {errors.altnumber && <p>{errors.altnumber.message}</p>}
                    </div>
                </div>
                <div className='w-full flex flex-col md:flex-row gap-y-4 gap-x-4'>
                    <div className='w-full'>
                         <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-emerald-700'>
                            <legend className='ml-4 px-1 text-black/50 transition-colors duration-200 group-focus-within:text-black'>PinCode</legend>
                            <input 
                            {...register("pinCode",{
                                pattern: {
                                value: /^[1-9][0-9]{5}$/, 
                                message: "Enter a valid 6-digit pincode."
                                }
                            })}
                            type="number" placeholder='e.g. 700001' className='w-full py-2 px-2 outline-none border-none' />
                        </fieldset>
                {errors.pinCode && <p>{errors.pinCode.message}</p>}
                    </div>
                    <div className='w-full'>
                        <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-emerald-700'>
                            <legend className='ml-4 px-1 text-black/50 transition-colors duration-200 group-focus-within:text-black'>Address</legend>
                            <input 
                            {...register("address", {
                                minLength: {
                                value: 5,
                                message: "Address must be at least 5 characters."
                                },
                                maxLength: {
                                value: 100,
                                message: "Address must not exceed 100 characters."
                                },
                                pattern: {
                                value: /^[a-zA-Z0-9\s,.-/#]+$/, 
                                message: "Address contains invalid characters."
                                }
                            })}
                            type="text" placeholder='eg(ABC Colony. . .)'  className='w-full py-2 px-2 outline-none border-none' />
                        </fieldset>
                    {errors.address && <p>{errors.address.message}</p>}
                    </div>
                </div>
            </div>
            <button type='submit' className='w-full bg-emerald-700 py-4 rounded text-white font-PublicSans text-xl'>Register</button>
            <div className='w-full flex justify-center items-center mt-2 '>
                <p className='text-lg text-center font-PublicSans font-semibold'>Already have an account? <Link to="/user/login" className='text-emerald-700 underline cursor-pointer'>Login</Link></p>
            </div>
        </form>
    </div>
  )
}

export default UserRegister