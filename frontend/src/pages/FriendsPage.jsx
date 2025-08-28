import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, UserPlus, Check, X, Trash2, Users, AlertTriangle } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";

const FriendsPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const { authUser } = useAuthStore();

  // Update tab when URL params change
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['friends', 'requests', 'search'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const {
    friends,
    friendRequests,
    searchResults,
    isLoading,
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
    clearSearchResults,
  } = useFriendStore();

  useEffect(() => {
    if (authUser) {
      getFriends();
      getFriendRequests();
    }
  }, [getFriends, getFriendRequests, authUser]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchUsers(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    clearSearchResults();
  };

  const handleRemoveFriend = (friend) => {
    setFriendToRemove(friend);
    setShowRemoveModal(true);
  };

  const confirmRemoveFriend = async () => {
    if (friendToRemove) {
      await removeFriend(friendToRemove._id);
      setShowRemoveModal(false);
      setFriendToRemove(null);
    }
  };

  const cancelRemoveFriend = () => {
    setShowRemoveModal(false);
    setFriendToRemove(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/50 to-base-300/30 pt-16">
      <div className="container mx-auto px-2 lg:px-4 py-4 lg:py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content mb-4 lg:mb-8 text-center">
            Friends & Connections
          </h1>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-4 lg:mb-8">
            <div className="bg-base-100 rounded-lg p-1 shadow-lg w-full max-w-md lg:max-w-none border border-base-300/30">
              <div className="grid grid-cols-3 lg:flex">
                <button
                  onClick={() => setActiveTab("friends")}
                  className={`px-2 lg:px-6 py-2 rounded-md font-medium transition-all text-xs lg:text-sm ${
                    activeTab === "friends"
                      ? "bg-primary text-primary-content shadow-md"
                      : "text-base-content/70 hover:text-primary"
                  }`}
                >
                  <span className="hidden lg:inline">My Friends ({friends.length})</span>
                  <span className="lg:hidden">Friends ({friends.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`px-2 lg:px-6 py-2 rounded-md font-medium transition-all text-xs lg:text-sm ${
                    activeTab === "requests"
                      ? "bg-primary text-primary-content shadow-md"
                      : "text-base-content/70 hover:text-primary"
                  }`}
                >
                  <span className="hidden lg:inline">Requests ({friendRequests.received.length})</span>
                  <span className="lg:hidden">Requests ({friendRequests.received.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("search")}
                  className={`px-2 lg:px-6 py-2 rounded-md font-medium transition-all text-xs lg:text-sm ${
                    activeTab === "search"
                      ? "bg-primary text-primary-content shadow-md"
                      : "text-base-content/70 hover:text-primary"
                  }`}
                >
                  <span className="hidden lg:inline">Add Friends</span>
                  <span className="lg:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Friends Tab */}
          {activeTab === "friends" && (
            <div className="bg-base-100 rounded-xl shadow-lg p-6 border border-base-300/30">
              <h2 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 flex items-center gap-2">
                <Users className="size-4 lg:size-5 text-primary" />
                My Friends
              </h2>
              {friends.length === 0 ? (
                <div className="text-center py-6 lg:py-8 text-base-content/60">
                  <Users className="size-12 lg:size-16 mx-auto mb-3 lg:mb-4 text-base-content/30" />
                  <p className="text-sm lg:text-base">No friends yet. Start by adding some friends!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between p-4 border border-base-300/50 rounded-lg hover:bg-base-200/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={friend.profilePic || "/avatar.png"}
                          alt={friend.fullName}
                          className="size-12 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm lg:text-base truncate">{friend.fullName}</h3>
                          <p className="text-xs lg:text-sm text-base-content/60 truncate">@{friend.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend)}
                        className="btn btn-xs lg:btn-sm btn-error btn-outline flex-shrink-0"
                      >
                        <Trash2 className="size-3 lg:size-4" />
                        <span className="hidden lg:inline">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Friend Requests Tab */}
          {activeTab === "requests" && (
            <div className="bg-base-100 rounded-xl shadow-lg p-6 border border-base-300/30">
              <h2 className="text-xl font-semibold mb-4 text-base-content">Friend Requests</h2>
              {friendRequests.received.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  <UserPlus className="size-16 mx-auto mb-4 text-base-content/30" />
                  <p>No pending friend requests</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {friendRequests.received.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-4 border border-base-300/50 rounded-lg hover:bg-base-200/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={request.profilePic || "/avatar.png"}
                          alt={request.fullName}
                          className="size-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium">{request.fullName}</h3>
                          <p className="text-sm text-base-content/60">@{request.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptFriendRequest(request._id)}
                          className="btn btn-sm btn-success"
                        >
                          <Check className="size-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => rejectFriendRequest(request._id)}
                          className="btn btn-sm btn-error btn-outline"
                        >
                          <X className="size-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Friends Tab */}
          {activeTab === "search" && (
            <div className="bg-base-100 rounded-xl shadow-lg p-6 border border-base-300/30">
              <h2 className="text-xl font-semibold mb-4 text-base-content">Add Friends</h2>
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-5" />
                    <input
                      type="text"
                      placeholder="Search by email or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input input-bordered w-full pl-10"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !searchQuery.trim()}
                    className="btn btn-primary"
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Search"
                    )}
                  </button>
                  {searchResults.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="btn btn-outline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="grid gap-4">
                  {searchResults.map((user) => {
                    const isFriend = friends.some(friend => friend._id === user._id);
                    const hasSentRequest = friendRequests.sent.some(req => req._id === user._id);
                    const isCurrentUser = user._id === authUser._id;

                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-4 border border-base-300/50 rounded-lg hover:bg-base-200/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className="size-10 lg:size-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm lg:text-base truncate">{user.fullName}</h3>
                            <p className="text-xs lg:text-sm text-base-content/60 truncate">@{user.username}</p>
                          </div>
                        </div>
                        <div>
                          {isCurrentUser ? (
                            <span className="text-sm text-base-content/60">That&apos;s you!</span>
                          ) : isFriend ? (
                            <span className="badge badge-success">Friends</span>
                          ) : hasSentRequest ? (
                            <span className="badge badge-warning">Request Sent</span>
                          ) : (
                            <button
                              onClick={() => sendFriendRequest(user.username)}
                              disabled={isLoading}
                              className="btn btn-sm btn-primary"
                            >
                              <UserPlus className="size-4" />
                              Add Friend
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isLoading && (
                <div className="text-center py-8 text-base-content/60">
                  <Search className="size-16 mx-auto mb-4 text-base-content/30" />
                  <p>No users found matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Remove Friend Confirmation Modal */}
      {showRemoveModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Remove Friend</h3>
                <p className="text-sm text-base-content/70">This action cannot be undone</p>
              </div>
            </div>
            
            {friendToRemove && (
              <div className="bg-base-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={friendToRemove.profilePic || "/avatar.png"}
                    alt={friendToRemove.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{friendToRemove.fullName}</p>
                    <p className="text-sm text-base-content/60">@{friendToRemove.username}</p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="mb-6 text-base-content/80">
              Are you sure you want to remove <strong>{friendToRemove?.fullName}</strong> from your friends list? 
              You&apos;ll need to send a new friend request to connect again.
            </p>
            
            <div className="modal-action">
              <button 
                onClick={cancelRemoveFriend}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveFriend}
                className="btn btn-error"
              >
                <Trash2 className="w-4 h-4" />
                Remove Friend
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={cancelRemoveFriend}></div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
