import { Link, useNavigate } from "react-router-dom"

const LandingPage = () => {
  return (
    <div className='w-full h-screen relative'>
       
        <img className='w-full h-full object-cover brightness-70' src="./20250828_1512_Colorful Cartoon Notebooks_remix_01k3r0rwy8e1natft20qsqzaz2.webp" alt="landing Photo" />

        <div className='w-full h-full absolute top-0 left-0 flex justify-center items-center'>
            <div className='bg-white max-w-[90vw] px-6 py-4 drop-shadow-2xl flex flex-col items-center gap-y-2 md:gap-y-8 md:py-10 md:px-20 xl:gap-y-5 xl:px-20 xl:py-15 2xl:gap-y-10 2xl:px-30 2xl:py-20'>
                <h1 className='text-[2.2rem] text-center md:text-5xl xl:text-7xl 2xl:text-8xl font-Syne uppercase font-bold'>KT Computech</h1>
                <p className='text-center text-xl tracking-tight leading-14 md:text-2xl xl:text-3xl 2xl:text-4xl font-medium capitalize font-ZenRegular'>One Stop Solution For School Items, Office Items, Gift Items, Craft Items, Household Products, Print, Xerox, Lamination, Recharge, Spiral Binding, Online Khajna Payment, Holding Tax Payments, Electric Bill Payment, Water Bill Payment And Many More.</p>
                <Link to="/product" className='text-2xl font-Jura font-semibold py-2 mt-4 border-b-2 px-4 rounded transition-clolors duration-500 hover:bg-black hover:text-white md:text-4xl xl:text-4xl 2xl:text-4xl cursor-pointer'>
                    view product
                </Link>
            </div>
        </div>

    </div>
  )
}

export default LandingPage