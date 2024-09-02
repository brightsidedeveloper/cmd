import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { tw } from 'bsdweb';
import { BrightBaseRealtime, initBrightBase } from 'bsdweb';
import { atom, useAtom } from 'jotai';
import content from './api/Chrome';
import { Label } from './components/ui/shadcn/ui/label';
import { Switch } from './components/ui/shadcn/ui/switch';

initBrightBase(
  'https://ybpjdhzaqaogrojgsjxh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicGpkaHphcWFvZ3JvamdzanhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYzNzMyOTYsImV4cCI6MjAyMTk0OTI5Nn0.CWTPdwYlV1g6Zif2dKRfVJHK8xwxNhS8gb9Sg3EY4Dg'
);

// * State
type ContentState = {
  listening: boolean;
  autoSpeakOn: boolean;
  autoSendOn: boolean;
  autoListenOn: boolean;
  speaking: boolean;
  showMore: boolean;
};

const contentStateAtom = atom<ContentState>({
  listening: false,
  autoSpeakOn: false,
  autoSendOn: false,
  autoListenOn: false,
  speaking: false,
  showMore: false,
});

export type Emitters = {
  GET_STATE: null;
  STATE: ContentState;
  PROMPT_SELECTED_CODE: { prompt: string; code: string; fileName: string };
  PROMPT_OPEN_FILES: { prompt: string; files: { path: string; content: string }[] };
};

export type Listeners = {
  STATE: ContentState;
  PROMPT_SELECTED_CODE: { prompt: string };
  PROMPT_OPEN_FILES: { prompt: string };
  SPEAKING: { speaking: boolean };
};

type VSCodeEvents = {
  CONNECTED: { optional?: string };
  DISCONNECTED: { optional?: string };
  GET_SELECTED_CODE: { prompt: string };
  GET_OPEN_FILES: { prompt: string };
  RECEIVE_SELECTED_CODE: { prompt: string; code: string; fileName: string };
  RECEIVE_OPEN_FILES: { prompt: string; files: { path: string; content: string }[] };
};

const vscode = new BrightBaseRealtime<VSCodeEvents>('vscode-chrome');

