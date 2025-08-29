import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useNavigate } from "react-router-dom";

const IncomingCallModal = () => {
  const { incomingCall, isCallModalOpen, acceptCall, rejectCall } = useCallStore();
  const navigate = useNavigate();

  if (!isCallModalOpen || !incomingCall) return null;

  const handleAccept = () => {
    acceptCall(incomingCall.callId);
    navigate(`/call/${incomingCall.callId}?type=${incomingCall.callType}`);
  };

  const handleReject = () => {
    rejectCall(incomingCall.callId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
        <div className="text-center">
          {/* Caller Avatar */}
          <div className="avatar mb-4">
            <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img 
                src={incomingCall.caller.profilePic || "/avatar.png"} 
                alt={incomingCall.caller.name}
                className="rounded-full object-cover"
              />
            </div>
          </div>

          {/* Call Info */}
          <h3 className="text-xl font-semibold mb-2">
            {incomingCall.caller.name}
          </h3>
          <p className="text-base-content/70 mb-6">
            Incoming {incomingCall.callType} call...
          </p>

          {/* Call Actions */}
          <div className="flex justify-center gap-6">
            {/* Reject Button */}
            <button
              onClick={handleReject}
              className="w-16 h-16 rounded-full bg-error hover:bg-error/80 transition-colors flex items-center justify-center text-error-content shadow-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Accept Button */}
            <button
              onClick={handleAccept}
              className="w-16 h-16 rounded-full bg-success hover:bg-success/80 transition-colors flex items-center justify-center text-success-content shadow-lg"
            >
              {incomingCall.callType === "video" ? (
                <Video className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
