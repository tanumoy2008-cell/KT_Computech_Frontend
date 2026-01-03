import React, { useState, useEffect, useRef } from 'react';
import Cropper from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';
import { useForm, useFieldArray } from 'react-hook-form';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiGlobe } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from '../config/axios';

const Settings = () => {
  const [currentTab, setCurrentTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  // Separate form instance for password to avoid collisions with profile
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword, watch: watchPassword } = useForm();
  const newPassword = watchPassword('newPassword');
  // Separate form instance for shop settings to avoid field name collisions
  const { register: registerShop, handleSubmit: handleSubmitShop, formState: { errors: shopErrors }, reset: resetShop, control, watch: watchShop } = useForm({
  defaultValues: { 
    phoneNumber: [{ number: '' }],
    state: '',
    city: ''
  }
});
  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: 'phoneNumber'
  });
  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({
    control,
    name: 'team'
  });
  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'services'
  });

  // Team image cropper state
  const [teamRawImage, setTeamRawImage] = useState(null);
  const [teamShowCropper, setTeamShowCropper] = useState(false);
  const teamCropperRef = useRef(null);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(null);
  const teamFileInputRef = useRef(null);
  const [teamImageFiles, setTeamImageFiles] = useState([]);
  const [teamImagePreviews, setTeamImagePreviews] = useState([]);

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
        // Admin has no avatar property; image not used
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load profile data');
      }
    };

    const fetchShopSettings = async () => {
      try {
        const res = await axios.get('/api/shop/shop-settings');
        if (res.data && res.data.data) {
          setShopData(res.data.data);
          resetShop({
            shopName: res.data.data.name || '',
            description: res.data.data.description || '',
            address: res.data.data.address || '',
            // backend stores phoneNumber as an array — map to objects for useFieldArray
            phoneNumber: Array.isArray(res.data.data.phoneNumber) && res.data.data.phoneNumber.length
              ? res.data.data.phoneNumber.map(p => ({ number: String(p) }))
              : [{ number: '' }],
            team: Array.isArray(res.data.data.team) && res.data.data.team.length
              ? res.data.data.team.map(t => ({ name: t.name || '', role: t.role || '', bio: t.bio || '', img: t.img || '' }))
              : [],
            services: Array.isArray(res.data.data.services) && res.data.data.services.length
              ? res.data.data.services.map(s => ({ title: s.title || '', desc: s.desc || '' }))
              : [],
            email: res.data.data.email || '',
            pincode: res.data.data.pincode || '',
            state: res.data.data.state || '',
            city: res.data.data.city || '',
          });
          if (res.data.data.logo) {
            setLogoPreview(res.data.data.logo);
          }
          // initialize team image previews/files
          if (Array.isArray(res.data.data.team)) {
            setTeamImagePreviews(res.data.data.team.map(t => t.img || null));
            setTeamImageFiles(res.data.data.team.map(() => null));
          } else {
            setTeamImagePreviews([]);
            setTeamImageFiles([]);
          }
        }
      } catch (err) {
        // It's okay if no settings exist yet
        console.warn('No shop settings found or failed to fetch:', err?.response?.data || err.message);
      }
    };

  fetchAdminData();
  fetchShopSettings();
    
    // Theme selection removed for admins
  }, [reset, resetShop, resetPassword]);

  // Profile image and theme toggle removed for admins per request

  const onSubmitProfile = async (data) => {
    try {
      setIsLoading(true);
      const response = await axios.patch('/api/admin/profile', {
        name: data.name,
        email: data.email,
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
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      
      toast.success('Password updated successfully');
      // Reset the password form
      resetPassword({
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

  // Preferences removed for admin

  // Logo preview state & ref
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = React.useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleTeamFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTeamRawImage(URL.createObjectURL(file));
    setTeamShowCropper(true);
  };

  const handleTeamCropDone = () => {
    const cropper = teamCropperRef.current?.cropper;
    if (!cropper || currentTeamIndex === null) return;

    cropper.getCroppedCanvas({ width: 500, height: 500 }).toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `team_${Date.now()}.jpg`, { type: 'image/jpeg' });

      setTeamImageFiles(prev => {
        const next = [...(prev || [])];
        next[currentTeamIndex] = file;
        return next;
      });

      setTeamImagePreviews(prev => {
        const next = [...(prev || [])];
        next[currentTeamIndex] = URL.createObjectURL(blob);
        return next;
      });

      setTeamRawImage(null);
      setTeamShowCropper(false);
      if (teamFileInputRef.current) teamFileInputRef.current.value = '';
    }, 'image/jpeg', 0.9);
  };

  const openTeamFileDialog = (idx) => {
    setCurrentTeamIndex(idx);
    teamFileInputRef.current?.click();
  };

  const onSubmitShopSettings = async (data) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      if (logoInputRef.current?.files[0]) {
        formData.append('logo', logoInputRef.current.files[0]);
      }
      // Map form fields to expected schema keys
      formData.append('name', data.shopName || '');
      formData.append('description', data.description || '');
      formData.append('address', data.address || '');
      // backend expects phoneNumber as an array — extract numbers from objects
      const phones = (data.phoneNumber || []).map(item => String(item.number || '').trim()).filter(p => p !== '');
      formData.append('phoneNumber', JSON.stringify(phones));
      // team and services (send as JSON strings)
      const teamToSend = (data.team || []).map((t, idx) => ({
        name: t.name || '',
        role: t.role || '',
        bio: t.bio || '',
        // if a new file is provided, send empty img so backend will use uploaded file
        img: teamImageFiles[idx] ? '' : (t.img || teamImagePreviews[idx] || '')
      }));
      const servicesToSend = (data.services || []).map(s => ({ title: s.title || '', desc: s.desc || '' }));
      formData.append('team', JSON.stringify(teamToSend));
      formData.append('services', JSON.stringify(servicesToSend));
      formData.append('email', data.email || '');
      // pincode stored as number in backend schema — send numeric value when possible
      if (data.pincode !== undefined && data.pincode !== '') {
        formData.append('pincode', Number(data.pincode));
      } else {
        formData.append('pincode', '');
      }
      formData.append('state', data.state || '');
      formData.append('city', data.city || '');

      // append team image files (if any)
      (teamImageFiles || []).forEach((f) => {
        if (f) formData.append('teamImages', f);
      });

      const res = await axios.put('/api/shop/shop-settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShopData(res.data.data);
      toast.success('Shop settings updated successfully');
    } catch (err) {
      console.error('Error updating shop settings:', err);
      toast.error(err.response?.data?.message || 'Failed to update shop settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-emerald-200 rounded-xl shadow p-4 mb-6">
            <div className="flex flex-col items-center py-4">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full border-2 border-emerald-700 bg-gray-200 flex items-center justify-center overflow-hidden">
                  <FiUser className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {adminData?.name || "Admin User"}
              </h2>
              <p className="text-sm text-gray-500">
                {adminData?.role === "superAdmin" ? "Super Admin" : "Admin"}
              </p>
            </div>
          </div>

          <nav className="space-y-1 border border-zinc-300 px-2 py-10 rounded-md flex flex-col gap-y-4">
            <button
              onClick={() => setCurrentTab("profile")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentTab === "profile"
                  ? "bg-emerald-200 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
              <FiUser className="w-5 h-5 mr-3" />
              Profile
            </button>
            <button
              onClick={() => setCurrentTab("password")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentTab === "password"
                  ? "bg-emerald-200 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
              <FiLock className="w-5 h-5 mr-3" />
              Password
            </button>
            <button
              onClick={() => setCurrentTab("shop")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentTab === "shop"
                  ? "bg-emerald-200 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
              <FiGlobe className="w-5 h-5 mr-3" />
              Shop Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-emerald-200 border-2 border-emerald-600 rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b-2 border-emerald-700">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentTab === "profile" && "Profile Information"}
                {currentTab === "password" && "Update Password"}
                {currentTab === "shop" && "Shop"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {currentTab === "profile" &&
                  "Update your account profile information."}
                {currentTab === "password" &&
                  "Ensure your account is using a long, random password to stay secure."}
                {currentTab === "shop" && "Manage your Shop settings."}
              </p>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {currentTab === "profile" && (
                <form
                  onSubmit={handleSubmit(onSubmitProfile)}
                  className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="h-full text-emerald-400" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          {...register("name", {
                            required: "Name is required",
                            minLength: {
                              value: 3,
                              message: "Name must be at least 3 characters",
                            },
                          })}
                          className={`p-2 pl-8 block w-full rounded-md border-2 outline-none border-black shadow-sm ${
                            errors.name
                              ? "text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                              : "focus:ring-emerald-500 focus:border-emerald-500"
                          }`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-full text-emerald-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                          className={`p-2 pl-8 block w-full rounded-md border-2 outline-none border-black shadow-sm ${
                            errors.email
                              ? "text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                              : "focus:border-emerald-500"
                          }`}
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {/* Shop Settings Tab */}
              {currentTab === "shop" && (
                <form
                  onSubmit={handleSubmitShop(onSubmitShopSettings)}
                  className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="shopName"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        Shop Name
                      </label>
                      <input
                        id="shopName"
                        type="text"
                        {...registerShop("shopName", {
                          required: "Shop name is required",
                        })}
                        className="p-2 block w-full rounded-md border-2 outline-none border-black shadow-sm focus:border-emerald-700"
                        placeholder="My Shop"
                      />
                      {shopErrors.shopName && (
                        <p className="mt-2 text-sm text-red-600">
                          {shopErrors.shopName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number(s)
                      </label>
                      <div className="flex flex-col gap-2">
                        {phoneFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex items-center gap-2">
                            <input
                              id={`phoneNumberShop-${index}`}
                              type="tel"
                              {...registerShop(`phoneNumber.${index}.number`, {
                                pattern: {
                                  value: /^[0-9]{10}$/,
                                  message: "Enter 10 digit phone",
                                },
                                required:
                                  index === 0
                                    ? "Phone number is required"
                                    : false,
                              })}
                              defaultValue={field.number}
                              className="p-2 flex-1 rounded-md border-2 outline-none border-black shadow-sm focus:border-emerald-700"
                              placeholder="9123456789"
                            />
                            <div className="flex gap-2">
                              {phoneFields.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePhone(index)}
                                  className="px-3 py-2 bg-red-600 text-white rounded">
                                  Remove
                                </button>
                              )}
                              {index === phoneFields.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => appendPhone({ number: "" })}
                                  className="px-3 py-2 bg-emerald-600 text-white rounded">
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {shopErrors.phoneNumber &&
                        Array.isArray(shopErrors.phoneNumber) &&
                        shopErrors.phoneNumber.map((err, i) =>
                          err?.number ? (
                            <p key={i} className="mt-2 text-sm text-red-600">
                              {err.number.message}
                            </p>
                          ) : null
                        )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1">
                      Description (# for heading, {"<br>"} for breaking line, {">>"} for highlight heading, -
                      for buletpoint)
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      {...registerShop("description")}
                      className="p-2  block w-full rounded-md border-2 outline-none border-black shadow-sm focus:border-emerald-700"
                      placeholder="Add the Description"
                    />
                    {shopErrors.description && (
                      <p className="mt-2 text-sm text-red-600">
                        {shopErrors.description.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      {...registerShop("address")}
                      className="p-2  block w-full rounded-md border-2 outline-none border-black shadow-sm focus:border-emerald-700"
                      placeholder="Add address"
                    />
                    {shopErrors.address && (
                      <p className="mt-2 text-sm text-red-600">
                        {shopErrors.address.message}
                      </p>
                    )}
                  </div>

                  {/* Services editable list */}
                  <div className="mt-4">
                    <h4 className="text-md font-medium mb-2">Services</h4>
                    <div className="flex flex-col gap-3">
                      {serviceFields.map((field, index) => (
                        <div key={field.id} className="p-3 border rounded">
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <input
                              type="text"
                              placeholder="Title"
                              {...registerShop(`services.${index}.title`)}
                              defaultValue={field.title}
                              className="p-2 rounded border-2 outline-none"
                            />
                            <textarea
                              placeholder="Description"
                              {...registerShop(`services.${index}.desc`)}
                              defaultValue={field.desc}
                              className="p-2 rounded border-2 outline-none col-span-2"
                            />
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="px-3 py-1 bg-red-600 text-white rounded">
                              Remove
                            </button>
                            {index === serviceFields.length - 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  appendService({ title: "", desc: "" })
                                }
                                className="px-3 py-1 bg-emerald-600 text-white rounded">
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {serviceFields.length === 0 && (
                        <button
                          type="button"
                          onClick={() => appendService({ title: "", desc: "" })}
                          className="px-3 py-2 bg-emerald-600 text-white rounded">
                          Add first service
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Team editable list */}
                  <div className="mt-4">
                    <h4 className="text-md font-medium mb-2">Team</h4>
                    <div className="flex flex-col gap-3">
                      {teamFields.map((field, index) => (
                        <div key={field.id} className="p-3 border rounded">
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <input
                              type="text"
                              placeholder="Name"
                              {...registerShop(`team.${index}.name`)}
                              defaultValue={field.name}
                              className="p-2 rounded border-2 outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Role"
                              {...registerShop(`team.${index}.role`)}
                              defaultValue={field.role}
                              className="p-2 rounded border-2 outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                {teamImagePreviews[index] ? (
                                  <img
                                    src={teamImagePreviews[index]}
                                    alt={`team-${index}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    No image
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openTeamFileDialog(index)}
                                    className="px-3 py-1 bg-emerald-600 text-white rounded">
                                    Upload
                                  </button>
                                  {teamImagePreviews[index] && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // remove preview and staged file
                                        setTeamImagePreviews((prev) => {
                                          const next = [...(prev || [])];
                                          next[index] = null;
                                          return next;
                                        });
                                        setTeamImageFiles((prev) => {
                                          const next = [...(prev || [])];
                                          next[index] = null;
                                          return next;
                                        });
                                        // also clear the form value for img
                                        // registerShop keeps value in form state; we update it to empty
                                      }}
                                      className="px-3 py-1 bg-red-600 text-white rounded">
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <textarea
                              placeholder="Bio"
                              {...registerShop(`team.${index}.bio`)}
                              defaultValue={field.bio}
                              className="p-2 rounded border-2 outline-none w-full"
                            />
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => removeTeam(index)}
                              className="px-3 py-1 bg-red-600 text-white rounded">
                              Remove
                            </button>
                            {index === teamFields.length - 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  appendTeam({
                                    name: "",
                                    role: "",
                                    bio: "",
                                    img: "",
                                  })
                                }
                                className="px-3 py-1 bg-emerald-600 text-white rounded">
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {teamFields.length === 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            appendTeam({ name: "", role: "", bio: "", img: "" })
                          }
                          className="px-3 py-2 bg-emerald-600 text-white rounded">
                          Add first team member
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        {...registerShop("email")}
                        className="p-2 block w-full rounded-md border-2 outline-none border-black shadow-sm focus:border-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="number"
                        {...registerShop("pincode")}
                        className="p-2 block w-full rounded-md border-2 outline-none border-black shadow-sm focus:border-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        {...registerShop("state")}
                        className="p-2 block w-full rounded-md border-2 outline-none border-black shadow-sm focus:border-emerald-700"
                        placeholder="West Bengal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        {...registerShop("city")}
                        className="p-2 block w-full rounded-md border-2 outline-none border-black shadow-sm focus:border-emerald-700"
                        placeholder="Durgapur"
                      />
                    </div>

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-52 aspect-square rounded-md border-2 bg-gray-200 overflow-hidden flex items-center justify-center">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">No logo</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <input
                          type="file"
                          accept="image/*"
                          ref={logoInputRef}
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-input"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-3 py-2 bg-emerald-600 text-white rounded">
                            Upload
                          </button>
                          {logoPreview && (
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="px-3 py-2 bg-red-600 text-white rounded">
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* hidden team file input (single input used for all entries) */}
                    <input
                      type="file"
                      ref={teamFileInputRef}
                      onChange={handleTeamFileSelected}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700">
                      {isLoading ? "Saving..." : "Save Shop Settings"}
                    </button>
                  </div>
                </form>
              )}

              {/* Password Tab */}
              {currentTab === "password" && (
                <form
                  onSubmit={handleSubmitPassword(onChangePassword)}
                  className="space-y-6">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-full text-emerald-400" />
                      </div>
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        {...registerPassword("currentPassword", {
                          required: "Current password is required",
                        })}
                        className={`p-2 pl-8 block w-full rounded-md border-2 outline-none border-black shadow-sm ${
                          passwordErrors.currentPassword
                            ? "text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                            : "focus:ring-emerald-500 focus:border-emerald-500"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500">
                        {showCurrentPassword ? (
                          <FiEyeOff className="h-full text-emerald-400" />
                        ) : (
                          <FiEye className="h-full text-emerald-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-full text-emerald-400" />
                        </div>
                        <input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          {...registerPassword("newPassword", {
                            required: "New password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                            pattern: {
                              value:
                                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                              message:
                                "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
                            },
                          })}
                          className={`p-2 pl-8 block w-full rounded-md border-2 outline-none border-black shadow-sm ${
                            passwordErrors.newPassword
                              ? "text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                              : "focus:ring-emerald-500 focus:border-emerald-500"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500">
                          {showNewPassword ? (
                            <FiEyeOff className="h-full text-emerald-400" />
                          ) : (
                            <FiEye className="h-full text-emerald-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-2 text-sm text-red-600">
                          {passwordErrors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-full text-emerald-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          {...registerPassword("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) =>
                              value === newPassword || "Passwords do not match",
                          })}
                          className={`p-2 pl-8 block w-full rounded-md border-2 outline-none border-black shadow-sm ${
                            passwordErrors.confirmPassword
                              ? "text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                              : "focus:ring-emerald-500 focus:border-emerald-500"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500">
                          {showConfirmPassword ? (
                            <FiEyeOff className="h-full text-emerald-400" />
                          ) : (
                            <FiEye className="h-full text-emerald-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">
                          {passwordErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}

              {/* Preferences removed */}
            </div>
          </div>
        </div>
      </div>
      {teamShowCropper && teamRawImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Crop Team Image
              </h3>
              <button
                type="button"
                onClick={() => {
                  setTeamShowCropper(false);
                  setTeamRawImage(null);
                }}
                className="text-gray-400 hover:text-gray-500">
                Close
              </button>
            </div>
            <div className="p-4">
              <div className="w-full h-96">
                <Cropper
                  ref={teamCropperRef}
                  src={teamRawImage}
                  style={{ height: "100%", width: "100%" }}
                  aspectRatio={1}
                  viewMode={1}
                  guides={true}
                  minCropBoxHeight={100}
                  minCropBoxWidth={100}
                  background={false}
                  responsive={true}
                  autoCropArea={0.8}
                  checkOrientation={false}
                />
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
              <button
                type="button"
                onClick={() => {
                  setTeamShowCropper(false);
                  setTeamRawImage(null);
                }}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTeamCropDone}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700">
                Crop & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;