export default function App() {
  const [contentState, setContentState] = useAtom(contentStateAtom);
  const { autoListenOn, autoSendOn, autoSpeakOn, listening, speaking, showMore } = contentState;

  const [status, setStatus] = useState('disconnected');
  const [vsCodeEvent, setVsCodeEvent] = useState<keyof VSCodeEvents | null>(null);

  useEffect(() => vscode.subscribe(), []);

  useEffect(() => vscode.on('CONNECTED', () => setStatus('connected')), []);
  useEffect(() => vscode.on('DISCONNECTED', () => setStatus('disconnected')), []);
  useEffect(() => {
    const t = setTimeout(() => vscode.emit('CONNECTED', { optional: 'optional' }), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(
    () =>
      content.on('PROMPT_SELECTED_CODE', ({ prompt }) => {
        vscode.emit('GET_SELECTED_CODE', { prompt });
        setVsCodeEvent('GET_SELECTED_CODE');
        setTimeout(() => setVsCodeEvent(null), 3000);
      }),
    []
  );
  useEffect(
    () =>
      vscode.on('RECEIVE_SELECTED_CODE', ({ prompt, code, fileName }) => {
        content.emit('PROMPT_SELECTED_CODE', { prompt, code, fileName });
        setVsCodeEvent('RECEIVE_SELECTED_CODE');
        setTimeout(() => setVsCodeEvent(null), 3000);
      }),
    []
  );
  useEffect(
    () =>
      content.on('PROMPT_OPEN_FILES', ({ prompt }) => {
        vscode.emit('GET_OPEN_FILES', { prompt });
        setVsCodeEvent('GET_OPEN_FILES');
        setTimeout(() => setVsCodeEvent(null), 3000);
      }),
    []
  );
  useEffect(
    () =>
      vscode.on('RECEIVE_OPEN_FILES', ({ prompt, files }) => {
        content.emit('PROMPT_OPEN_FILES', { prompt, files });
        setVsCodeEvent('RECEIVE_OPEN_FILES');
        setTimeout(() => setVsCodeEvent(null), 3000);
      }),
    []
  );
  useEffect(() => content.on('STATE', setContentState), [setContentState]);
  useEffect(() => content.emit('GET_STATE', null), []);

  const updateState = (newState: Partial<ContentState>) => {
    const state = { ...contentState, ...newState };
    setContentState(state);
    content.emit('STATE', state);
  };

  return (
    <div className={tw('max-h-[250px] size-full transition-all duration-500', showMore ? 'min-w-[550px]' : 'min-w-[280px]')}>
      <header className="h-12 border-b shadow-sm flex items-center justify-center">
        <div className="px-2 flex items-center justify-between w-full [max-width:1920px]">
          <span className="font-bold text-xl text-primary">VoiceChatAI</span>
          <div className="w-fit flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://github.com/brightsidedeveloper/cmd"
              target="_blank"
              className="size-6 rounded-full overflow-hidden border-border shadow-md"
            >
              <Avatar>
                <AvatarImage src="https://github.com/brightsidedeveloper.png" alt="name" />
                <AvatarFallback>NAME</AvatarFallback>
              </Avatar>
            </a>
          </div>
        </div>
      </header>
      <div className="p-6 w-full flex justify-between items-center gap-4 @container">
        <div className="w-[200px] flex justify-center items-center flex-col gap-3">
          <div
            className={tw(
              'flex justify-between items-center gap-2 transition-all duration-500',
              showMore ? 'min-w-full' : 'min-w-[105%] translate-x-[8px]'
            )}
          >
            <Label>Auto Send:</Label>
            <Switch checked={autoSendOn} onCheckedChange={() => updateState({ autoSendOn: !autoSendOn })} />
          </div>
          <div
            className={tw(
              'flex justify-between items-center gap-2 transition-all duration-500',
              showMore ? 'min-w-full' : 'min-w-[105%] translate-x-[8px]'
            )}
          >
            <Label>Auto Speak:</Label>
            <Switch checked={autoSpeakOn} onCheckedChange={() => updateState({ autoSpeakOn: !autoSpeakOn })} />
          </div>
          <div
            className={tw(
              'flex justify-between items-center gap-2 transition-all duration-500',
              showMore ? 'min-w-full' : 'min-w-[105%] translate-x-[8px]'
            )}
          >
            <Label>Auto Listen:</Label>
            <Switch checked={autoListenOn} onCheckedChange={() => updateState({ autoListenOn: !autoListenOn })} />
          </div>
          <div
            className={tw(
              'flex justify-between items-center gap-2 transition-all duration-500',
              showMore ? 'min-w-full' : 'min-w-[105%] translate-x-[8px]'
            )}
          >
            <Label>Show more:</Label>
            <Switch checked={showMore} onCheckedChange={() => updateState({ showMore: !showMore })} />
          </div>
        </div>
        <div
          className={tw(
            'flex justify-center flex-col gap-1.5 w-full text-left transition-all duration-500 overflow-hidden [&_p]:whitespace-nowrap translate-x-[8px]',
            showMore ? 'max-w-[250px]' : 'max-w-0'
          )}
        >
          <p>"Listen" & "Stop Listening" & "Nevermind"</p>
          <p>"Speak" & "Stop"</p>
          <p>"Toggle [send/speak/listen/show more]"</p>
          <p>"[add] [selected code/open files]"</p>
        </div>
      </div>
      <div className="w-full flex justify-center items-center">
        <p
          className={tw(
            'text-lg transition-all',
            vsCodeEvent
              ? 'text-blue-500 scale-105'
              : speaking
              ? 'animate-bounce text-fuchsia-500'
              : listening
              ? 'text-green-500 animate-pulse'
              : 'text-amber-500'
          )}
        >
          {vsCodeEvent ? 'Received Code' : speaking ? 'Speaking' : listening ? 'Listening' : 'On Standby'}
        </p>
      </div>
      <div className={tw('flex justify-center items-center py-5 uppercase', status === 'connected' ? 'text-green-500' : 'text-red-500')}>
        VSCode {status}
      </div>
      <a
        href="https://brightsidedevelopers.com"
        target="_blank"
        className="py-2 block underline text-foreground/50 text-[10px] mt-auto w-full text-center"
      >
        BrightSide Developers
      </a>
    </div>
  );
}
