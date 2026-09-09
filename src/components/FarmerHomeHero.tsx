import { useRef, useState } from 'react'
import { CloudSun, Mic, Square, Wifi, WifiOff } from 'lucide-react'

type Language = 'Hindi' | 'Marathi'

interface SpeechRecognitionEventLike extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

interface SpeechRecognitionConstructor { new (): SpeechRecognitionLike }
interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

const modules = [
  { hindi: 'बीमारी स्कैन करें', marathi: 'रोग स्कॅन करा', english: 'Leaf Disease Scanner', icon: '📸', href: '#leaf-analysis', accent: 'border-lime-400 bg-lime-400/10' },
  { hindi: 'पानी और मिट्टी', marathi: 'पाणी आणि माती', english: 'Water / Soil Moisture', icon: '💧', href: '#monitoring', accent: 'border-sky-400 bg-sky-400/10' },
  { hindi: 'मंडी भाव (Live)', marathi: 'मंडी भाव (Live)', english: 'Live Market Prices', icon: '📈', href: '#market', accent: 'border-amber-400 bg-amber-400/10' },
  { hindi: 'मौसम का हाल', marathi: 'हवामान अंदाज', english: 'Weather Forecast', icon: '⛅', href: '#monitoring', accent: 'border-orange-400 bg-orange-400/10' },
] as const

const copy = {
  Hindi: { welcome: 'नमस्ते, किसान', offline: 'ऑफ़लाइन तैयार', worksOffline: 'नेट न हो तब भी सेवा चालू', prompt: 'आपको आज किस मदद की ज़रूरत है?', hint: 'नीचे कोई सेवा चुनें या बोलकर पूछें', start: 'बोलना शुरू करें', listening: 'सुन रहे हैं...', initial: 'बोलकर पूछें: “मेरी फसल को पानी कब चाहिए?”', unsupported: 'इस फोन में आवाज़ की सुविधा उपलब्ध नहीं है। नीचे से सेवा चुनें।', heard: 'सुना गया', noSpeech: 'कुछ सुनाई नहीं दिया। फिर से बोलें।', error: 'आवाज़ समझ नहीं आई। धीरे और साफ़ बोलकर फिर कोशिश करें।', listeningHelp: 'सुन रहे हैं... अपनी फसल के बारे में बोलें।', saved: 'आज की जानकारी आपके फोन में सुरक्षित है' },
  Marathi: { welcome: 'नमस्कार, शेतकरी', offline: 'ऑफलाइन तयार', worksOffline: 'नेट नसले तरी सेवा सुरू', prompt: 'आज तुम्हाला कशाची मदत हवी आहे?', hint: 'खालील सेवा निवडा किंवा बोलून विचारा', start: 'बोलायला सुरू करा', listening: 'ऐकत आहोत...', initial: 'बोलून विचारा: “माझ्या पिकाला पाणी कधी द्यावे?”', unsupported: 'या फोनवर आवाजाची सुविधा उपलब्ध नाही. खालील सेवा निवडा।', heard: 'ऐकले', noSpeech: 'काही ऐकू आले नाही. पुन्हा बोला।', error: 'आवाज समजला नाही. हळू आणि स्पष्ट बोलून पुन्हा प्रयत्न करा।', listeningHelp: 'ऐकत आहोत... तुमच्या पिकाबद्दल बोला।', saved: 'आजची माहिती तुमच्या फोनमध्ये सुरक्षित आहे' },
} as const

