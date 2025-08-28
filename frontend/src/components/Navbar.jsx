import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useChatStore } from "../store/useChatStore";
import { LogOut, MessageSquare, Settings, User, Bell, Users } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { friendRequests, getFriendRequests } = useFriendStore();
  const { selectedUser } = useChatStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (authUser) {
      getFriendRequests();
    }
  }, [getFriendRequests, authUser]);

  const totalNotifications = friendRequests.received.length;
  
  // Hide navbar on mobile when in chat view
  const isInChat = location.pathname === '/' && selectedUser;
  const shouldHideOnMobile = isInChat;

  return (
    <header className={`bg-base-100/95 border-b border-base-300/50 fixed w-full top-0 z-40 backdrop-blur-md shadow-sm ${
      shouldHideOnMobile ? 'hidden lg:block' : 'block'
    }`}>
      <div className="container mx-auto px-6 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">LinkClub</h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {authUser && (
              <>
                {/* Notifications */}
<div className="dropdown dropdown-end">
                  <button 
                    tabIndex={0}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {totalNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {totalNotifications}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div tabIndex={0} className="dropdown-content mt-3 z-[50] p-4 shadow-2xl bg-base-100 rounded-2xl w-80 sm:w-96 max-w-[calc(100vw-1rem)] border border-base-300/30 max-h-[70vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-primary" />
                          <h3 className="font-bold text-lg text-base-content">Notifications</h3>
                        </div>
                        <div className="badge badge-primary badge-sm">{totalNotifications}</div>
                      </div>
                      {friendRequests.received.length === 0 ? (
                        <div className="text-center py-8 text-base-content/60">
                          <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                            <Bell className="w-8 h-8 opacity-50" />
                          </div>
                          <p className="text-base font-medium mb-1">All caught up!</p>
                          <p className="text-sm opacity-70">No new notifications</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {friendRequests.received.map((request) => (
                            <div key={request._id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl hover:from-primary/10 hover:to-secondary/10 transition-all duration-200 border border-base-300/30">
                              <img
                                src={request.profilePic || "/avatar.png"}
                                alt={request.fullName}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/20"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-base-content mb-1">
                                  {request.fullName}
                                </p>
                                <p className="text-xs text-base-content/70 mb-1">@{request.username}</p>
                                <p className="text-xs text-primary font-medium">Friend request</p>
                              </div>
                              <Link
                                to="/friends?tab=requests"
                                onClick={() => setShowNotifications(false)}
                                className="btn btn-sm btn-primary rounded-full px-4 flex-shrink-0 shadow-md hover:shadow-lg transition-shadow"
                              >
                                View
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                      {friendRequests.received.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-base-300/50">
                          <Link
                            to="/friends?tab=requests"
                            onClick={() => setShowNotifications(false)}
                            className="btn btn-primary w-full rounded-xl shadow-md hover:shadow-lg transition-all"
                          >
                            View All Requests
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Settings */}
                <Link
                  to="/settings"
                  className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </Link>

                {/* Profile Dropdown */}
                <div className="dropdown dropdown-end">
                  <div 
                    tabIndex={0} 
                    role="button" 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="btn btn-ghost btn-circle avatar hover:bg-primary/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full ring-2 ring-primary/20">
                      <img
                        src={authUser.profilePic || "/avatar.png"}
                        alt={authUser.fullName}
                        className="rounded-full object-cover"
                      />
                    </div>
                  </div>
                  {showProfileDropdown && (
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[50] p-2 shadow-xl bg-base-100 rounded-xl w-52 border border-base-300/50">
                    <li className="menu-title">
                      <span className="text-base-content/70">{authUser.fullName}</span>
                    </li>
                    <li>
                      <Link 
                        to="/profile" 
                        onClick={() => setShowProfileDropdown(false)}
                        className="gap-3 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/friends" 
                        onClick={() => setShowProfileDropdown(false)}
                        className="gap-3 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        Friends
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/settings" 
                        onClick={() => setShowProfileDropdown(false)}
                        className="gap-3 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </li>
                    <div className="divider my-1"></div>
                    <li>
                      <button 
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                        }}
                        className="gap-3 hover:bg-error/10 hover:text-error transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </li>
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
