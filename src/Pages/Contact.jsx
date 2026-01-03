import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useForm } from "react-hook-form";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPaperPlane, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";


const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { shopData } = useSelector(state=>state.ShopReducer);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/message/message-send", data);
      toast.success(res.data.msg || 'Message sent successfully!');
      reset();
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4">
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          {/* Contact Form */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200`}
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200`}
                    {...register("phone", {
                      minLength: {
                        value: 10,
                        message: "Phone number must be 10 digits",
                      },
                      maxLength: {
                        value: 15,
                        message: "Phone number is too long",
                      },
                      pattern: {
                        value: /^[0-9\-\+\(\)\s]+$/,
                        message: "Please enter a valid phone number",
                      },
                    })}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows="5"
                    placeholder="How can we help you?"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200`}
                    {...register("message", {
                      required: "Message is required",
                      minLength: {
                        value: 10,
                        message: "Message must be at least 10 characters",
                      },
                      maxLength: {
                        value: 1000,
                        message: "Message is too long (max 1000 characters)",
                      },
                    })}></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}>
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    Clear Form
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <FaMapMarkerAlt className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Our Location
                    </h3>
                    <p className="mt-1 text-gray-600">{shopData.address || "abc location"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <FaPhone className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Phone Number
                    </h3>
                    <p className="mt-1 text-gray-600">
                      +91 {shopData.phoneNumber || "0000000000"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Mon-Fri, 9am-6pm EST
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <FaEnvelope className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Email Address
                    </h3>
                    <a
                      href={shopData.email}
                      className="mt-1 text-teal-600 hover:text-teal-800 transition-colors duration-200">
                      {shopData.email || "abcdef@gmail.com"}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Follow Us
              </h2>
              <p className="text-gray-600 mb-6">
                Stay connected with us on social media for the latest updates
                and news.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors duration-200">
                  <FaFacebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center hover:bg-teal-400 hover:text-white transition-colors duration-200">
                  <FaTwitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-teal-100 text-pink-600 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors duration-200">
                  <FaInstagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center hover:bg-teal-700 hover:text-white transition-colors duration-200">
                  <FaLinkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Map Section */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
            Find Us on the Map
          </h2>

          <div className="rounded-xl overflow-hidden shadow-xl h-96 w-full">
            <iframe
              src="https://www.google.com/maps?q=23.5345503,87.3477322&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Our Location"></iframe>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;