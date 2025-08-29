import { X, MoreVertical, ArrowLeft, UserMinus, Phone, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import { useCallStore } from "../store/useCallStore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { removeFriend } = useFriendStore();
  const { sendCallInvitation } = useCallStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleCall = (callType = "video") => {
    const callId = uuidv4();
    
    
    // Send call invitation to the friend
    sendCallInvitation(selectedUser._id, callId, callType);
    
    // Navigate to call page with call type
    navigate(`/call/${callId}?type=${callType}`);
  };

  const handleUnfriend = async () => {
    if (window.confirm(`Are you sure you want to remove ${selectedUser.fullName} from your friends?`)) {
      await removeFriend(selectedUser._id);
      setShowDropdown(false);
      setSelectedUser(null); // Close chat after unfriending
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="fixed top-0 left-0 right-0 z-20 lg:fixed lg:top-16 lg:left-80 lg:z-20 p-4 sm:p-4 lg:p-4 border-b border-base-300/30 bg-base-100/95 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile back button */}
          <button 
            onClick={() => setSelectedUser(null)}
            className="w-10 h-10 sm:w-11 sm:h-11 lg:w-9 lg:h-9 rounded-full bg-base-200 hover:bg-base-300 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="size-4" />
          </button>
          {/* Avatar */}
          <div className="avatar">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-10 lg:h-10 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={selectedUser.profilePic || "/avatar.png"} 
                alt={selectedUser.fullName}
                className="rounded-full object-cover"
              />
              {onlineUsers.includes(selectedUser._id) && (
                <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-success rounded-full ring-1 ring-base-100"></span>
              )}
            </div>
          </div>

          {/* User info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-base sm:text-lg lg:text-base text-base-content truncate">
              {selectedUser.fullName}
            </h3>
            <p className="text-sm sm:text-base lg:text-sm text-base-content/70 truncate">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 sm:gap-3 lg:gap-2">
          {/* Call buttons */}
          <button 
            onClick={() => handleCall("audio")}
            className="w-10 h-10 sm:w-11 sm:h-11 lg:w-9 lg:h-9 rounded-full bg-primary hover:bg-primary/80 transition-colors flex items-center justify-center text-primary-content"
            title="Audio call"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4" />
          </button>
          
          <button 
            onClick={() => handleCall("video")}
            className="w-10 h-10 sm:w-11 sm:h-11 lg:w-9 lg:h-9 rounded-full bg-success hover:bg-success/80 transition-colors flex items-center justify-center text-success-content"
            title="Video call"
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4" />
          </button>

          {/* More options dropdown */}
          <div className="dropdown dropdown-end">
            <button 
              tabIndex={0}
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 sm:w-11 sm:h-11 lg:w-9 lg:h-9 rounded-full bg-base-200 hover:bg-base-300 transition-colors flex items-center justify-center"
            >
              <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6 lg:w-4 lg:h-4 text-base-content" />
            </button>
            {showDropdown && (
              <ul tabIndex={0} className="dropdown-content mt-3 z-[50] p-2 shadow-xl bg-base-100 rounded-xl w-48 border border-base-300/50">
                <li>
                  <button 
                    onClick={handleUnfriend}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-error/10 hover:text-error transition-colors rounded-lg"
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove Friend
                  </button>
                </li>
              </ul>
            )}
          </div>
          {/* Desktop close button */}
          <button 
            onClick={() => setSelectedUser(null)}
            className="hidden lg:block btn btn-ghost btn-sm btn-circle hover:bg-error/10 hover:text-error transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
