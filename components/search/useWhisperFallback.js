import { useRef } from "react";

/**
 * A fallback voice recording + transcription hook for non-Chrome browsers.
 * Uses the MediaRecorder API and a simple silence detector to auto-stop.
 */
export function useWhisperFallback(setQuery, isListening, setIsListening, isLoading, setIsLoading) {
  // Internal refs for persistent resources
  const mediaRecorderRef = useRef(null);
  const cancelRecordingRef = useRef(() => {});
  const abortControllerRef = useRef(null);

  /**
   * Starts recording audio and auto-stops when silence is detected.
   */
  const startRecording = async () => {
    if (isListening || isLoading) return; // prevent double start

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      // Flags to control lifecycle
      let cancelled = false;
      let recordingActive = true;
      setIsListening(true);

      // --- 1 Setup audio context for silence detection ---
      const {
        audioContext,
        analyser,
        data
      } = setupAudioAnalysis(stream);
      const silenceDelay = 3000; // stop after 3s silence
      const rmsThreshold = 12; // threshold for voice detection
      let silenceStart = Date.now();
      let silenceTimer = null;
      const stopDueToSilence = () => {
        if (recordingActive && !cancelled && mediaRecorder.state !== "inactive") {
          recordingActive = false;
          mediaRecorder.stop();
          cleanupStream(stream);
        }
      };

      // --- 2 Start silence detection loop ---
      const detectSilence = () => {
        if (!recordingActive) return;
        analyser.getByteTimeDomainData(data);
        const rms = computeRMS(data);

        // If loud enough → reset silence timer
        if (rms > rmsThreshold) {
          silenceStart = Date.now();
          if (silenceTimer) clearTimeout(silenceTimer);
          silenceTimer = setTimeout(stopDueToSilence, silenceDelay);
        }
        requestAnimationFrame(detectSilence);
      };
      detectSilence();

      // --- 3 Handle audio data and stop event ---
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => handleStop({
        cancelled,
        chunks,
        stream,
        audioContext,
        setQuery,
        setIsListening,
        setIsLoading,
        abortControllerRef
      });
      mediaRecorder.start();

      // --- 4 Cancel recording logic ---
      cancelRecordingRef.current = () => {
        cancelled = true;
        recordingActive = false;
        if (silenceTimer) clearTimeout(silenceTimer);
        abortControllerRef.current?.abort();
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
        cleanupStream(stream);
        audioContext.close();
        setIsListening(false);
        setIsLoading(false);
      };
    } catch (err) {
      console.error("🎤 Microphone capture failed:", err);
      alert("Microphone access denied or not available.");
      setIsListening(false);
      setIsLoading(false);
    }
  };
  return {
    startRecording,
    cancelRecordingRef
  };
}

/* -----------------------------------------------------------
 * Helper Functions
 * -----------------------------------------------------------
 */

// Initialize AudioContext + Analyser for silence detection.
function setupAudioAnalysis(stream) {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  const data = new Uint8Array(analyser.fftSize);
  return {
    audioContext,
    analyser,
    data
  };
}

// Compute RMS (root mean square) of audio buffer.
function computeRMS(data) {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const deviation = data[i] - 128;
    sum += deviation * deviation;
  }
  return Math.sqrt(sum / data.length);
}

// Clean up microphone stream tracks.
function cleanupStream(stream) {
  try {
    stream.getTracks().forEach(t => t.stop());
  } catch {}
}

/**
 * Handle the MediaRecorder `onstop` event:
 * - Stops audio context
 * - Uploads audio to backend
 * - Aborts safely if cancelled
 */
async function handleStop({
  cancelled,
  chunks,
  stream,
  audioContext,
  setQuery,
  setIsListening,
  setIsLoading,
  abortControllerRef
}) {
  await audioContext.close();
  if (cancelled) {
    setIsListening(false);
    setIsLoading(false);
    return;
  }
  const audioBlob = new Blob(chunks, {
    type: "audio/webm"
  });
  const formData = new FormData();
  formData.append("file", audioBlob);
  try {
    setIsListening(false);
    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const res = await fetch("/api/speech-to-text", {
      method: "POST",
      body: formData,
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`Speech API error: ${res.status}`);
    const {
      transcript
    } = await res.json();
    if (transcript) setQuery(transcript);
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Transcription aborted");
    } else {
      console.error("Transcription failed:", err);
      alert("Failed to transcribe audio");
    }
  } finally {
    cleanupStream(stream);
    setIsLoading(false);
  }
}