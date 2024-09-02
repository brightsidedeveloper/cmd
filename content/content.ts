// * State
let ContentState = {
  listening: false,
  speaking: false,
  autoSpeakOn: false,
  autoSendOn: false,
  autoListenOn: false,
  showMore: false,
};

// * Popup Connection
type Emitters = {
  STATE: typeof ContentState;
  PROMPT_SELECTED_CODE: { prompt: string };
  PROMPT_OPEN_FILES: { prompt: string };
};
function emit<T extends keyof Emitters>(event: T, payload: Emitters[T]) {
  chrome.runtime.sendMessage({ event, payload });
}

const listeners = {
  GET_STATE: () => emit('STATE', ContentState),
  STATE: (payload: typeof ContentState) => (ContentState = payload),
  // * VSCode Events
  PROMPT_SELECTED_CODE: ({ prompt, code, fileName }: { prompt?: string; code: string; fileName: string }) => {
    const shouldSubmit = prompt && prompt.split('add selected code').length === 0;
    if (shouldSubmit) appendTextArea(prompt);
    appendTextArea('The following code is a file named: ' + fileName);
    appendTextArea('```' + code + '```');

    if (shouldSubmit) submitForm();
  },
  PROMPT_OPEN_FILES: ({ prompt, files }: { prompt?: string; files: { path: string; content: string }[] }) => {
    const shouldSubmit = prompt && prompt.split('add open files').length === 0;
    files.forEach(({ path, content }) => {
      appendTextArea('The following file content is in this path `' + path + '`');
      appendTextArea('```' + content + '```');
    });
    if (shouldSubmit) {
      appendTextArea(prompt);
      submitForm();
    }
  },
};

type Message<T extends Record<string, (...args: any) => any> = typeof listeners, K extends keyof T = keyof T> = {
  event: K;
  payload: Parameters<T[K]>[0];
};
chrome.runtime.onMessage.addListener((message: Message) => {
  const { event, payload } = message;
  if (!listeners[event]) return;
  (listeners[event] as (arg: typeof payload) => void)(payload);
});

// * Recognition Logic
// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) throw new Error('SpeechRecognition API not supported');

const r = new SpeechRecognition();
r.lang = 'en-US';
r.interimResults = false;
r.maxAlternatives = 1;
r.continuous = true;
const startRecognition = () => r.start();
r.onend = startRecognition;
// @ts-ignore
r.onresult = ({ results }) => handleRecognitionResult(results[results.length - 1][0].transcript);
startRecognition();

type CommandsBase = {
  [key: string]: {
    keywords: string[] | string[][];
    action: (transcript: string) => void;
  };
};

const commands = {
  // * Popup Commands
  TOGGLE_AUTO_SEND: {
    keywords: ['send', 'toggle'],
    action: () => {
      ContentState.autoSendOn = !ContentState.autoSendOn;
      emit('STATE', ContentState);
    },
  },
  TOGGLE_AUTO_LISTEN: {
    keywords: ['listen', 'toggle'],
    action: () => {
      ContentState.autoListenOn = !ContentState.autoListenOn;
      emit('STATE', ContentState);
    },
  },
  TOGGLE_AUTO_SPEAK: {
    keywords: ['speak', 'toggle'],
    action: () => {
      ContentState.autoSpeakOn = !ContentState.autoSpeakOn;
      emit('STATE', ContentState);
    },
  },
  TOGGLE_SHOW_MORE: {
    keywords: ['show', 'more', 'toggle'],
    action: () => {
      ContentState.showMore = !ContentState.showMore;
      emit('STATE', ContentState);
    },
  },
  STOP_LISTENING: {
    keywords: ['stop', 'listening'],
    action: () => {
      ContentState.listening = false;
      emit('STATE', ContentState);
    },
  },
  LISTEN: {
    keywords: ['listen'],
    action: () => {
      ContentState.listening = true;
      emit('STATE', ContentState);
    },
  },
  SEND: {
    keywords: ['send'],
    action: () => {
      stop();
      submitForm();
    },
  },
  SPEAK: {
    keywords: ['speak'],
    action: () => {
      stop();
      speak();
    },
  },
  NEVERMIND: {
    keywords: [['nevermind'], ['never mind']],
    action: () => {
      ContentState.listening = false;
      clearTextArea();
      emit('STATE', ContentState);
    },
  },
  STOP: {
    keywords: ['stop'],
    action: () => stop(),
  },
  // * VSCode Commands
  PROMPT_SELECTED_CODE: {
    keywords: ['selected', 'code'],
    action: (prompt) => emit('PROMPT_SELECTED_CODE', { prompt }),
  },
  PROMPT_OPEN_FILES: {
    keywords: ['open', 'files'],
    action: (prompt) => emit('PROMPT_OPEN_FILES', { prompt }),
  },
} satisfies CommandsBase;

function handleRecognitionResult(transcript: string) {
  console.log(transcript);
  const [cmd] = Object.entries(commands).find(([, { keywords }]) => {
    if (!Array.isArray(keywords[0])) return (keywords as string[]).every((keyword) => transcript.includes(keyword));
    return keywords.some((keywords) => (keywords as string[]).every((k) => transcript.includes(k)));
  }) ?? [null];
  if (cmd) return commands[cmd as keyof typeof commands].action(transcript);
  if (!ContentState.listening) return;

  appendTextArea(transcript);
  if (ContentState.autoSendOn) return submitForm();
}

// * ChatGPT Utils

function speak() {
  const btns = Array.from(document.querySelectorAll('button[aria-label="Read Aloud"]')) as HTMLButtonElement[];
  const button = btns[btns.length - 1];
  if (button) button.click();
  ContentState.speaking = true;
  emit('STATE', ContentState);
  setTimeout(() => {
    const i = setInterval(() => {
      const badButton = document.querySelector('button[aria-label="Stop"]') as HTMLButtonElement | null;
      if (badButton) return;
      ContentState.speaking = false;
      emit('STATE', ContentState);
      clearInterval(i);
      if (ContentState.autoListenOn) {
        r.abort();
        setTimeout(() => {
          ContentState.listening = true;
          emit('STATE', ContentState);
        }, 100);
      }
    }, 100);
  }, 1500);
}

function appendTextArea(text: string) {
  const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement | null;
  if (textarea) {
    textarea.value = textarea.value.trim() + ' ' + text.trim();
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  }
}

function stop() {
  const button = document.querySelector('button[aria-label="Stop streaming"]') as HTMLButtonElement | null;
  const button2 = document.querySelector('button[aria-label="Stop"]') as HTMLButtonElement | null;
  if (button) button.click();
  if (button2) button2.click();
  ContentState.listening = false;
  ContentState.speaking = false;
  emit('STATE', ContentState);
}

function clearTextArea() {
  const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement | null;
  if (textarea) {
    textarea.value = '';
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  }
}

function submitForm() {
  setTimeout(() => {
    const button = document.querySelector('button[data-testid="send-button"]') as HTMLButtonElement | null;
    if (button) button.click();
    if (!ContentState.autoSpeakOn) return;
    setTimeout(() => {
      const i = setInterval(() => {
        const badButton = document.querySelector('button[aria-label="Stop streaming"]') as HTMLButtonElement | null;
        if (badButton) return;
        clearInterval(i);
        setTimeout(() => {
          speak();
        }, 100);
      }, 100);
    }, 1500);
  }, 100);
}
