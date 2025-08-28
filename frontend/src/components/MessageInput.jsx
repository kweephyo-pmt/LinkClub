import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  // Common emojis for quick access
  const commonEmojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
    "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
    "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏",
    "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠",
    "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨",
    "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥",
    "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧",
    "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐",
    "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑",
    "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻",
    "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸",
    "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "❤️",
    "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍",
    "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘",
    "💝", "💟", "👍", "👎", "👌", "🤌", "🤏", "✌️",
    "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕",
    "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏",
    "🙌", "🤝", "🙏", "✍️", "💪", "🦾", "🦿", "🦵",
    "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷"
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emoji) => {
    setText(prev => prev + emoji);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isLoading) return; // Prevent double sending

    setIsLoading(true);
    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(e);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 lg:relative lg:z-auto p-2 sm:p-3 lg:p-6 w-full bg-base-100/95 border-t border-base-300/30 shadow-lg backdrop-blur-md">
      {imagePreview && (
        <div className="mb-3 flex items-end gap-2 lg:gap-4">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-primary/20 shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-error-content
              flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
          <div className="text-xs sm:text-sm text-base-content/70">
            <p className="font-medium">Image ready to send</p>
            <p>Click the X to remove</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Left side buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-4 h-4 text-primary" />
          </button>
          
          <div className="relative emoji-picker-container">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
            >
              <Smile className="w-4 h-4 text-primary" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 w-64 sm:w-80 max-h-48 bg-base-100 border border-base-300 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-base-300">
                  <h3 className="font-semibold text-sm text-base-content/80">Quick Emojis</h3>
                </div>
                <div className="p-3 grid grid-cols-8 sm:grid-cols-10 gap-1 overflow-y-auto max-h-36">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-1 hover:bg-base-200 rounded text-lg hover:scale-110 transition-all"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full h-10 px-4 rounded-full bg-base-200 border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm placeholder:text-base-content/50"
              placeholder={isLoading ? "Sending..." : "Aa"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              style={{ fontSize: '16px' }}
            />
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {(text.trim() || imagePreview) ? (
            <button
              type="submit"
              disabled={isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors touch-manipulation ${
                isLoading 
                  ? 'bg-primary/50 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-content/30 border-t-primary-content rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-primary-content" />
              )}
            </button>
          ) : (
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
export default MessageInput;
