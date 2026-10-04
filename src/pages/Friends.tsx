import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Check, X, ShieldBan } from 'lucide-react';
import { socialService } from '../lib/social';
import type { PublicProfile, FriendRequest } from '../lib/social';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Friends = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  
  const [friends, setFriends] = useState<PublicProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'friends') loadFriends();
    if (activeTab === 'requests') loadRequests();
  }, [activeTab]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const data = await socialService.fetchFriends();
      setFriends(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await socialService.fetchIncomingRequests();
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await socialService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAccept = async (req: FriendRequest) => {
    await socialService.acceptFriendRequest(req.id, req.sender_id);
    setRequests(current => current.filter(r => r.id !== req.id));
  };

  const handleDecline = async (reqId: string) => {
    await socialService.declineFriendRequest(reqId);
    setRequests(current => current.filter(r => r.id !== reqId));
  };

  const handleAddFriend = async (targetId: string) => {
    try {
      await socialService.sendFriendRequest(targetId);
      alert('Friend request sent!');
    } catch (e: any) {
      alert(e.message || 'Error sending request');
    }
  };

  const handleRemoveFriend = async (targetId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      await socialService.removeFriend(targetId);
      setFriends(current => current.filter(f => f.id !== targetId));
    }
  };

  const handleBlockUser = async (targetId: string) => {
    if (confirm('Are you sure you want to block this user?')) {
      await socialService.blockUser(targetId);
      setFriends(current => current.filter(f => f.id !== targetId));
      setRequests(current => current.filter(r => r.sender_id !== targetId));
      setSearchResults(current => current.filter(r => r.id !== targetId));
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">SQUAD</h1>
        <p className="text-textMuted font-medium tracking-wider text-sm mt-1 uppercase">YOUR FITNESS CIRCLE</p>
      </div>

      <div className="flex space-x-2 mb-8 bg-surface/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('friends')}
          className={cn(
            "flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2",
            activeTab === 'friends' ? "bg-primary text-black" : "text-textMuted hover:text-white"
          )}
        >
          <Users className="w-4 h-4" /> Friends
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2 relative",
            activeTab === 'requests' ? "bg-primary text-black" : "text-textMuted hover:text-white"
          )}
        >
          <UserPlus className="w-4 h-4" /> Requests
          {requests.length > 0 && activeTab !== 'requests' && (
            <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-red-500"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={cn(
            "flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2",
            activeTab === 'search' ? "bg-primary text-black" : "text-textMuted hover:text-white"
          )}
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </div>

      {loading && <div className="text-center text-textMuted p-8 font-bold uppercase tracking-widest">Loading...</div>}

      {!loading && activeTab === 'friends' && (
        <div className="space-y-4">
          {friends.length === 0 ? (
            <div className="text-center bg-surface/30 border border-border p-8 rounded-xl">
              <Users className="w-12 h-12 text-textMuted mx-auto mb-4" />
              <h3 className="text-lg font-black text-white uppercase mb-2">Your circle is empty</h3>
              <p className="text-textMuted mb-6 text-sm">Find people. Build your squad. Get stronger together.</p>
              <button 
                onClick={() => setActiveTab('search')}
                className="bg-primary text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg hover:bg-primary/90"
              >
                Find Friends
              </button>
            </div>
          ) : (
            friends.map(friend => (
              <div key={friend.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                <Link to={`/u/${friend.username}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="font-black text-primary uppercase text-lg">{friend.display_name?.charAt(0) || friend.username.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase">{friend.display_name}</h4>
                    <p className="text-textMuted text-xs font-bold tracking-widest uppercase">@{friend.username}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleRemoveFriend(friend.id)} className="p-2 text-textMuted hover:text-red-500 rounded-lg hover:bg-surfaceHighlight" title="Remove Friend">
                    <X className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleBlockUser(friend.id)} className="p-2 text-textMuted hover:text-red-500 rounded-lg hover:bg-surfaceHighlight" title="Block User">
                    <ShieldBan className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center bg-surface/30 border border-border p-8 rounded-xl text-textMuted font-bold uppercase tracking-widest">
              No pending requests
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                <Link to={`/u/${req.sender_profile?.username}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center border border-border">
                    <span className="font-black text-textMuted uppercase text-lg">{req.sender_profile?.display_name?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase">{req.sender_profile?.display_name}</h4>
                    <p className="text-textMuted text-xs font-bold tracking-widest uppercase">@{req.sender_profile?.username}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleAccept(req)} className="bg-primary/20 text-primary border border-primary/30 p-2 rounded-lg hover:bg-primary hover:text-black transition-colors" title="Accept">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDecline(req.id)} className="bg-red-500/10 text-red-500 border border-red-500/20 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Decline">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="SEARCH BY USERNAME..."
                className="w-full bg-surface border border-border rounded-xl py-4 pl-12 pr-4 text-white font-bold tracking-widest placeholder:text-textMuted focus:border-primary focus:outline-none uppercase text-sm"
              />
              <button type="submit" className="hidden">Search</button>
            </div>
          </form>

          {!loading && (
            <div className="space-y-4">
              {searchResults.length === 0 && searchQuery ? (
                <div className="text-center text-textMuted p-4 font-bold uppercase tracking-widest text-xs">No users found</div>
              ) : (
                searchResults.map(result => (
                  <div key={result.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                    <Link to={`/u/${result.username}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center border border-border">
                        <span className="font-black text-textMuted uppercase text-lg">{result.display_name?.charAt(0) || result.username.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase">{result.display_name}</h4>
                        <p className="text-textMuted text-xs font-bold tracking-widest uppercase">@{result.username}</p>
                      </div>
                    </Link>
                    <button onClick={() => handleAddFriend(result.id)} className="bg-surfaceHighlight text-white font-bold tracking-widest uppercase text-[10px] px-4 py-2 rounded-lg hover:bg-primary hover:text-black transition-colors">
                      Add Friend
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
