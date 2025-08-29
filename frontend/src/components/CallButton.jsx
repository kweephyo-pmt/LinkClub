import { Phone, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const CallButton = ({ friendName, type = "video" }) => {
  const navigate = useNavigate();

  const handleCall = () => {
    // Generate a unique call ID
    const callId = uuidv4();
    
    // Navigate to call page
    navigate(`/call/${callId}`);
    
    // TODO: Send call invitation to friend via socket
    // This would be implemented with socket.io to notify the friend
  };

  return (
    <button
      onClick={handleCall}
      className={`btn btn-sm ${
        type === "video" ? "btn-success" : "btn-primary"
      } text-white`}
      title={`Start ${type} call with ${friendName}`}
    >
      {type === "video" ? (
        <Video className="size-4" />
      ) : (
        <Phone className="size-4" />
      )}
    </button>
  );
};

export default CallButton;
