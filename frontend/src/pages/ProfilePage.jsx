import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, AtSign } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-base-100 shadow-2xl rounded-3xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 sm:p-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-primary-content/80 text-sm sm:text-base">Manage your account information</p>
          </div>

          {/* Profile Picture Section */}
          <div className="relative -mt-16 flex flex-col items-center px-6 sm:px-8 pb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="relative size-32 sm:size-40 rounded-full object-cover border-4 border-white shadow-2xl"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-2 right-2 
                  bg-primary hover:bg-primary-focus hover:scale-110
                  p-3 rounded-full cursor-pointer shadow-lg
                  transition-all duration-300 border-2 border-white
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-base-content">{authUser?.fullName}</h2>
              <p className="text-base-content/60 text-sm sm:text-base">@{authUser?.username}</p>
              <p className="text-xs sm:text-sm text-base-content/50 mt-2">
                {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
              </p>
            </div>
          </div>

          {/* Profile Information Cards */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information Card */}
              <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-base-content/60 font-medium">Full Name</p>
                      <p className="text-base-content font-semibold">{authUser?.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <AtSign className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-base-content/60 font-medium">Username</p>
                      <p className="text-base-content font-semibold">@{authUser?.username}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-base-content/60 font-medium">Email Address</p>
                      <p className="text-base-content font-semibold break-all">{authUser?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/10">
              <h3 className="text-lg font-bold text-base-content mb-6 text-center">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-base-100 rounded-xl p-4 text-center shadow-md">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {new Date(authUser.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                  <p className="text-sm text-base-content/60">Member Since</p>
                </div>
                <div className="bg-base-100 rounded-xl p-4 text-center shadow-md">
                  <div className="text-2xl font-bold text-success mb-1">Active</div>
                  <p className="text-sm text-base-content/60">Account Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
