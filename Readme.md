# GPT Voice Mode

An extension to enable voice mode in the ChatGPT browser version. It allows users to interact with ChatGPT using voice commands, enhancing accessibility and user experience.

## Features

- **Voice Commands**: Use commands like "Send", "Speak", "Listen", "Nevermind", and "Stop" to control ChatGPT.
- **Auto Modes**: Automatically activate sending, speaking, or listening modes based on user preferences.
- **VSCode Extension**: Uses a real-time backend (`BrightBaseRealtime`) to synchronize actions from my [VSCode Extension](https://github.com/brightsidedeveloper/chrome-gpt-fire) that sends file contents to this extension.
- **User Interface**: A clean and intuitive popup interface with theme toggles and settings.

## Installation

1. Clone the repository or download the source code from [GitHub](https://github.com/brightsidedeveloper/gpt-voice).
2. Go to `chrome://extensions/` in your browser.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the folder containing the extension.

## Usage

- **Open the extension**: Use `Ctrl+Shift+X` or click on the extension icon.
- **Voice Commands**: Speak commands directly to control ChatGPT.

  - "Turn [on/off] [send/speak/listen/commands]"
  - "Speak" - Speaks the last response.
  - "Listen" - Activates auto-type.
  - "Nevermind" - Clears input and stops listening.
  - "Stop" - Stops generating or speaking.

  ## Developer Docs

  Read the code, see how it works 🙃
