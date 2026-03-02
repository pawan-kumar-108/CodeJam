'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Swords, Ghost, Search, X, Trophy, ChevronLeft, ChevronRight, UserPlus, Zap, Flame, Activity, Gift, Share2, Check, Clock, Lock } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast, { ToastType } from './ui/Toast';

function TimeAgo({ timestamp }: { timestamp: number }) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return <>{minutes}m ago</>;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return <>{hours}h ago</>;
    return <>{Math.floor(hours / 24)}d ago</>;
}

const getFriendlyErrorMessage = (error: any): string => {
    // 1. Get the raw message
    let msg = error.message || error.toString();
    
    // 2. Strip technical prefixes from Convex
    // Matches "[CONVEX ...]" and "Server Error Uncaught Error:" patterns
    msg = msg.replace(/^\[CONVEX.*?\]\s*/, "")
             .replace(/^\[Request ID:.*?\]\s*/, "")
             .replace(/^Server Error\s*/, "")
             .replace(/^Uncaught Error:\s*/, "");

    // 3. Check for specific known messages
    if (msg.includes("Request already sent") || msg.includes("already friends")) return "Request pending or already friends";
    if (msg.includes("Guest users cannot access") || msg.includes("Please sign up")) return "Sign up to unlock social features!";
    if (msg.includes("User not found")) return "User not found. Check email.";
    if (msg.includes("Cannot add yourself")) return "You cannot add yourself.";
    
    // 4. Fallback: Return the cleaned first line
    return msg.split('\n')[0];
};

const isUserOnline = (lastSeen?: number) => {
    if (!lastSeen) return false;
    return Date.now() - lastSeen < 1000 * 60 * 5; // 5 mins
};

