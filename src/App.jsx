import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom'
import { doc, getDoc, getDocs, collection, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, helpModel, firebaseReady } from './firebase.js'
import Auth from './Auth.jsx';
import { BookOpen, Home, Gamepad2, MessageCircle, Trophy, Settings, Volume2, Mic, Send, ImagePlus, X, ChevronRight, Check, Flame, Heart, ArrowLeft, Sparkles, Smartphone, CircleHelp, UserRound, Sun, BookMarked, Brain, Bot, User, Clock3, Award, AlertCircle, Type, LogOut, Trash2 } from 'lucide-react';
import { games, lessons } from './data.js';
import { useSpeech } from './hooks.js';
const nav = [
    { id: 'home', label: 'হোম', icon: Home }, { id: 'learn', label: 'ইংরেজি শিখি', icon: BookOpen }, { id: 'past', label: 'Past lessons', icon: BookMarked },
    { id: 'games', label: 'মজার খেলা', icon: Gamepad2 }, { id: 'help', label: 'ডিজিটাল সাহায্য', icon: MessageCircle },
    { id: 'progress', label: 'আমার অগ্রগতি', icon: Trophy }
];
const starterMessages = [{ role: 'assistant', text: 'স্বাগতম। আমি ভাষোরার ডিজিটাল সহকারী। মোবাইল, ইন্টারনেট বা কোনো অ্যাপ নিয়ে সমস্যা হলে আমাকে বলুন। চাইলে স্ক্রিনশটও পাঠাতে পারেন।' }];
const todayKey = () => new Date().toLocaleDateString('en-CA');
function getDailyQuiz() {
    const date = todayKey();
    const [year, month, day] = date.split('-').map(Number);
    const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
    const firstQuestion = (dayNumber * 10) % games.length;
    const dailyQuestions = Array.from({ length: 10 }, (_, offset) => (firstQuestion + offset) % games.length);
    return { date, questions: dailyQuestions, index: 0, answers: Array(10).fill(null), finished: false };
}
function calculateStreak(days) {
    const set = new Set(days);
    let count = 0;
    const cursor = new Date(`${todayKey()}T12:00:00`);
    if (!set.has(cursor.toLocaleDateString('en-CA')))
        cursor.setDate(cursor.getDate() - 1);
    while (set.has(cursor.toLocaleDateString('en-CA'))) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return count;
}
function MainApp({ user }) {
    const location = useLocation();
    const navigate = useNavigate();
    const routePages = { '/app':'home', '/app/home':'home', '/app/learn':'learn', '/app/past':'past', '/app/games':'games', '/app/help':'help', '/app/progress':'progress', '/app/settings':'settings', '/app/lesson':'lesson' };
    const page = routePages[location.pathname] || 'home';
    const setPage = (next) => navigate(next === 'home' ? '/app' : `/app/${next}`);
    const [lessonId, setLessonId] = useState(1);
    const [wordIndex, setWordIndex] = useState(0);
    const [completed, setCompleted] = useState([]);
    const [activeDays, setActiveDays] = useState([]);
    const [largeText, setLargeText] = useState(true);
    const [dark, setDark] = useState(false);
    const [messages, setMessages] = useState(starterMessages);
    const [cloudReady, setCloudReady] = useState(false);
    const [question, setQuestion] = useState('');
    const [image, setImage] = useState();
    const [busy, setBusy] = useState(false);
    const [quiz, setQuiz] = useState(getDailyQuiz);
    const [toast, setToast] = useState('');
    const { speak, prepareSpeech, stopSpeaking, listen, listening, supported, speechError, selectedVoice, setSelectedVoice } = useSpeech();
    useEffect(() => { stopSpeaking(); }, [location.pathname, stopSpeaking]);
    const lesson = lessons.find(x => x.id === lessonId) || lessons[0];
    const word = lesson.words[wordIndex];
    const progress = Math.round(completed.length / lessons.length * 100);
    const streak = calculateStreak(activeDays);
    // Restore the signed-in user's cloud profile before allowing writes.
    useEffect(() => {
        let cancelled = false;
        async function restoreCloudData() {
            if (!user || !db) return;
            setCloudReady(false);
            try {
                const profileRef = doc(db, 'users', user.uid, 'appData', 'main');
                const profileSnap = await getDoc(profileRef);
                let saved = profileSnap.exists() ? profileSnap.data() : {};
                // One-time recovery from the older build's per-day Firestore records.
                const dailySnap = await getDocs(collection(db, 'users', user.uid, 'dailyProgress'));
                const legacyDays = dailySnap.docs.map(item => item.data());
                const mergedCompleted = [...new Set([...(saved.completed || []), ...legacyDays.flatMap(day => day.completedLessons || [])])];
                const mergedActiveDays = [...new Set([...(saved.activeDays || []), ...legacyDays.flatMap(day => day.activeDays || []), ...legacyDays.map(day => day.date).filter(Boolean)])];
                if (cancelled) return;
                setCompleted(mergedCompleted);
                setActiveDays(mergedActiveDays);
                if (saved.quiz?.date === todayKey()) setQuiz(saved.quiz);
                else {
                    const todayLegacy = legacyDays.find(day => day.date === todayKey());
                    if (todayLegacy?.quiz?.date === todayKey()) setQuiz(todayLegacy.quiz);
                    else setQuiz(getDailyQuiz());
                }
                if (typeof saved.largeText === 'boolean') setLargeText(saved.largeText);
                if (typeof saved.dark === 'boolean') setDark(saved.dark);
                if (Array.isArray(saved.messages) && saved.messages.length) setMessages(saved.messages.slice(-40));
                setCloudReady(true);
            } catch (error) {
                console.error('Firestore restore failed:', error);
                if (!cancelled) setToast('ডেটা আনা যায়নি। ইন্টারনেট ও Firestore Rules পরীক্ষা করুন।');
            }
        }
        restoreCloudData();
        return () => { cancelled = true; };
    }, [user]);
    // Cloud Firestore is the source of truth; localStorage is not used for progress.
    useEffect(() => {
        if (!user || !db || !cloudReady) return;
        const safeMessages = messages.slice(-40).map(({ role, text }) => ({ role, text: String(text || '').slice(0, 5000) }));
        setDoc(doc(db, 'users', user.uid, 'appData', 'main'), {
            completed, activeDays, quiz, largeText, dark, messages: safeMessages,
            updatedAt: serverTimestamp()
        }, { merge: true }).catch(error => {
            console.error('Firestore save failed:', error);
            setToast('ডেটা সংরক্ষণ হয়নি। আবার ইন্টারনেট পেলে চেষ্টা করুন।');
        });
    }, [user, cloudReady, completed, activeDays, quiz, largeText, dark, messages]);
    useEffect(() => {
        const refreshForNewDay = () => {
            const fresh = getDailyQuiz();
            setQuiz(old => old.date === fresh.date ? old : fresh);
        };
        const interval = window.setInterval(refreshForNewDay, 60000);
        window.addEventListener('focus', refreshForNewDay);
        document.addEventListener('visibilitychange', refreshForNewDay);
        return () => { window.clearInterval(interval); window.removeEventListener('focus', refreshForNewDay); document.removeEventListener('visibilitychange', refreshForNewDay); };
    }, []);
    useEffect(() => { if (toast) {
        const t = setTimeout(() => setToast(''), 2600);
        return () => clearTimeout(t);
    } }, [toast]);
    function markActiveDay() {
        const date = todayKey();
        setActiveDays(old => old.includes(date) ? old : [...old, date]);
    }
    function clearMessages() { if (busy) return; setMessages(starterMessages); }
    function startLesson(id) { setLessonId(id); setWordIndex(0); setPage('lesson'); }
    function finishLesson() {
        setCompleted(old => old.includes(lessonId) ? old : [...old, lessonId]);
        markActiveDay();
        const nextLesson = lessons.find(l => l.id > lessonId && !completed.includes(l.id)) || lessons.find(l => l.id !== lessonId && !completed.includes(l.id)) || lessons[0];
        setLessonId(nextLesson.id);
        setWordIndex(0);
        setPage('lesson');
        setToast('দারুণ! আগের পাঠটি Past lessons-এ রাখা হয়েছে। নতুন পাঠ শুরু হলো!');
    }
    async function sendMessage() {
        if ((!question.trim() && !image) || busy) return;

        const userText = question.trim() || 'এই ছবিটিতে কী সমস্যা হয়েছে? সহজ বাংলায় বুঝিয়ে বলুন।';
        const next = [...messages, { role: 'user', text: userText, image }];

        setMessages(next);
        setQuestion('');
        setImage(undefined);
        setBusy(true);

        try {
            if (!helpModel) {
                throw new Error('Firebase AI সংযোগ প্রস্তুত নয়। Firebase Console-এ Firebase AI Logic চালু করুন।');
            }

            const transcript = next
                .map(m => `${m.role === 'user' ? 'ব্যবহারকারী' : 'সহকারী'}: ${m.text}`)
                .join('\n\n');

            const parts = [{
                text: `নিচের কথোপকথনের ধারাবাহিকতায় সর্বশেষ প্রশ্নের উত্তর সহজ বাংলায় দিন।\n\n${transcript}`
            }];

            const latestImage = [...next]
                .reverse()
                .find(m => m.role === 'user' && m.image)?.image;

            if (latestImage) {
                const [meta, data] = latestImage.split(',');
                const mimeType = meta.match(/data:(.*?);/)?.[1] || 'image/jpeg';
                parts.push({ inlineData: { mimeType, data } });
            }

            const result = await helpModel.generateContent(parts);
            const reply = result.response.text() || 'দুঃখিত, উত্তর তৈরি করা যায়নি। আবার চেষ্টা করুন।';
            // Prepare the default Bengali voice in the background while the user reads the answer.
            prepareSpeech(reply, 'bn-BD');

            setMessages([...next, { role: 'assistant', text: reply }]);
        } catch (error) {
            const detail = String(error?.message || error || 'Unknown error');
            const status = error?.customData?.status || error?.status || '';

            console.error('Bhashora Digital Help AI request failed:', error);

            let friendly;
            let nextStep;

            if (/genai config not found/i.test(detail)) {
                friendly = 'Firebase AI Logic-এর Gemini configuration পাওয়া যাচ্ছে না।';
                nextStep = 'Firebase Console → AI Services → AI Logic-এ Gemini Developer API setup পরীক্ষা করুন।';
            } else if (/app.?check|403|permission_denied/i.test(detail)) {
                friendly = 'Firebase App Check যাচাই সম্পন্ন হয়নি।';
                nextStep = 'App Check Debug Token তৈরি ও Firebase Console-এ register হয়েছে কি না পরীক্ষা করুন।';
            } else if (/high demand|internal server error/i.test(detail) || String(status) === '500') {
                friendly = 'এই মুহূর্তে AI সার্ভারে অনেক চাপ রয়েছে।';
                nextStep = 'কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।';
            } else if (/429|resource_exhausted|quota/i.test(detail) || String(status) === '429') {
                friendly = 'AI ব্যবহারের সাময়িক সীমা পূর্ণ হয়েছে।';
                nextStep = 'কিছুক্ষণ পর আবার চেষ্টা করুন অথবা Gemini API usage limit পরীক্ষা করুন।';
            } else if (/api key|blocked/i.test(detail)) {
                friendly = 'Firebase API Key অনুমোদন সংক্রান্ত সমস্যা হয়েছে।';
                nextStep = 'Firebase API Key-এর API restrictions পরীক্ষা করুন।';
            } else {
                friendly = 'এই মুহূর্তে AI সহকারী সংযোগ করতে পারছে না।';
                nextStep = 'ইন্টারনেট সংযোগ ও Firebase সেটআপ পরীক্ষা করে আবার চেষ্টা করুন।';
            }

            setMessages([
                ...next,
                {
                    role: 'assistant',
                    text: `${friendly}\n\nপরবর্তী করণীয়: ${nextStep}\n\nআপনার প্রশ্নটি হারায়নি। আবার পাঠাতে পারবেন।`
                }
            ]);
        } finally {
            setBusy(false);
        }
    }
    function uploadImage(file) {
        if (!file)
            return;
        if (!file.type.startsWith('image/')) {
            setToast('অনুগ্রহ করে একটি ছবি নির্বাচন করুন।');
            return;
        }
        if (file.size > 12 * 1024 * 1024) {
            setToast('ছবিটি ১২ MB-এর কম হলে ভালো হয়।');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setImage(String(reader.result));
        reader.readAsDataURL(file);
    }
    function answerQuiz(answer) {
        if (quiz.finished || quiz.answers[quiz.index] !== null)
            return;
        const answers = [...quiz.answers];
        answers[quiz.index] = answer;
        setQuiz({ ...quiz, answers, finished: quiz.index === 9 });
        if (quiz.index === 9)
            markActiveDay();
    }
    function nextQuizQuestion() { setQuiz(old => ({ ...old, index: Math.min(9, old.index + 1) })); }
    const shellClass = `${dark ? 'app-shell dark-mode' : 'app-shell'} ${largeText ? 'large-text' : ''}`;
    return _jsxs("div", { className: shellClass, children: [_jsxs("header", { className: "topbar", children: [_jsxs("button", { className: "brand", onClick: () => setPage('home'), "aria-label": "\u09B9\u09CB\u09AE\u09C7 \u09AF\u09BE\u09A8", children: [_jsx("img", { className: "brand-mark brand-logo", src: "/logo.svg", alt: "" }), _jsxs("span", { children: [_jsx("b", { children: "\u09AD\u09BE\u09B7\u09CB\u09B0\u09BE" }), _jsx("small", { children: "\u09AD\u09BE\u09B7\u09BE \u09B6\u09C7\u0996\u09BE, \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u09A4\u09C7 \u09AD\u09B0\u09B8\u09BE" })] })] }), _jsxs("div", { className: "top-actions", children: [_jsxs("span", { className: "streak", children: [_jsx(Flame, { size: 18 }), " ", streak ? `${streak} দিনের চর্চা` : 'আজ শুরু করুন'] }), _jsxs("div", { className: "account-actions", children: [_jsx("button", { className: "icon-button", onClick: () => setPage('settings'), "aria-label": "\u09B8\u09C7\u099F\u09BF\u0982\u09B8", children: _jsx(Settings, {}) }), _jsx("button", { className: "icon-button", onClick: () => setPage('settings'), "aria-label": "অ্যাকাউন্ট ও সেটিংস", title: "অ্যাকাউন্ট ও সেটিংস", children: _jsx(UserRound, {}) }), _jsx("button", { className: "icon-button", onClick: () => signOut(auth), "aria-label": "লগ আউট", title: "লগ আউট", children: _jsx(LogOut, {}) })] })] })] }), _jsxs("div", { className: "layout", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "side-welcome", children: [_jsx("div", { className: "avatar", children: _jsx(UserRound, { size: 31 }) }), _jsx("b", { children: "\u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE!" }), _jsx("span", { children: "\u0986\u099C \u098F\u0995\u099F\u09C1 \u09B6\u09BF\u0996\u09C7 \u09A8\u09BF\u0987?" })] }), _jsx("nav", { children: nav.map(item => _jsxs("button", { onClick: () => setPage(item.id), className: page === item.id || (page === 'lesson' && item.id === 'learn') ? 'nav-item active' : 'nav-item', children: [_jsx(item.icon, { size: 21 }), item.label] }, item.id)) }), _jsxs("div", { className: "side-note", children: [_jsx(Heart, { size: 18 }), " ", _jsxs("span", { children: ["\u09A7\u09C0\u09B0\u09C7 \u09A7\u09C0\u09B0\u09C7 \u09B6\u09BF\u0996\u09C1\u09A8\u0964", _jsx("br", {}), "\u09AD\u09C1\u09B2 \u09B9\u09B2\u09C7\u0993 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09A8\u09C7\u0987!"] })] })] }), _jsxs("main", { className: "main-content", children: [speechError && page !== 'help' && _jsx("p", { className: "speech-status", role: "status", children: speechError }), page === 'home' && _jsx(HomePage, { completed: completed, progress: progress, startLesson: startLesson, setPage: setPage, speak: speak }), page === 'learn' && _jsx(LearnPage, { completed: completed, startLesson: startLesson }), page === 'past' && _jsx(PastLessonsPage, { completed: completed, startLesson: startLesson }), page === 'lesson' && _jsxs("section", { className: "page-wrap", children: [_jsxs("button", { className: "back-link", onClick: () => setPage('learn'), children: [_jsx(ArrowLeft, { size: 18 }), " \u09AA\u09BE\u09A0\u09C7\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE\u09DF \u09AB\u09BF\u09B0\u09C1\u09A8"] }), _jsxs("div", { className: "lesson-card", children: [_jsxs("div", { className: "lesson-top", children: [_jsxs("span", { className: "eyebrow", children: ["\u09AA\u09BE\u09A0 ", lesson.id, " / ", lessons.length] }), _jsxs("span", { className: "time-pill", children: [_jsx(Clock3, { size: 15 }), " ", lesson.minutes, " \u09AE\u09BF\u09A8\u09BF\u099F"] })] }), _jsx("div", { className: "progress-track", children: _jsx("div", { style: { width: `${(wordIndex + 1) / lesson.words.length * 100}%` } }) }), _jsx("div", { className: "lesson-emoji", children: _jsx(lesson.icon, { size: 42 }) }), _jsx("h1", { children: lesson.title }), _jsx("p", { className: "muted", children: lesson.subtitle }), _jsxs("div", { className: "word-card", children: [_jsx("span", { className: "eyebrow", children: "\u0987\u0982\u09B0\u09C7\u099C\u09BF \u09B6\u09AC\u09CD\u09A6 \u09AC\u09BE \u09AC\u09BE\u0995\u09CD\u09AF" }), _jsx("h2", { children: word.en }), _jsx("p", { className: "bangla-meaning", children: word.bn }), _jsxs("div", { className: "pronounce", children: ["\u0989\u099A\u09CD\u099A\u09BE\u09B0\u09A3: ", word.say] }), _jsxs("button", { className: "listen-button", onClick: () => speak(word.en), children: [_jsx(Volume2, { size: 20 }), " \u09B6\u09C1\u09A8\u09C1\u09A8"] }), _jsxs("div", { className: "word-examples", children: [_jsx("h3", { children: "দৈনন্দিন জীবনের ৫টি উদাহরণ" }), _jsx("ol", { children: (word.examples || []).map((example, index) => _jsxs("li", { children: [_jsx("b", { children: example.en }), _jsx("small", { children: example.bn })] }, index)) })] })] }), _jsxs("div", { className: "lesson-controls", children: [_jsx("button", { className: "button secondary", disabled: wordIndex === 0, onClick: () => setWordIndex(i => i - 1), children: "\u0986\u0997\u09C7\u09B0\u099F\u09BF" }), wordIndex < lesson.words.length - 1 ? _jsxs("button", { className: "button primary", onClick: () => setWordIndex(i => i + 1), children: ["\u09AA\u09B0\u09C7\u09B0\u099F\u09BF ", _jsx(ChevronRight, { size: 19 })] }) : _jsxs("button", { className: "button primary", onClick: finishLesson, children: [_jsx(Check, { size: 19 }), " \u09AA\u09BE\u09A0 \u09B6\u09C7\u09B7 \u0995\u09B0\u09BF"] })] }), _jsx("p", { className: "gentle-tip", children: "\u098F\u0995\u09AC\u09BE\u09B0 \u09B6\u09C1\u09A8\u09C1\u09A8, \u09A4\u09BE\u09B0\u09AA\u09B0 \u09A8\u09BF\u099C\u09C7 \u09AC\u09B2\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" })] })] }), page === 'games' && _jsx(GamesPage, { quiz: quiz, answerQuiz: answerQuiz, nextQuizQuestion: nextQuizQuestion }), page === 'help' && _jsx(HelpPage, { messages: messages, clearMessages: clearMessages, question: question, setQuestion: setQuestion, image: image, setImage: setImage, uploadImage: uploadImage, sendMessage: sendMessage, busy: busy, listen: listen, listening: listening, supported: supported, speechError: speechError, speak: speak, selectedVoice: selectedVoice, setSelectedVoice: setSelectedVoice }), page === 'progress' && _jsx(ProgressPage, { completed: completed, progress: progress, streak: streak }), page === 'settings' && _jsx(SettingsPage, { largeText: largeText, setLargeText: setLargeText, dark: dark, setDark: setDark, speak: speak, selectedVoice: selectedVoice, setSelectedVoice: setSelectedVoice })] })] }), _jsx("nav", { className: "mobile-nav", children: nav.map(item => _jsxs("button", { onClick: () => setPage(item.id), className: page === item.id || (page === 'lesson' && item.id === 'learn') ? 'mobile-nav-item active' : 'mobile-nav-item', children: [_jsx(item.icon, { size: 21 }), _jsx("span", { children: item.label })] }, item.id)) }), toast && _jsxs("div", { className: "toast", children: [_jsx(Sparkles, { size: 18 }), toast] })] });
}
function HomePage({ completed, progress, startLesson, setPage, speak }) {
    const next = lessons.find(l => !completed.includes(l.id)) || lessons[0];
    return _jsxs("div", { className: "page-wrap", children: [_jsxs("section", { className: "hero", children: [_jsxs("div", { className: "hero-copy", children: [_jsx("span", { className: "eyebrow", children: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09B6\u09C7\u0996\u09BE\u09B0 \u099B\u09CB\u099F\u09CD\u099F \u09B8\u0999\u09CD\u0997\u09C0" }), _jsxs("h1", { children: ["\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE!", _jsx("br", {}), _jsx("em", { children: "\u0986\u099C \u0995\u09C0 \u09B6\u09BF\u0996\u09AC\u09C7\u09A8?" })] }), _jsx("p", { children: "\u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u0985\u09B2\u09CD\u09AA \u0985\u09B2\u09CD\u09AA \u0995\u09B0\u09C7 \u09B6\u09BF\u0996\u09B2\u09C7\u0987 \u0985\u09A8\u09C7\u0995 \u09A6\u09C2\u09B0 \u09AF\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u0964 \u099A\u09B2\u09C1\u09A8, \u0986\u099C\u0995\u09C7\u09B0 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8 \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09BF\u0964" }), _jsxs("button", { className: "button hero-button", onClick: () => startLesson(next.id), children: ["\u0986\u099C\u0995\u09C7\u09B0 \u09AA\u09BE\u09A0 \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09BF ", _jsx(ChevronRight, { size: 20 })] })] }), _jsxs("div", { className: "hero-art", children: [_jsx("div", { className: "sun-disc", children: _jsx(Sun, { size: 35 }) }), _jsx("div", { className: "book-illustration", children: _jsx(BookOpen, { size: 104 }) }), _jsx("div", { className: "floating-word", children: "Hello!" })] })] }), _jsxs("div", { className: "section-heading", children: [_jsxs("div", { children: [_jsx("span", { className: "eyebrow", children: "\u0986\u099C\u0995\u09C7\u09B0 \u09AA\u09B0\u09BF\u0995\u09B2\u09CD\u09AA\u09A8\u09BE" }), _jsx("h2", { children: "\u099B\u09CB\u099F\u09CD\u099F \u09A4\u09BF\u09A8\u099F\u09BF \u0995\u09BE\u099C" })] }), _jsx("span", { className: "soft-pill", children: "\u09B8\u09AE\u09DF \u09B2\u09BE\u0997\u09AC\u09C7 \u09E7\u09E6 \u09AE\u09BF\u09A8\u09BF\u099F" })] }), _jsxs("div", { className: "task-grid", children: [_jsxs("button", { className: "task-card", onClick: () => startLesson(next.id), children: [_jsx("span", { className: "task-icon mint-bg", children: _jsx(BookMarked, { size: 23 }) }), _jsx("b", { children: "\u098F\u0995\u099F\u09BF \u09AA\u09BE\u09A0 \u09B6\u09BF\u0996\u09BF" }), _jsx("small", { children: "\u09A8\u09A4\u09C1\u09A8 \u09EA\u099F\u09BF \u09B6\u09AC\u09CD\u09A6 \u09AC\u09BE \u09AC\u09BE\u0995\u09CD\u09AF" }), _jsx("span", { className: "task-arrow", children: _jsx(ChevronRight, {}) })] }), _jsxs("button", { className: "task-card", onClick: () => setPage('games'), children: [_jsx("span", { className: "task-icon peach-bg", children: _jsx(Brain, { size: 23 }) }), _jsx("b", { children: "\u098F\u0995\u099F\u09BF \u0996\u09C7\u09B2\u09BE \u0996\u09C7\u09B2\u09BF" }), _jsx("small", { children: "\u09AE\u099C\u09BE\u09B0 \u0995\u09C1\u0987\u099C \u09A6\u09BF\u09DF\u09C7 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8" }), _jsx("span", { className: "task-arrow", children: _jsx(ChevronRight, {}) })] }), _jsxs("button", { className: "task-card", onClick: () => setPage('help'), children: [_jsx("span", { className: "task-icon lilac-bg", children: _jsx(MessageCircle, { size: 23 }) }), _jsx("b", { children: "\u0995\u09BF\u099B\u09C1 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u0987" }), _jsx("small", { children: "\u09AC\u09BE\u0982\u09B2\u09BE\u09DF \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09C1\u09A8" }), _jsx("span", { className: "task-arrow", children: _jsx(ChevronRight, {}) })] })] }), _jsxs("div", { className: "section-heading", children: [_jsxs("div", { children: [_jsx("span", { className: "eyebrow", children: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09A5\u099A\u09B2\u09BE" }), _jsx("h2", { children: "\u09B6\u09C7\u0996\u09BE\u09B0 \u0985\u0997\u09CD\u09B0\u0997\u09A4\u09BF" })] }), _jsxs("button", { className: "text-link", onClick: () => setPage('progress'), children: ["\u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 ", _jsx(ChevronRight, { size: 16 })] })] }), _jsxs("div", { className: "progress-card", children: [_jsx("div", { className: "progress-icon", children: _jsx(Trophy, { size: 25 }) }), _jsxs("div", { className: "progress-copy", children: [_jsxs("b", { children: [completed.length, "\u099F\u09BF \u09AA\u09BE\u09A0 \u09B6\u09C7\u09B7 \u0995\u09B0\u09C7\u099B\u09C7\u09A8"] }), _jsx("span", { children: "\u099A\u09AE\u09CE\u0995\u09BE\u09B0! \u098F\u09AD\u09BE\u09AC\u09C7\u0987 \u098F\u0997\u09BF\u09DF\u09C7 \u099A\u09B2\u09C1\u09A8\u0964" }), _jsx("div", { className: "progress-track", children: _jsx("div", { style: { width: `${progress}%` } }) })] }), _jsxs("strong", { children: [progress, "%"] })] }), _jsxs("div", { className: "kind-note", children: [_jsx("span", { children: _jsx(Heart, { size: 22 }) }), _jsxs("p", { children: [_jsx("b", { children: "\u09AE\u09A8\u09C7 \u09B0\u09BE\u0996\u09AC\u09C7\u09A8:" }), " \u09AD\u09C1\u09B2 \u0995\u09B0\u09BE \u09B6\u09C7\u0996\u09BE\u09B0\u0987 \u0985\u0982\u09B6\u0964 \u09A4\u09BE\u09DC\u09BE\u09B9\u09C1\u09DC\u09BE \u09A8\u09C7\u0987, \u09A8\u09BF\u099C\u09C7\u09B0 \u0997\u09A4\u09BF\u09A4\u09C7 \u09B6\u09BF\u0996\u09C1\u09A8\u0964"] }), _jsx("button", { onClick: () => speak('You are doing great. Keep learning!'), "aria-label": "\u0989\u09CE\u09B8\u09BE\u09B9\u09C7\u09B0 \u0995\u09A5\u09BE \u09B6\u09C1\u09A8\u09C1\u09A8", children: _jsx(Volume2, {}) })] })] });
}
function LearnPage({ completed, startLesson }) {
    return _jsxs("div", { className: "page-wrap", children: [_jsx(PageTitle, { eyebrow: "\u0987\u0982\u09B0\u09C7\u099C\u09BF \u09B6\u09C7\u0996\u09BE\u09B0 \u099C\u09BE\u09DF\u0997\u09BE", title: "\u0986\u099C \u098F\u0995\u099F\u09C1 \u09A8\u09A4\u09C1\u09A8 \u0995\u09BF\u099B\u09C1 \u09B6\u09BF\u0996\u09BF", desc: "\u098F\u0995\u099F\u09BF \u09AC\u09BF\u09B7\u09DF \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8\u0964 \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AA\u09BE\u09A0 \u099B\u09CB\u099F \u098F\u09AC\u0982 \u09B8\u09B9\u099C \u0995\u09B0\u09C7 \u09B8\u09BE\u099C\u09BE\u09A8\u09CB\u0964" }), _jsx("div", { className: "lesson-list", children: lessons.filter(l => !completed.includes(l.id)).slice(0, 30).map(l => _jsxs("button", { className: "lesson-row", onClick: () => startLesson(l.id), children: [_jsx("span", { className: `lesson-icon ${l.color}`, children: _jsx(l.icon, { size: 27 }) }), _jsxs("span", { className: "lesson-info", children: [_jsx("b", { children: l.title }), _jsxs("small", { children: [l.subtitle, " \u00B7 ", l.words.length, "\u099F\u09BF \u09AC\u09BE\u0995\u09CD\u09AF \u00B7 ", l.minutes, " \u09AE\u09BF\u09A8\u09BF\u099F"] })] }), completed.includes(l.id) ? _jsxs("span", { className: "done-mark", children: [_jsx(Check, { size: 17 }), " \u09B6\u09C7\u09B7"] }) : _jsx(ChevronRight, { className: "row-chevron" })] }, l.id)) }), _jsxs("div", { className: "tip-card", children: [_jsx(AlertCircle, { size: 19 }), " ", _jsx("span", { children: "\u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AC\u09BE\u0995\u09CD\u09AF \u09B6\u09C1\u09A8\u09C7 \u09A8\u09BF\u099C\u09C7 \u09AC\u09B2\u09C1\u09A8\u0964 \u099A\u09BE\u0987\u09B2\u09C7 \u09AF\u09A4\u09AC\u09BE\u09B0 \u0996\u09C1\u09B6\u09BF \u0986\u09AC\u09BE\u09B0 \u09B6\u09C1\u09A8\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964" })] })] });
}
function PastLessonsPage({ completed, startLesson }) {
    const past = lessons.filter(l => completed.includes(l.id)).sort((a,b) => b.id-a.id);
    return _jsxs("div", { className: "page-wrap", children: [
      _jsx(PageTitle, { eyebrow: "আপনার শেখার ইতিহাস", title: "Past lessons", desc: "আপনি যেসব পাঠ শেষ করেছেন, সেগুলো এখানে জমা থাকবে। চাইলে আবার অনুশীলন করতে পারবেন।" }),
      past.length ? _jsx("div", { className: "lesson-list", children: past.map(l => _jsxs("button", { className: "lesson-row", onClick: () => startLesson(l.id), children: [
        _jsx("span", { className: `lesson-icon ${l.color}`, children: _jsx(l.icon, { size: 27 }) }),
        _jsxs("span", { className: "lesson-info", children: [_jsx("b", { children: l.title }), _jsx("small", { children: `${l.subtitle} · ${l.words.length}টি শব্দ` })] }),
        _jsxs("span", { className: "done-mark", children: [_jsx(Check, { size: 17 }), " সম্পন্ন"] })
      ] }, l.id)) }) : _jsx("div", { className: "tip-card", children: "এখনো কোনো পাঠ শেষ হয়নি। একটি পাঠ শেষ করলে সেটি এখানে দেখা যাবে।" })
    ] });
}
function GamesPage({ quiz, answerQuiz, nextQuizQuestion }) {
    const finished = quiz.finished;
    const currentQuestion = games[quiz.questions[quiz.index]];
    const currentAnswer = quiz.answers[quiz.index];
    const correctCount = quiz.answers.filter((answer, index) => answer === games[quiz.questions[index]].answer).length;
    if (finished)
        return _jsxs("div", { className: "page-wrap", children: [_jsx(PageTitle, { eyebrow: "\u0986\u099C\u0995\u09C7\u09B0 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8", title: "\u0986\u099C\u0995\u09C7\u09B0 \u0996\u09C7\u09B2\u09BE \u09B6\u09C7\u09B7!", desc: "\u0986\u099C\u0995\u09C7\u09B0 \u09A6\u09B6\u099F\u09BF \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u09B8\u09C7\u09B6\u09A8 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09B9\u09DF\u09C7\u099B\u09C7\u0964" }), _jsxs("div", { className: "game-card session-summary", children: [_jsx("div", { className: "summary-icon", children: _jsx(Award, { size: 38 }) }), _jsx("h2", { children: "\u0986\u099C\u0995\u09C7\u09B0 \u09B8\u09C7\u09B6\u09A8 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8" }), _jsxs("p", { className: "score-line", children: ["\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09CD\u0995\u09CB\u09B0: ", _jsxs("strong", { children: [correctCount, " / 10"] })] }), _jsx("p", { className: "muted", children: correctCount >= 8 ? 'অসাধারণ কাজ করেছেন।' : correctCount >= 5 ? 'ভালো চেষ্টা। নিয়মিত অনুশীলনে আরও ভালো হবে।' : 'চিন্তা নেই। ভুলগুলো দেখে আবার শিখে নিন।' }), _jsxs("div", { className: "review-list", children: [_jsx("h3", { children: "\u0989\u09A4\u09CD\u09A4\u09B0 \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE" }), quiz.questions.map((questionIndex, i) => { const q = games[questionIndex]; const answer = quiz.answers[i]; const ok = answer === q.answer; return _jsxs("div", { className: `review-item ${ok ? 'review-correct' : 'review-wrong'}`, children: [_jsx("div", { className: "review-status", children: ok ? _jsx(Check, { size: 17 }) : _jsx(X, { size: 17 }) }), _jsxs("div", { children: [_jsxs("b", { children: [i + 1, ". ", q.question] }), _jsxs("small", { children: ["\u0986\u09AA\u09A8\u09BE\u09B0 \u0989\u09A4\u09CD\u09A4\u09B0: ", answer || 'উত্তর দেননি'] }), _jsxs("small", { children: ["\u09B8\u09A0\u09BF\u0995 \u0989\u09A4\u09CD\u09A4\u09B0: ", q.answer] }), _jsx("small", { children: q.explain })] })] }, `${quiz.date}-${i}`); })] })] })] });
    const isCorrect = currentAnswer === currentQuestion.answer;
    return _jsxs("div", { className: "page-wrap", children: [_jsx(PageTitle, { eyebrow: "\u0996\u09C7\u09B2\u09A4\u09C7 \u0996\u09C7\u09B2\u09A4\u09C7 \u09B6\u09C7\u0996\u09BE", title: "\u099A\u09B2\u09C1\u09A8, \u098F\u0995\u099F\u09C1 \u09AE\u099C\u09BE \u0995\u09B0\u09BF!", desc: "\u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u09E7\u09E6\u099F\u09BF \u09A8\u09A4\u09C1\u09A8 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u0964 \u0986\u099C\u0995\u09C7\u09B0 \u09B8\u09C7\u09B6\u09A8 \u09B6\u09C7\u09B7 \u09B9\u09B2\u09C7 \u09AB\u09B2\u09BE\u09AB\u09B2 \u09A6\u09C7\u0996\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964" }), _jsxs("div", { className: "game-card", children: [_jsxs("div", { className: "game-top", children: [_jsxs("span", { children: [_jsx(Brain, { size: 17 }), " \u09B6\u09AC\u09CD\u09A6\u09C7\u09B0 \u0995\u09C1\u0987\u099C"] }), _jsxs("span", { children: [quiz.index + 1, " / 10"] })] }), _jsx("div", { className: "quiz-progress", children: _jsx("div", { style: { width: `${(quiz.index + (currentAnswer ? 1 : 0)) / 10 * 100}%` } }) }), _jsx("h2", { children: currentQuestion.question }), _jsx("div", { className: "answer-list", children: currentQuestion.options.map((option) => _jsxs("button", { disabled: currentAnswer !== null, onClick: () => answerQuiz(option), className: `answer-option ${currentAnswer !== null && option === currentQuestion.answer ? 'correct' : currentAnswer === option ? 'incorrect' : ''}`, children: [option, currentAnswer !== null && option === currentQuestion.answer && _jsx(Check, { size: 20 })] }, option)) }), currentAnswer !== null && _jsxs("div", { className: isCorrect ? 'answer-feedback good' : 'answer-feedback', children: [isCorrect ? 'সঠিক উত্তর!' : 'এই উত্তরটি সঠিক নয়।', _jsx("small", { children: currentQuestion.explain })] }), currentAnswer !== null && _jsxs("button", { className: "button primary full-button", onClick: nextQuizQuestion, children: [quiz.index === 9 ? 'ফলাফল দেখুন' : 'পরের প্রশ্ন', " ", _jsx(ChevronRight, { size: 18 })] })] })] });
}
const guidedTopics = {
  wifi: { title:'Wi-Fi / ইন্টারনেট চলছে না', steps:['ফোনের ওপরের দিক থেকে আঙুল নামিয়ে Quick Settings খুলুন।','Wi-Fi বন্ধ থাকলে একবার চালু করুন। চালু থাকলে বন্ধ করে ১০ সেকেন্ড পর আবার চালু করুন।','আপনার পরিচিত Wi-Fi নেটওয়ার্কে চাপ দিন। প্রয়োজন হলে সঠিক পাসওয়ার্ড দিন।','তবুও না চললে Airplane Mode ১০ সেকেন্ড চালু রেখে বন্ধ করুন।'] },
  whatsapp: { title:'WhatsApp-এ ছবি বা বার্তা পাঠাতে পারছি না', steps:['প্রথমে ফোনে ইন্টারনেট চলছে কি না দেখুন।','WhatsApp বন্ধ করে আবার খুলুন।','ফোনের Settings → Apps → WhatsApp → Permissions-এ গিয়ে Photos/Camera অনুমতি পরীক্ষা করুন।','ফোনে খালি জায়গা আছে কি না দেখুন। জায়গা কম হলে অপ্রয়োজনীয় বড় ফাইল সরান।'] },
  storage: { title:'ফোনে জায়গা নেই', steps:['ফোনের Settings খুলুন।','Storage বা Device care লেখা অপশন খুঁজুন।','কোন অ্যাপ বা ফাইল বেশি জায়গা নিচ্ছে দেখুন।','যে ছবি বা ভিডিও আর দরকার নেই, আগে সেগুলো ব্যাকআপ নিয়ে তারপর মুছুন। অচেনা System file মুছবেন না।'] },
  text: { title:'লেখা খুব ছোট দেখাচ্ছে', steps:['ফোনের Settings খুলুন।','Display বা Screen লেখা অপশনে যান।','Font size বা Text size নির্বাচন করুন।','স্লাইডার একটু ডানে সরিয়ে লেখা বড় করুন। পছন্দ না হলে আগের জায়গায় ফিরিয়ে আনুন।'] },
};
function GuidedHelp(){
 const [topic,setTopic]=useState(''); const [step,setStep]=useState(0); const [done,setDone]=useState(false);
 const guide=guidedTopics[topic];
 return _jsxs('section',{className:'guided-help',children:[_jsxs('div',{className:'guided-heading',children:[_jsx('span',{className:'guided-kicker',children:'AI ছাড়াও ব্যবহার করা যায়'}),_jsx('h2',{children:'সাধারণ সমস্যার ধাপে ধাপে সমাধান'}),_jsx('p',{children:'একবারে একটি নির্দেশনা দেখুন। কাজটি শেষ হলে “হয়ে গেছে” চাপুন।'})]}),!guide?_jsx('div',{className:'guided-topics',children:[['wifi','Wi-Fi / ইন্টারনেট'],['whatsapp','WhatsApp সমস্যা'],['storage','ফোনের জায়গা খালি'],['text','লেখা বড় করা']].map(([id,label])=>_jsx('button',{className:'guided-topic',onClick:()=>{setTopic(id);setStep(0);setDone(false)},children:label},id))}):_jsxs('div',{className:'guided-step-card',children:[_jsxs('div',{className:'guided-step-top',children:[_jsx('b',{children:guide.title}),_jsx('button',{className:'guided-reset',onClick:()=>{setTopic('');setStep(0);setDone(false)},children:'অন্য সমস্যা'})]}),done?_jsxs('div',{className:'guided-finish',children:[_jsx('h3',{children:'সমস্যাটি কি ঠিক হয়েছে?'}),_jsx('p',{children:'ঠিক হলে এখানেই শেষ। না হলে নিচের চ্যাটে আরও বিস্তারিত লিখুন বা স্ক্রিনশট দিন।'}),_jsx('button',{className:'button primary',onClick:()=>{setTopic('');setDone(false);setStep(0)},children:'হ্যাঁ, ঠিক হয়েছে'}),_jsx('button',{className:'button secondary',onClick:()=>{setTopic('');setDone(false);setStep(0)},children:'না, আরও সাহায্য চাই'})]}):_jsxs('div',{children:[_jsxs('span',{className:'guided-count',children:['ধাপ ',step+1,' / ',guide.steps.length]}),_jsx('p',{className:'guided-instruction',children:guide.steps[step]}),_jsxs('div',{className:'guided-controls',children:[_jsx('button',{className:'button secondary',disabled:step===0,onClick:()=>setStep(v=>Math.max(0,v-1)),children:'আগের ধাপ'}),_jsx('button',{className:'button primary',onClick:()=>step===guide.steps.length-1?setDone(true):setStep(v=>v+1),children:step===guide.steps.length-1?'শেষ ধাপ':'হয়ে গেছে, পরের ধাপ'})]})]})]})]});
}
function HelpPage({ messages, clearMessages, question, setQuestion, image, setImage, uploadImage, sendMessage, busy, listen, listening, supported, speechError, speak, selectedVoice, setSelectedVoice }) {
    const [voiceLanguage,setVoiceLanguage]=useState('bn-BD');
    const messagesEndRef=useRef(null);
    useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:'smooth',block:'end'});},[messages,busy]);
    return _jsxs("div", { className: "page-wrap help-wrap", children: [_jsx(PageTitle, { eyebrow: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09BE\u09B6\u09C7 \u0986\u099B\u09BF", title: "\u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF\u0995\u09BE\u09B0\u09C0", desc: "\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09AC\u09BE \u0995\u09AE\u09CD\u09AA\u09BF\u0989\u099F\u09BE\u09B0\u09C7 \u0995\u09CB\u09A8\u09CB \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE? \u09B8\u09B9\u099C \u09AC\u09BE\u0982\u09B2\u09BE\u09DF \u09AC\u09B2\u09C1\u09A8\u0964" }), _jsxs("div", { className: "help-banner", children: [_jsx(Smartphone, { size: 29 }), _jsxs("div", { children: [_jsx("b", { children: "\u09A8\u09BF\u09B0\u09CD\u09AD\u09DF\u09C7 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8 \u0995\u09B0\u09C1\u09A8" }), _jsx("p", { children: "\u09AC\u09BE\u0982\u09B2\u09BE\u09DF \u09B2\u09BF\u0996\u09C1\u09A8, \u0995\u09A5\u09BE \u09AC\u09B2\u09C1\u09A8 \u0985\u09A5\u09AC\u09BE \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F \u09AA\u09BE\u09A0\u09BE\u09A8\u0964" })] })] }), _jsxs("div", { className: "chat-panel", children: [_jsxs("div", { className: "chat-header", children: [_jsx("span", { className: "bot-avatar", children: _jsx(Bot, { size: 24 }) }), _jsxs("div", { children: [_jsx("b", { children: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09BE\u0982\u09B2\u09BE \u09B8\u09B9\u0995\u09BE\u09B0\u09C0" }), _jsxs("small", { children: [_jsx("span", { className: "online-dot" }), " \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4"] })] }), _jsx("button", { type: "button", className: "clear-chat-button", onClick: clearMessages, disabled: busy, title: "কথোপকথন মুছুন", "aria-label": "কথোপকথন মুছুন", children: _jsx(Trash2, { size: 18 }) })] }), _jsxs("div", { className: "chat-messages", children: [messages.map((m, i) => _jsxs("div", { className: `message ${m.role}`, children: [_jsx("div", { className: "message-avatar", children: m.role === 'assistant' ? _jsx(Bot, { size: 17 }) : _jsx(User, { size: 17 }) }), _jsxs("div", { className: "bubble", children: [m.image && _jsx("img", { src: m.image, className: "chat-image", alt: "\u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F" }), _jsx("p", { children: m.text }), m.role === 'assistant' && _jsxs("div", { className: "speak-controls", children: [_jsxs("button", { className: "speak-reply", onClick: () => speak(m.text, /[\u0980-\u09FF]/.test(m.text) ? 'bn-BD' : 'en-IN'), children: [_jsx(Volume2, { size: 16 }), " \u09B6\u09C1\u09A8\u09C1\u09A8"] }), _jsxs("select", { className: "voice-select", value: (/[\u0980-\u09FF]/.test(m.text) ? ["auto","roopa","suhani","rehan"] : ["auto","ishita","ratan"]).includes(selectedVoice) ? selectedVoice : "auto", onChange: (e) => { const v=e.target.value; setSelectedVoice(v); speak(m.text, /[\u0980-\u09FF]/.test(m.text) ? 'bn-BD' : 'en-IN', v); }, "aria-label": "\u0995\u09A3\u09CD\u09A0 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8", children: /[\u0980-\u09FF]/.test(m.text) ? [_jsx("option", { value: "auto", children: "Auto" }), _jsx("option", { value: "roopa", children: "Roopa" }), _jsx("option", { value: "suhani", children: "Suhani" }), _jsx("option", { value: "rehan", children: "Rehan" })] : [_jsx("option", { value: "auto", children: "Auto" }), _jsx("option", { value: "ishita", children: "Ishita" }), _jsx("option", { value: "ratan", children: "Ratan" })] })] })] })] }, i)), busy && _jsx("div", { className: "typing", children: "\u09B8\u09B9\u0995\u09BE\u09B0\u09C0 \u0989\u09A4\u09CD\u09A4\u09B0 \u09B2\u09BF\u0996\u099B\u09C7\u09A8\u2026" }), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { className: "composer", children: [image && _jsxs("div", { className: "image-preview", children: [_jsx("img", { src: image, alt: "\u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09BF\u09A4 \u099B\u09AC\u09BF" }), _jsx("button", { onClick: () => setImage(undefined), "aria-label": "\u099B\u09AC\u09BF \u09B8\u09B0\u09BE\u09A8", children: _jsx(X, { size: 16 }) })] }), _jsx("textarea", { value: question, onChange: (e) => setQuestion(e.target.value), placeholder: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE\u099F\u09BF \u09AC\u09BE\u0982\u09B2\u09BE\u09DF \u09B2\u09BF\u0996\u09C1\u09A8\u2026", rows: 2, onKeyDown: (e) => { if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                } } }), _jsxs("div", { className: "composer-actions", children: [_jsxs("label", { className: "attach-button", title: "\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09B6\u099F \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8", children: [_jsx(ImagePlus, { size: 20 }), _jsx("span", { children: "\u099B\u09AC\u09BF" }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => uploadImage(e.target.files?.[0]), hidden: true })] }), _jsx("button", { type: "button", className: 'attach-button', onClick: () => setVoiceLanguage(v => v === 'bn-BD' ? 'en-US' : 'bn-BD'), children: voiceLanguage === 'bn-BD' ? 'বাংলা' : 'English' }), _jsxs("button", { type: "button", className: `attach-button ${listening ? 'recording' : ''}`, disabled: !supported, onClick: () => listen((v) => setQuestion((old) => old ? `${old} ${v}` : v), voiceLanguage), children: [_jsx(Mic, { size: 20 }), _jsx("span", { children: listening ? 'শুনছি…' : voiceLanguage === 'bn-BD' ? 'বাংলায় বলুন' : 'Speak English' })] }), _jsxs("button", { className: "send-button", disabled: busy || (!question.trim() && !image), onClick: sendMessage, children: [_jsx(Send, { size: 19 }), " \u09AA\u09BE\u09A0\u09BE\u09A8"] })] }), speechError && _jsx("p", { className: "speech-status", role: "status", children: speechError }), !supported && _jsx("p", { className: "speech-status", role: "status", children: "\u098F\u0987 \u09AC\u09CD\u09B0\u09BE\u0989\u099C\u09BE\u09B0\u09C7 \u09AE\u09BE\u0987\u0995\u09CD\u09B0\u09CB\u09AB\u09CB\u09A8 \u09A6\u09BF\u09DF\u09C7 \u09B2\u09C7\u0996\u09BE \u09B8\u09AE\u09B0\u09CD\u09A5\u09BF\u09A4 \u09A8\u09DF\u0964 Android Chrome \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 HTTPS \u09B8\u0982\u09AF\u09CB\u0997\u09C7 \u0985\u09CD\u09AF\u09BE\u09AA \u0996\u09C1\u09B2\u09C1\u09A8\u0964" })] })] }), _jsxs("p", { className: "privacy-note", children: [_jsx(CircleHelp, { size: 15 }), " \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1, OTP \u09AC\u09BE \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09C7\u09B0 \u0997\u09CB\u09AA\u09A8 \u09A4\u09A5\u09CD\u09AF \u0995\u0996\u09A8\u09CB \u09B6\u09C7\u09DF\u09BE\u09B0 \u0995\u09B0\u09AC\u09C7\u09A8 \u09A8\u09BE\u0964"] })] });
}
function ProgressPage({ completed, progress, streak }) {
    return _jsxs("div", { className: "page-wrap", children: [_jsx(PageTitle, { eyebrow: "\u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u099C\u09A8", title: "\u09A6\u09C7\u0996\u09C1\u09A8, \u0995\u09A4\u09A6\u09C2\u09B0 \u098F\u0997\u09BF\u09DF\u09C7\u099B\u09C7\u09A8!", desc: "\u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u099B\u09CB\u099F \u09AA\u09A6\u0995\u09CD\u09B7\u09C7\u09AA\u0987 \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09AC\u09AA\u09C2\u09B0\u09CD\u09A3\u0964" }), _jsxs("div", { className: "stats-grid", children: [_jsxs("div", { className: "stat-card", children: [_jsx(BookOpen, { size: 25 }), _jsx("b", { children: completed.length }), _jsx("small", { children: "\u09B6\u09C7\u09B7 \u0995\u09B0\u09BE \u09AA\u09BE\u09A0" })] }), _jsxs("div", { className: "stat-card", children: [_jsx(Trophy, { size: 25 }), _jsxs("b", { children: [progress, "%"] }), _jsx("small", { children: "\u09AE\u09CB\u099F \u0985\u0997\u09CD\u09B0\u0997\u09A4\u09BF" })] }), _jsxs("div", { className: "stat-card", children: [_jsx(Flame, { size: 25 }), _jsx("b", { children: streak }), _jsx("small", { children: "\u099F\u09BE\u09A8\u09BE \u09A6\u09BF\u09A8\u09C7\u09B0 \u099A\u09B0\u09CD\u099A\u09BE" })] })] }), _jsxs("div", { className: "progress-detail", children: [_jsx("h3", { children: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09BE\u09A0\u09B8\u09AE\u09C2\u09B9" }), lessons.map(l => _jsxs("div", { className: "progress-line", children: [_jsx("span", { children: l.title }), _jsx("span", { className: completed.includes(l.id) ? 'status-done' : 'status-pending', children: completed.includes(l.id) ? 'শেষ হয়েছে' : 'এখনো বাকি' })] }, l.id))] }), _jsxs("div", { className: "kind-note", children: [_jsx(Heart, { size: 22 }), _jsxs("p", { children: [_jsx("b", { children: "\u0986\u09AA\u09A8\u09BF \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8!" }), " \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u09EB \u09AE\u09BF\u09A8\u09BF\u099F \u09B8\u09AE\u09DF \u09A6\u09BF\u09B2\u09C7\u0987 \u09A7\u09C0\u09B0\u09C7 \u09A7\u09C0\u09B0\u09C7 \u0989\u09A8\u09CD\u09A8\u09A4\u09BF \u09B9\u09AC\u09C7\u0964"] })] })] });
}
function SettingsPage({ largeText, setLargeText, dark, setDark, speak, selectedVoice, setSelectedVoice }) {
    return _jsxs("div", { className: "page-wrap", children: [_jsx(PageTitle, { eyebrow: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE\u09AE\u09A4\u09CB", title: "\u09B8\u09C7\u099F\u09BF\u0982\u09B8", desc: "\u0985\u09CD\u09AF\u09BE\u09AA\u099F\u09BF \u09A8\u09BF\u099C\u09C7\u09B0 \u09AE\u09A4\u09CB \u0995\u09B0\u09C7 \u09B8\u09BE\u099C\u09BF\u09DF\u09C7 \u09A8\u09BF\u09A8\u0964" }), _jsxs("div", { className: "settings-list", children: [_jsxs("div", { className: "setting-row", children: [_jsx("span", { className: "setting-icon", children: _jsx(TypeIcon, {}) }), _jsxs("div", { children: [_jsx("b", { children: "\u09AC\u09DC \u09B2\u09C7\u0996\u09BE" }), _jsx("small", { children: "\u09AA\u09DC\u09A4\u09C7 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE \u09B9\u09B2\u09C7 \u099A\u09BE\u09B2\u09C1 \u09B0\u09BE\u0996\u09C1\u09A8" })] }), _jsx("button", { className: `toggle ${largeText ? 'on' : ''}`, onClick: () => setLargeText(!largeText), "aria-label": "\u09AC\u09DC \u09B2\u09C7\u0996\u09BE \u09AC\u09A6\u09B2\u09BE\u09A8", children: _jsx("i", {}) })] }), _jsxs("div", { className: "setting-row", children: [_jsx("span", { className: "setting-icon", children: _jsx(Sun, { size: 22 }) }), _jsxs("div", { children: [_jsx("b", { children: "\u09A1\u09BE\u09B0\u09CD\u0995 \u09AE\u09CB\u09A1" }), _jsx("small", { children: "\u09B0\u09BE\u09A4\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE" })] }), _jsx("button", { className: `toggle ${dark ? 'on' : ''}`, onClick: () => setDark(!dark), "aria-label": "\u09A1\u09BE\u09B0\u09CD\u0995 \u09AE\u09CB\u09A1 \u09AC\u09A6\u09B2\u09BE\u09A8", children: _jsx("i", {}) })] }), _jsxs("div", { className: "setting-row", children: [_jsx("span", { className: "setting-icon", children: _jsx(Volume2, { size: 22 }) }), _jsxs("div", { children: [_jsx("b", { children: "\u0995\u09A3\u09CD\u09A0 \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE" }), _jsx("small", { children: "\u09AC\u09BE\u0982\u09B2\u09BE \u09AC\u09BE \u0987\u0982\u09B0\u09C7\u099C\u09BF \u0989\u099A\u09CD\u099A\u09BE\u09B0\u09A3 \u09B6\u09C1\u09A8\u09C1\u09A8" })] }), _jsx("select", { className: "voice-select settings-voice-select", value: selectedVoice, onChange: (e) => setSelectedVoice(e.target.value), "aria-label": "কণ্ঠ নির্বাচন", children: [_jsx("option", {value:"auto",children:"স্বয়ংক্রিয়"}),_jsx("option",{value:"roopa",children:"Roopa"}),_jsx("option",{value:"suhani",children:"Suhani"}),_jsx("option",{value:"rehan",children:"Rehan"}),_jsx("option",{value:"ishita",children:"Ishita"}),_jsx("option",{value:"ratan",children:"Ratan"})] }), _jsx("button", { className: "button small secondary", onClick: () => speak('স্বাগতম। Welcome to Bhashora.', 'bn-BD'), children: "\u09B6\u09C1\u09A8\u09C1\u09A8" })] })] }), _jsxs("div", { className: "tip-card", children: [_jsx(Smartphone, { size: 19 }), " ", _jsx("span", { children: "\u098F\u0987 \u0985\u09CD\u09AF\u09BE\u09AA\u099F\u09BF \u09AB\u09CB\u09A8\u09C7\u09B0 \u09B9\u09CB\u09AE \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09C7 \u09AF\u09CB\u0997 \u0995\u09B0\u09B2\u09C7 \u0985\u09A8\u09CD\u09AF \u0985\u09CD\u09AF\u09BE\u09AA\u09C7\u09B0 \u09AE\u09A4\u09CB \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964" })] })] });
}
function TypeIcon() { return _jsx(Type, { size: 22 }); }
function PageTitle({ eyebrow, title, desc }) { return _jsxs("div", { className: "page-title", children: [_jsx("span", { className: "eyebrow", children: eyebrow }), _jsx("h1", { children: title }), _jsx("p", { children: desc })] }); }

function PublicSite({ user }){
 const location=useLocation();
 const pages={
  '/':{title:'ভাষোরা — সহজ ইংরেজি শিক্ষা ও ডিজিটাল সহায়তা',eyebrow:'সহজভাবে শিখুন, আত্মবিশ্বাসের সঙ্গে এগিয়ে যান',heading:'প্রতিদিন একটু একটু করে ইংরেজি শিখুন',body:'সহজ বাংলা ব্যাখ্যা, শুদ্ধ উচ্চারণ ও দৈনন্দিন কথোপকথনের মাধ্যমে নিজের গতিতে ইংরেজি শিখুন। প্রয়োজনে প্রযুক্তির সহজ সহায়তাও নিন।',word:'সুপ্রভাত',practice:'আজকের অনুশীলন',hint:'শুনুন এবং বলার চেষ্টা করুন',primary:'ইংরেজি শেখা শুরু করুন',secondary:'ডিজিটাল সাহায্য নিন'},
  '/digital-help':{title:'বাংলায় ডিজিটাল সাহায্য | ভাষোরা',eyebrow:'প্রযুক্তি ব্যবহারে পাশে আছে ভাষোরা',heading:'ডিজিটাল সমস্যার সমাধান শিখুন সহজ বাংলায়',body:'মোবাইল, অ্যাপ, ইন্টারনেট বা অনলাইন সেবা নিয়ে সমস্যায় পড়লে ধাপে ধাপে সহজ নির্দেশনা নিন। প্রয়োজনে স্ক্রিনশট পাঠিয়ে প্রশ্ন করুন।',word:'কীভাবে সাহায্য করতে পারি?',practice:'সহজ ডিজিটাল সহায়তা',hint:'একটি ধাপ করে এগিয়ে যান',primary:'ডিজিটাল সাহায্য নিন',secondary:'ইংরেজি শেখা শুরু করুন'},
  '/english-learning':{title:'সহজ ইংরেজি শিক্ষা | ভাষোরা',eyebrow:'নিজের গতিতে শিখুন',heading:'সহজ ইংরেজি শিখুন, প্রতিদিনের কথায় ব্যবহার করুন',body:'বাংলা অর্থ, সহজ উচ্চারণ, শোনার সুবিধা এবং পরিচিত পরিস্থিতির বাক্য দিয়ে ধীরে ধীরে ইংরেজিতে আত্মবিশ্বাস গড়ে তুলুন।',word:'আপনি কেমন আছেন?',practice:'আজকের ইংরেজি অনুশীলন',hint:'শুনুন, বুঝুন, নিজে বলুন',primary:'ইংরেজি শেখা শুরু করুন',secondary:'ডিজিটাল সাহায্য নিন'},
  '/about':{title:'ভাষোরা সম্পর্কে',eyebrow:'সহজ শেখা, সবার জন্য',heading:'শেখা ও প্রযুক্তিকে সহজ করাই আমাদের লক্ষ্য',body:'বাংলাভাষী মানুষের জন্য সহজ ইংরেজি শিক্ষা ও ধৈর্যশীল ডিজিটাল সহায়তা পৌঁছে দেওয়াই ভাষোরার উদ্দেশ্য।',word:'স্বাগতম',practice:'ভাষোরার সঙ্গে শিখুন',hint:'ছোট পদক্ষেপেই অগ্রগতি',primary:'ইংরেজি শেখা শুরু করুন',secondary:'ডিজিটাল সাহায্য নিন'}
 };
 const item=pages[location.pathname]||pages['/'];
 useEffect(()=>{document.documentElement.lang='bn';document.title=item.title;const desc='সহজ বাংলা ব্যাখ্যায় ইংরেজি শিখুন এবং প্রয়োজনীয় ডিজিটাল সহায়তা নিন।';let m=document.querySelector('meta[name="description"]');if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m)}m.content=desc;},[location.pathname,item.title]);
 const learnTo=user?'/app/learn':'/login?next=/app/learn'; const helpTo=user?'/app/help':'/login?next=/app/help';
 return _jsxs('main',{className:'public-site bengali-mode',children:[
  _jsxs('header',{className:'public-header',children:[_jsxs(Link,{to:'/',className:'public-brand',children:[_jsx('img',{src:'/logo.svg',className:'brand-logo',alt:'ভাষোরা'}),_jsxs('span',{children:[_jsx('b',{children:'ভাষোরা'}),_jsx('small',{children:'সহজে শিখুন, আত্মবিশ্বাসী হোন'})]})]}),_jsxs('nav',{className:'public-links',children:[_jsx(Link,{to:'/english-learning',children:'ইংরেজি শিখি'}),_jsx(Link,{to:'/digital-help',children:'ডিজিটাল সাহায্য'}),_jsx(Link,{to:'/about',children:'আমাদের কথা'})]}),!user?_jsx(Link,{to:'/login',className:'public-login',children:'লগ ইন'}):_jsx(Link,{to:'/app',className:'public-login',children:'অ্যাপে যান'})]}),
  _jsxs('section',{className:'public-hero',children:[_jsxs('div',{className:'public-hero-copy',children:[_jsx('span',{className:'eyebrow',children:item.eyebrow}),_jsx('h1',{children:item.heading}),_jsx('p',{children:item.body}),_jsxs('div',{className:'public-cta',children:[_jsx(Link,{to:location.pathname==='/digital-help'?helpTo:learnTo,className:'button primary',children:item.primary}),_jsx(Link,{to:location.pathname==='/digital-help'?learnTo:helpTo,className:'button secondary',children:item.secondary})]})]}),_jsxs('div',{className:'practice-art',children:[_jsx('div',{className:'practice-orbit orbit-one'}),_jsx('div',{className:'practice-orbit orbit-two'}),_jsxs('article',{className:'practice-card',children:[_jsx('span',{className:'practice-label',children:item.practice}),_jsx('strong',{children:item.word}),_jsx('p',{children:item.hint}),_jsx('small',{children:'জোরে জোরে অনুশীলন করুন'})]}),_jsx('span',{className:'practice-aa',children:'অ আ'})]})]}),
  _jsxs('section',{className:'public-features',children:[_jsxs('article',{children:[_jsx('h2',{children:'ধাপে ধাপে শিখুন'}),_jsx('p',{children:'নিজের সুবিধামতো ছোট পাঠ ও সহজ নির্দেশনা।'})]}),_jsxs('article',{children:[_jsx('h2',{children:'শুনুন ও অনুশীলন করুন'}),_jsx('p',{children:'উচ্চারণ ও দৈনন্দিন বাক্যের মাধ্যমে আত্মবিশ্বাস বাড়ান।'})]}),_jsxs('article',{children:[_jsx('h2',{children:'সহজ সহায়তা'}),_jsx('p',{children:'প্রয়োজনে সাধারণ ডিজিটাল কাজে সহায়তা নিন।'})]})]}),_jsx('footer',{className:'public-footer',children:'ভাষোরা — প্রতিদিন একটু একটু করে শিখুন'})]});
}
export default function App(){ const [user,setUser]=useState(null); const [loading,setLoading]=useState(true); const location=useLocation(); useEffect(()=>{let r=document.querySelector('meta[name="robots"]');if(r)r.content=location.pathname==='/login'||location.pathname.startsWith('/app')?'noindex,nofollow':'index,follow';},[location.pathname]); useEffect(()=>{ if(!auth){setLoading(false);return} return onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)}) },[]); if(loading) return _jsx('div',{className:'loading-screen',children:'ভাষোরা চালু হচ্ছে…'}); if(location.pathname==='/login') return user ? _jsx(Navigate,{to:'/app',replace:true}) : _jsx(Auth,{}); if(location.pathname.startsWith('/app')) return user ? _jsx(MainApp,{user}) : _jsx(Navigate,{to:'/login',replace:true}); return _jsx(PublicSite,{user}); }
