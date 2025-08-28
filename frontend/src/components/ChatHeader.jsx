import { X, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { startCall } = useCallStore();

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
          <button 
            onClick={() => {
              console.log('Starting audio call with:', selectedUser);
              startCall(selectedUser, 'audio');
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 lg:w-9 lg:h-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center"
          >
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 lg:w-4 lg:h-4 text-primary" />
          </button>
          <button 
            onClick={() => {
              console.log('Starting video call with:', selectedUser);
              startCall(selectedUser, 'video');
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 lg:w-9 lg:h-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center"
          >
            <Video className="w-5 h-5 sm:w-6 sm:h-6 lg:w-4 lg:h-4 text-primary" />
          </button>
          <button className="w-10 h-10 sm:w-11 sm:h-11 lg:w-9 lg:h-9 rounded-full bg-base-200 hover:bg-base-300 transition-colors flex items-center justify-center">
            <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6 lg:w-4 lg:h-4 text-base-content" />
          </button>
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
