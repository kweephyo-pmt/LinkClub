import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const SpeakerButton = ({ audioElement }) => {
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const toggleSpeaker = async () => {
    if (!audioElement) return;

    try {
      if (isSpeakerOn) {
        // Switch to earpiece (if available) or lower volume
        audioElement.volume = 0.3;
        if (audioElement.setSinkId) {
          // Try to set to earpiece, fallback to default
          await audioElement.setSinkId('communications').catch(() => {
            audioElement.setSinkId('default');
          });
        }
      } else {
        // Switch to speaker mode
        audioElement.volume = 1.0;
        if (audioElement.setSinkId) {
          await audioElement.setSinkId('default');
        }
      }
      setIsSpeakerOn(!isSpeakerOn);
    } catch (error) {
      console.error('Error toggling speaker:', error);
    }
  };

  return (
    <button
      onClick={toggleSpeaker}
      className={`btn btn-circle btn-lg ${
        isSpeakerOn ? 'bg-primary text-white' : 'bg-base-200 hover:bg-base-300'
      }`}
      title={isSpeakerOn ? 'Switch to Earpiece' : 'Switch to Speaker'}
    >
      {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
    </button>
  );
};

export default SpeakerButton;