export function FarmerHomeHero() {
  const [language, setLanguage] = useState<Language>('Hindi')
  const [isListening, setIsListening] = useState(false)
  const [voiceMessage, setVoiceMessage] = useState<string>(copy.Hindi.initial)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const text = copy[language]

  function changeLanguage(nextLanguage: Language) {
    recognitionRef.current?.stop()
    setLanguage(nextLanguage)
    setVoiceMessage(copy[nextLanguage].initial)
  }

  function toggleVoice() {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }
    const speechWindow = window as SpeechWindow
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceMessage(text.unsupported)
      return
    }
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = language === 'Hindi' ? 'hi-IN' : 'mr-IN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript.trim() ?? ''
      setVoiceMessage(transcript ? `${text.heard}: “${transcript}”` : text.noSpeech)
    }
    recognition.onend = () => {
      recognitionRef.current = null
      setIsListening(false)
    }
    recognition.onerror = () => setVoiceMessage(text.error)
    setIsListening(true)
    setVoiceMessage(text.listeningHelp)
    recognition.start()
  }

  return (
    <section aria-labelledby="farmer-home-title" className="min-h-screen bg-slate-950 px-4 py-4 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-md flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">SCAS किसान सेवा</p><h1 id="farmer-home-title" className="mt-1 text-2xl font-black tracking-tight">{text.welcome}</h1></div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-100" aria-label={text.offline}><Wifi aria-hidden="true" className="size-4" /><span>{text.offline}</span></div>
        </header>
        <div className="flex items-center justify-between gap-3 py-4">
          <p className="flex items-center gap-2 text-xs font-medium text-slate-300"><WifiOff aria-hidden="true" className="size-4 shrink-0 text-slate-400" />{text.worksOffline}</p>
          <div className="flex shrink-0 rounded-lg border border-slate-700 p-1" aria-label="भाषा चुनें">
            {(['Hindi', 'Marathi'] as const).map((item) => <button key={item} type="button" onClick={() => changeLanguage(item)} aria-pressed={language === item} className={`min-h-11 rounded-md px-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300 ${language === item ? 'bg-lime-300 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}>{item === 'Hindi' ? 'हिंदी' : 'मराठी'}</button>)}
          </div>
        </div>
        <div className="mt-2 text-center"><p className="text-base font-bold text-slate-100">{text.prompt}</p><p className="mt-1 text-xs leading-5 text-slate-400">{text.hint}</p></div>
        <nav className="mt-5 grid grid-cols-2 gap-3" aria-label="किसान सेवाएँ">
          {modules.map((module) => <a key={module.english} href={module.href} className={`flex min-h-[112px] flex-col justify-between rounded-2xl border-l-4 border-y border-r border-slate-700 p-4 transition hover:-translate-y-0.5 hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300 ${module.accent}`}><span className="text-4xl leading-none" aria-hidden="true">{module.icon}</span><span><span className="block text-base font-black leading-tight">{language === 'Hindi' ? module.hindi : module.marathi}</span><span className="mt-1 block text-[11px] font-medium text-slate-400">{module.english}</span></span></a>)}
        </nav>
        <div className="mt-auto pt-8">
          <button type="button" onClick={toggleVoice} aria-pressed={isListening} className={`flex min-h-32 w-full flex-col items-center justify-center rounded-3xl border-2 text-center shadow-[0_12px_40px_rgba(163,230,53,0.12)] transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300 ${isListening ? 'border-rose-300 bg-rose-400/15 text-white' : 'border-lime-300 bg-lime-300 text-slate-950 hover:bg-lime-200'}`}><span className={`grid size-14 place-items-center rounded-full ${isListening ? 'bg-rose-300 text-slate-950' : 'bg-slate-950 text-lime-300'}`}>{isListening ? <Square aria-hidden="true" className="size-6 fill-current" /> : <Mic aria-hidden="true" className="size-7" />}</span><span className="mt-2 text-xl font-black">{isListening ? text.listening : text.start}</span></button>
          <p aria-live="polite" className="min-h-12 pt-3 text-center text-sm leading-5 text-slate-300">{voiceMessage}</p>
          <p className="flex items-center justify-center gap-2 pb-2 pt-2 text-center text-xs font-semibold text-slate-500"><CloudSun aria-hidden="true" className="size-4" />{text.saved}</p>
        </div>
      </div>
    </section>
  )
}
