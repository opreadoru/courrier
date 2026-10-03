# Set up Courrier with an AI assistant

This file is written for a coding assistant such as Claude Code or Cursor. If you are a person, ask your assistant to "follow SETUP-WITH-AI.md", or follow the short version in the README.

## Instructions for the assistant

You are helping someone run Courrier on their own computer. Courrier is a single web page plus a small Node server that talks to a local Ollama model. Nothing is sent to any cloud service.

Work through the steps in order. Explain each step in one plain sentence before you do it. **Ask before you install anything, download the model or change any setting.** If a step fails, show the person the exact error and stop. Do not try workarounds that change their system.

### 1. Check the machine

- Find the operating system (Windows, macOS or Linux).
- Check for a graphics card and its memory. On Windows or Linux with NVIDIA, run `nvidia-smi --query-gpu=name,memory.total --format=csv`. On a Mac with Apple silicon, the unified memory counts.
- Tell the person what you found. Courrier was built on a 12 GB graphics card, where a reading takes 15 to 45 seconds. With less memory or no graphics card it still works, but a reading can take several minutes. Let them decide whether to continue.
- Check free disk space. The model needs about 8 GB.

### 2. Node.js

- Run `node --version`. Version 18 or later is needed.
- If it is missing or older, ask before installing it. Suggested ways: `winget install OpenJS.NodeJS.LTS` on Windows, `brew install node` on macOS, or the package manager on Linux.

### 3. Ollama

- Run `ollama --version`. Version 0.30.5 or later is needed.
- If it is missing or older, ask before installing it. Suggested ways: `winget install Ollama.Ollama` on Windows, `brew install ollama` on macOS, or the official install script from https://ollama.com/download on Linux.
- Make sure Ollama is running. `ollama list` should answer without an error. If it does not, start the Ollama app, or run `ollama serve` in a separate terminal.

### 4. The model

- Run `ollama list` and look for `gemma4:12b`.
- If it is not there, tell the person it is a download of about 8 GB and ask before running `ollama pull gemma4:12b`.

### 5. Start Courrier

- In the folder that contains `server.mjs`, run `node server.mjs`. It should print `Courrier on http://localhost:5179`.
- If port 5179 is already in use, tell the person and ask what is using it. Do not stop other programs without asking.
- Open http://localhost:5179 in their browser, or give them the address.

### 6. Check it works

- Ask the person to click "Sample: missing papers". After 15 to 45 seconds, the right side should list eight answers, each with a number that matches a pin in the letter.
- If the status line shows an error about the model, check that Ollama is running and that `gemma4:12b` appears in `ollama list`.

### 7. Hand over

Tell the person:

- To start Courrier again later: make sure Ollama is running, then run `node server.mjs` in this folder and open http://localhost:5179.
- To stop it: press Ctrl+C in the terminal where the server runs.
- Their letters stay on their computer. The page only talks to Ollama on their own machine.
