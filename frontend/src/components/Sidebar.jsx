import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, UserPlus, Circle } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, lastMessages, unreadMessages } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (authUser) {
      getUsers();
    }
  }, [getUsers, authUser]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOnlineFilter = showOnlineOnly ? onlineUsers.includes(user._id) : true;
    return matchesSearch && matchesOnlineFilter;
  });

  // Count online friends (excluding current user)
  const onlineFriendsCount = users.filter(user => onlineUsers.includes(user._id)).length;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full lg:w-80 border-r border-base-300 flex flex-col transition-all duration-300 bg-base-100 shadow-lg">
      <div className="border-b border-base-300 w-full p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-content" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-base sm:text-lg text-base-content">Friends</h1>
                <p className="text-xs sm:text-sm text-base-content/70 font-medium">{users.length} connected</p>
              </div>
              <Link
                to="/friends"
                className="group p-2 bg-primary/10 hover:bg-primary/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                title="Add Friends"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-primary/80 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
        {/* Search Bar */}
        <div className="mb-3 sm:mb-4 lg:mb-5">
          <div className="relative group">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-base-content/50 size-3 sm:size-4 transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-base-200/50 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base-content placeholder-base-content/50 text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md input"
            />
          </div>
        </div>
        
        {/* Online filter toggle */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
          <label className="cursor-pointer flex items-center gap-3 group">
            <div className="relative">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-all duration-200 ${
                showOnlineOnly 
                  ? 'bg-gradient-to-r from-success to-success shadow-lg shadow-success/25' 
                  : 'bg-base-300'
              }`}>
                <div className={`w-5 h-5 bg-base-100 rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                  showOnlineOnly ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-base-content group-hover:text-base-content/80 transition-colors">Online only</span>
          </label>
          <div className="flex items-center gap-2">
            <Circle className="w-2 h-2 fill-success text-success" />
            <span className="text-xs font-medium text-base-content/70 bg-success/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-success/20">
              {onlineFriendsCount} online
            </span>
          </div>
        </div>

      </div>

      <div className="overflow-y-auto w-full py-2 sm:py-3 lg:py-4 px-1 sm:px-2 lg:px-3 space-y-1 sm:space-y-1.5 lg:space-y-2 flex-1 min-h-0 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
            <p className="text-base-content/70 text-sm font-medium">No friends found</p>
            <p className="text-base-content/50 text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredUsers
            .sort((a, b) => {
              const lastMessageA = lastMessages[a._id];
              const lastMessageB = lastMessages[b._id];
              
              // If both have last messages, sort by timestamp (most recent first)
              if (lastMessageA && lastMessageB) {
                return new Date(lastMessageB.createdAt) - new Date(lastMessageA.createdAt);
              }
              
              // If only one has a last message, prioritize it
              if (lastMessageA && !lastMessageB) return -1;
              if (!lastMessageA && lastMessageB) return 1;
              
              // If neither has messages, sort alphabetically
              return a.fullName.localeCompare(b.fullName);
            })
            .map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`group w-full p-3 sm:p-4 flex items-center gap-3 sm:gap-4 rounded-2xl transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] ${
                selectedUser?._id === user._id 
                  ? "bg-gradient-to-r from-primary/10 to-secondary/10 ring-2 ring-primary/20 shadow-lg" 
                  : "hover:bg-base-200/50"
              }`}
            >
              <div className="relative">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 sm:size-14 object-cover rounded-2xl border-2 border-base-100 shadow-md group-hover:shadow-lg transition-shadow duration-200"
                />
                {onlineUsers.includes(user._id) && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-success rounded-full ring-2 sm:ring-3 ring-base-100 shadow-lg">
                    <div className="w-full h-full bg-success rounded-full animate-pulse" />
                  </div>
                )}
              </div>

              <div className="text-left min-w-0 flex-1">
                <div className={`truncate text-sm sm:text-base group-hover:text-primary transition-colors ${
                  unreadMessages[user._id] > 0 ? 'font-bold text-base-content' : 'font-bold text-base-content'
                }`}>
                  {user.fullName}
                </div>
                {/* Last message preview */}
                {lastMessages[user._id] && (
                  <div className={`mt-1 sm:mt-2 text-xs truncate max-w-[160px] sm:max-w-[200px] ${
                    unreadMessages[user._id] > 0 
                      ? 'text-base-content font-semibold' 
                      : 'text-base-content/60 font-normal'
                  }`}>
                    {lastMessages[user._id].senderId === authUser._id ? (
                      <span className="text-primary/70 font-medium">You: </span>
                    ) : null}
                    {lastMessages[user._id].image ? (
                      <span className="italic flex items-center gap-1">
                        📷 <span>Photo</span>
                      </span>
                    ) : (
                      <span className="break-words">
                        {lastMessages[user._id].text}
                      </span>
                    )}
                  </div>
                )}
                {/* Unread message indicator */}
                {unreadMessages[user._id] > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full">
                      {unreadMessages[user._id]}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
