import {Link} from 'react-router-dom'
const UserRegister = () => {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
        <form className='w-1/3 flex flex-col gap-4 border-1 rounded-md items-center border-black/50 py-5 px-10'>
            <h1 className='text-4xl text-center leading-10 font-Syne font-semibold w-2/3'>Wellcome to KT Computech Store</h1>
            <p className='font-ZenMeduim leading-0 mt-3 text-xl font-semibold uppercase'>Register Yourself</p>
            <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-blue-400'>
                <legend className='ml-2 text-black/50 transition-colors duration-200 group-focus-within:text-black'>First Name</legend>
                <input type="text" className='w-full py-2 px-2 outline-none border-none' />
            </fieldset>
            <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-blue-400'>
                <legend className='ml-2 text-black/50 transition-colors duration-200 group-focus-within:text-black'>Last Name</legend>
                <input type="text" className='w-full py-2 px-2 outline-none border-none' />
            </fieldset>
            <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-blue-400'>
                <legend className='ml-2 text-black/50 transition-colors duration-200 group-focus-within:text-black'>Phone Number</legend>
                <input type="number" className='w-full py-2 px-2 outline-none border-none' />
            </fieldset>
            <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-blue-400'>
                <legend className='ml-2 text-black/50 transition-colors duration-200 group-focus-within:text-black'>Alternate Phone Number</legend>
                <input type="number" className='w-full py-2 px-2 outline-none border-none' />
            </fieldset>
            <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-blue-400'>
                <legend className='ml-2 text-black/50 transition-colors duration-200 group-focus-within:text-black'>PinCode</legend>
                <input type="number" className='w-full py-2 px-2 outline-none border-none' />
            </fieldset>
            <fieldset className='w-full border-2 rounded-md border-black/50 group transition-colors duration-200 focus-within:border-blue-400'>
                <legend className='ml-2 text-black/50 transition-colors duration-200 group-focus-within:text-black'>Address</legend>
                <input type="number" className='w-full py-2 px-2 outline-none border-none' />
            </fieldset>
            <button className='w-full bg-sky-500 py-2 rounded text-white font-Syne text-xl'>Register</button>
            <div className='w-full flex justify-center items-center mt-2 '>
                <p className='text-lg'>Already have an account? <Link to="/user/login" className='text-blue-500 underline cursor-pointer'>Login</Link></p>
            </div>
        </form>
    </div>
  )
}

export default UserRegister