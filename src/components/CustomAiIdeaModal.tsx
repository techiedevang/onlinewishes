import React, { useState, useRef } from 'react';
import { UserCustomization, CustomAiBlueprint, CustomWebsiteRequest } from '../types';
import { 
  X, Sparkles, Bot, ArrowRight, CheckCircle2, Wand2, RefreshCw, 
  Mic, Square, Play, Trash2, Volume2, Phone, Globe, MessageCircle, Send, Check 
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { saveCustomWebsiteRequest } from '../lib/customRequestService';
import { recordPaymentInCloud } from '../lib/scrapbookService';

interface CustomAiIdeaModalProps {
  onClose: () => void;
  onApplyBlueprint: (blueprint: CustomAiBlueprint, customization: UserCustomization) => void;
}

export function CustomAiIdeaModal({
  onClose,
  onApplyBlueprint,
}: CustomAiIdeaModalProps) {
  const [clientPrompt, setClientPrompt] = useState('');
  const [recipientName, setRecipientName] = useState('Ananya');
  const [relationship, setRelationship] = useState('Best Friend');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [requestedSlug, setRequestedSlug] = useState('ananya-special');
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<CustomAiBlueprint | null>(null);

  // Submit Request state
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<CustomWebsiteRequest | null>(null);

  const sampleIdeas = [
    'Cyberpunk neon gamer theme with 8-bit sound effects, 35 photos, and secret high-score love quiz for my boyfriend',
    'Chic Vogue-style fashion editorial with monochrome aesthetic, vintage jazz background music, and 20 quote cards for my sister',
    'A whimsical Harry Potter & magic spellbook theme with potion recipe memories, glowing wand animation, and floating candles for my bestie',
    'Sunset beach campfire acoustic theme with star constellation nodes, custom poem, and 25 sunset photos',
  ];

  // Auto update requested slug when recipient name changes
  const handleRecipientNameChange = (val: string) => {
    setRecipientName(val);
    const cleanSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    setRequestedSlug(`${cleanSlug || 'user'}-special`);
  };

  // Audio recording controls
  const startRecording = async () => {
    setAudioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      setAudioError('Microphone access denied or audio recording not supported in browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteAudio = () => {
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleGenerateCustomIdea = async () => {
    if (!clientPrompt.trim() && !audioUrl) {
      alert('Please write your custom idea or record a voice note for the AI Architect.');
      return;
    }
    setIsAnalyzing(true);
    setGeneratedBlueprint(null);

    const promptText = clientPrompt.trim() || '(User recorded a detailed voice note describing their vision)';

    try {
      let aiResult: CustomAiBlueprint | null = null;
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `You are OnlineWishes's Senior AI Web Architect & Bespoke Gift Specialist.
Analyze the user's custom gift website request and return a JSON object with:
- "title": a creative title for the website concept
- "conceptDescription": a 2-sentence summary of the custom visual & interactive experience
- "suggestedThemeColor": Tailwind color string or hex color like "#ec4899"
- "suggestedMusic": background music style name
- "estimatedPrice": 300
- "complexityLevel": "Custom Website" (Rs. 300)
- "features": array of 4 bespoke custom feature strings
- "initialPoem": a custom 4-line poem tailored to recipient and theme
- "initialParagraph": a warm 2-sentence personal message
Respond strictly in valid JSON format.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Recipient: ${recipientName} (${relationship})\nCustom Idea Request: ${promptText}`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          aiResult = JSON.parse(response.text);
          if (aiResult) aiResult.estimatedPrice = 300;
        }
      }

      if (!aiResult) {
        const promptLower = promptText.toLowerCase();
        aiResult = {
          title: `Custom ${recipientName}'s ${relationship} ${promptLower.includes('gamer') ? 'Gamer Quest' : 'Special Surprise Website'}`,
          conceptDescription: `A custom-engineered website built specifically around your request. Combines unique typography, custom interactive animations, and personalized memory galleries.`,
          suggestedThemeColor: promptLower.includes('neon') ? '#10b981' : promptLower.includes('cyber') ? '#8b5cf6' : '#ec4899',
          suggestedMusic: promptLower.includes('lofi') ? 'lofi_vibes' : promptLower.includes('jazz') ? 'jazz_cafe' : 'acoustic_love',
          estimatedPrice: 300,
          complexityLevel: 'Advanced Bespoke',
          features: [
            `Tailored visual layout designed around your custom request`,
            `Custom interactive memory gallery with flexible photo count`,
            `Specialized theme animations & ambient audio integration`,
            `Published live on onlinewishes.in/${requestedSlug || 'custom'}`,
          ],
          initialPoem: `Created for ${recipientName} with custom love and care,\nA one-of-a-kind web surprise beyond compare.\nThrough laughter and memories we keep close to heart,\nA custom digital masterpiece that never will part.`,
          initialParagraph: `Dear ${recipientName}, I wanted to create something truly unique and personal for you. This custom website was designed specifically around our bond and shared memories!`,
        };
      }

      setGeneratedBlueprint(aiResult);
    } catch (err) {
      console.error('Error generating AI concept:', err);
      setGeneratedBlueprint({
        title: `${recipientName}'s Tailored Custom Website`,
        conceptDescription: `Custom designed website tailored to your idea: "${promptText.slice(0, 50)}...". Includes personalized color palette, custom interactive sections, and unlimited photo support.`,
        suggestedThemeColor: '#ec4899',
        suggestedMusic: 'acoustic_love',
        estimatedPrice: 300,
        complexityLevel: 'Advanced Bespoke',
        features: [
          'Custom layout tailored to your specific theme idea',
          'Flexible photo gallery with custom captions',
          'Interactive passcode vault & soundboard',
          `Published live on onlinewishes.in/${requestedSlug || 'custom'}`,
        ],
        initialPoem: `A unique digital gift designed just for you,\nPreserving our favorite moments honest and true.\nEvery photo a memory, every line from the heart,\nA custom website where our stories never part.`,
        initialParagraph: `Thank you for being such an important part of my life, ${recipientName}. Hope you love this custom website created just for you!`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleSendToAdmin = async () => {
    if (!clientPrompt.trim() && !audioUrl) {
      alert('Please write a text description or record a voice note explaining your website idea.');
      return;
    }
    if (!whatsappNumber.trim()) {
      alert('Please enter your WhatsApp number so Admin can connect with you.');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      const price = generatedBlueprint?.estimatedPrice || 300;
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to create order');
      }
      const order = await res.json();
      
      // If it's a mock order (keys not configured), simulate successful payment automatically
      if (order.id && order.id.startsWith('order_mock_')) {
        console.warn('Razorpay keys not configured. Simulating successful mock payment.');
        alert('Notice: Razorpay API keys are not configured on the server. Simulating a successful mock payment for testing.');
        const mockPayId = `pay_mock_${Date.now()}`;
        try {
          await recordPaymentInCloud(order.id, mockPayId, price, `Bespoke AI Architecture Blueprint: ${generatedBlueprint?.title || 'Custom Surprise App'}`);
        } catch (payErr) {
          console.error("Failed to write mock custom payment to cloud:", payErr);
        }
        setTimeout(async () => {
          setIsProcessingPayment(false);
          await submitToAdminBackend();
        }, 1500);
        return;
      }

      const options = {
        key: order.key_id || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'OnlineWishes',
        description: 'Custom AI Idea Website',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await recordPaymentInCloud(order.id, response.razorpay_payment_id || `pay_${Date.now()}`, price, `Bespoke AI Architecture Blueprint: ${generatedBlueprint?.title || 'Custom Surprise App'}`);
          } catch (payErr) {
            console.error("Failed to write custom payment to cloud:", payErr);
          }
          setIsProcessingPayment(false);
          await submitToAdminBackend();
        },
        prefill: {
          name: recipientName || 'Sender',
          contact: whatsappNumber
        },
        theme: {
          color: '#10b981'
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };
      
      // @ts-ignore
      if (window.Razorpay) {
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setIsProcessingPayment(false);
          alert('Payment failed: ' + response.error.description);
        });
        try {
          rzp.open();
        } catch (e: any) {
          console.error("Razorpay open error:", e);
          setIsProcessingPayment(false);
          alert("Error opening Razorpay: " + (e.message || 'Unknown error. Please check if Razorpay keys are valid.'));
        }
      } else {
        // Fallback for environments without Razorpay script loaded
        setIsProcessingPayment(false);
        alert("Payment gateway could not be loaded. Please disable your adblocker or try a different browser to complete the payment.");
      }
    } catch (err) {
      console.error(err);
      setIsProcessingPayment(false);
      alert('Error initializing payment. Please try again.');
    }
  };

  const submitToAdminBackend = async () => {
    setIsSaving(true);
    try {
      const cleanSlug = requestedSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || `${recipientName.toLowerCase().replace(/\s+/g, '-')}-special`;

      const req = await saveCustomWebsiteRequest({
        recipientName: recipientName || 'Special Someone',
        relationship: relationship || 'Bestie',
        clientPrompt: clientPrompt.trim() || '(Voice note recorded explaining requirements)',
        audioUrl: audioUrl || undefined,
        audioDuration: recordingTime > 0 ? recordingTime : undefined,
        whatsappNumber: whatsappNumber.trim(),
        requestedSlug: cleanSlug,
        estimatedPrice: generatedBlueprint?.estimatedPrice || 300,
        aiBlueprintTitle: generatedBlueprint?.title || `${recipientName}'s Custom Website`,
      });

      setSubmittedRequest(req);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error sending request:', err);
      alert('Could not submit request. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmAndLoadStudio = () => {
    if (!generatedBlueprint) return;

    const customData: UserCustomization = {
      recipientName: recipientName,
      relationship: relationship,
      senderName: 'You',
      occasion: 'bestie',
      primaryColor: generatedBlueprint.suggestedThemeColor,
      bgTheme: 'pink',
      musicTrack: generatedBlueprint.suggestedMusic,
      memories: [
        {
          id: 'cm1',
          imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
          caption: `Custom memory #1 created for ${recipientName}`,
          date: '2025-01-01',
        },
        {
          id: 'cm2',
          imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=800',
          caption: `Our unforgettable shared adventure`,
          date: '2025-02-14',
        }
      ],
      customPoem: generatedBlueprint.initialPoem,
      customParagraph: generatedBlueprint.initialParagraph,
      secretPasscode: '2025',
      enablePasscode: false,
      subdomain: requestedSlug || recipientName.toLowerCase().replace(/\s+/g, '-') + '-custom-gift',
    };

    onApplyBlueprint(generatedBlueprint, customData);
    onClose();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 pb-12 px-4 flex items-center justify-center overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col ">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-rose-500 flex items-center justify-center text-white shadow-md shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold flex items-center space-x-2 text-slate-900 dark:text-white">
                <span>Custom Website Idea Request</span>
                <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded-full border border-rose-500/30">
                  CUSTOM AI
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Write or record your idea — Our team will build your exact custom website & contact you on WhatsApp!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-white rounded-xl"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {isSubmitted && submittedRequest ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border-2 border-emerald-500/60 rounded-2xl p-6 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl shadow-lg">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  Request Received Successfully
                </span>
                <h4 className="text-xl font-black text-white">
                  🎉 Your Custom Website Request is Sent!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Our team has received your description{submittedRequest.audioUrl ? ' & voice note' : ''}.
                  We will contact you on WhatsApp at <span className="font-bold text-emerald-300">{submittedRequest.whatsappNumber}</span> shortly to design your custom website!
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Recipient Name:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{submittedRequest.recipientName} ({submittedRequest.relationship})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Requested Custom Link:</span>
                  <span className="font-bold text-rose-400 font-mono">onlinewishes.in/{submittedRequest.requestedSlug}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">WhatsApp Contact:</span>
                  <span className="font-bold text-emerald-400">{submittedRequest.whatsappNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">Written Idea Description:</span>
                  <p className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-lg text-slate-600 dark:text-slate-300 italic">{submittedRequest.clientPrompt}</p>
                </div>
                {submittedRequest.audioUrl && (
                  <div className="pt-2">
                    <span className="text-slate-500 dark:text-slate-400 block mb-1">Your Voice Note:</span>
                    <audio src={submittedRequest.audioUrl} controls className="w-full h-8" />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
                >
                  Done & Close
                </button>
                {generatedBlueprint && (
                  <button
                    onClick={handleConfirmAndLoadStudio}
                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Open Studio Preview Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* MAIN INPUT FORM */
            <div className="space-y-5">
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-4">
                
                {/* Recipient & Relationship */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => handleRecipientNameChange(e.target.value)}
                      placeholder="e.g. Ananya, Alex, Sarah"
                      className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder="e.g. Best Friend, Girlfriend, Sister"
                      className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* 1. WRITE FEATURE: Text Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>1. Write Your Custom Idea & Demand *</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Text description</span>
                  </label>
                  <textarea
                    rows={3}
                    value={clientPrompt}
                    onChange={(e) => setClientPrompt(e.target.value)}
                    placeholder="Describe everything you want in detail: e.g. 'I want a retro cyberpunk gaming theme with neon glowing photos, 8-bit love song background, secret passcode quiz, and custom love timeline...'"
                    className="w-full p-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-slate-100 placeholder-slate-500"
                  />
                </div>

                {/* Quick Prompts */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Click a sample idea prompt:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleIdeas.map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setClientPrompt(idea)}
                        className="text-[10px] bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700/70 px-2.5 py-1 rounded-lg text-left transition-colors"
                      >
                        "{idea.slice(0, 42)}..."
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. RECORD AUDIO FEATURE */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Mic className="w-4 h-4 text-rose-400" />
                      <span>2. Record Audio Voice Note (Explain by speaking)</span>
                    </span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-semibold">
                      VOICE NOTE FEATURE
                    </span>
                  </label>

                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col space-y-3">
                    {!audioUrl ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {isRecording ? (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="w-10 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center animate-pulse shadow-lg shrink-0"
                              title="Click to stop recording"
                            >
                              <Square className="w-5 h-5 fill-current" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shrink-0 transition-transform hover:scale-105"
                              title="Click to start voice recording"
                            >
                              <Mic className="w-5 h-5" />
                            </button>
                          )}

                          <div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                              {isRecording ? (
                                <span className="text-rose-400 animate-pulse flex items-center space-x-1.5">
                                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping"></span>
                                  <span>Recording Voice Note... {formatAudioTime(recordingTime)}</span>
                                </span>
                              ) : (
                                'Click microphone to record voice note'
                              )}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              {isRecording ? 'Click stop button when finished speaking' : 'Explain your custom design request in your own words'}
                            </span>
                          </div>
                        </div>

                        {isRecording && (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Done Recording
                          </button>
                        )}
                      </div>
                    ) : (
                      /* RECORDED AUDIO PREVIEW PLAYER */
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                          <span className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Voice Note Recorded ({formatAudioTime(recordingTime)})</span>
                          </span>
                          <button
                            type="button"
                            onClick={deleteAudio}
                            className="text-slate-500 dark:text-slate-400 hover:text-rose-400 flex items-center space-x-1 text-[11px] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Re-record</span>
                          </button>
                        </div>
                        <audio src={audioUrl} controls className="w-full h-9 rounded-lg" />
                      </div>
                    )}

                    {audioError && (
                      <p className="text-[11px] text-rose-400 font-medium">{audioError}</p>
                    )}
                  </div>
                </div>

                {/* 3. WHATSAPP NUMBER & REQUESTED LINK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  
                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Number for Contact *</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500 dark:text-slate-400" />
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="e.g. +91 9876543210"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-emerald-400 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                      We will message you on this WhatsApp number with your finished website!
                    </span>
                  </div>

                  {/* Requested Link: onlinewishes.in/username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-purple-400" />
                      <span>Requested Website Link *</span>
                    </label>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
                      <span className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-700 shrink-0">
                        onlinewishes.in/
                      </span>
                      <input
                        type="text"
                        value={requestedSlug}
                        onChange={(e) => setRequestedSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="username"
                        className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-900 text-xs font-mono font-bold text-purple-300 focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Your website will be published live at <span className="text-purple-300 font-mono">onlinewishes.in/{requestedSlug || 'username'}</span>
                    </span>
                  </div>

                </div>

                {/* Primary Action Button: Submit Request */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleSendToAdmin}
                    disabled={isProcessingPayment || isSaving || (!clientPrompt.trim() && !audioUrl) || !whatsappNumber.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black text-xs rounded-xl shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Processing Payment...</span>
                      </>
                    ) : isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Sending Idea & Voice Note...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>Submit Custom Idea & Request Website (Rs. 300)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateCustomIdea}
                    disabled={isAnalyzing || (!clientPrompt.trim() && !audioUrl)}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating AI Concept...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Also Generate Instant AI Concept Preview</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* GENERATED BLUEPRINT DISPLAY */}
              {generatedBlueprint && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border-2 border-rose-500/50 space-y-5 animate-fadeIn">
                  
                  <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{generatedBlueprint.complexityLevel}</span>
                      </div>
                      <h4 className="text-xl font-extrabold text-white">
                        {generatedBlueprint.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {generatedBlueprint.conceptDescription}
                      </p>
                    </div>

                    <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-center min-w-[110px]">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Custom Charge</span>
                      <span className="text-2xl font-black text-emerald-400">Rs. {generatedBlueprint.estimatedPrice}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">One-time payment</span>
                    </div>
                  </div>

                  {/* Bespoke Features List */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Included Bespoke Features
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {generatedBlueprint.features.map((feat, fIdx) => (
                        <div key={fIdx} className="bg-slate-100 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleSendToAdmin}
                      disabled={isProcessingPayment || isSaving || !whatsappNumber.trim()}
                      className="w-full sm:flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <span>{isProcessingPayment ? 'Processing Payment...' : isSaving ? 'Submitting...' : 'Submit with WhatsApp Contact'}</span>
                      {!isProcessingPayment && !isSaving && <ArrowRight className="w-4 h-4" />}
                      {(isProcessingPayment || isSaving) && <RefreshCw className="w-4 h-4 animate-spin" />}
                    </button>
                    <button
                      onClick={handleConfirmAndLoadStudio}
                      className="w-full sm:flex-1 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <span>Open in Studio Preview</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

