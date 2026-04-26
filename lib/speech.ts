export function speakArabic(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.8;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const arabicVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('ar'));
  if (arabicVoice) {
    utterance.voice = arabicVoice;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
