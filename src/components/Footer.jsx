import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <div className='w-full py-2 font-ArvoBold bg-white border-t-2 border-zinc-500/50'>
      <div className="w-full py-10 px-10 flex gap-x-10">
        <div className="w-full flex flex-col gap-y-10 lg:flex-row justify-around">
            <ul className="flex flex-col gap-y-5 text-xl">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/product">Product</Link>
              </li>
              <li>
                <Link>About</Link>
              </li>
              <li>
                <Link>Contact Us</Link>
              </li>
            </ul>
            <div className="flex flex-col gap-y-5 text-xl">
              <p>Office: Sanchita Park</p>
              <p>City: Durgapur - 713206</p>
              <p>State: West Bengal</p>
              <p>Phone: +91 7365028035 ( Mobile & WhatsApp )</p>
              <a href="mailto:ktcomputech@outlook.com">ktcomputech@outlook.com</a>
            </div>
            <ul className="flex flex-col gap-y-5 text-xl">
              <li>
                <Link to="/admin">Admin</Link>
              </li>
              <li>
                <Link>FAQ</Link>
              </li>
              <li>
                <Link>Canceling & Refund Policy</Link>
              </li>
              <li>
                <Link>Cookie Policy</Link>
              </li>
              <li>
                <Link>Privacy Policy</Link>
              </li>
            </ul>
        </div>
      </div>
        <h1 className='text-center text-xl'> &copy; CopyRight by KT Computech {new Date().getFullYear()}.</h1>
    </div>
  )
}

export default Footer