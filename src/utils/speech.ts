// Speech Synthesis Helper for Odia and English Game Announcements

export function announceGameEvent(text: string, language: 'odia' | 'english', enabled: boolean) {
  if (!enabled) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select correct voice based on language
    const voices = window.speechSynthesis.getVoices();
    if (language === 'odia') {
      // Find an Indian voices or Eastern Indian if available, otherwise default standard.
      // Often, Odia fallback is an Indian Accent English or generic hi-IN, but we can set lang to standard or search for hi-IN or standard.
      // SpeechSynthesis will speak the Odia words beautifully using Hindi/Indian phonetics if hi-IN is used, or fallback.
      const odiaOrHindiVoice = voices.find(
        (v) => v.lang.startsWith('or-') || v.lang.startsWith('hi-IN') || v.lang.includes('India')
      );
      if (odiaOrHindiVoice) {
        utterance.voice = odiaOrHindiVoice;
      }
      utterance.lang = 'or-IN'; // Standard code for Odia
    } else {
      const englishVoice = voices.find((v) => v.lang.startsWith('en-'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      utterance.lang = 'en-US';
    }

    // Set natural rate
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
  }
}

// Prepopulate voices since browser loads them asynchronously
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
