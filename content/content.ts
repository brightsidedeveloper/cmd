// * State
const ContentState = {
  switch: true,
}

// * Popup Listener Setup
type Listener<T> = (payload: T) => void
type Listeners = {
  GET_STATE: Listener<{}>
  UPDATE_STATE: Listener<Partial<typeof ContentState>>
}

type Message<T extends Listeners = Listeners> = { event: keyof T; payload: T[keyof T] }

const listeners: Partial<Listeners> = {}
chrome.runtime.onMessage.addListener((message: Message) => {
  const { event, payload } = message
  if (!listeners[event]) return
  listeners[event](payload)
})

const sendState = () => chrome.runtime.sendMessage({ event: 'STATE', payload: ContentState })

listeners.GET_STATE = () => sendState

listeners.UPDATE_STATE = (payload) => Object.assign(ContentState, payload)

// * Recognition Logic
// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
if (!SpeechRecognition) throw new Error('SpeechRecognition API not supported')

const r = new SpeechRecognition()
r.lang = 'en-US'
r.interimResults = false
r.maxAlternatives = 1
r.continuous = true
const startRecognition = () => r.start()
r.onend = startRecognition
// @ts-ignore
r.onresult = ({ results }) => handleRecognitionResult(results[results.length - 1][0].transcript)
startRecognition()

type CommandsBase = {
  [key: string]: {
    keywords: string[]
    action: (transcript: string) => void
  }
}

const commands = {
  'flip-switch': {
    keywords: ['toggle'],
    action: (_) => {
      ContentState.switch = !ContentState.switch
      sendState()
    },
  },
} satisfies CommandsBase

function handleRecognitionResult(transcript: string) {
  const [cmd] = Object.entries(commands).find(([, { keywords }]) => keywords.every((keyword) => transcript.includes(keyword))) ?? [null]
  if (!cmd) return
  commands[cmd as keyof typeof commands].action(transcript)
}
