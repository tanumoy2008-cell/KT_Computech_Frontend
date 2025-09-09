import React, { useState } from 'react'
import { GoPencil } from "react-icons/go";
import { useForm } from 'react-hook-form';
const Dashbord = () => {
    const [editMode, setEditMode] = useState(false);

    const {register, handleSubmit, reset, formState:{errors}} = useForm({
        defaultValues: {
            firstName: "Suvam",
            lastName: "Chakraborti",
            phone: "9876543210",
            email: "abc@gmail.com",
            Altphone: "9876543210",
            pin: "700135"
        }
    })
    const onSubmit = (data) => {
        console.log(data);
        
    }

  return (
    <div className='w-full h-full flex flex-col gap-y-5 pt-15 lg:pt-0'>
        <div className='flex items-center justify-between'>
        <h1 className='font-Syne text-2xl lg:text-6xl font-semibold'>Dashboard</h1>
        <div className='flex flex-col gap-y-2 items-center'>
        <button onClick={()=>setEditMode(true)} className='flex gap-x-2 items-center bg-sky-500 px-4 py-2 rounded text-white'><GoPencil/><span>Edit Profile</span></button>
        {editMode && <small className='text-red-500 font-semibold text-lg'>Edit Mode On</small>}
        </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} >
            <div className='flex gap-x-10 gap-y-5 font-ZenMeduim flex-col  lg:flex-row'>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
            <legend className='px-2 font-ZenRegular font-semibold leading-2'>First Name</legend>
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
            })} readOnly={!editMode}  className='w-full text-lg py-2 outline-none'/>
            </fieldset>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
                <legend className='px-2 font-ZenRegular font-semibold leading-2'>Last Name</legend>
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
            })} readOnly={!editMode} className='w-full text-lg py-2 outline-none'/>
            </fieldset>
            </div>
            <div className='flex gap-x-10 gap-y-5 font-ZenMeduim flex-col lg:flex-row mt-5'>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
                <legend className='px-2 font-ZenRegular font-semibold leading-2'>Number</legend>
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
                })} readOnly={!editMode} className='w-full text-lg  py-2 outline-none'/>
            </fieldset>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
                <legend className='px-2 font-ZenRegular font-semibold leading-2'>Email</legend>
            {errors.email && <p className='font-mono text-red-500'>{errors.email.message}</p>}
            <input type="email"
             {...register("email",{
                 required: "Email is required",
                 pattern:{
                     value: "^[^\s@]+@[^\s@]+\.[^\s@]{2,}$",
                     message: "fill proper email"
                    }
                })} readOnly={!editMode} className='w-full text-lg py-2 outline-none'/>
            </fieldset>
            </div>
            <div className='flex gap-x-10 gap-y-5 font-ZenMeduim flex-col lg:flex-row mt-5'>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
                <legend className='px-2 font-ZenRegular font-semibold leading-2'>Alternate Number</legend>
            {errors.phone && <p className='font-mono text-red-500'>{errors.phone.message}</p>}
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
            })} readOnly={!editMode} className='w-full text-lg py-2 outline-none'/>
            </fieldset>
            <fieldset className='w-full border border-black rounded-lg px-3 py-2'>
                <legend className='px-2 font-ZenRegular font-semibold leading-2'>Pin Code</legend>
            {errors.email && <p className='font-mono text-red-500'>{errors.email.message}</p>}
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
                })} readOnly={!editMode} className='w-full text-lg py-2 outline-none'/>
            </fieldset>
            </div>
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

export default Dashbord