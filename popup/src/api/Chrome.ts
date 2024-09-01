import { wetToast } from 'bsdweb'
import { atom } from 'jotai'

// * State
type ContentState = {
  switch: boolean
}
export const contentStateAtom = atom<ContentState>({
  switch: false,
})

// * Content Emitter Setup
function emit(event: string, payload: unknown) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { event, payload })
    } else wetToast('No active tab found')
  })
}

// * Content Listener Setup
type Listener<T> = (payload: T) => void
type Listeners = {
  STATE: {
    switch: boolean
  }
}
type Message<T extends Listeners = Listeners> = { event: keyof T; payload: T[keyof T] }
const listeners: Partial<{
  [K in keyof Listeners]: Listener<Listeners[K]>
}> = {}

chrome.runtime.onMessage.addListener((request: Message) => {
  const { event, payload } = request
  if (!listeners[event]) return
  listeners[event](payload)
})

function on<T extends keyof Listeners>(event: T, listener: (payload: Listeners[T]) => void) {
  listeners[event] = listener
  return () => {
    delete listeners[event]
  }
}

const content = {
  emit,
  on,
}

export default content
