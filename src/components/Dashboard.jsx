import React, { useState } from 'react'
import { GoPencil } from "react-icons/go";
import { useForm } from 'react-hook-form';
import { useSelector } from "react-redux"
const Dashboard = () => {
    const user = useSelector(state=>state.UserReducer);

    const [editMode, setEditMode] = useState(false);

    const {register, handleSubmit, reset, formState:{errors}} = useForm({
        defaultValues: {
            firstName: user.fullName.firstName,
            lastName: user.fullName.lastName,
            phone: user.phoneNumber,
            email: user.email,
            Altphone: user.alternateNumber,
            pin: user.pinCode,
            address: user.address
        }
    })
    const onSubmit = (data) => {
        console.log(data);
        
    }

  return (
    <div className='w-full h-full flex flex-col gap-y-5 px-10 pt-15 lg:pt-5'>
        <div className='flex items-center justify-between'>
        <h1 className='font-ArvoBold text-2xl lg:text-6xl font-semibold'>Dashboard</h1>
        <div className='flex flex-col gap-y-2 items-center'>
        <button onClick={()=>setEditMode(true)} className='flex gap-x-2 items-center bg-sky-500 px-4 py-2 rounded text-white'><GoPencil/><span>Edit Profile</span></button>
        {editMode && <small className='text-red-500 font-semibold text-lg'>Edit Mode On</small>}
        </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} >
            <div className='flex gap-x-10 gap-y-5 font-Geist flex-col  lg:flex-row'>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
            <legend className='px-2 font-Geist font-semibold leading-2'>First Name</legend>
            {errors.firstName && <p className='font-mono text-red-500'>{errors.firstName.message}</p>}
            <input type="text" {...register("firstName",{
                required: "First Name is required",
                min:{
                    value: 2,
                    message: "Minimum 2 characters required"
                },
                max:{
                    value: 20,
                    message: "Maximum 20 characters allowed"
                }
            })} readOnly={!editMode} placeholder='FirstName Here. . . '  className='w-full text-lg py-2 outline-none'/>
            </fieldset>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
                <legend className='px-2 font-Geist font-semibold leading-2'>Last Name</legend>
            {errors.lastName && <p className='font-mono text-red-500'>{errors.lastName.message}</p>}
            <input type="text" {...register("lastName",{
                required: "Last Name is required",
                min:{
                    value: 2,
                    message: "Minimum 2 characters required"
                },
                max:{
                    value: 20,
                    message: "Maximum 20 characters allowed"
                }
            })} readOnly={!editMode} placeholder='LastName Here. . . ' className='w-full text-lg py-2 outline-none'/>
            </fieldset>
            </div>
            <div className='flex gap-x-10 gap-y-5 font-Geist flex-col lg:flex-row mt-5'>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
                <legend className='px-2 font-Geist font-semibold leading-2'>Number</legend>
            {errors.phone && <p className='font-mono text-red-500'>{errors.phone.message}</p>}
            <input type="number"
             {...register("phone",{
                 validAsNumber: true,
                 required: "Phone number is required",
                 min:{
                     value: 10,
                     message: "Minimum 2 characters required"
                    },
                    max:{
                        value: 10,
                        message: "Maximum 10 characters allowed"
                    },
                    validate: (value) => 
                        !isNaN(value) && value > 0 || "Phone must be a valid positive number"
                })} readOnly={!editMode} placeholder='Phone Number Here. . . ' className='w-full text-lg  py-2 outline-none'/>
            </fieldset>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
                <legend className='px-2 font-Geist font-semibold leading-2'>Email</legend>
            {errors.email && <p className='font-mono text-red-500'>{errors.email.message}</p>}
            <input type="email"
             {...register("email",{
                 required: "Email is required",
                 pattern:{
                     value: "^[^\s@]+@[^\s@]+\.[^\s@]{2,}$",
                     message: "fill proper email"
                    }
                })} readOnly={!editMode} placeholder='Email Here. . . ' className='w-full text-lg py-2 outline-none'/>
            </fieldset>
            </div>
            <div className='flex gap-x-10 gap-y-5 font-Geist flex-col lg:flex-row mt-5'>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
                <legend className='px-2 font-Geist font-semibold leading-2'>Alternate Number</legend>
            {errors.Altphone && <p className='font-mono text-red-500'>{errors.Altphone.message}</p>}
            <input type="number"
             {...register("Altphone",{
                 validAsNumber: true,
                 min:{
                     value: 10,
                    message: "Minimum 2 characters required"
                },
                max:{
                    value: 10,
                    message: "Maximum 10 characters allowed"
                },
                validate: (value) => 
                    !isNaN(value) && value > 0 || "Phone must be a valid positive number"
            })} readOnly={!editMode} placeholder='Alternate Number Here. . . ' className='w-full text-lg py-2 outline-none'/>
            </fieldset>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
                <legend className='px-2 font-Geist font-semibold leading-2'>Pin Code</legend>
            {errors.pin && <p className='font-mono text-red-500'>{errors.pin.message}</p>}
            <input type="number"
             {...register("pin",{
                 validAsNumber: true,
                 required: "Pin is required",
                 min:{
                     value: 6,
                    message: "Minimum 2 characters required"
                },
                max:{
                    value: 6,
                    message: "Maximum 10 characters allowed"
                },
                validate: (value) => 
                    !isNaN(value) && value > 0 || "Pin must be a valid positive number"
                })} readOnly={!editMode} placeholder='PinCode Here. . . ' className='w-full text-lg py-2 outline-none'/>
            </fieldset>
            </div>
            <fieldset className='w-full border border-black rounded-lg mt-5 px-3 py-2'>
                <legend className='px-2 font-Geist font-semibold leading-2'>Address</legend>
            {errors.address && <p className='font-mono text-red-500'>{errors.address.message}</p>}
            <textarea type="text"
             {...register("address",{
                 validAsNumber: true,
                 required: "Pin is required",
                 min:{
                     value: 6,
                    message: "Minimum 2 characters required"
                },
                max:{
                    value: 50,
                    message: "Maximum 50 characters allowed"
                },
                })} readOnly={!editMode} placeholder='Address Here. . . ' className='w-full resize-none h-40 text-lg py-2 outline-none'></ textarea>
            </fieldset>
            {editMode && <div className='flex gap-x-5 mt-5 w-full md:w-1/2'>
                <button type='submit' className='px-4 py-2 md:text-xl w-full rounded-md bg-green-400 text-white'>Save</button>
                <button onClick={()=>{
                    setEditMode(false);
                    reset();
                }} type="button" className='px-4 py-2 md:text-xl w-full rounded-md bg-zinc-400 text-white'>Cancel</button>
            </div>}
        </form>
    </div>
  )
}

export default Dashboard