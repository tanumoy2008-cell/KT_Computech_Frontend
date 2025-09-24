import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  return (
    <div className="w-full bg-zinc-900 text-gray-300 font-PublicSans border-t border-zinc-700">
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 justify-between">
        
        {/* Quick Links */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="flex flex-col gap-5 text-lg"
        >
          <h2 className="text-white font-semibold text-xl mb-3">Quick Links</h2>
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/product" className="hover:text-white transition-colors">Product</Link>
          <Link className="hover:text-white transition-colors">About</Link>
          <Link className="hover:text-white transition-colors">Contact Us</Link>
        </motion.div>

        {/* Office Info */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          variants={fadeUp}
          className="flex flex-col gap-3 text-lg"
        >
          <h2 className="text-white font-semibold text-xl mb-3">Contact Info</h2>
          <p>Office: Sanchita Park</p>
          <p>City: Durgapur - 713206</p>
          <p>State: West Bengal</p>
          <p>Phone: +91 7365028035 (Mobile & WhatsApp)</p>
          <a href="mailto:ktcomputech@outlook.com" className="hover:text-white transition-colors">
            ktcomputech@outlook.com
          </a>
        </motion.div>

        {/* Policies */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={2}
          variants={fadeUp}
          className="flex flex-col gap-5 text-lg"
        >
          <h2 className="text-white font-semibold text-xl mb-3">Policies</h2>
          <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
          <Link className="hover:text-white transition-colors">FAQ</Link>
          <Link className="hover:text-white transition-colors">Cancelling & Refund Policy</Link>
          <Link className="hover:text-white transition-colors">Cookie Policy</Link>
          <Link className="hover:text-white transition-colors">Privacy Policy</Link>
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-lg text-gray-400 py-5"
      >
        &copy; CopyRight by KT Computech {new Date().getFullYear()}.
      </motion.h1>
    </div>
  );
};

export default Footer;
