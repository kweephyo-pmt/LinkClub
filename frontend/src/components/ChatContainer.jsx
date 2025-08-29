import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser && authUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages, authUser]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-gradient-to-b from-base-50/30 to-base-100/50">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-base-100 w-full">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 py-3 lg:p-6 space-y-2 lg:space-y-4 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent min-h-0 pt-28 pb-20 lg:pt-20 lg:pb-6">
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === authUser._id;
          const prevMessage = messages[index - 1];
          const nextMessage = messages[index + 1];
          const isFirstInGroup = !prevMessage || prevMessage.senderId !== message.senderId;
          const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;
          
          return (
          <div
            key={`${message._id || `temp-${Date.now()}-${index}`}-${message.createdAt}-${index}`}
            className={`flex items-end gap-1 mb-1 ${
              isCurrentUser ? "justify-end" : "justify-start"
            }`}
            ref={messageEndRef}
          >
            {/* Avatar - only show for last message in group from other users */}
            {!isCurrentUser && isLastInGroup && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 mb-1">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="profile pic"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!isCurrentUser && !isLastInGroup && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0"></div>
            )}
            
            <div className="flex flex-col max-w-[320px] sm:max-w-[360px] lg:max-w-[400px]">
              {/* Timestamp - only show for first message in group */}
              {isFirstInGroup && (
                <div className={`text-xs text-base-content/40 mb-1 px-2 ${
                  isCurrentUser ? "text-right" : "text-left"
                }`}>
                  {formatMessageTime(message.createdAt)}
                </div>
              )}
              
              <div className={`inline-block px-4 py-3 rounded-3xl ${
                message.isCallHistory 
                  ? "bg-base-300/50 text-base-content/70 border border-base-300/30" 
                  : isCurrentUser 
                    ? "bg-primary text-primary-content rounded-br-lg" 
                    : "bg-base-200 text-base-content rounded-bl-lg"
              } ${
                !isFirstInGroup && !isLastInGroup ? "rounded-3xl" :
                isFirstInGroup && !isLastInGroup ? (isCurrentUser ? "rounded-br-3xl" : "rounded-bl-3xl") :
                !isFirstInGroup && isLastInGroup ? (isCurrentUser ? "rounded-tr-3xl" : "rounded-tl-3xl") :
                ""
              }`}>
                {message.isCallHistory ? (
                  <div className="flex items-center gap-2">
                    {message.callType === 'video' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    )}
                    <span className="text-sm italic">{message.text}</span>
                  </div>
                ) : (
                  <>
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-[240px] w-full h-auto rounded-2xl mb-1 cursor-pointer"
                        style={{ 
                          maxHeight: '200px',
                          objectFit: 'cover',
                          minHeight: '80px'
                        }}
                        onClick={() => window.open(message.image, '_blank')}
                      />
                    )}
                    {message.text && <span className="text-sm sm:text-base leading-relaxed">{message.text}</span>}
                  </>
                )}
              </div>
              
              {/* Message status indicators - only for current user's messages and last in group */}
              {isCurrentUser && isLastInGroup && (
                <div className="flex items-center justify-end mt-1 sm:mt-2 gap-1 sm:gap-2">
                  {message.status === "sent" && (
                    <div className="flex items-center gap-1 text-xs text-base-content/80 bg-base-200/50 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Sent</span>
                    </div>
                  )}
                  {message.status === "delivered" && (
                    <div className="flex items-center gap-1 text-xs text-base-content/80 bg-base-200/50 px-2 py-1 rounded-full">
                      <div className="flex -space-x-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">Delivered</span>
                    </div>
                  )}
                  {message.status === "seen" && (
                    <div className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full border border-success/20">
                      <div className="flex -space-x-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">Seen</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          );
        })}
        
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-base-content/80 mb-2">Start the conversation</h3>
            <p className="text-base-content/60">Send a message to begin chatting with {selectedUser.fullName}</p>
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
