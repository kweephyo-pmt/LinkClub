import { MessageSquare, Users, Sparkles, Image } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-4 sm:p-8 lg:p-16 bg-gradient-to-br from-base-100 via-base-200/50 to-base-300/30">
      <div className="max-w-2xl text-center space-y-6 sm:space-y-8">
        {/* Hero Icon */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-2xl animate-pulse">
              <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-success to-info flex items-center justify-center animate-bounce shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Welcome to LinkClub!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-base-content/70 leading-relaxed max-w-xl mx-auto">
            Connect with friends, share moments, and stay in touch with high-quality messaging.
          </p>
          <p className="text-sm sm:text-base text-base-content/50">
            Select a conversation from the sidebar to get started
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <div className="group p-4 sm:p-6 bg-gradient-to-br from-base-100 to-base-200 rounded-2xl border border-base-300/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500/20 transition-colors">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-base-content/80">Real-time Chat</p>
          </div>
          <div className="group p-4 sm:p-6 bg-gradient-to-br from-base-100 to-base-200 rounded-2xl border border-base-300/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/20 transition-colors">
              <Image className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-base-content/80">Image Sharing</p>
          </div>
          <div className="group p-4 sm:p-6 bg-gradient-to-br from-base-100 to-base-200 rounded-2xl border border-base-300/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-500/20 transition-colors">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-base-content/80">Online Status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
