import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-gradient-to-br from-base-200/50 to-base-300/30 pt-16">
      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Desktop: Always show sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Mobile: Show sidebar only when no user selected, otherwise show chat */}
        <div className="flex-1">
          {!selectedUser ? (
            <>
              <div className="lg:hidden">
                <Sidebar />
              </div>
              <div className="hidden lg:block">
                <NoChatSelected />
              </div>
            </>
          ) : (
            <ChatContainer />
          )}
        </div>
      </div>
    </div>
  );
};
export default HomePage;
