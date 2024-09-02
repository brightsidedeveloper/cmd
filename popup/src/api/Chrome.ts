import { Emitters, Listeners } from '@/App';
import { wetToast } from 'bsdweb';

// * Content Emitter Setup
function emit<T extends keyof Emitters>(event: T, payload: Emitters[T]) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { event, payload });
    } else wetToast('No active tab found');
  });
}

// * Content Listener Setup

type Message<T extends Listeners = Listeners> = { event: keyof T; payload: T[keyof T] };

type ListenersType<T extends Listeners = Listeners> = Partial<Record<keyof T, (payload: T[keyof T]) => void>>;
const listeners: ListenersType = {};

chrome.runtime.onMessage.addListener((request: Message) => {
  const { event, payload } = request;
  if (!listeners[event]) return;
  listeners[event](payload);
});

function on<T extends keyof Listeners>(event: T, listener: (payload: Listeners[T]) => void) {
  listeners[event] = listener as (payload: Listeners[keyof Listeners]) => void;
  return () => {
    delete listeners[event];
  };
}

const content = {
  emit,
  on,
};

export default content;