interface FriendsSidebarProps {
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function FriendsSidebar({ isMobileOpen = false, onMobileClose }: FriendsSidebarProps) {
  const user = useQuery(api.users.viewer);
  const friendsRaw = useQuery(api.social.getFriends);
  
  // Force re-render every minute to update online status
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const friends = friendsRaw?.map((f: any) => ({
      ...f,
      isOnline: isUserOnline(f.lastSeen)
  }));
  const activities = useQuery(api.social.getFriendsActivity);
  const notifications = useQuery(api.social.getNotifications);
  const sendRequest = useMutation(api.social.sendFriendRequest);
  const acceptRequest = useMutation(api.social.acceptFriendRequest);
  const rejectRequest = useMutation(api.social.rejectFriendRequest);
  const createBattle = useMutation(api.social.createBattle);
  const markRead = useMutation(api.social.markRead);

  // Filter Revenge Notifications
  const revengeNotifs = notifications?.filter((n: any) => n.type === 'revenge') || [];

  // SEARCH STATE
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = useQuery(api.users.searchUsers, { query: searchQuery });
  
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState('syntax-smasher');

  // Toast State
  const handleBattleRevenge = async (notif: any) => {
      try {
          const result = await createBattle({
              opponentId: notif.data.senderId,
              gameId: notif.data.gameId,
              mode: 'ghost'
          });
          await markRead({ notificationId: notif._id });
          if (result.battleId) {
             router.push(`/dashboard/arena/${notif.data.gameId}?battleId=${result.battleId}`);
          }
      } catch (err: any) {
          showToast(getFriendlyErrorMessage(err), 'error');
      }
  };

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
      message: '',
      type: 'info',
      isVisible: false
  });

  const showToast = (message: string, type: ToastType = 'info') => {
      setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    const stored = localStorage.getItem('friends-sidebar-collapsed');
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('friends-sidebar-collapsed', String(newState));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSendRequest = async (targetId: any) => {
    try {
      // @ts-ignore
      const result = await sendRequest({ targetId });
      if (result && 'error' in result) {
          showToast(result.error as string, 'error');
      } else {
          setSearchQuery('');
          showToast('Friend Request Sent', 'success');
      }
    } catch (err: any) {
      showToast(getFriendlyErrorMessage(err), 'error');
    }
  };

  const handleAccept = async (id: any) => {
      const result = await acceptRequest({ friendshipId: id });
      if (result && 'error' in result) {
          showToast(result.error as string, 'error');
      }
  };

  const handleReject = async (id: any) => {
      const result = await rejectRequest({ friendshipId: id });
      if (result && 'error' in result) {
          showToast(result.error as string, 'error');
      }
  };

  const handleChallenge = async () => {
    if (!selectedFriend) return;
    
    // Default to 'ghost' to ensure the viral "Beat Score" loop works reliably.
    // 'live' mode is reserved for future real-time socket implementation.
    const mode = 'ghost'; 
    
    try {
        const result = await createBattle({
            opponentId: selectedFriend.friendId,
            gameId: selectedGame,
            mode: mode
        });
        
        if (result && 'error' in result) {
            showToast(result.error as string, 'error');
            return;
        }

        // @ts-ignore - Validated success above
        const battleId = result.battleId;
        
        router.push(`/dashboard/arena/${selectedGame}?battle=${battleId}&mode=${mode}`);
        setBattleModalOpen(false);
    } catch (err: any) {
        showToast(getFriendlyErrorMessage(err), 'error');
    }
  };

  // Derived lists
  const onlineFriends = friends?.filter((f: any) => f.status === 'active') || []; // Showing all active for list, sorting by online
  const sortedFriends = [...onlineFriends].sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));
  
  const pendingRequests = friends?.filter((f: any) => f.status === 'pending' && !f.initiatedByMe) || [];
  
  // Counts
  const onlineCount = onlineFriends.filter(f => f.isOnline).length;

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={onMobileClose}
        />
      )}
    <motion.aside
        initial={{ opacity: 0 }}
        animate={{ 
            opacity: 1,
            width: isMobileOpen ? 320 : (isCollapsed ? 80 : 320)
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed right-0 top-0 bottom-0 bg-[#0A0A0A] border-l border-white/5 z-[70] flex flex-col shadow-2xl font-sans transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
    >
        {isMobileOpen && (
           <button 
             onClick={onMobileClose}
             className="absolute md:hidden top-3 right-3 p-2 text-gray-400 hover:text-white z-[60]"
           >
             <X size={24} />
           </button>
        )}

        {/* Guest Lock Overlay */}
        {user?.isAnonymous && !isCollapsed && (
            <div className="absolute inset-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-nav-orange/10 rounded-full flex items-center justify-center mb-4 text-nav-orange">
                    <Lock size={32} />
                </div>
                <h3 className="text-white font-black uppercase tracking-tight text-lg mb-2">Social Hub Locked</h3>
                <p className="text-gray-400 text-xs font-bold mb-6 max-w-[200px]">
                    Create a free account to add friends, battle ghosts, and track global leaderboards.
                </p>
                <button 
                    onClick={() => router.push('/')}
                    className="w-full py-3 bg-white text-black font-black uppercase tracking-wide rounded-xl hover:bg-nav-orange transition-colors"
                >
                    Unlock Features
                </button>
            </div>
        )}

        {/* Toggle Button */}
        <button
            onClick={toggleCollapse}
            className="absolute -left-3 top-8 w-6 h-6 bg-nav-lime rounded-full hidden md:flex items-center justify-center text-black hover:scale-110 transition-transform z-50 shadow-lg"
        >
            {isCollapsed ? <ChevronLeft size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
        </button>

        {/* HEADER */}
        <div className="p-6 pb-2 flex items-center justify-between shrink-0">
            {isCollapsed ? (
                <div className="w-full flex justify-center">
                    <Users size={20} className="text-nav-lime" />
                </div>
            ) : (
                <div className="flex items-center gap-3 w-full">
                    <Users size={20} className="text-nav-lime" />
                    <h2 className="text-white font-bold text-lg">Social</h2>
                </div>
            )}
        </div>

        {/* TABS */}
        {!isCollapsed && (
            <div className="px-6 pb-2 pt-2">
                <div className="flex bg-[#111] rounded-xl p-1 border border-white/10 relative">
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-lg shadow-sm"
                        animate={{ left: activeTab === 'friends' ? '4px' : 'calc(50%)' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <button 
                        onClick={() => setActiveTab('friends')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'friends' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Friends
                    </button>
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Requests
                        {pendingRequests.length > 0 && (
                            <span className="bg-[#FF552E] text-white text-[9px] px-1.5 rounded-full">{pendingRequests.length}</span>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-8 mt-2">
            
            {/* COLLAPSED VIEW */}
            {isCollapsed && (
                <div className="flex flex-col items-center gap-4 mt-4">
                    {onlineFriends.slice(0, 5).map((friend: any) => (
                        <div key={friend._id} className="relative cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/10 group-hover:border-nav-lime transition-colors">
                                {friend.image ? (
                                    <img src={friend.image} alt={friend.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
                                )}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0A0A0A] ${friend.isOnline ? 'bg-nav-lime' : 'bg-gray-600'}`} />
                        </div>
                    ))}
                    <button onClick={() => { toggleCollapse(); }} className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <UserPlus size={18} />
                    </button>
                </div>
            )}

            {/* EXPANDED VIEW */}
            {!isCollapsed && activeTab === 'friends' && (
                <>
                     {/* REVENGE SECTION */}
                     {revengeNotifs.length > 0 && (
                        <div className="mb-6 space-y-3">
                            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                <Swords size={12} strokeWidth={3} /> Revenge Available
                            </h3>
                            {revengeNotifs.map((notif: any) => (
                                <div key={notif._id} className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-3 group hover:bg-red-500/20 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-nav-black border border-white/10 overflow-hidden shrink-0">
                                        {notif.senderImage ? ( 
                                            <img src={notif.senderImage} alt="rival" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-red-900" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{notif.senderName}</p>
                                        <p className="text-[10px] text-red-400 font-bold truncate uppercase">{notif.data.message}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleBattleRevenge(notif)}
                                        className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                                        title="Revenge Battle"
                                    >
                                        <Swords size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Friend Input (Search) */}
                    <div className="mb-6 relative group z-30">
                        <div className="flex items-center gap-2 bg-[#111] border border-white/10 rounded-xl px-3 py-3 transition-colors focus-within:border-white/30 focus-within:bg-[#161616]">
                            <Search size={16} className="text-gray-500" />
                            <input 
                                type="text"
                                placeholder="Find users..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full font-medium"
                            />
                        </div>
                        
                        {/* Search Results Dropdown */}
                        {searchQuery.length >= 2 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-[100]">
                                {searchResults?.length ? (
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {searchResults.map((user: any) => (
                                            <div 
                                                key={user._id} 
                                                className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                                        {user.customAvatar || user.image ? (
                                                            <img src={user.customAvatar || user.image} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-700 font-bold text-xs">
                                                                {user.name?.[0]?.toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{user.name}</div>
                                                        <div className="text-[10px] text-gray-500">Rank {user.level || 1}</div>
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    onClick={() => handleSendRequest(user._id)}
                                                    className="p-2 bg-nav-lime text-black rounded-lg hover:bg-white transition-colors"
                                                    title="Send Friend Request"
                                                >
                                                    <UserPlus size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-xs text-gray-500 italic">
                                        No users found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SECTION: ONLINE NOW */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-nav-lime" />
                                <span className="text-gray-400 font-bold text-xs">Online Now</span>
                            </div>
                            <span className="text-nav-lime font-bold text-xs">{onlineCount}</span>
                        </div>

                        <div className="space-y-2">
                            {sortedFriends.map((friend: any) => (
                                <div key={friend._id} className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                                {friend.image ? (
                                                    <img src={friend.image} alt={friend.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                                                )}
                                            </div>
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0A0A0A] ${friend.isOnline ? 'bg-nav-lime' : 'bg-gray-600'}`} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm">{friend.name}</div>
                                            <div className={`text-[10px] font-bold ${friend.isOnline ? 'text-nav-lime' : 'text-gray-600'}`}>
                                                {friend.isOnline ? 'Coding now' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => { setSelectedFriend(friend); setBattleModalOpen(true); }}
                                        className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Swords size={14} />
                                    </button>
                                </div>
                            ))}
                            {onlineFriends.length === 0 && (
                                <div className="text-gray-600 text-xs font-bold pl-2">Add friends to start</div>
                            )}
                        </div>
                    </div>

                    {/* SECTION: ACTIVITY */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 mt-6">
                            <Activity size={14} className="text-nav-orange" />
                            <span className="text-gray-400 font-bold text-xs">Activity</span>
                        </div>
                        
                        <div className="bg-[#111] rounded-2xl p-1 space-y-1">
                            {activities?.map((act: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0">
                                         {act.userImage ? (
                                            <img src={act.userImage} alt={act.userName} className="w-full h-full object-cover" />
                                         ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                                         )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white text-xs font-bold truncate">
                                            {act.userName} <span className="text-gray-400 font-medium">{act.type === 'Game Win' ? `earned +${act.xp} XP` : 'completed a quest'}</span>
                                        </div>
                                        <div className="text-gray-600 text-[10px] font-bold flex items-center gap-1">
                                            <Clock size={10} /> <TimeAgo timestamp={act.timestamp} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!activities || activities.length === 0) && (
                                <div className="p-4 text-center text-gray-600 text-[10px] font-bold">No recent activity</div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* EXPANDED VIEW - REQUESTS */}
            {!isCollapsed && activeTab === 'requests' && (
                <>
                    {/* SECTION: REQUESTS */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <UserPlus size={14} className="text-[#797EF6]" />
                                <span className="text-gray-400 font-bold text-xs">Incoming</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {pendingRequests.map((req: any) => (
                                <div key={req._id} className="bg-[#111] p-3 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-800" />
                                        <div>
                                            <div className="text-white font-bold text-sm">{req.name}</div>
                                            <div className="text-gray-500 text-[10px] font-bold">New invite</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleAccept(req._id)}
                                            className="w-8 h-8 bg-nav-lime rounded-xl flex items-center justify-center text-black hover:scale-105 transition-transform"
                                        >
                                            <Check size={16} strokeWidth={3} />
                                        </button>
                                        <button 
                                            onClick={() => handleReject(req._id)}
                                            className="w-8 h-8 bg-[#222] rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                        >
                                            <X size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {pendingRequests.length === 0 && (
                                <div className="text-center py-8 text-gray-600 text-xs font-bold">No pending requests</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* FOOTER - INVITE CARD */}
        {!isCollapsed && (
            <div className="p-4 shrink-0">
                <div className="bg-[#111] rounded-3xl p-5 border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 bg-nav-lime rounded-2xl flex items-center justify-center text-black shadow-lg shadow-nav-lime/20">
                            <Gift size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="text-white font-black text-sm uppercase">Invite Friends</div>
                            <div className="text-gray-400 text-xs font-bold">Earn 200 XP each</div>
                        </div>
                    </div>
                    
                    <button className="w-full bg-nav-lime text-black h-12 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform relative z-10">
                        Share Invite Link <Share2 size={14} />
                    </button>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-nav-lime/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        )}

        {/* BATTLE MODAL */}
        <AnimatePresence>
            {battleModalOpen && selectedFriend && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full relative shadow-2xl"
                    >
                        <button onClick={() => setBattleModalOpen(false)} className="absolute right-6 top-6 text-gray-500 hover:text-white">
                            <X size={24} />
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Versus</h2>
                            <div className="text-xl font-bold text-gray-400 mb-6">{selectedFriend.name}</div>
                            
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${selectedFriend.isOnline ? 'bg-nav-lime/10 text-nav-lime' : 'bg-gray-800 text-gray-400'}`}>
                                {selectedFriend.isOnline ? (
                                    <><span>●</span> Live Battle</>
                                ) : (
                                    <><span>○</span> Ghost Mode</>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            {['syntax-smasher', 'logic-labyrinth', 'css-combat'].map(game => (
                                <button
                                    key={game}
                                    onClick={() => setSelectedGame(game)}
                                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                                        selectedGame === game 
                                        ? 'bg-white text-black border-white scale-[1.02]' 
                                        : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:bg-white/5'
                                    }`}
                                >
                                    <span className="font-bold uppercase text-xs tracking-wide">{game.replace('-', ' ')}</span>
                                    {selectedGame === game && <Trophy size={16} />}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleChallenge}
                            className="w-full py-4 bg-nav-orange text-black font-black uppercase tracking-wide rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-nav-orange/20"
                        >
                            <Swords size={20} /> 
                            {selectedFriend.isOnline ? 'Send Challenge' : 'Fight Ghost'}
                        </button>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        <Toast 
            message={toast.message} 
            type={toast.type} 
            isVisible={toast.isVisible} 
            onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
        />
    </motion.aside>
    </>
  );
}
