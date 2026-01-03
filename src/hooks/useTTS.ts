import { useRef, useCallback, useState, useEffect } from 'react';

interface TTSOptions {
  voiceId?: string;
  useElevenLabs?: boolean;
}

// Helper to read ttsProvider setting from localStorage
const getTtsProvider = (): 'browser' | 'elevenlabs' => {
  if (typeof window === 'undefined') return 'browser';
  const saved = localStorage.getItem('ttsProvider');
  return saved === 'elevenlabs' ? 'elevenlabs' : 'browser';
};

export const useTTS = (options: TTSOptions = {}) => {
  const { voiceId = 'EXAVITQu4vr4xnSDxMaL', useElevenLabs = true } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const elevenLabsDisabledRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsProvider, setTtsProvider] = useState<'browser' | 'elevenlabs'>(getTtsProvider);

  // Listen for storage changes (in case user changes setting in another tab or same page)
  useEffect(() => {
    const onStorage = () => setTtsProvider(getTtsProvider());
    window.addEventListener('storage', onStorage);
    // Also re-check on visibility change (same-tab updates)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        setTtsProvider(getTtsProvider());
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Web Speech API fallback
  const speakWithBrowser = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'uz-UZ';
      utterance.rate = 1.2;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();
      const uzVoice = voices.find((v) => v.lang.startsWith('uz'));
      const ruVoice = voices.find((v) => v.lang.startsWith('ru'));

      if (uzVoice) {
        utterance.voice = uzVoice;
      } else if (ruVoice) {
        utterance.voice = ruVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // ElevenLabs TTS
  const speakWithElevenLabs = useCallback(
    async (text: string) => {
      // If we already detected a permission/config problem, stop retrying.
      if (elevenLabsDisabledRef.current) {
        speakWithBrowser(text);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Clean up previous audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text, voiceId }),
          }
        );

        if (!response.ok) {
          let serverMessage = '';
          try {
            const data = await response.json();
            serverMessage = data?.error || '';
          } catch {
            // ignore
          }

          const msg = serverMessage || `TTS request failed: ${response.status}`;

          // If ElevenLabs key is missing the required permission, disable further attempts.
          if (msg.includes('missing the permission text_to_speech')) {
            elevenLabsDisabledRef.current = true;
          }

          throw new Error(msg);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        await audio.play();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('ElevenLabs TTS error:', err);
        // Fallback to browser TTS
        speakWithBrowser(text);
      } finally {
        setIsLoading(false);
      }
    },
    [voiceId, speakWithBrowser]
  );

  // Main speak function - formats math operations
  // Respects global ttsProvider setting from localStorage
  const speakNumber = useCallback(
    (number: string, isAddition: boolean, isFirst: boolean) => {
      // Re-read provider in case changed after hook mounted
      const currentProvider = getTtsProvider();
      let text: string;

      if (isFirst) {
        text = number;
      } else {
        text = isAddition ? `qo'sh ${number}` : `ayir ${number}`;
      }

      // Use ElevenLabs only if provider is elevenlabs, useElevenLabs option is true, and not disabled due to permission error
      const shouldUseElevenLabs =
        currentProvider === 'elevenlabs' && useElevenLabs && !elevenLabsDisabledRef.current;

      if (shouldUseElevenLabs) {
        speakWithElevenLabs(text);
      } else {
        speakWithBrowser(text);
      }
    },
    [useElevenLabs, speakWithElevenLabs, speakWithBrowser]
  );

  // Stop current playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    stop();
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, [stop]);

  return {
    speakNumber,
    speakWithElevenLabs,
    speakWithBrowser,
    stop,
    cleanup,
    isLoading,
    error,
  };
};
