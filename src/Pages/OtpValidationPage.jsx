import React, { useEffect, useState } from 'react'
import EmailMasker from '../utils/EmailMasker';
import { useForm } from 'react-hook-form';
import axios from "../config/axios";
import { useDispatch } from 'react-redux';
import {toast} from "react-toastify";
import { login } from '../Store/reducers/UserReducer';
import { useNavigate } from 'react-router-dom';

const OtpValidationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {register, handleSubmit, formState:{errors}} = useForm();
  const email = localStorage.getItem("identifier");
  const [timeLeft, setTimeLeft] = useState(300);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };
  
  const submitForm = async (data) => {
    try{
      const res = await axios.post("/api/user/verify-otp", data);
      // persist token (if server returned) and set axios header for user requests
      const token = res.data?.token || res.headers?.['x-user-token'];
      if (token) {
        try {
          localStorage.setItem('userToken', token);
          axios.defaults.headers.common['x-user-token'] = token;
        } catch (e) {}
      }

      localStorage.removeItem("identifier");
      toast.success(res.data.message);
      dispatch(login(res.data.metaData));
      navigate("/product/all");
    } catch(err){
       toast.error(err.response.data.message)
    }
  }
  return (
    <div className='flex justify-center items-center w-full h-screen'>
        <form onSubmit={handleSubmit(submitForm)} className='border-1 flex flex-col items-center gap-y-8 rounded-md border-black/50 py-10 px-10'>
        <h1 className='mb-2 font-PublicSans uppercase tracking-wide text-4xl'>otp varification</h1>
        <div className='flex flex-col items-center font-PublicSans'>
        <p className='font-Inter font-semibold text-xl'>{formatTime(timeLeft)}</p>
        <p>OTP send to this account (Check the Inbox or Spam section)</p>
        <p className='text-lg font-semibold leading-5'>{EmailMasker(email)}</p>
        </div>
        <input {...register("email")} type="hidden" value={email} />
            <input
            {...register("otp",{
              required: "otp is required!"
            })}
              type="text"
              className="outline-none border text-xl border-black/50 rounded-lg px-4 py-2 w-full text-center"
              placeholder="######"
              onInput={(e) => {
                if (e.target.value.length > 6) {
                  e.target.value = e.target.value.slice(0, 6);
                }
              }}
            />
            <div className='w-full flex flex-col gap-y-4'>
            <button className='bg-emerald-700 w-full py-2 rounded-lg text-white cursor-pointer active:bg-emerald-500'>Verify</button>
            <button type="button" className={`w-full py-2 text-white cursor-pointer rounded-lg ${timeLeft < 1 ? "bg-zinc-500" : "bg-emerald-800"}`}>Re-send OTP</button>
            </div>
        </form>
    </div>
  )
}

export default OtpValidationPage