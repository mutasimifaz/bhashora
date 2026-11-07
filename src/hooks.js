import { useCallback, useEffect, useRef, useState } from 'react';

const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';
const SARVAM_MODEL = import.meta.env.VITE_SARVAM_TTS_MODEL || 'bulbul:v3';
const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY || '';

function splitSpeechText(value, maxLength = 2400) {
    const text = String(value || '').trim();
    if (!text) return [];
    const sentences = text.match(/[^.!?।\n]+[.!?।\n]*/g) || [text];
    const chunks = [];
    let current = '';
    for (const sentence of sentences) {
        const part = sentence.trim();
        if (!part) continue;
        if ((current + ' ' + part).trim().length <= maxLength) {
            current = (current + ' ' + part).trim();
            continue;
        }
        if (current) chunks.push(current);
        if (part.length <= maxLength) {
            current = part;
        } else {
            for (let start = 0; start < part.length; start += maxLength) {
                const slice = part.slice(start, start + maxLength).trim();
                if (slice) chunks.push(slice);
            }
            current = '';
        }
    }
    if (current) chunks.push(current);
    return chunks;
}

function getSarvamLanguage(lang) {
    return String(lang || '').toLowerCase().startsWith('bn') ? 'bn-IN' : 'en-IN';
}

function getSarvamSpeaker(languageCode, selectedVoice = 'auto') {
    const allowed = languageCode === 'bn-IN' ? ['roopa', 'suhani', 'rehan'] : ['ishita', 'ratan'];
    if (selectedVoice && allowed.includes(selectedVoice)) return selectedVoice;
    // Sarvam Bulbul v3 speaker IDs recommended for Bengali and English.
    return languageCode === 'bn-IN'
        ? (import.meta.env.VITE_SARVAM_BN_SPEAKER || 'roopa')
        : (import.meta.env.VITE_SARVAM_EN_SPEAKER || 'ishita');
}

const speechAudioCache = new Map();

async function requestSarvamAudio(text, languageCode, signal, selectedVoice) {
    const speaker = getSarvamSpeaker(languageCode, selectedVoice);
    const cacheKey = `${languageCode}:${speaker}:${text}`;
    if (speechAudioCache.has(cacheKey)) return speechAudioCache.get(cacheKey);
    const response = await fetch(SARVAM_TTS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': SARVAM_API_KEY,
        },
        body: JSON.stringify({
            text,
            model: SARVAM_MODEL,
            language_code: languageCode,
            speaker,
            pace: 1.0,
            speech_sample_rate: 22050,
            output_audio_codec: 'wav',
        }),
        signal,
    });

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        if (response.status === 401 || response.status === 403) {
            throw new Error('Sarvam API key গ্রহণ করা হয়নি। নতুন/সঠিক API key .env ফাইলে দিন।');
        }
        if (response.status === 429) {
            throw new Error('Sarvam-এর অনুরোধের সীমা আপাতত পূর্ণ হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।');
        }
        throw new Error(`Sarvam TTS request failed (${response.status}). ${detail.slice(0, 240)}`);
    }

    const payload = await response.json();
    const encodedAudio = payload?.audios?.[0];
    if (!encodedAudio) throw new Error('Sarvam থেকে অডিও পাওয়া যায়নি। আবার চেষ্টা করুন।');
    const binary = atob(encodedAudio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'audio/wav' });
    speechAudioCache.set(cacheKey, blob);
    if (speechAudioCache.size > 40) speechAudioCache.delete(speechAudioCache.keys().next().value);
    return blob;
}

const VOICE_STORAGE_KEY = 'bhashora-tts-voice';

function readSavedVoice() {
    try {
        const saved = localStorage.getItem(VOICE_STORAGE_KEY);
        return ['auto', 'roopa', 'suhani', 'rehan', 'ishita', 'ratan'].includes(saved) ? saved : 'auto';
    } catch {
        return 'auto';
    }
}

