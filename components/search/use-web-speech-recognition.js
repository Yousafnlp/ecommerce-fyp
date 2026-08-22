import { useRef } from "react";
export function useWebSpeechRecognition(setQuery, setIsListening) {
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Lazily initialize
  if (typeof window !== "undefined" && !recognitionRef.current) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) recognitionRef.current = new SpeechRecognition();
  }
  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("Speech recognition not supported");
      return;
    }
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = e => {
      const transcript = e.results[e.results.length - 1][0].transcript;
      setQuery(prev => prev + " " + transcript);

      // reset silence timer every time we hear something
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(stopListening, 3000);
    };
    recognition.onerror = () => stopListening();
    recognition.onend = () => setIsListening(false);
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn("Recognition already running or failed:", err);
    }
  };
  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    // clear any pending stop timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // safely remove handlers so no stale callbacks fire
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      recognition.stop();
    } catch (e) {
      // sometimes throws "not allowed" if already stopped
      console.debug("Recognition stop ignored:", e);
    }
    setIsListening(false);
  };
  return {
    startListening,
    stopListening,
    supported: !!recognitionRef.current
  };
}