# JARVIS Setup Guide

## One-time setup (run these once)

### 1. Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Ollama
```bash
brew install ollama
```

### 3. Start Ollama and download the AI model (~4GB)
```bash
ollama serve &
ollama pull llama3
```

### 4. Install Python dependencies
```bash
pip3 install SpeechRecognition pyaudio requests yfinance
```

If `pyaudio` fails on Mac, run this first:
```bash
brew install portaudio
pip3 install pyaudio
```

---

## Running Jarvis

### Voice mode (speak to it):
```bash
python3 jarvis.py
```

### Text mode (type commands, no mic needed):
```bash
python3 jarvis.py --text
```

---

## Wake Word
Say **"Hey Jarvis"** to activate.

---

## What you can say

| Say this | What happens |
|----------|-------------|
| "Hey Jarvis, what time is it?" | Tells the time |
| "Hey Jarvis, what's the weather in Dubai?" | Live weather |
| "Hey Jarvis, open Spotify" | Opens the app |
| "Hey Jarvis, search for Tesla news" | Opens Google |
| "Hey Jarvis, what's the stock price of Apple?" | Live AAPL price |
| "Hey Jarvis, set a timer for 5 minutes" | Sets a timer |
| "Hey Jarvis, take a screenshot" | Saves to Desktop |
| "Hey Jarvis, set volume to 70" | Sets Mac volume |
| "Hey Jarvis, open my Desktop" | Opens in Finder |
| "Hey Jarvis, lock the screen" | Locks your Mac |
| "Hey Jarvis, how's my battery?" | Battery status |
| "Hey Jarvis, tell me a joke" | 😄 |
| "Goodbye" | Exits Jarvis |

---

## Change the AI voice
Edit `jarvis.py` line:
```python
VOICE = "Samantha"   # Other options: Alex, Victoria, Karen, Daniel
```

## Change AI model (after installing with ollama pull)
```python
OLLAMA_MODEL = "llama3"   # or "mistral", "llama3.2", "gemma2"
```
