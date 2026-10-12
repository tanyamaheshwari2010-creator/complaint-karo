import { useCallback, useEffect, useRef, useState } from "react";

// Browser speech-to-text (Chrome, Edge, Safari). Not available in every browser.
const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const ERRORS = {
  "not-allowed": "Microphone access is blocked. Allow it in your browser settings.",
  "service-not-allowed": "Microphone access is blocked. Allow it in your browser settings.",
  "no-speech": "I didn't hear anything. Try again.",
  network: "Voice typing needs an internet connection.",
};

/**
 * onTranscript(fullText) is called while the person speaks.
 * fullText = whatever was already typed + what has been spoken so far.
 * Pass a stable function (e.g. a useState setter).
 */
export default function useVoiceInput({ lang, onTranscript }) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  const start = useCallback(
    (existingText = "") => {
      if (!SR) return;
      setError("");

      const rec = new SR();
      rec.lang = lang;
      rec.continuous = true;
      rec.interimResults = true;

      const base = existingText.trim();
      let finals = "";

      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finals += t + " ";
          else interim += t;
        }
        onTranscript((base ? base + " " : "") + (finals + interim).trim());
      };
      rec.onerror = (e) => setError(ERRORS[e.error] ?? "Voice typing stopped. Please try again.");
      rec.onend = () => setListening(false);

      recRef.current = rec;
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    },
    [lang, onTranscript]
  );

  const stop = useCallback(() => recRef.current?.stop(), []);

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported: Boolean(SR), listening, error, start, stop };
}
