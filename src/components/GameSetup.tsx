import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Bot, User, Check, Play, Volume2, VolumeX, Mic, MicOff, Languages, BookOpen, Shield, Sparkles } from 'lucide-react';
import { PlayerColor, PlayerType, Player, COLOR_THEMES } from '../types';
import { ODIA_FOLKLORE_CHARACTERS, FolkloreCharacter } from '../data/characters';
import PhonepeUpiModal from './PhonepeUpiModal';

interface GameSetupProps {
  onStartGame: (
    playerConfigs: Record<PlayerColor, Player>,
    voiceEnabled: boolean,
    lang: 'odia' | 'english'
  ) => void;
  defaultLang: 'odia' | 'english';
}

export default function GameSetup({ onStartGame, defaultLang }: GameSetupProps) {
  const [lang, setLang] = useState<'odia' | 'english'>(defaultLang);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(true);

  // Lifetime PRO unlocked check via localStorage
  const [isLifetimePro, setIsLifetimePro] = useState<boolean>(() => {
    return localStorage.getItem('ludo_supreme_pro_unlocked') === 'true';
  });
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);

  // Core player types
  const [playerTypes, setPlayerTypes] = useState<Record<PlayerColor, PlayerType>>({
    RED: 'human',
    GREEN: 'bot',
    YELLOW: 'inactive',
    BLUE: 'bot'
  });

  // Selected characters from folklore
  const [playerCharacters, setPlayerCharacters] = useState<Record<PlayerColor, string>>({
    RED: '',
    GREEN: 'dharmapada',
    YELLOW: '',
    BLUE: 'kharavela'
  });

  // Custom player names overrides
  const [playerNames, setPlayerNames] = useState<Record<PlayerColor, string>>({
    RED: '',
    GREEN: '',
    YELLOW: '',
    BLUE: ''
  });

  // Keep track of active backstory modals
  const [inspectCharacter, setInspectCharacter] = useState<FolkloreCharacter | null>(null);

  const handlePlayerTypeChange = (color: PlayerColor, type: PlayerType) => {
    setPlayerTypes((prev) => {
      const next = { ...prev, [color]: type };
      // If inactive, clear character
      if (type === 'inactive') {
        setPlayerCharacters((prevChar) => ({ ...prevChar, [color]: '' }));
      } else if (type === 'bot' && !playerCharacters[color]) {
        // Pre-fill bot with an available character
        const used = Object.values({ ...playerCharacters, [color]: '' }).filter(Boolean);
        const nextChar = ODIA_FOLKLORE_CHARACTERS.find((c) => !used.includes(c.id));
        if (nextChar) {
          setPlayerCharacters((prevChar) => ({ ...prevChar, [color]: nextChar.id }));
        }
      }
      return next;
    });
  };

  const handleNameChange = (color: PlayerColor, name: string) => {
    setPlayerNames((prev) => ({ ...prev, [color]: name }));
  };

  const handleCharacterSelect = (color: PlayerColor, charId: string) => {
    setPlayerCharacters((prev) => ({ ...prev, [color]: charId }));
    const char = ODIA_FOLKLORE_CHARACTERS.find((c) => c.id === charId);
    if (char) {
      setPlayerNames((prev) => ({
        ...prev,
        [color]: lang === 'odia' ? `${char.nameOdia}` : `${char.nameEng}`
      }));
    } else {
      setPlayerNames((prev) => ({ ...prev, [color]: '' }));
    }
  };

  const loadPreset = (preset: '2P' | '4P' | 'VSBOT' | 'COMP') => {
    if (preset === '2P') {
      setPlayerTypes({
        RED: 'human',
        GREEN: 'inactive',
        YELLOW: 'human',
        BLUE: 'inactive'
      });
      setPlayerCharacters({
        RED: '',
        GREEN: '',
        YELLOW: 'dharmapada',
        BLUE: ''
      });
      setPlayerNames({
        RED: '',
        GREEN: '',
        YELLOW: lang === 'odia' ? 'ଧର୍ମପଦ' : 'Dharmapada',
        BLUE: ''
      });
    } else if (preset === '4P') {
      setPlayerTypes({
        RED: 'human',
        GREEN: 'human',
        YELLOW: 'human',
        BLUE: 'human'
      });
      setPlayerCharacters({
        RED: 'baji_rout',
        GREEN: 'dharmapada',
        YELLOW: 'jayee_rajguru',
        BLUE: 'bakshi_jagabandhu'
      });
      setPlayerNames({
        RED: lang === 'odia' ? 'ବାଜି ରାଉତ' : 'Baji Rout',
        GREEN: lang === 'odia' ? 'ଧର୍ମପଦ' : 'Dharmapada',
        YELLOW: lang === 'odia' ? 'ଜୟୀ ରାଜଗୁରୁ' : 'Jayee Rajguru',
        BLUE: lang === 'odia' ? 'ବକ୍ସି ଜଗବନ୍ଧୁ' : 'Bakshi Jagabandhu'
      });
    } else if (preset === 'VSBOT') {
      setPlayerTypes({
        RED: 'human',
        GREEN: 'bot',
        YELLOW: 'inactive',
        BLUE: 'inactive'
      });
      setPlayerCharacters({
        RED: '',
        GREEN: 'kharavela',
        YELLOW: '',
        BLUE: ''
      });
      setPlayerNames({
        RED: '',
        GREEN: lang === 'odia' ? 'ସମ୍ରାଟ ଖାରବେଳ' : 'Emperor Kharavela',
        YELLOW: '',
        BLUE: ''
      });
    } else if (preset === 'COMP') {
      setPlayerTypes({
        RED: 'human',
        GREEN: 'bot',
        YELLOW: 'bot',
        BLUE: 'bot'
      });
      setPlayerCharacters({
        RED: '',
        GREEN: 'dharmapada',
        YELLOW: 'jayee_rajguru',
        BLUE: 'bakshi_jagabandhu'
      });
      setPlayerNames({
        RED: '',
        GREEN: lang === 'odia' ? 'ଧର୍ମପଦ' : 'Dharmapada',
        YELLOW: lang === 'odia' ? 'ଜୟୀ ରାଜଗୁରୁ' : 'Jayee Rajguru',
        BLUE: lang === 'odia' ? 'ବକ୍ସି ଜଗବନ୍ଧୁ' : 'Bakshi Jagabandhu'
      });
    }
  };

  const handleSubmit = () => {
    const activeCount = Object.values(playerTypes).filter((t) => t !== 'inactive').length;
    if (activeCount < 2) {
      alert(
        lang === 'odia'
          ? 'ଖେଳ ଆରମ୍ଭ କରିବା ପାଇଁ ଅତିକମରେ ଦୁଇଟି ସକ୍ରିୟ ଖେଳାଳି ଆବଶ୍ୟକ!'
          : 'At least 2 active players are required to start!'
      );
      return;
    }

    const configs: Record<PlayerColor, Player> = {
      RED: {
        color: 'RED',
        name: playerNames.RED.trim() || (lang === 'odia' ? 'ଖେଳାଳି ୧ (ଲାଲ୍)' : 'Player 1 (Red)'),
        type: playerTypes.RED,
        isActive: playerTypes.RED !== 'inactive',
        characterId: playerCharacters.RED || undefined
      },
      GREEN: {
        color: 'GREEN',
        name: playerNames.GREEN.trim() || (lang === 'odia' ? 'ଖେଳାଳି ୨ (ସବୁଜ)' : 'Player 2 (Green)'),
        type: playerTypes.GREEN,
        isActive: playerTypes.GREEN !== 'inactive',
        characterId: playerCharacters.GREEN || undefined
      },
      YELLOW: {
        color: 'YELLOW',
        name: playerNames.YELLOW.trim() || (lang === 'odia' ? 'ଖେଳାଳି ୩ (ହଳଦିଆ)' : 'Player 3 (Yellow)'),
        type: playerTypes.YELLOW,
        isActive: playerTypes.YELLOW !== 'inactive',
        characterId: playerCharacters.YELLOW || undefined
      },
      BLUE: {
        color: 'BLUE',
        name: playerNames.BLUE.trim() || (lang === 'odia' ? 'ଖେଳାଳି ୪ (ନୀଳ)' : 'Player 4 (Blue)'),
        type: playerTypes.BLUE,
        isActive: playerTypes.BLUE !== 'inactive',
        characterId: playerCharacters.BLUE || undefined
      }
    };

    onStartGame(configs, voiceEnabled, lang);
    
    // Play conch shell welcome on load
    if (soundEnabled) {
      import('../utils/audio').then(({ gameAudio }) => {
        gameAudio.setEnabled(true);
        gameAudio.playSankha();
        if (bgmEnabled) {
          setTimeout(() => {
            gameAudio.playTraditionalBGM();
          }, 1000);
        }
      });
    }
  };

  const menuText = {
    title: lang === 'odia' ? 'ଲୁଡୋ ସୁପ୍ରିମ: ସମ୍ବ୍ରାନ୍ତ ସଂସ୍କରଣ' : 'Ludo Supreme: Folklore Edition',
    subtitle: lang === 'odia' ? 'ଓଡ଼ିଶାର ଐତିହାସିକ ବୀର ଓ ସାଂସ୍କୃତିକ କଳା ସହ' : 'Feat. Odisha\'s Historic Heroes & Traditional Music',
    presetsTitle: lang === 'odia' ? 'ତତ୍କାଳ ପ୍ରେସେଟ୍' : 'Quick Presets',
    preset2P: lang === 'odia' ? '୨ ଖେଳାଳି (୧ v ୧)' : '2 Players (1 vs 1)',
    preset4P: lang === 'odia' ? '୪ ପାଇକ (Folklore)' : '4 Legends (Epic Battle)',
    presetVsComp: lang === 'odia' ? 'ମୁଁ v ସମ୍ରାଟ' : 'Me vs Emperor',
    presetAllComps: lang === 'odia' ? '୧ v ୩ ରୋବୋଟ୍' : 'Me vs 3 Heroes',
    playerSetup: lang === 'odia' ? 'ରଣଯୋଦ୍ଧା ଖେଳାଳି ସଜ୍ଜୀକରଣ' : 'Epic Warriors Setup',
    voiceToggle: lang === 'odia' ? 'ଓଡ଼ିଆ ଭଏସ୍ ଘୋଷଣା' : 'Odia Voice Commentary',
    soundToggle: lang === 'odia' ? 'ଓଡ଼ିଆ ପାରମ୍ପରିକ ଶବ୍ଦ (Mardala)' : 'Traditional SFX (Mardala)',
    bgmToggle: lang === 'odia' ? 'ଧୀମା ଓଡ଼ିଶୀ ବାଦ୍ୟ ସଙ୍ଗୀତ (Mahuri & Mardala BGM)' : 'Classical BGM (Mahuri & Drum)',
    btnStart: lang === 'odia' ? 'ଶଙ୍ଖନାଦ ସହ ଖେଳ ଆରମ୍ଭ' : 'Begin Ludo Empire Match',
    active: lang === 'odia' ? 'ସକ୍ରିୟ' : 'Active',
    inactive: lang === 'odia' ? 'ନିଷ୍କ୍ରିୟ (Off)' : 'Inactive',
    humanRole: lang === 'odia' ? 'ଖେଳାଳି (Human)' : 'Human',
    botRole: lang === 'odia' ? 'ରୋବୋଟ୍ (Bot)' : 'Computer Bot',
    placeholderName: lang === 'odia' ? 'ଯୋଦ୍ଧା ନାମ...' : 'Enter character name...',
    selectLegend: lang === 'odia' ? 'ଲୋକକଥା ବୀର ବାଛନ୍ତୁ:' : 'Select Folklore Hero:'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-700/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl relative"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Language Switcher in Upper Corner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 to-rose-600 rounded-2xl shadow-lg flex items-center justify-center text-white shrink-0 antialiased font-black">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-amber-300 to-rose-400 font-sans tracking-tight">
              {menuText.title}
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-tight leading-none mt-1">{menuText.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => setLang((l) => (l === 'odia' ? 'english' : 'odia'))}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-2xl transition border border-slate-700/60 text-xs font-bold text-slate-200 cursor-pointer self-end sm:self-auto shadow-sm"
        >
          <Languages className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'odia' ? 'English Translate' : 'ଓଡ଼ିଆରେ ଖେଳନ୍ତୁ'}</span>
        </button>
      </div>

      {/* Premium Upgrade Hub Banner with PhonePe UPI triggers */}
      {isLifetimePro ? (
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/45 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden shadow-lg shadow-emerald-950/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex gap-3 items-start">
            <div className="p-2.5 rounded-2xl bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 mt-0.5 sm:mt-0 shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-350 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-black tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded-md">
                  {lang === 'odia' ? 'ସକ୍ରିୟ' : 'PRO ACTIVE'}
                </span>
                <span className="text-xs font-bold text-emerald-200 flex items-center gap-1">
                  {lang === 'odia' ? 'ଲାଇଫ୍‌ଟାଇମ୍ ପ୍ରୋ ସଦସ୍ୟତା' : 'Ludo Pro Lifetime Membership Unlocked'}
                </span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">
                {lang === 'odia' ? 'ଆପଣଙ୍କର ସହାୟତା ପାଇଁ ଧନ୍ୟବାଦ!' : 'Thank You For Your Support!'}
              </h4>
              <p className="text-xs text-slate-350 mt-1 leading-normal max-w-xl">
                {lang === 'odia' 
                  ? 'ଆପଣଙ୍କର ଉଦାରତା ଓଡ଼ିଶାର ଏହି ମହାନ ଖେଳକୁ ଆଗକୁ ବଢ଼ାଇବାରେ ସାହାଯ୍ୟ କରୁଛି। ସୁବର୍ଣ୍ଣ କଏନ, ଭଏସ୍ କମେଣ୍ଟ୍ରି ଏବଂ ପ୍ରୋ ଆସିଷ୍ଟାଣ୍ଟ ସ୍ଥାୟୀ ଭାବେ ସଜ୍ଜିତ ଅଛି।' 
                  : 'Your generous contribution has unlocked golden custom coins, complete character sound narratives, live commentators, and the visual helper permanently.'}
              </p>
            </div>
          </div>
          <div className="shrink-0 font-mono text-[9px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl px-4 py-2 font-bold text-center">
            <span className="block text-emerald-300 font-extrabold text-xs uppercase">{lang === 'odia' ? 'ପ୍ରୋ ସକ୍ରିୟ' : 'LIFETIME PRO'}</span>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent border border-amber-500/35 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden shadow-lg shadow-amber-950/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex gap-3 items-start flex-1">
            <div className="p-2.5 rounded-2xl bg-amber-500/25 border border-amber-400/40 text-amber-300 animate-pulse mt-0.5 sm:mt-0 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-black tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                  {lang === 'odia' ? 'ରିଅଲ୍-ଟାଇମ୍ ଅଫର୍' : 'Special Offer'}
                </span>
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                  {lang === 'odia' ? 'ମାଗଣା ପ୍ରିମିୟମ୍ ପରୀକ୍ଷଣ ସକ୍ରିୟ' : '7-Day Premium Free Trial Active'}
                </span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">
                {lang === 'odia' ? 'ସମସ୍ତ ମାନବ ଖେଳาଳିଙ୍କ ପାଇଁ ପ୍ରିମିୟମ୍ ଅଫର' : 'Free Trial Unlocked for All Human Players'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-normal max-w-xl">
                {lang === 'odia' 
                  ? 'ଓଡ଼ିଶାର ଏହି ମହାନ ଖେଳରେ ସମସ୍ତ ମାନବ ଖେଳାଳିଙ୍କ ପାଇଁ ସୁବର୍ଣ୍ଣ କଏନ, ଭଏସ୍ ସଂଳାପ ଏବଂ ମାର୍ଗଦର୍ଶକ ସହାୟକ ସମ୍ପୂର୍ଣ୍ଣ ମାଗଣାରେ ଅନଲକ୍ ହୋଇଛି।' 
                  : 'Enjoy premium custom golden tokens, elite character voice responses, Odia live sound commentaries, and advanced visual helper assistant!'}
              </p>
              
              {/* PhonePe Upgrade Trigger button */}
              <button
                onClick={() => setIsUpiModalOpen(true)}
                className="mt-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 hover:from-violet-500 to-purple-700 text-white text-xs font-black transition shadow-md border border-violet-500/20 hover:border-violet-400/40 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>👑</span>
                <span>{lang === 'odia' ? 'ଫୋନ୍-ପେ / ୟୁପିଆଇ ମାଧ୍ୟମରେ ସ୍ଥାୟୀ ଭାବେ ଅପଗ୍ରେଡ୍ କରନ୍ତୁ' : 'Upgrade permanently via PhonePe / UPI (₹29)'}</span>
              </button>
            </div>
          </div>
          <div className="shrink-0 font-mono text-[9px] text-amber-400/80 bg-slate-950/70 border border-amber-500/20 rounded-2xl px-3 py-1.5 font-bold self-stretch md:self-auto text-center flex md:flex-col justify-center items-center gap-1.5 md:gap-0">
            <span className="block">{lang === 'odia' ? 'ଅବଶିଷ୍ଟ ସମୟ:' : 'TRIAL ENDS:'}</span>
            <span className="block text-amber-300 font-extrabold text-sm mt-0.5">6d 23h 59m</span>
          </div>
        </div>
      )}

      {/* Quick Presets Section */}
      <div className="mb-6 bg-slate-950/40 border border-slate-800 p-4 rounded-3xl">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-left">
          {menuText.presetsTitle}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => loadPreset('2P')}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700/50 text-slate-200 transition text-center hover:border-amber-500/30 cursor-pointer"
          >
            {menuText.preset2P}
          </button>
          <button
            onClick={() => loadPreset('4P')}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700/50 text-slate-200 transition text-center hover:border-amber-500/30 cursor-pointer"
          >
            {menuText.preset4P}
          </button>
          <button
            onClick={() => loadPreset('VSBOT')}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700/50 text-slate-200 transition text-center hover:border-amber-500/30 cursor-pointer"
          >
            {menuText.presetVsComp}
          </button>
          <button
            onClick={() => loadPreset('COMP')}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700/50 text-slate-200 transition text-center hover:border-amber-500/30 cursor-pointer"
          >
            {menuText.presetAllComps}
          </button>
        </div>
      </div>

      {/* Player Setup Section */}
      <div className="space-y-4 mb-6">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1 text-left">
          {menuText.playerSetup}
        </h3>

        {(['RED', 'GREEN', 'YELLOW', 'BLUE'] as PlayerColor[]).map((col) => {
          const theme = COLOR_THEMES[col];
          const currType = playerTypes[col];
          const selectedCharId = playerCharacters[col];

          return (
            <div
              key={col}
              className={`p-4 rounded-3xl bg-slate-800/25 border transition-all duration-300 ${
                currType !== 'inactive' ? 'border-slate-800 hover:border-slate-700/50' : 'border-slate-900/40 opacity-50'
              } flex flex-col gap-3.5`}
            >
              {/* Row 1: Header + Color indicator + Type Selector */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-3.5 h-3.5 rounded-full ${theme.primary} ring-2 ring-white/10 shrink-0 shadow-md`} />
                  <div className="text-left">
                    <span className="text-sm font-black text-slate-200 tracking-wide flex items-center gap-2">
                      {lang === 'odia' ? theme.nameOdia : theme.nameEng}
                      {currType !== 'inactive' && (
                        <span className="text-[9px] leading-none px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-md uppercase tracking-wider">
                          {menuText.active}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Role Buttons Picker */}
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-850 gap-1 self-stretch md:self-auto justify-between">
                  <button
                    type="button"
                    onClick={() => handlePlayerTypeChange(col, 'human')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 flex-1 md:flex-none cursor-pointer ${
                      currType === 'human'
                        ? 'bg-slate-800 text-amber-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{menuText.humanRole}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayerTypeChange(col, 'bot')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 flex-1 md:flex-none cursor-pointer ${
                      currType === 'bot'
                        ? 'bg-slate-800 text-teal-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{menuText.botRole}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayerTypeChange(col, 'inactive')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 flex-1 md:flex-none cursor-pointer ${
                      currType === 'inactive'
                        ? 'bg-slate-800 text-rose-500 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>{menuText.inactive}</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Character select & name override (visible only if active) */}
              {currType !== 'inactive' && (
                <div className="pt-2 border-t border-slate-850 flex flex-col gap-3.5">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    {/* Name input */}
                    <input
                      type="text"
                      value={playerNames[col]}
                      onChange={(e) => handleNameChange(col, e.target.value)}
                      placeholder={
                        playerNames[col] ||
                        (selectedCharId
                          ? (lang === 'odia'
                              ? ODIA_FOLKLORE_CHARACTERS.find((c) => c.id === selectedCharId)?.nameOdia
                              : ODIA_FOLKLORE_CHARACTERS.find((c) => c.id === selectedCharId)?.nameEng)
                          : (lang === 'odia' ? theme.nameOdia : theme.nameEng))
                      }
                      className="px-3 py-1.5 bg-slate-950 border border-slate-850 text-xs text-slate-100 rounded-xl placeholder-slate-500 focus:outline-none focus:border-slate-700 text-left flex-1"
                    />

                    {/* Quick bio reading trigger */}
                    {selectedCharId && (
                      <button
                        type="button"
                        onClick={() => {
                          const char = ODIA_FOLKLORE_CHARACTERS.find((c) => c.id === selectedCharId);
                          if (char) setInspectCharacter(char);
                        }}
                        className="px-3.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{lang === 'odia' ? 'ଲୋକକଥା କାହାଣୀ' : 'Read History'}</span>
                      </button>
                    )}
                  </div>

                  {/* Horizontal Character select scrollbar */}
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                      {menuText.selectLegend}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCharacterSelect(col, '')}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          !selectedCharId
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-sm'
                            : 'bg-slate-950/80 border-slate-850 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>👤</span>
                        <span>{lang === 'odia' ? 'ସାଧାରଣ' : 'Custom'}</span>
                      </button>

                      {ODIA_FOLKLORE_CHARACTERS.map((char) => {
                        const isChosen = selectedCharId === char.id;
                        return (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => handleCharacterSelect(col, char.id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              isChosen
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-950/15'
                                : 'bg-slate-950/80 border-slate-850 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>{char.avatarEmoji}</span>
                            <span>{lang === 'odia' ? char.nameOdia : char.nameEng}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Auxiliary Options & Start Action */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 border-t border-slate-850 pt-6">
        <div className="flex flex-col gap-3 text-left">
          {/* Voice Switcher */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-2xl border cursor-pointer ${
                voiceEnabled
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-950 border-slate-850 text-slate-500'
              } transition`}
            >
              {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition">
                {menuText.voiceToggle}
              </span>
              <span className="text-[10px] text-slate-500">
                {lang === 'odia' ? 'ଚରିତ୍ର ମୁହଁରୁ ଓଡ଼ିଆ କଥା ଏବଂ ଚାଲ୍ ଘୋଷଣା' : 'Character voice lines & narration in Odia'}
              </span>
            </div>
          </label>

          {/* Sound Switcher */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-2xl border cursor-pointer ${
                soundEnabled
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                  : 'bg-slate-950 border-slate-850 text-slate-500'
              } transition`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition">
                {menuText.soundToggle}
              </span>
              <span className="text-[10px] text-slate-500">
                {lang === 'odia' ? 'ମର୍ଦ୍ଦଳ ଡ୍ରମ୍ ପାଞ୍ଜିର ରିଦିମ ଏବଂ କୀର୍ତ୍ତନ ଇନ୍-ଗେମ୍' : 'Authentic synthesized Mardala frame percussion'}
              </span>
            </div>
          </label>

          {/* Traditional BGM Music Loop */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <button
              onClick={() => setBgmEnabled(!bgmEnabled)}
              className={`p-2 rounded-2xl border cursor-pointer ${
                bgmEnabled
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-450'
                  : 'bg-slate-950 border-slate-850 text-slate-500'
              } transition`}
            >
              {bgmEnabled ? <Volume2 className="w-4 h-4 text-rose-450" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200 group-hover:text-rose-450 transition">
                {menuText.bgmToggle}
              </span>
              <span className="text-[10px] text-slate-500 text-slate-500">
                {lang === 'odia' ? 'ମହୁରୀ ଓ ମର୍ଦ୍ଦଳର ମଧୁର ଓଡ଼ିଶୀ ରାଗ ବିବେଚନା (Mohana)' : 'Realtime classical Odia pentatonic melody stream'}
              </span>
            </div>
          </label>
        </div>

        {/* Start Button */}
        <button
          onClick={handleSubmit}
          className="relative group px-8 py-4 bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 hover:from-amber-600 hover:to-cyan-600 text-white text-sm font-black rounded-3xl transition shadow-xl shadow-amber-950/20 flex items-center justify-center gap-2.5 overflow-hidden cursor-pointer self-stretch md:self-auto"
        >
          <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition duration-300" />
          <Play className="w-4 h-4 fill-white shrink-0" />
          <span>{menuText.btnStart}</span>
        </button>
      </div>

      {/* Backstory Inspect Modal Pop-up */}
      {inspectCharacter && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm select-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] max-w-lg w-full text-center relative max-h-[90vh] overflow-y-auto"
          >
            <span className="text-6xl pb-4 block">{inspectCharacter.avatarEmoji}</span>
            <h2 className="text-2xl font-black text-white">
              {lang === 'odia' ? inspectCharacter.nameOdia : inspectCharacter.nameEng}
            </h2>
            <p className="text-xs font-bold text-amber-400 mt-1 uppercase tracking-widest">
              {lang === 'odia' ? inspectCharacter.roleOdia : inspectCharacter.roleEng}
            </p>

            <div className="mt-4 bg-slate-950/50 p-4 border border-slate-850 rounded-2xl text-left">
              <p className="text-slate-350 text-xs leading-relaxed">
                {lang === 'odia' ? inspectCharacter.backstoryOdia : inspectCharacter.backstoryEng}
              </p>
            </div>

            <div className="mt-4 text-left">
              <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">
                {lang === 'odia' ? 'ଚରିତ୍ରର ଇନ୍-ଗେମ୍ ଡାଏଲଗ୍ ପ୍ରତିଫଳନ:' : 'Character In-Game Dialogues Preview:'}
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 border border-slate-850 bg-slate-950/20 rounded-xl leading-snug">
                  <span className="font-extrabold text-amber-500 font-mono text-[9px] block uppercase tracking-wider">
                    {lang === 'odia' ? 'ଛକା ପଡ଼ିଲେ' : 'On rolling six'}
                  </span>
                  <p className="text-slate-200 mt-0.5">
                    "
                    {lang === 'odia'
                      ? inspectCharacter.dialogues.rollSix.odia
                      : inspectCharacter.dialogues.rollSix.eng}
                    "
                  </p>
                </div>
                <div className="p-2 border border-slate-850 bg-slate-950/20 rounded-xl leading-snug">
                  <span className="font-extrabold text-teal-400 font-mono text-[9px] block uppercase tracking-wider">
                    {lang === 'odia' ? 'ଗୋଟି କାଟିଲେ' : 'On Strike / Capture'}
                  </span>
                  <p className="text-slate-200 mt-0.5">
                    "
                    {lang === 'odia'
                      ? inspectCharacter.dialogues.capturing.odia
                      : inspectCharacter.dialogues.capturing.eng}
                    "
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectCharacter(null)}
              className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer text-center"
            >
              {lang === 'odia' ? 'ଫେରି ଯାଆନ୍ତୁ' : 'Close Backstory'}
            </button>
          </motion.div>
        </div>
      )}

      {/* UPI / PhonePe Activation Modal */}
      <PhonepeUpiModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        lang={lang}
        onUnlockSuccess={() => {
          setIsLifetimePro(true);
          try {
            import('../utils/audio').then(({ gameAudio }) => {
              gameAudio.playSankha();
            });
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </motion.div>
  );
}
