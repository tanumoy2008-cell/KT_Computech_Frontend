import React, { useRef, useState }  from 'react'
import {useForm} from "react-hook-form"
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
const Settings = () => {
   const imageCard = useRef(null)
  const imageTaker = useRef(null)
  const [image, setimage] = useState("")
  const [passShow, setpassShow] = useState(false)
          const {register, handleSubmit, formState:{errors}, reset} = useForm({
              defaultValues:{
                  name:"",
                  company:"",
                  category:"",
                  productImage:"",
                  productDescription:[],
              }
          });
        const formSubmit = (data)=>{
            console.log(data)
        }
    
        const ImageTaking = ()=>{
            if(imageTaker.current){
                imageTaker.current.click();
            }
            return;
        }
        const handleImageSelect = () => {
        const file = imageTaker.current.files[0];
        if (file) {
          const imageUrl = URL.createObjectURL(file); 
          setimage(imageUrl)
        }
      };
  return (
    <div className='w-full h-screen bg-zinc-800 px-10 py-5 flex flex-col gap-y-5'>
        <div className='w-full h-full bg-white rounded-2xl px-10 py-15'>
          <form>
        <div className='flex gap-x-10'>
          <div className='h-[35vh] overflow-hidden bg-zinc-300 border-10 border-zinc-400 border-dashed rounded-2xl w-[40%] flex items-center'>
            <img ref={imageCard} onClick={ImageTaking} className="mx-auto h-full object-contain object-center" src={ image  || "./imagePlaceholder.png"} alt="" />
                    <input ref={imageTaker} onChange={handleImageSelect} type="file" accept="image/*" className='hidden'/>
          </div>
          <div className='w-1/2 py-10 flex flex-col itmes-end gap-y-5'>
          <h1 className='font-ArvoBold text-4xl text-center'>Edit Details</h1>
          <input type="text" placeholder='Company Name. . .' className='w-full outline-none px-4 py-4 rounded border-zinc-500 border-2'/>
          <input type="email" placeholder='Company Email. . .' className='w-full outline-none px-4 py-4 rounded border-zinc-500 border-2'/>
          <div className='w-full flex items-center pr-5 rounded border-zinc-500 border-2'>
          <input type={passShow ? "text" : "password"} placeholder='Company Password Change• • • • • • •' className='w-full outline-none border-none px-4 py-4'/>
          {passShow ? <FaRegEye onClick={()=>setpassShow(false)} className='text-2xl text-green-500' /> : <FaRegEyeSlash onClick={()=>setpassShow(true)} className='text-2xl text-red-500' />}
          </div>
          </div>
        </div>
        <textarea placeholder='Company About Section. . .' className='w-full py-4 px-6 rounded-lg border-zinc-500 h-[35vh] resize-none border-2 outline-none'></textarea>
           <div className='flex gap-x-4 mt-5'>
              <button type="submit" className='w-full text-center py-3 outline-none rounded-lg text-white font-Jura uppercase text-2xl transition-colors duration-200 bg-sky-400 active:bg-sky-600'>Add</button>
              <button onClick={()=>setimage("")} type='reset' className='w-full text-center py-3 outline-none rounded-lg text-white font-Jura uppercase text-2xl transition-colors duration-200 bg-red-400 active:bg-red-600'>Reset</button>
              </div>
          </form>
        </div>
    </div>
  )
}

export default Settings