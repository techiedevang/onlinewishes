import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, RefreshCw, Check, Volume2, AlertCircle } from 'lucide-react';

interface SpeechPoemRecorderProps {
  onTranscribed: (text: string) => void;
  currentPoemText: string;
}

// Typing for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function SpeechPoemRecorder({
  onTranscribed,
  currentPoemText,
}: SpeechPoemRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    setErrorMessage('');
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          currentTranscript += result[0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMessage(`Mic error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      setErrorMessage(e.message || 'Could not start microphone');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleApplyToPoem = () => {
    if (!transcript.trim()) return;
    const formattedText = currentPoemText ? `${currentPoemText}\n\n${transcript.trim()}` : transcript.trim();
    onTranscribed(formattedText);
    setTranscript('');
  };

  return (
    <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 space-y-3">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300'
          }`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>Speech-to-Text Poem Dictation</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-600 dark:text-rose-300 px-1.5 py-0.2 rounded-full font-bold">
                SPEECH RECOGNITION
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Speak your poetry lines aloud & auto-transcribe directly into your website custom poem
            </p>
          </div>
        </div>

        {isSupported && (
          <div>
            {isListening ? (
              <button
                type="button"
                onClick={stopListening}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1.5"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>Stop Dictating</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startListening}
                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Record Spoken Poem</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!isSupported && (
        <div className="p-2.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>SpeechRecognition API is not natively available in this browser context, but manual typing is fully enabled above!</span>
        </div>
      )}

      {errorMessage && (
        <div className="text-xs text-red-500 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Live Transcript Display Box */}
      {isListening && (
        <div className="p-3 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-xl flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-300">
            Listening... Speak now:
          </span>
          <span className="text-xs italic text-slate-700 dark:text-slate-300 flex-1 truncate">
            {transcript || 'Waiting for spoken poetry...'}
          </span>
        </div>
      )}

      {transcript && !isListening && (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-800 space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-400">Recorded Speech Transcript:</span>
          <p className="text-xs italic text-slate-800 dark:text-slate-200 font-serif">
            "{transcript}"
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleApplyToPoem}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Append Transcribed Poem</span>
            </button>
            <button
              type="button"
              onClick={() => setTranscript('')}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-600"
            >
              Discard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