export function useSpeech() {
    const [selectedVoice, setSelectedVoiceState] = useState(readSavedVoice);

    const setSelectedVoice = useCallback((voice) => {
        const safeVoice = ['auto', 'roopa', 'suhani', 'rehan', 'ishita', 'ratan'].includes(voice) ? voice : 'auto';
        setSelectedVoiceState(safeVoice);
        try {
            localStorage.setItem(VOICE_STORAGE_KEY, safeVoice);
        } catch (error) {
            console.warn('Could not save voice preference:', error);
        }
    }, []);
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(false);
    const [speechError, setSpeechError] = useState('');
    const recognitionRef = useRef(null);
    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);
    const requestControllerRef = useRef(null);
    const requestIdRef = useRef(0);
    const activeSpeechKeyRef = useRef('');

    useEffect(() => {
        const w = window;
        setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
        return () => {
            recognitionRef.current?.abort?.();
            requestControllerRef.current?.abort?.();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        };
    }, []);

    const stopSpeaking = useCallback(() => {
        requestIdRef.current += 1;
        requestControllerRef.current?.abort?.();
        requestControllerRef.current = null;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }
        activeSpeechKeyRef.current = '';
    }, []);

    const prepareSpeech = useCallback((text, lang = 'bn-BD', voiceOverride) => {
        const languageCode = getSarvamLanguage(lang);
        const voiceToUse = voiceOverride || selectedVoice;
        for (const chunk of splitSpeechText(text)) {
            requestSarvamAudio(chunk, languageCode, undefined, voiceToUse).catch((error) => console.warn('Speech prefetch failed:', error));
        }
    }, [selectedVoice]);

    const speak = useCallback(async (text, lang = 'en-IN', voiceOverride) => {
        const chunks = splitSpeechText(text);
        if (!chunks.length) return;
        const languageCode = getSarvamLanguage(lang);
        const voiceToUse = voiceOverride || selectedVoice;
        const speechKey = `${languageCode}:${voiceToUse}:${chunks.join('|')}`;
        if (activeSpeechKeyRef.current === speechKey) { stopSpeaking(); return; }
        stopSpeaking();
        activeSpeechKeyRef.current = speechKey;
        setSpeechError('');

        if (!SARVAM_API_KEY) {
            setSpeechError('Sarvam AI voice চালু করতে .env ফাইলে VITE_SARVAM_API_KEY যোগ করুন।');
            return;
        }

        const requestId = requestIdRef.current;
        const controller = new AbortController();
        requestControllerRef.current = controller;

        try {
            for (const chunk of chunks) {
                if (requestId !== requestIdRef.current) return;
                const blob = await requestSarvamAudio(chunk, languageCode, controller.signal, voiceToUse);
                if (requestId !== requestIdRef.current) return;

                const audioUrl = URL.createObjectURL(blob);
                audioUrlRef.current = audioUrl;
                const audio = new Audio(audioUrl);
                audioRef.current = audio;
                await new Promise((resolve, reject) => {
                    audio.onended = resolve;
                    audio.onerror = () => reject(new Error('অডিও চালানো যায়নি। ব্রাউজারের sound permission ও internet সংযোগ পরীক্ষা করুন।'));
                    audio.play().catch(reject);
                });
                if (audioUrlRef.current === audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                    audioUrlRef.current = null;
                }
                if (audioRef.current === audio) audioRef.current = null;
            }
        } catch (error) {
            if (error?.name !== 'AbortError' && requestId === requestIdRef.current) {
                console.error('Sarvam TTS failed:', error);
                setSpeechError(error instanceof Error ? error.message : 'Sarvam voice চালানো যায়নি। আবার চেষ্টা করুন।');
            }
        } finally {
            if (requestId === requestIdRef.current) requestControllerRef.current = null;
        }
    }, [stopSpeaking, selectedVoice]);

    const listen = useCallback((onText, lang = 'bn-BD') => {
        const w = window;
        const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
        if (!Recognition) {
            setSpeechError('এই ব্রাউজারে ভয়েস ইনপুট নেই। Android Chrome বা সমর্থিত ব্রাউজার ব্যবহার করুন।');
            return;
        }
        recognitionRef.current?.abort?.();
        setSpeechError('');
        const recognition = new Recognition();
        recognitionRef.current = recognition;
        recognition.lang = lang;
        recognition.interimResults = true;
        recognition.continuous = false;
        let finalText = '';
        let delivered = false;
        recognition.onstart = () => setListening(true);
        recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex || 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) finalText += result[0].transcript;
                else interim += result[0].transcript;
            }
            if (finalText.trim() && !delivered) {
                delivered = true;
                setSpeechError('');
                onText(finalText.trim());
            } else if (interim.trim()) {
                setSpeechError('শুনছি… কথা শেষ হলে লেখা যোগ হবে।');
            }
        };
        recognition.onerror = (event) => {
            const errors = {
                'not-allowed': 'মাইক্রোফোন ব্যবহারের অনুমতি দিন। ব্রাউজারের ঠিকানা বারের পাশের অনুমতি সেটিংস দেখুন।',
                'audio-capture': 'মাইক্রোফোন পাওয়া যাচ্ছে না। ফোনের মাইক্রোফোন পরীক্ষা করুন।',
                'network': 'ভয়েস শনাক্ত করতে ইন্টারনেট সংযোগ প্রয়োজন হতে পারে।',
                'no-speech': 'কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন।'
            };
            setSpeechError(errors[event.error] || 'মাইক্রোফোন চালু করা যায়নি। আবার চেষ্টা করুন।');
            setListening(false);
        };
        recognition.onend = () => setListening(false);
        try {
            recognition.start();
        } catch {
            setListening(false);
            setSpeechError('মাইক্রোফোন চালু করা যায়নি। একটু পরে আবার চেষ্টা করুন।');
        }
    }, []);

    const changeVoice = useCallback((voice) => { stopSpeaking(); setSelectedVoice(voice); }, [stopSpeaking, setSelectedVoice]);
    return { speak, prepareSpeech, listen, stopSpeaking, listening, supported, speechError, selectedVoice, setSelectedVoice: changeVoice };
}
