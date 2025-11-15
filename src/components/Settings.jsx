import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiUpload, FiSave, FiX, FiUser, FiMail, FiLock, FiGlobe, FiBell, FiMoon, FiSun } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from '../config/axios';

const Settings = () => {
  const [currentTab, setCurrentTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = React.useRef(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const newPassword = watch('newPassword');

  useEffect(() => {
    // Load admin data
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('/api/admin/profile');
        setAdminData(response.data.data);
        // Pre-fill the form with existing data
        reset({
          name: response.data.data.name,
          email: response.data.data.email,
        });
        if (response.data.data.avatar) {
          setProfileImage(response.data.data.avatar);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load profile data');
      }
    };

    fetchAdminData();
    
    // Check for dark mode preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, [reset]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const onSubmitProfile = async (data) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      if (fileInputRef.current?.files[0]) {
        formData.append('avatar', fileInputRef.current.files[0]);
      }
      formData.append('name', data.name);
      formData.append('email', data.email);

      const response = await axios.patch('/api/admin/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setAdminData(response.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/api/admin/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      toast.success('Password updated successfully');
      // Reset the form
      reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdatePreferences = async (data) => {
    try {
      setIsLoading(true);
      // Here you would typically send the preferences to your API
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
            <div className="flex flex-col items-center py-4">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
                >
                  <FiUpload className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {adminData?.name || 'Admin User'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {adminData?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setCurrentTab('profile')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentTab === 'profile'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              <FiUser className="w-5 h-5 mr-3" />
              Profile
            </button>
            <button
              onClick={() => setCurrentTab('password')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentTab === 'password'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              <FiLock className="w-5 h-5 mr-3" />
              Password
            </button>
            <button
              onClick={() => setCurrentTab('preferences')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentTab === 'preferences'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              <FiBell className="w-5 h-5 mr-3" />
              Preferences
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentTab === 'profile' && 'Profile Information'}
                {currentTab === 'password' && 'Update Password'}
                {currentTab === 'preferences' && 'Preferences'}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {currentTab === 'profile' && 'Update your account profile information.'}
                {currentTab === 'password' && 'Ensure your account is using a long, random password to stay secure.'}
                {currentTab === 'preferences' && 'Manage your application preferences.'}
              </p>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {currentTab === 'profile' && (
                <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          {...register('name', {
                            required: 'Name is required',
                            minLength: {
                              value: 3,
                              message: 'Name must be at least 3 characters',
                            },
                          })}
                          className={`pl-10 block w-full rounded-md shadow-sm ${
                            errors.name
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
                          }`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address',
                            },
                          })}
                          className={`pl-10 block w-full rounded-md shadow-sm ${
                            errors.email
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
                          }`}
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Password Tab */}
              {currentTab === 'password' && (
                <form onSubmit={handleSubmit(onChangePassword)} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        {...register('currentPassword', {
                          required: 'Current password is required',
                        })}
                        className={`pl-10 pr-10 block w-full rounded-md shadow-sm ${
                          errors.currentPassword
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      >
                        {showCurrentPassword ? (
                          <FiEyeOff className="h-5 w-5" />
                        ) : (
                          <FiEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          {...register('newPassword', {
                            required: 'New password is required',
                            minLength: {
                              value: 8,
                              message: 'Password must be at least 8 characters',
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                              message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
                            },
                          })}
                          className={`pl-10 pr-10 block w-full rounded-md shadow-sm ${
                            errors.newPassword
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                        >
                          {showNewPassword ? (
                            <FiEyeOff className="h-5 w-5" />
                          ) : (
                            <FiEye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) =>
                              value === newPassword || 'Passwords do not match',
                          })}
                          className={`pl-10 pr-10 block w-full rounded-md shadow-sm ${
                            errors.confirmPassword
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                        >
                          {showConfirmPassword ? (
                            <FiEyeOff className="h-5 w-5" />
                          ) : (
                            <FiEye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* Preferences Tab */}
              {currentTab === 'preferences' && (
                <form onSubmit={handleSubmit(onUpdatePreferences)} className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Theme
                      </h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                        <p>Choose between light and dark themes.</p>
                      </div>
                      <div className="mt-5">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={toggleDarkMode}
                            className={`${
                              darkMode ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            role="switch"
                            aria-checked={darkMode}
                          >
                            <span className="sr-only">Toggle dark mode</span>
                            <span
                              className={`${
                                darkMode ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            >
                              <span
                                className={`${
                                  darkMode
                                    ? 'opacity-0 ease-out duration-100'
                                    : 'opacity-100 ease-in duration-200'
                                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                                aria-hidden="true"
                              >
                                <FiSun className="h-3 w-3 text-gray-400" />
                              </span>
                              <span
                                className={`${
                                  darkMode
                                    ? 'opacity-100 ease-in duration-200'
                                    : 'opacity-0 ease-out duration-100'
                                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                                aria-hidden="true"
                              >
                                <FiMoon className="h-3 w-3 text-blue-600" />
                              </span>
                            </span>
                          </button>
                          <span className="ml-3">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {darkMode ? 'Dark' : 'Light'} mode
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                        <p>Manage how you receive notifications.</p>
                      </div>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="email-notifications"
                              type="checkbox"
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              defaultChecked
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="email-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                              Email notifications
                            </label>
                            <p className="text-gray-500 dark:text-gray-400">Get notified about important updates.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="push-notifications"
                              type="checkbox"
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              defaultChecked
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="push-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                              Push notifications
                            </label>
                            <p className="text-gray-500 dark:text-gray-400">Receive push notifications on your device.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;