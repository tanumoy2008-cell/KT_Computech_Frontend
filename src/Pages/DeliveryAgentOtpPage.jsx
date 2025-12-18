import React, { useEffect, useState } from 'react';
import EmailMasker from '../utils/EmailMasker';
import { useForm } from 'react-hook-form';
import axios from "../config/axios";
import { useDispatch } from 'react-redux';
import { toast } from "react-toastify";
import { loginSuccess } from '../Store/reducers/DeliveryReducer';
import { useNavigate } from 'react-router-dom';

const DeliveryAgentOtpPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const email = localStorage.getItem("deliveryAgentEmail");
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
    try {
      const res = await axios.post("/api/delivery/verify-otp", data);
      localStorage.removeItem("deliveryAgentEmail");
      toast.success(res.data.message);
      
      // Dispatch login success with user data and token
      dispatch(loginSuccess({
        agent: res.data.agent,
        token: res.data.token
      }));
      localStorage.setItem('deliveryToken', res.data.token);
      // Navigate to delivery dashboard
      navigate("/delivery");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify OTP");
    }
  }

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    
    try {
      await axios.post("/api/delivery/resend-otp", { email });
      setTimeLeft(300);
      toast.success("OTP has been resent successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className='flex justify-center items-center w-full h-screen bg-gray-50'>
      <form onSubmit={handleSubmit(submitForm)} className='border-1 flex flex-col items-center gap-y-8 rounded-lg shadow-lg bg-white py-10 px-8 w-full max-w-md'>
        <h1 className='mb-2 font-PublicSans uppercase tracking-wide text-3xl text-center text-gray-800'>Delivery Agent Verification</h1>
        
        <div className='flex flex-col items-center font-PublicSans text-center'>
          <p className='font-Inter font-semibold text-xl mb-2 text-emerald-600'>{formatTime(timeLeft)}</p>
          <p className='text-gray-600'>OTP sent to your registered email</p>
          <p className='text-lg font-semibold text-gray-800 mt-1'>{EmailMasker(email)}</p>
        </div>

        <input {...register("email")} type="hidden" value={email} />
        
        <div className='w-full space-y-2'>
          <input
            {...register("otp", {
              required: "OTP is required!",
              minLength: {
                value: 6,
                message: "OTP must be 6 digits"
              },
              maxLength: {
                value: 6,
                message: "OTP must be 6 digits"
              }
            })}
            type="text"
            className={`outline-none border-2 text-xl rounded-lg px-4 py-3 w-full text-center ${
              errors.otp ? 'border-red-500' : 'border-gray-300 focus:border-emerald-500'
            }`}
            placeholder="Enter 6-digit OTP"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
            }}
          />
          {errors.otp && (
            <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
          )}
        </div>

        <div className='w-full space-y-3'>
          <button 
            type="submit" 
            className='bg-emerald-700 hover:bg-emerald-800 w-full py-3 rounded-lg text-white font-medium transition-colors duration-200'
          >
            Verify & Continue
          </button>
          
          <button 
            type="button" 
            onClick={handleResendOtp}
            disabled={timeLeft > 0}
            className={`w-full py-3 text-white font-medium rounded-lg transition-colors duration-200 ${
              timeLeft > 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-emerald-800 hover:bg-emerald-900 cursor-pointer'
            }`}
          >
            {timeLeft > 0 ? `Resend OTP in ${formatTime(timeLeft)}` : 'Resend OTP'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeliveryAgentOtpPage;
