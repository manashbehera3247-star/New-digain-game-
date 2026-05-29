import { useState, useEffect } from 'react';
import { googleSignIn, logout, initAuth, getAccessToken, listChatSpaces, postChatMessage } from '../utils/googleAuth';
import { User } from 'firebase/auth';
import { MessageSquare, RefreshCw, LogIn, LogOut, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface GoogleChatPanelProps {
  language: 'odia' | 'english';
  onAutoBroadcastToggle: (enabled: boolean, spaceName: string | null) => void;
  gameStateLogs: any[];
}

export default function GoogleChatPanel({
  language,
  onAutoBroadcastToggle,
  gameStateLogs
}: GoogleChatPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [autoBroadcast, setAutoBroadcast] = useState<boolean>(false);
  const [manualMessage, setManualMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        fetchSpaces(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setSpaces([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // Update parent when selected space or autobroadcast toggle changes
  useEffect(() => {
    onAutoBroadcastToggle(autoBroadcast, selectedSpace || null);
  }, [autoBroadcast, selectedSpace]);

  const handleSignIn = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        fetchSpaces(result.accessToken);
        setStatus({
          type: 'success',
          text: language === 'odia' ? 'ଗୁଗଲ ଚାଟ୍ ସଫଳତାର ସହ ସଂଯୁକ୍ତ ହେଲା!' : 'Google Chat connected successfully!'
        });
      }
    } catch (e: any) {
      console.error(e);
      setStatus({
        type: 'error',
        text: language === 'odia' ? 'ସଂଯୋଗ ବିଫଳ ହେଲା। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' : 'Authentication failed. Please retry.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setSpaces([]);
      setSelectedSpace('');
      setAutoBroadcast(false);
      setStatus({
        type: 'success',
        text: language === 'odia' ? 'ସଫଳତାର ସହ ଲଗ୍ ଆଉଟ୍ ହୋଇଛି।' : 'Signed out successfully.'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSpaces = async (accessToken: string) => {
    setLoading(true);
    try {
      const spacesList = await listChatSpaces(accessToken);
      setSpaces(spacesList);
      if (spacesList.length > 0) {
        setSelectedSpace(spacesList[0].name);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPost = async () => {
    if (!token || !selectedSpace || !manualMessage.trim()) return;

    // MANDATORY confirmation prompt for posting message
    const targetSpaceObj = spaces.find((s) => s.name === selectedSpace);
    const spaceLabel = targetSpaceObj?.displayName || selectedSpace;
    const confirmMsg = language === 'odia' 
      ? `ଆପଣ ପ୍ରକୃତରେ ଗୁଗଲ ଚାଟ୍ ର "${spaceLabel}" ରୁମକୁ ଏହି ମେସେଜ ପଠାଇବାକୁ ଚାହାଁନ୍ତି କି?`
      : `Are you sure you want to send this message to the Google Chat space "${spaceLabel}"?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    setStatus(null);
    try {
      await postChatMessage(token, selectedSpace, manualMessage.trim());
      setManualMessage('');
      setStatus({
        type: 'success',
        text: language === 'odia' ? 'ଚାଟ୍ ମେସେଜ ସଫଳତାର ସହ ପଠାଗଲା!' : 'Message sent successfully!'
      });
    } catch (e: any) {
      console.error(e);
      setStatus({
        type: 'error',
        text: language === 'odia' ? 'ମେସେଜ ପଠାଇବା ବିଫଳ ହେଲା।' : 'Failed to send message.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBragStatus = () => {
    // Generate text of current situation
    if (gameStateLogs.length === 0) return;
    const lastLog = gameStateLogs[gameStateLogs.length - 1];
    const text = language === 'odia' 
      ? `[ଲୁଡୋ ସୁପ୍ରିମ ଐତିହାସିକ ଅପଡେଟ୍]: ${lastLog.messageOdia}` 
      : `[Ludo Supreme Folklore Live]: ${lastLog.messageEnglish}`;
    setManualMessage(text);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 select-none ring-1 ring-white/5 relative overflow-hidden flex flex-col gap-4 text-left">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full pointer-events-none" />
      
      <div className="flex items-center gap-2.5">
        <MessageSquare className="w-5 h-5 text-cyan-400 shrink-0" />
        <div className="text-left">
          <h3 className="text-sm font-black text-white">
            {language === 'odia' ? 'ଗୁଗଲ ଚାଟ୍ ସହ ପ୍ରସାରଣ' : 'Google Chat Share'}
          </h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            {language === 'odia' ? 'ଐତିହାସିକ ଯୋଦ୍ଧା ମୈତ୍ରୀ ବିବରଣୀ' : 'Game Commentary Streamer'}
          </p>
        </div>
      </div>

      {!user ? (
        <div className="flex flex-col gap-2.5 py-2">
          <p className="text-[11px] text-slate-400 leading-normal">
            {language === 'odia'
              ? 'ନିଜର ଗୁଗଲ ଆକାଉଣ୍ଟ ସହ ସଂଯୋଗ କରି ଲୁଡୋ ସୁପ୍ରିମ ବୀରତା ଏବଂ ଗୋଟି କାଟିବାର ରୋମାଞ୍ଚକାରୀ ରିପୋର୍ଟ ସିଧାସଳଖ ନିଜର ଚାଟ୍ ରୁମକୁ ପଠାନ୍ତୁ।'
              : 'Connect your Google account to broadcast live match summaries and epic folklore dialogue updates straight to your workspace channels.'}
          </p>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-cyan-950/20 cursor-pointer disabled:opacity-45"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span>{language === 'odia' ? 'ଗୁଗଲ୍ ସାଇନ୍ ଇନ୍' : 'Sign in with Google'}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* User Status Bar */}
          <div className="flex items-center justify-between bg-slate-950/40 border border-slate-850 p-2 rounded-2xl">
            <div className="flex items-center gap-2 text-xs">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full ring-1 ring-white/10 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-cyan-600 text-[10px] flex items-center justify-center font-bold text-white uppercase sm:shrink-0">
                  {user.displayName?.substring(0, 1) || 'U'}
                </div>
              )}
              <span className="text-slate-200 truncate font-bold max-w-[120px]">
                {user.displayName || user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl border border-rose-500/20 transition cursor-pointer"
              title="Disconnect"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Space Picker */}
          {spaces.length === 0 ? (
            <div className="text-[10px] text-slate-400 border border-amber-500/10 bg-amber-500/5 p-2.5 rounded-xl leading-relaxed">
              {language === 'odia'
                ? 'କୌଣସି ଗୁଗଲ ଚାଟ୍ ସ୍ପେସ୍ ମିଳିଲା ନାହିଁ। ପ୍ରଥମେ ଗୁଗଲ ଚାଟ୍‌ରେ ସ୍ପେସ୍ ତିଆରି କରନ୍ତୁ।'
                : 'No Google Chat spaces detected. Please create or join a space in your Google Chat app first.'}
              <button
                onClick={() => fetchSpaces(token!)}
                className="mt-2 flex items-center gap-1 text-[10px] text-amber-400 hover:text-white font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 shrink-0" />
                <span>{language === 'odia' ? 'ରିଫ୍ରେଶ୍ କରିବେ' : 'Retry Refresh'}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-left">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {language === 'odia' ? 'ଟାର୍ଗେଟ୍ ମେସେଜ ରୁମ୍:' : 'Broadcast Room:'}
                </label>
                <button
                  onClick={() => fetchSpaces(token!)}
                  disabled={loading}
                  className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Refresh spaces"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <select
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-slate-700"
              >
                {spaces.map((sp) => (
                  <option key={sp.name} value={sp.name}>
                    {sp.displayName || sp.name}
                  </option>
                ))}
              </select>

              {/* Auto Broadcast highlight toggle */}
              <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoBroadcast}
                  onChange={(e) => setAutoBroadcast(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-cyan-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                />
                <span className="text-[10px] text-slate-300 font-bold">
                  {language === 'odia' ? 'ଐତିହାସିକ କୀର୍ତ୍ତି ଅଟୋ ପ୍ରସାରଣ' : 'Auto-broadcast major highlights'}
                </span>
              </label>
            </div>
          )}

          {/* Quick manual brag message box */}
          {spaces.length > 0 && (
            <div className="pt-2 border-t border-slate-850 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                <span>{language === 'odia' ? 'ମେସେଜ୍ ଲେଖନ୍ତୁ:' : 'Compose Message:'}</span>
                <button
                  onClick={handleBragStatus}
                  className="text-[9px] text-cyan-400 hover:text-white underline cursor-pointer"
                >
                  {language === 'odia' ? 'ବର୍ତ୍ତମାନ ପରିସ୍ଥିତି ଲୋଡ୍ କରନ୍ତୁ' : 'Format Current Status'}
                </button>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  placeholder={
                    language === 'odia'
                      ? 'ରଣକୀର୍ତ୍ତି ଗୁଗଲ ଚାଟ୍‌ରେ ଜଣାନ୍ତୁ...'
                      : 'Send game status update...'
                  }
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-850 text-xs text-slate-100 rounded-xl focus:outline-none focus:border-slate-700 flex-1 placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={handleManualPost}
                  disabled={loading || !manualMessage.trim()}
                  className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl border border-cyan-500/25 text-white transition cursor-pointer disabled:opacity-45"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Messages Banner */}
      {status && (
        <div
          className={`px-3 py-2 rounded-xl text-[11px] leading-snug flex items-start gap-2 border ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-450'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          )}
          <span>{status.text}</span>
        </div>
      )}
    </div>
  );
}
