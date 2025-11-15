import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerAdmin, clearError, selectIsLoading, selectError } from '../Store/reducers/AdminReducer';

const AdminRegister = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    
    const [passShow, setPassShow] = useState(false);
    const [confirmPassShow, setConfirmPassShow] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const password = watch("password");

    // Handle errors
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const result = await dispatch(registerAdmin(data)).unwrap();
            if (result.success) {
                toast.success("Admin registered successfully! Please login.");
                reset();
                navigate("/admin/login");
            }
        } catch (error) {
            console.error('Registration error:', error);
            // Error is handled by the error effect
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-2xl">
                <div className="p-8">
                    <div className="flex items-center mb-8">
                        <Link to="/admin/login" className="text-blue-600 hover:text-blue-800 mr-4">
                            <FaArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Create Admin Account</h1>
                            <p className="text-gray-600">Fill in the details to create a new admin account</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    {...register("name", {
                                        required: "Name is required",
                                        minLength: {
                                            value: 3,
                                            message: "Name must be at least 3 characters"
                                        }
                                    })}
                                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Please enter a valid email address"
                                        }
                                    })}
                                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
                                    placeholder="your@email.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={passShow ? "text" : "password"}
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 8,
                                                message: "Password must be at least 8 characters"
                                            },
                                            pattern: {
                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                                message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
                                            }
                                        })}
                                        className={`w-full px-4 py-3 rounded-lg border-2 ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none pr-12`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPassShow(!passShow)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {passShow ? (
                                            <FaRegEyeSlash className="w-5 h-5" />
                                        ) : (
                                            <FaRegEye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={confirmPassShow ? "text" : "password"}
                                        {...register("confirmPassword", {
                                            required: "Please confirm your password",
                                            validate: value => 
                                                value === password || "Passwords do not match"
                                        })}
                                        className={`w-full px-4 py-3 rounded-lg border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none pr-12`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setConfirmPassShow(!confirmPassShow)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {confirmPassShow ? (
                                            <FaRegEyeSlash className="w-5 h-5" />
                                        ) : (
                                            <FaRegEye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="terms"
                                type="checkbox"
                                {...register("terms", {
                                    required: "You must accept the terms and conditions"
                                })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                I agree to the <a href="#" className="text-blue-600 hover:text-blue-800">Terms and Conditions</a>
                            </label>
                        </div>
                        {errors.terms && (
                            <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/admin/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                    <p className="text-xs text-center text-gray-500">
                        &copy; {new Date().getFullYear()} KT Computech. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
