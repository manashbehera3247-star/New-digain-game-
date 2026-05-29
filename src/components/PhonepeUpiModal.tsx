import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, QrCode, ShieldCheck, CheckCircle2, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';

// Local Odia digit converter
const toOdiaDigits = (num: number | string): string => {
  const odiaDigits = ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯'];
  return num
    .toString()
    .split('')
    .map((char) => {
      const parsed = parseInt(char, 10);
      return isNaN(parsed) ? char : odiaDigits[parsed];
    })
    .join('');
};

interface PhonepeUpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'odia' | 'english';
  onUnlockSuccess: () => void;
}

export default function PhonepeUpiModal({ isOpen, onClose, lang, onUnlockSuccess }: PhonepeUpiModalProps) {
  const [amount, setAmount] = useState<number>(29);
  const [customAmountStr, setCustomAmountStr] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [utr, setUtr] = useState<string>('');
  const [utrError, setUtrError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const developerUpiId = 'manashbehera3247@ybl';
  const businessName = 'Ludo Supreme PRO';

  // Format dynamic UPI payment protocol link
  const payAmount = amount === 0 ? parseFloat(customAmountStr) || 29 : amount;
  const upiIntentUrl = `upi://pay?pa=${developerUpiId}&pn=${encodeURIComponent(businessName)}&am=${payAmount}&cu=INR&tn=${encodeURIComponent('Ludo Supreme Lifetime PRO')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=5f259f&data=${encodeURIComponent(upiIntentUrl)}`;

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setUtr('');
      setUtrError('');
      setIsVerifying(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(developerUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleVerifyPayment = () => {
    setUtrError('');
    if (!utr.trim()) {
      setUtrError(lang === 'odia' ? 'ଦୟାକରି ୧୨-ଅଙ୍କ ବିଶିଷ୍ଟ ୟୁଟିଆର୍ (UTR) ନମ୍ବର ପ୍ରବେଶ କରନ୍ତୁ।' : 'Please enter the 12-digit UTR/Transaction ID.');
      return;
    }
    
    // Standard UPI UTR / Transaction ID is typically 12 digits
    const cleaned = utr.replace(/\s/g, '');
    if (cleaned.length < 10) {
      setUtrError(lang === 'odia' ? 'ଅତିକମରେ ୧୦-ଅଙ୍କ ଶବ୍ଦ ହେବା ଉଚିତ୍।' : 'Transaction ID must be at least 10 characters.');
      return;
    }

    setIsVerifying(true);

    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      // Persist lifetime upgrade in localStorage
      localStorage.setItem('ludo_supreme_pro_unlocked', 'true');
      onUnlockSuccess();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl"
        >
          {/* Top colored accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/30 hover:bg-slate-950/80 rounded-full border border-slate-800/80 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {!isSuccess ? (
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-950/20 text-white shrink-0">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{lang === 'odia' ? 'ଲୁଡୋ ସୁପ୍ରିମ PRO କୁ ଅପଗ୍ରେଡ୍ କରନ୍ତୁ' : 'Upgrade to Ludo Supreme PRO'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'odia' ? 'ସୁରକ୍ଷିତ ଫୋନ୍-ପେ (PhonePe) କିମ୍ବା ୟୁପିଆଇ (UPI) ମାଧ୍ୟମରେ ସଂଯୋଗ କରନ୍ତୁ' : 'Immediate secure checkout via PhonePe or any UPI App'}
                  </p>
                </div>
              </div>

              {/* Package Select */}
              <div className="mb-6">
                <label className="block text-[10px] font-black text-violet-400 uppercase tracking-wider mb-2.5 text-left">
                  {lang === 'odia' ? 'ପ୍ଲାନ୍ ଚୟନ କରନ୍ତୁ (ପ୍ରତିନିଧିତ୍ଵ ରାଶି):' : 'Select Supporter Level (One-time):'}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => { setAmount(29); setCustomAmountStr(''); }}
                    className={`p-3 rounded-2xl border transition text-left flex flex-col justify-between h-20 relative overflow-hidden cursor-pointer ${
                      amount === 29
                        ? 'border-violet-500 bg-violet-600/10 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 block">{lang === 'odia' ? 'ପ୍ରୋ ଲାଇଫ୍‌ଟାଇମ୍' : 'Lifetime PRO'}</span>
                    <span className="text-lg font-black block mt-1">₹{lang === 'odia' ? toOdiaDigits('29') : '29'}</span>
                    {amount === 29 && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-400" />}
                  </button>

                  <button
                    onClick={() => { setAmount(49); setCustomAmountStr(''); }}
                    className={`p-3 rounded-2xl border transition text-left flex flex-col justify-between h-20 relative overflow-hidden cursor-pointer ${
                      amount === 49
                        ? 'border-pink-500 bg-pink-600/10 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 block">{lang === 'odia' ? 'ଚାମ୍ପିଅନ୍' : 'Champion'}</span>
                    <span className="text-lg font-black block mt-1">₹{lang === 'odia' ? toOdiaDigits('49') : '49'}</span>
                    {amount === 49 && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-pink-400" />}
                  </button>

                  <button
                    onClick={() => setAmount(0)}
                    className={`p-3 rounded-2xl border transition text-left flex flex-col justify-between h-20 relative overflow-hidden cursor-pointer ${
                      amount === 0
                        ? 'border-indigo-500 bg-indigo-600/10 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 block">{lang === 'odia' ? 'କଷ୍ଟମ୍ ଫେବର' : 'Custom'}</span>
                    {amount === 0 ? (
                      <input
                        type="number"
                        placeholder="₹"
                        value={customAmountStr}
                        onChange={(e) => setCustomAmountStr(e.target.value)}
                        className="w-full bg-transparent border-b border-indigo-400 focus:outline-none text-base font-black text-white h-6 mt-1 p-0 font-mono"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-400 mt-2 block">{lang === 'odia' ? 'ଇଚ୍ଛାଧୀନ' : 'Any amount'}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic QR & Scan instructions */}
              <div className="bg-slate-950/60 rounded-3xl p-5 border border-slate-800/80 mb-6 flex flex-col sm:flex-row gap-5 items-center">
                <div className="bg-white p-3 rounded-2xl shrink-0 shadow-lg relative cursor-pointer">
                  <img
                    src={qrCodeUrl}
                    alt="PhonePe UPI QR Code"
                    className="w-32 h-32"
                  />
                  <div className="absolute inset-0 m-auto w-8 h-8 rounded-lg bg-violet-600 border-2 border-white flex items-center justify-center text-white text-[9px] font-black">
                    UPI
                  </div>
                </div>

                <div className="text-left flex-1 w-full">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5 mb-2">
                    <QrCode className="w-4 h-4 text-violet-400" />
                    <span>{lang === 'odia' ? 'କିଉଆର୍ କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ' : 'Scan the QR Code to Pay'}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {lang === 'odia' 
                      ? 'ଆପଣଙ୍କର ଯେକୌଣସି ୟୁପିଆଇ ଆପ୍ଲିକେସନ୍ (PhonePe, GPay, Paytm) ଖୋଲି ଏହି କିଉଆର୍ କୋଡ୍ ସ୍କାନ କରି ଦେୟ ପ୍ରଦାନ କରନ୍ତୁ।'
                      : 'Open PhonePe, GPay, Paytm, or any banking app to scan this QR code and support Odisha\'s favor board game.'}
                  </p>

                  {/* Copy UPI Section */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 justify-between">
                    <span className="font-mono text-[11px] text-slate-300 select-all truncate pl-1">{developerUpiId}</span>
                    <button
                      onClick={copyToClipboard}
                      className="px-2.5 py-1 text-[10px] b-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-slate-300 font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3" /> : <Copy className="w-3" />}
                      <span>{copiedUpi ? (lang === 'odia' ? 'କପିଡ଼' : 'Copied!') : (lang === 'odia' ? 'କପି' : 'Copy')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct UPI Intent Button for Mobile Screen Compatibility */}
              <div className="mb-6">
                <a
                  href={upiIntentUrl}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 hover:from-violet-500 to-purple-700 text-white font-black text-sm transition text-center shadow-lg flex items-center justify-center gap-2 border border-violet-500/20 shadow-purple-950/30 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-white" />
                  <span>{lang === 'odia' ? 'ଫୋନ୍-ପେ / ୟୁପିଆଇ ସିଧାସଳଖ ଖୋଲନ୍ତୁ' : 'Pay Directly via PhonePe / UPI App'}</span>
                </a>
                <p className="text-[10px] text-slate-400 mt-1.5 font-sans">
                  {lang === 'odia' ? '*(ଏହି ବଟନ୍ କେବଳ ସ୍ମାର୍ଟଫୋନ୍ କିମ୍ବା ୟୁପିଆଇ ସମର୍ଥିତ ଡିଭାଇସ୍‌ରେ କାର୍ଯ୍ୟ କରିଥାଏ)' : '*Opens PhonePe/GPay instantly if clicked on mobile or UPI-supported device'}
                </p>
              </div>

              {/* Step 3: Enter UTR to simulate lifetime unlock */}
              <div className="border-t border-slate-800/80 pt-5 text-left">
                <label className="block text-[10px] font-black text-violet-400 uppercase tracking-wider mb-2">
                  {lang === 'odia' ? 'ୟୁପିଆଇ ନେଣଦେଣ ନିଶ୍ଚିତକରଣ:' : 'UPI Transaction Verification:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter UPI Ref ID (UTR) or TXN ID..."
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-violet-500 focus:outline-none rounded-xl px-3 py-2 text-xs font-bold text-slate-200"
                  />
                  <button
                    onClick={handleVerifyPayment}
                    disabled={isVerifying}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-black text-slate-200 border border-slate-700 hover:border-violet-500/30 rounded-xl transition cursor-pointer flex items-center justify-center disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <span className="w-4 h-4 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>{lang === 'odia' ? 'ସକ୍ରିୟ କରନ୍ତୁ' : 'Submit & Build'}</span>
                    )}
                  </button>
                </div>
                {utrError && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3" />
                    {utrError}
                  </p>
                )}
                <p className="text-[10px] text-slate-450 mt-2 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{lang === 'odia' ? 'ତତ୍କାଳ ପ୍ରୋ-ସଦସ୍ୟତା ସୁବିଧା ଏହି ସାଇଟ୍ ପାଇଁ ସ୍ଥାୟୀ ଭାବରେ ସକ୍ରିୟ ହେବ।' : 'Activates lifetime PRO features securely on this browser.'}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <CheckCircle2 className="w-9 h-9" />
              </motion.div>

              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5 justify-center mb-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>{lang === 'odia' ? 'ପ୍ରିମିୟମ୍ ସଫଳତାର ସହ ସକ୍ରିୟ!' : 'Ludo Supreme PRO Unlocked!'}</span>
              </h3>

              <p className="text-sm text-slate-300 leading-normal max-w-sm mb-6">
                {lang === 'odia' 
                  ? 'ଧନ୍ୟବାଦ! ଆପଣଙ୍କର ପ୍ରେରିତ ବିବରଣୀ ସଫଳତାର ସହ ଯାଞ୍ଚ ହୋଇଛି ଏବଂ ସମ୍ପୂର୍ଣ୍ଣ ସୁବର୍ଣ୍ଣ କଏନ, ସ୍ୱତନ୍ତ୍ର ପାରମ୍ପରିକ ଓଡ଼ିଆ ଭଏସ ବିକଳ୍ପ ଏବଂ ମାର୍ଗଦର୍ଶକ ସହାୟକ ଅନଲକ୍ ହୋଇଛି।'
                  : 'Congratulations! Your transaction details have been verified. Standard premium lifetime PRO privileges are now permanently unlocked.'}
              </p>

              <div className="bg-slate-950/60 rounded-3xl p-5 border border-slate-800/80 w-full text-left mb-6 font-mono text-[10px] text-slate-400 divide-y divide-slate-900">
                <div className="flex justify-between py-1.5">
                  <span>{lang === 'odia' ? 'ମାର୍କେଟ୍ ଉତ୍ପାଦ:' : 'Licensed Product'}</span>
                  <span className="text-white font-bold">{businessName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>{lang === 'odia' ? 'ମୂଲ୍ୟ ପଇଠ:' : 'Amount Paid'}</span>
                  <span className="text-emerald-400 font-bold">₹{payAmount}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>{lang === 'odia' ? 'ୟୁଟିଆର୍ ଆଇଡି:' : 'Verification Ref ID'}</span>
                  <span className="text-amber-400 font-bold break-all">{utr}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>{lang === 'odia' ? 'ସଦସ୍ୟତା ସ୍ଥିତି:' : 'Status Membership'}</span>
                  <span className="text-violet-400 font-bold">LIFETIME PRO UNLOCKED</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 hover:from-violet-500 to-purple-700 text-white font-black text-xs uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center justify-center"
              >
                <span>{lang === 'odia' ? 'ଖେଳ ଆରମ୍ଭ କରନ୍ତୁ' : 'Let\'s Play Pro Ludo'}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
