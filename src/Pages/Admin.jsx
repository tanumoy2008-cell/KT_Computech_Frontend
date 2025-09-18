import { useState } from "react"
import ProductAdder from "../components/ProductAdder"
import Products from "../components/Products";
import Settings from "../components/Settings";
import { useNavigate } from "react-router-dom";

const Admin = () => {
    const [contextViewer, setcontextViewer] = useState("");
    const navigate = useNavigate()
    let contant = <ProductAdder />;
    switch(contextViewer){
        case "home":
           contant = <ProductAdder />
            break;
        case "product" :
            contant = <Products />
            break;
        case "setting" : 
            contant = <Settings />
            break;
        default :
        break;
    }
  return (
    <div className='relative w-full min-h-screen flex'>
        <div className='h-screen w-96 flex flex-col gap-y-20 items-center justify-center font-ArvoBold text-4xl'>
            <h1 onClick={()=>setcontextViewer("home")} className='cursor-pointer font-Jura font-black mb-10 italic text-5xl w-full text-center'>KT Computech</h1>
            <h1 onClick={()=>navigate("/")} className='cursor-pointer w-full text-center'>Home</h1>
            <h1 onClick={()=>setcontextViewer("home")} className='cursor-pointer w-full text-center'>Product Add</h1>
            <h1 onClick={()=>setcontextViewer("product")} className='cursor-pointer w-full text-center'>Products</h1>
            <h1 onClick={()=>setcontextViewer("setting")} className='cursor-pointer w-full text-center'>Setting</h1>
            <h1 className='cursor-pointer w-full text-center'>LogOut</h1>
        </div>
        {contant}
    </div>
  )
}

export default Admin