"use strict";
// * State
const ContentState = {
    switch: true,
};
const listeners = {};
chrome.runtime.onMessage.addListener((message) => {
    const { event, payload } = message;
    if (!listeners[event])
        return;
    listeners[event](payload);
});
const sendState = () => chrome.runtime.sendMessage({ event: 'STATE', payload: ContentState });
listeners.GET_STATE = () => sendState;
listeners.UPDATE_STATE = (payload) => Object.assign(ContentState, payload);
// * Recognition Logic
// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition)
    throw new Error('SpeechRecognition API not supported');
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
const commands = {
    'flip-switch': {
        keywords: ['toggle'],
        action: (_) => {
            ContentState.switch = !ContentState.switch;
            sendState();
        },
    },
};
function handleRecognitionResult(transcript) {
    var _a;
    const [cmd] = (_a = Object.entries(commands).find(([, { keywords }]) => keywords.every((keyword) => transcript.includes(keyword)))) !== null && _a !== void 0 ? _a : [null];
    if (!cmd)
        return;
    commands[cmd].action(transcript);
}
