# SETUP: Engineering Failure Studio

Instructions for Claude. The user typed "follow SETUP.md". Get this computer ready to make documentaries. You only need to do this once per machine.

This must run in the **Code** tab of the Claude desktop app (or the Claude Code CLI) with this folder open. Normal chat runs in an online sandbox and can't install software or render video. If you're running in a cloud sandbox, say so and tell the user to open this folder in the Code tab on their own computer.

## 1. Check
Run `bash scripts/check_setup.sh` and show the user a short list of what's missing. If everything is OK, skip to step 4.

## 2. Install what's missing
Ask once before installing ("I need to install X, Y, Z. OK?"), then do it. Detect the OS with `uname -s` (on Windows use PowerShell, or Git Bash if present).

| need | macOS | Windows | Linux (Debian/Ubuntu) |
|---|---|---|---|
| Homebrew (macOS only) | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` | – | – |
| Node.js 18+ | `brew install node` | `winget install OpenJS.NodeJS.LTS` | `sudo apt-get install -y nodejs npm` (or NodeSource for a newer one) |
| ffmpeg | `brew install ffmpeg` | `winget install Gyan.FFmpeg` | `sudo apt-get install -y ffmpeg` |
| Python 3.10–3.12 | `brew install python@3.12` | `winget install Python.Python.3.12` | `sudo apt-get install -y python3 python3-venv` |
| PDF tools (optional, helps read reports) | `brew install poppler` | `winget install oschwartz10612.Poppler` | `sudo apt-get install -y poppler-utils` |

Then, from this folder:
```
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install faster-whisper yt-dlp
cd studio && npm install && cd ..
```
On Windows the venv paths are `.venv\Scripts\python.exe` and `.venv\Scripts\pip.exe`.

### If something fails, read the error and try another way. Don't give up.
- **faster-whisper won't install because Python is too new** (no wheel for `ctranslate2`/`av`): make the venv with an older Python. Use `uv` (`brew install uv` or `pip install uv`), then `rm -rf .venv && uv venv --python 3.12 .venv && uv pip install --python .venv faster-whisper yt-dlp`. Or use `python3.12 -m venv .venv` if 3.12 is installed. As a last resort, `.venv/bin/pip install openai-whisper` also works; align_words.py falls back to it automatically.
- **`node`/`ffmpeg` not found right after installing**: the app's shell hasn't picked up the new PATH. Tell the user: "Please quit and reopen the Claude app, open this same folder in the Code tab, and type *follow SETUP.md* again." Then stop.
- **npm install errors**: run `npm cache verify` and retry once. Check Node is version 18 or newer.
- **Apple Silicon**: everything above works natively; no Rosetta needed.

## 3. Warm up (one time)
- Download the word-timing model so the first render isn't slow: `.venv/bin/python -c "from faster_whisper import WhisperModel; WhisperModel('small.en', device='cpu', compute_type='int8')"`
- Let Remotion fetch its headless browser: `cd studio && npx remotion browser ensure && cd ..`

## 4. Confirm
Run `bash scripts/check_setup.sh` again. When it prints **You're set up.**, tell the user:

> You're set up. Type **make a documentary about** and a topic, for example *make a documentary about the Baltimore Key Bridge collapse*.
> You'll also need an ElevenLabs account for the narration voice.

Starter topics that each have an official report and free footage: the Titan submersible, the Hyatt Regency walkway collapse, the Tacoma Narrows Bridge, Deepwater Horizon, the Silver Bridge, the Baltimore Key Bridge, the Oroville Dam spillway, the I-35W Mississippi River bridge, the Texas City refinery explosion (CSB), and the FIU pedestrian bridge.
