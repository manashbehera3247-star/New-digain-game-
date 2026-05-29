import { useRef, useEffect, useState } from 'react';
import { ScrollText, Award, HelpCircle, Gamepad2, ShieldAlert, Play, Square, Music, Disc, Sparkles } from 'lucide-react';
import { PlayerColor, LogEntry, Token, Player, COLOR_THEMES } from '../types';
import { gameAudio } from '../utils/audio';

interface SidebarPanelProps {
  logs: LogEntry[];
  tokens: Record<PlayerColor, Token[]>;
  players: Record<PlayerColor, Player>;
  language: 'odia' | 'english';
  winnerList: PlayerColor[];
}

export default function SidebarPanel({ logs, tokens, players, language, winnerList }: SidebarPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>([15, 20, 10, 35, 45, 12, 18, 30, 25, 40, 15, 20]);

  // Synchronize playing states with the global sound utility
  useEffect(() => {
    const syncBgm = () => {
      setIsPlaying(gameAudio.getIsBgmPlaying());
    };
    syncBgm();
    const interval = setInterval(syncBgm, 400);
    return () => clearInterval(interval);
  }, []);

  // Smooth visualizer spectrum simulator using requestAnimationFrame for pristine animations
  useEffect(() => {
    let rAFId: number;
    
    const updateVisualizer = () => {
      if (isPlaying) {
        setVisualizerHeights(prev =>
          prev.map(h => {
            const delta = Math.floor(Math.random() * 24) - 12;
            const next = h + delta;
            return Math.max(8, Math.min(80, next));
          })
        );
      } else {
        setVisualizerHeights(prev =>
          prev.map(h => (h > 6 ? Math.max(4, h - 3) : 4))
        );
      }
      rAFId = requestAnimationFrame(updateVisualizer);
    };
    
    updateVisualizer();
    return () => cancelAnimationFrame(rAFId);
  }, [isPlaying]);

  const handleToggleBGM = () => {
    if (isPlaying) {
      gameAudio.stopTraditionalBGM();
      setIsPlaying(false);
    } else {
      gameAudio.playTraditionalBGM();
      setIsPlaying(true);
    }
  };

  const handleInstrumentPlay = (type: 'baya' | 'dahana' | 'sankha' | 'sa' | 'pa' | 'dha_high') => {
    if (type === 'baya') {
      gameAudio.playMardala(true, 1.2);
    } else if (type === 'dahana') {
      gameAudio.playMardala(false, 1.2);
    } else if (type === 'sankha') {
      gameAudio.playSankha();
    } else if (type === 'sa') {
      gameAudio.playMahuriNote(261.63, 0.4);
    } else if (type === 'pa') {
      gameAudio.playMahuriNote(392.00, 0.4);
    } else if (type === 'dha_high') {
      gameAudio.playMahuriNote(523.25, 0.4);
    }

    // Momentarily burst the visualizer heights to show immediate tactile feedback
    setVisualizerHeights(prev => prev.map(() => Math.floor(Math.random() * 40) + 55));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Translate labels
  const UI = {
    statsTitle: language === 'odia' ? 'ଖେଳର ସ୍ଥିତି' : 'Match Statistics',
    logTitle: language === 'odia' ? 'ଖେଳର ବିବରଣୀ' : 'Live Match Commentary',
    rulesTitle: language === 'odia' ? 'ଖେଳର ନିୟମାବଳୀ' : 'Ludo Classic Rules',
    yard: language === 'odia' ? 'ବେସ୍‌' : 'Base',
    track: language === 'odia' ? 'ଟ୍ରାକ୍‌' : 'Track',
    home: language === 'odia' ? 'ହୋମ୍‌' : 'Home',
    rulesList: language === 'odia' ? [
      'ୟାର୍ଡରୁ ଗୋଟି ବାହାର କରିବା ପାଇଁ କେବଳ ଛକା (6) ଆବଶ୍ୟକ।',
      'ସମସ୍ତ ୪ଟି ଗୋଟି ହୋମ୍ (ମଝି ସ୍ଥାନ) କୁ ଗଲେ ହିଁ ବିଜେତା ଘୋଷଣା ହେବେ।',
      'ବୋର୍ଡରେ ୮ଟି ନକ୍ଷତ୍ର (Star) ଚିହ୍ନିତ ସ୍ଥାନ ଅଛି, ଯାହା ସୁରକ୍ଷିତ। ସେଠାରେ ବିରୋଧୀ ଆପଣଙ୍କୁ କାଟିପାରିବେ ନାହିଁ।',
      'ଗୋଟିଏ ଛକା ପଡ଼ିଲେ ଅତିରିକ୍ତ ପାଳି ମିଳେ। ୩ଥର କ୍ରମାଗତ ଛକା ପଡ଼ିଲେ ସେହି ପାଳି ବାତିଲ ହେବ।',
      'ବିରୋଧୀଙ୍କ ଗୋଟି କାଟିଲେ ବା ଗୋଟି ହୋମ୍‌ରେ ପ୍ରବେଶ କଲେ ଆଉ ଏକ ବୋନସ୍ ପାଳି ମିଳେ।'
    ] : [
      'Need a Six (6) to release a token from the starting base/yard.',
      'To win, all 4 tokens must reach the central Home triangle exactly.',
      'There are 8 star-marked cells acting as safe zones where capturing is disabled.',
      'Rolling a 6 grants a bonus turn. Three consecutive 6s cancel the turn.',
      'Capturing an opponent piece or reaching home grants an immediate bonus roll.'
    ],
    noLogs: language === 'odia' ? 'ଖେଳ ଏବେ ଆରମ୍ଭ ହେଲା।' : 'Match has just begun. Best of luck!',
    winnersLabel: language === 'odia' ? 'ବିଜେତା କ୍ରମ' : 'Leaderboard'
  };

  // Helper to count locations of tokens for a color
  const getStats = (color: PlayerColor) => {
    let yardCount = 0;
    let trackCount = 0;
    let homeCount = 0;

    tokens[color].forEach((t) => {
      if (t.step === 0) yardCount++;
      else if (t.step === 57) homeCount++;
      else trackCount++;
    });

    return { yardCount, trackCount, homeCount };
  };

  return (
    <div className="flex flex-col gap-5 h-full w-full">
      {/* 1. Leaderboard / Winner Panel (only if there are winners) */}
      {winnerList.length > 0 && (
        <div className="bg-slate-900/50 border border-amber-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur">
          <h4 className="text-sm font-bold text-amber-500 uppercase tracking-tighter italic flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>{UI.winnersLabel} (Leaderboard)</span>
          </h4>
          <div className="space-y-3">
            {winnerList.map((col, idx) => {
              const theme = COLOR_THEMES[col];
              const player = players[col];
              return (
                <div
                  key={col}
                  className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-850"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-amber-400 w-5">#{idx + 1}</span>
                    <span className={`w-3.5 h-3.5 rounded-full ${theme.primary} shadow-md`} />
                    <span className="text-xs font-bold text-slate-100">{player.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                    {language === 'odia' ? 'ବିଜେତା' : 'Winner'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Real-time stats */}
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur rounded-3xl p-5 shadow-2xl">
        <h4 className="text-sm font-bold text-orange-500 mb-4 uppercase tracking-tighter italic flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-orange-500" />
          <span>{UI.statsTitle}</span>
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {(['RED', 'GREEN', 'YELLOW', 'BLUE'] as PlayerColor[]).map((col) => {
            const player = players[col];
            if (!player.isActive) return null;

            const theme = COLOR_THEMES[col];
            const stats = getStats(col);

            return (
              <div
                key={col}
                className="p-3 rounded-2xl bg-slate-950/90 border border-slate-850 flex flex-col justify-between"
              >
                {/* Headers */}
                <div className="flex items-center gap-1.5 mb-2 overflow-hidden">
                  <span className={`w-2.5 h-2.5 rounded-full ${theme.primary} shrink-0`} />
                  <span className="text-[11px] font-black text-slate-200 truncate">{player.name}</span>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="bg-slate-900/50 rounded-lg py-1 border border-slate-900">
                    <div className="text-[9px] text-slate-500">{UI.yard}</div>
                    <div className="text-xs font-black text-slate-300">{stats.yardCount}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg py-1 border border-slate-900">
                    <div className="text-[9px] text-cyan-500/70">{UI.track}</div>
                    <div className="text-xs font-black text-cyan-400">{stats.trackCount}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg py-1 border border-slate-900">
                    <div className="text-[9px] text-emerald-500/70">{UI.home}</div>
                    <div className="text-xs font-black text-emerald-400">{stats.homeCount}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immersive Classical Odia Music Player with Dynamic Waveform & Live Jam Pads */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-violet-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header containing spinning disc or active pulse indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 text-left">
            <div className={`p-2 rounded-xl bg-violet-500/10 border border-violet-500/25 ${isPlaying ? 'animate-bounce text-violet-400' : 'text-slate-400'}`}>
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                <span>{language === 'odia' ? 'ଓଡ଼ିଶୀ ବାଦ୍ୟ ମନ୍ଦିର' : 'Traditional Music Box'}</span>
                {isPlaying && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                {isPlaying ? (language === 'odia' ? 'ରାଗ ମୋହନ • ୧୨୦ ବିପିଏମ୍' : 'Raga Mohana • 120 BPM') : (language === 'odia' ? 'ବାଦ୍ୟ ବନ୍ଦ ଅଛି' : 'Synthesizer Idle')}
              </p>
            </div>
          </div>
          
          {/* Main toggle */}
          <button
            onClick={handleToggleBGM}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              isPlaying
                ? 'bg-rose-500/20 border border-rose-500/35 text-rose-300 shadow-lg shadow-rose-950/20'
                : 'bg-violet-600 hover:bg-violet-550 border border-violet-500/20 text-white shadow-lg shadow-violet-950/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3 h-3 fill-rose-300" />
                <span>{language === 'odia' ? 'ବନ୍ଦ' : 'Stop'}</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-white animate-pulse" />
                <span>{language === 'odia' ? 'ବଜାନ୍ତୁ' : 'Play'}</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time Dynamic Waveform Spectrum Visualizer */}
        <div className="bg-slate-950/80 border border-slate-900/60 rounded-2xl h-14 px-3 flex items-end justify-between gap-1 mb-4 overflow-hidden shadow-inner">
          {visualizerHeights.map((height, idx) => (
            <div
              key={idx}
              className="w-full rounded-t bg-gradient-to-t from-violet-600 via-indigo-500 to-cyan-400 transition-all duration-75"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {/* Live Jam Pads Title */}
        <div className="text-left mb-2 pl-0.5">
          <span className="text-[9px] uppercase font-black tracking-widest text-violet-400/80 bg-violet-950/40 border border-violet-500/20 px-2 py-0.5 rounded-md">
            {language === 'odia' ? 'ସିଧାସଳଖ ବଜାନ୍ତୁ (Live Jam Pads):' : 'Interactive Live Jam Pads:'}
          </span>
        </div>

        {/* Interactive Jam Pad Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {/* Mardala Baya Pitch */}
          <button
            onClick={() => handleInstrumentPlay('baya')}
            className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-[10px] text-slate-300 hover:text-white transition cursor-pointer font-bold flex flex-col items-center gap-0.5"
            title={language === 'odia' ? 'ମର୍ଦଳ ବାୟା (Dhum)' : 'Mardala Baya (Dhum)'}
          >
            <span className="text-sm">🪘</span>
            <span className="font-mono text-[9px] text-slate-400">{language === 'odia' ? 'ବାୟା' : 'Baya'}</span>
          </button>

          {/* Mardala Dahana Pitch */}
          <button
            onClick={() => handleInstrumentPlay('dahana')}
            className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-[10px] text-slate-300 hover:text-white transition cursor-pointer font-bold flex flex-col items-center gap-0.5"
            title={language === 'odia' ? 'ମର୍ଦଳ ଡାହାଣ (Takh)' : 'Mardala Dahana (Takh)'}
          >
            <span className="text-sm">🪘</span>
            <span className="font-mono text-[9px] text-slate-400">{language === 'odia' ? 'ଡାହାଣ' : 'Dahana'}</span>
          </button>

          {/* Sankha / Conch blow */}
          <button
            onClick={() => handleInstrumentPlay('sankha')}
            className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/30 text-[10px] text-slate-300 hover:text-white transition cursor-pointer font-bold flex flex-col items-center gap-0.5"
            title={language === 'odia' ? 'ଶଙ୍ଖ' : 'Blow Conch'}
          >
            <span className="text-sm">📯</span>
            <span className="font-mono text-[9px] text-amber-400/80">{language === 'odia' ? 'ଶଙ୍ଖ' : 'Sankha'}</span>
          </button>

          {/* Mahuri Key Sa */}
          <button
            onClick={() => handleInstrumentPlay('sa')}
            className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-[10px] text-slate-350 hover:text-white transition cursor-pointer font-bold flex flex-col items-center gap-0.5"
            title="Mahuri Scale Note C4"
          >
            <span className="text-sm">🪈</span>
            <span className="font-mono text-[8px] text-violet-400">MAHURI (Sa)</span>
          </button>

          {/* Mahuri Key Pa */}
          <button
            onClick={() => handleInstrumentPlay('pa')}
            className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-[10px] text-slate-350 hover:text-white transition cursor-pointer font-bold flex flex-col items-center gap-0.5"
            title="Mahuri Scale Note G4"
          >
            <span className="text-sm">🪈</span>
            <span className="font-mono text-[8px] text-violet-400">MAHURI (Pa)</span>
          </button>

          {/* Mahuri Key High Sa */}
          <button
            onClick={() => handleInstrumentPlay('dha_high')}
            className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-[10px] text-slate-350 hover:text-white transition cursor-pointer font-bold flex flex-col items-center gap-0.5"
            title="Mahuri Scale Note C5"
          >
            <span className="text-sm">🪈</span>
            <span className="font-mono text-[8px] text-violet-400">MAHURI (High Sa)</span>
          </button>
        </div>
      </div>

      {/* 3. Live Log Panel */}
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur rounded-3xl p-5 shadow-2xl flex-1 flex flex-col min-h-[220px]">
        <h4 className="text-sm font-bold text-teal-400 mb-4 uppercase tracking-tighter italic flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-teal-400" />
          <span>{UI.logTitle}</span>
        </h4>

        {/* Console-like logger box */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto max-h-[220px] space-y-2.5 pr-1 text-xs font-mono bg-slate-950 p-4 rounded-2xl border border-slate-850 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent text-left"
        >
          {logs.length === 0 ? (
            <div className="text-slate-600 italic text-center py-4">{UI.noLogs}</div>
          ) : (
            logs.map((log) => {
              let colorClasses = 'text-slate-300';
              if (log.type === 'kill') colorClasses = 'text-rose-400 font-extrabold';
              else if (log.type === 'home') colorClasses = 'text-emerald-400 font-extrabold';
              else if (log.type === 'win') colorClasses = 'text-amber-400 font-black';

              return (
                <div
                  key={log.id}
                  className="pb-2 border-b border-slate-900/40 last:border-none last:pb-0"
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className={colorClasses}>
                      {language === 'odia' ? log.messageOdia : log.messageEnglish}
                    </span>
                    <span className="text-[9px] text-slate-600 select-none shrink-0 ml-2">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Help Rules Details */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span>{UI.rulesTitle}</span>
        </h4>
        <ul className="text-left text-[11px] leading-relaxed text-slate-400 space-y-1.5 list-disc list-inside">
          {UI.rulesList.map((rule, idx) => (
            <li key={idx} className="text-slate-400">
              <span className="text-slate-300">{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
