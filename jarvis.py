#!/usr/bin/env python3
"""
JARVIS - Local Personal AI Assistant
Powered by Ollama (local LLM) + macOS TTS + SpeechRecognition
No API keys required — runs 100% on your machine.
"""

import os
import sys
import json
import time
import threading
import subprocess
import webbrowser
import datetime
import requests
import speech_recognition as sr
import yfinance as yf

# ─── CONFIG ──────────────────────────────────────────────────────────────────
ASSISTANT_NAME   = "Jarvis"
WAKE_WORDS       = ["jarvis", "hey jarvis", "ok jarvis"]
OLLAMA_MODEL     = "llama3"          # change to "mistral" if you prefer
OLLAMA_URL       = "http://localhost:11434/api/generate"
VOICE            = "Samantha"        # macOS voices: Samantha, Alex, Victoria
SPEECH_TIMEOUT   = 5                 # seconds to wait for speech
LISTEN_PHRASE_LIMIT = 10             # max seconds per phrase
# ─────────────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = f"""You are {ASSISTANT_NAME}, a smart local personal AI assistant (like Jarvis from Iron Man).
You run 100% on the user's Mac laptop. Be concise, helpful, and witty.

When the user asks you to DO something (open app, search, weather, stock, timer, volume, etc.)
you MUST respond with a valid JSON object like this:

{{
  "speak": "What I will say out loud",
  "action": "action_name",
  "params": {{}}
}}

Available actions and their params:
- "chat"         : params: {{}}                          — just talking, no action
- "open_app"     : params: {{"app": "Spotify"}}          — open a Mac application
- "web_search"   : params: {{"query": "search term"}}    — open browser with search
- "get_weather"  : params: {{"city": "Dubai"}}           — get weather for a city
- "get_stock"    : params: {{"ticker": "AAPL"}}          — get stock price
- "set_timer"    : params: {{"seconds": 60}}             — set a countdown timer
- "get_time"     : params: {{}}                          — current time
- "get_date"     : params: {{}}                          — current date
- "set_volume"   : params: {{"level": 50}}               — set system volume (0-100)
- "open_folder"  : params: {{"path": "~/Desktop"}}       — open a folder in Finder
- "screenshot"   : params: {{}}                          — take a screenshot
- "lock_screen"  : params: {{}}                          — lock the Mac
- "battery"      : params: {{}}                          — check battery level
- "joke"         : params: {{}}                          — tell a joke

For ALL responses, return ONLY valid JSON. Never write plain text outside JSON.
Keep "speak" short and natural — you are talking, not writing.
"""

# ─── TEXT TO SPEECH ──────────────────────────────────────────────────────────

def speak(text: str):
    """Speak text using macOS built-in TTS."""
    clean = text.replace('"', '\\"').replace("'", "\\'")
    os.system(f'say -v {VOICE} "{clean}"')

def speak_async(text: str):
    """Speak without blocking."""
    threading.Thread(target=speak, args=(text,), daemon=True).start()

# ─── SPEECH RECOGNITION ──────────────────────────────────────────────────────

recognizer = sr.Recognizer()
recognizer.energy_threshold = 300
recognizer.dynamic_energy_threshold = True

def listen(prompt_text: str = None, timeout: int = SPEECH_TIMEOUT) -> str | None:
    """Listen for a voice command and return text."""
    with sr.Microphone() as source:
        if prompt_text:
            print(f"\n🎤  {prompt_text}")
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        try:
            audio = recognizer.listen(source, timeout=timeout,
                                      phrase_time_limit=LISTEN_PHRASE_LIMIT)
        except sr.WaitTimeoutError:
            return None

    try:
        text = recognizer.recognize_google(audio)
        print(f"You said: {text}")
        return text.lower().strip()
    except sr.UnknownValueError:
        return None
    except sr.RequestError:
        # Fallback to offline Sphinx if Google is unavailable
        try:
            return recognizer.recognize_sphinx(audio).lower().strip()
        except Exception:
            return None

# ─── OLLAMA LOCAL LLM ─────────────────────────────────────────────────────────

def ask_ollama(user_message: str, history: list) -> dict:
    """Send a message to local Ollama and get structured JSON back."""
    # Build conversation context (last 6 exchanges)
    context = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history[-6:]])
    prompt = f"{context}\nUSER: {user_message}\nASSISTANT:"

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "system": SYSTEM_PROMPT,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0.7, "num_predict": 300}
    }

    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=30)
        r.raise_for_status()
        raw = r.json().get("response", "{}")
        return json.loads(raw)
    except requests.exceptions.ConnectionError:
        return {"speak": "Ollama is not running. Please start it with: ollama serve",
                "action": "chat", "params": {}}
    except json.JSONDecodeError:
        return {"speak": "I had trouble thinking. Could you repeat that?",
                "action": "chat", "params": {}}
    except Exception as e:
        return {"speak": f"Something went wrong: {str(e)}", "action": "chat", "params": {}}

# ─── SKILLS ──────────────────────────────────────────────────────────────────

def skill_open_app(app: str) -> str:
    try:
        subprocess.Popen(["open", "-a", app])
        return f"Opening {app}."
    except Exception:
        # Try by name without exact match
        result = subprocess.run(["open", "-a", app], capture_output=True, text=True)
        if result.returncode != 0:
            return f"I couldn't find {app}. Is it installed?"
        return f"Opening {app}."

def skill_web_search(query: str) -> str:
    url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
    webbrowser.open(url)
    return f"Searching for {query}."

def skill_get_weather(city: str) -> str:
    try:
        r = requests.get(f"https://wttr.in/{city.replace(' ', '+')}?format=3", timeout=5)
        if r.status_code == 200:
            return r.text.strip()
        return f"Couldn't get weather for {city}."
    except Exception:
        return "Weather service is unavailable right now."

def skill_get_stock(ticker: str) -> str:
    try:
        stock = yf.Ticker(ticker.upper())
        info = stock.fast_info
        price = round(info.last_price, 2)
        prev  = round(info.previous_close, 2)
        change = round(price - prev, 2)
        direction = "up" if change >= 0 else "down"
        return (f"{ticker.upper()} is trading at ${price}, "
                f"{direction} {abs(change)} from yesterday's close.")
    except Exception:
        return f"Couldn't fetch data for {ticker}."

def skill_set_timer(seconds: int) -> str:
    def _timer(s):
        time.sleep(s)
        speak(f"Time's up! Your {s}-second timer is done.")
        # macOS notification
        subprocess.run(["osascript", "-e",
            f'display notification "Timer done!" with title "{ASSISTANT_NAME}"'])
    threading.Thread(target=_timer, args=(int(seconds),), daemon=True).start()
    mins = int(seconds) // 60
    secs = int(seconds) % 60
    label = f"{mins} minute{'s' if mins != 1 else ''}" if mins else f"{secs} second{'s' if secs != 1 else ''}"
    return f"Timer set for {label}."

def skill_get_time() -> str:
    now = datetime.datetime.now()
    return f"It's {now.strftime('%I:%M %p')}."

def skill_get_date() -> str:
    now = datetime.datetime.now()
    return f"Today is {now.strftime('%A, %B %d, %Y')}."

def skill_set_volume(level: int) -> str:
    level = max(0, min(100, int(level)))
    os.system(f"osascript -e 'set volume output volume {level}'")
    return f"Volume set to {level} percent."

def skill_open_folder(path: str) -> str:
    expanded = os.path.expanduser(path)
    subprocess.Popen(["open", expanded])
    return f"Opening {path}."

def skill_screenshot() -> str:
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    path = os.path.expanduser(f"~/Desktop/screenshot_{ts}.png")
    subprocess.run(["screencapture", "-x", path])
    return f"Screenshot saved to your Desktop."

def skill_lock_screen() -> str:
    os.system("pmset displaysleepnow")
    return "Locking the screen."

def skill_battery() -> str:
    result = subprocess.run(["pmset", "-g", "batt"], capture_output=True, text=True)
    lines = result.stdout.strip().split("\n")
    for line in lines:
        if "%" in line:
            # e.g. "	100%; charged; 0:00 remaining present: true"
            pct = line.strip().split(";")[0].strip()
            status = line.strip().split(";")[1].strip() if ";" in line else ""
            return f"Battery is at {pct}, {status}."
    return "Couldn't read battery status."

def skill_joke() -> str:
    jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "I told my computer I needed a break. Now it won't stop sending me Kit-Kat ads.",
        "Why did the developer go broke? Because he used up all his cache.",
        "A SQL query walks into a bar, walks up to two tables and asks... can I join you?",
        "Why do Java developers wear glasses? Because they don't C-sharp.",
    ]
    import random
    return random.choice(jokes)

# ─── ACTION DISPATCHER ───────────────────────────────────────────────────────

def dispatch(action: str, params: dict, ollama_speak: str) -> str:
    """Run the action and return the final text to speak."""
    action = action.lower()

    if action == "open_app":
        result = skill_open_app(params.get("app", "Finder"))
        return ollama_speak or result

    elif action == "web_search":
        result = skill_web_search(params.get("query", ""))
        return ollama_speak or result

    elif action == "get_weather":
        result = skill_get_weather(params.get("city", "Dubai"))
        return result  # override with live data

    elif action == "get_stock":
        result = skill_get_stock(params.get("ticker", "AAPL"))
        return result  # override with live data

    elif action == "set_timer":
        result = skill_set_timer(params.get("seconds", 60))
        return ollama_speak or result

    elif action == "get_time":
        return skill_get_time()

    elif action == "get_date":
        return skill_get_date()

    elif action == "set_volume":
        result = skill_set_volume(params.get("level", 50))
        return ollama_speak or result

    elif action == "open_folder":
        result = skill_open_folder(params.get("path", "~/Desktop"))
        return ollama_speak or result

    elif action == "screenshot":
        result = skill_screenshot()
        return ollama_speak or result

    elif action == "lock_screen":
        skill_lock_screen()
        return ollama_speak or "Locking the screen."

    elif action == "battery":
        return skill_battery()

    elif action == "joke":
        return skill_joke()

    else:  # "chat" or unknown
        return ollama_speak or "I'm not sure how to help with that."

# ─── MAIN LOOP ────────────────────────────────────────────────────────────────

def check_ollama():
    """Make sure Ollama is running."""
    try:
        r = requests.get("http://localhost:11434", timeout=3)
        return True
    except Exception:
        return False

def print_banner():
    print("""
╔══════════════════════════════════════════════════╗
║         J A R V I S  — Local AI Assistant        ║
║         Powered by Ollama + macOS TTS             ║
╚══════════════════════════════════════════════════╝
Say  'Hey Jarvis'  to wake me up.
Say  'quit' or 'goodbye'  to exit.
Press  Ctrl+C  to force quit.
""")

def main():
    print_banner()

    # Check Ollama
    if not check_ollama():
        print("⚠️  Ollama is not running!")
        print("   Start it with:  ollama serve")
        print("   Then re-run this script.\n")
        speak("Ollama is not running. Please start it before I can think properly.")

    speak(f"Hello! I'm {ASSISTANT_NAME}, your personal assistant. Say hey Jarvis to wake me up.")

    history = []
    awake   = False

    while True:
        try:
            if not awake:
                # Passively listen for wake word
                text = listen("Listening for wake word...", timeout=10)
                if text is None:
                    continue
                if any(w in text for w in WAKE_WORDS):
                    awake = True
                    speak("Yes? How can I help?")
                    print("🟢  JARVIS AWAKE")
                continue

            # Active listening for command
            command = listen("Listening...", timeout=SPEECH_TIMEOUT)

            if command is None:
                speak("I didn't catch that. I'm going back to sleep.")
                awake = False
                continue

            # Exit commands
            if any(x in command for x in ["quit", "exit", "goodbye", "shut down", "bye"]):
                speak("Goodbye! Have a great day.")
                break

            # Get AI response
            print(f"\n🤖  Thinking...")
            response = ask_ollama(command, history)

            speak_text = response.get("speak", "")
            action     = response.get("action", "chat")
            params     = response.get("params", {})

            # Execute action and get final text
            final_text = dispatch(action, params, speak_text)

            print(f"💬  {ASSISTANT_NAME}: {final_text}")
            speak(final_text)

            # Save to history
            history.append({"role": "user",      "content": command})
            history.append({"role": "assistant",  "content": final_text})

            # Stay awake for follow-up (reset after 20s of silence)
            awake = True

        except KeyboardInterrupt:
            print("\nExiting...")
            speak("Goodbye!")
            break

# ─── TEXT MODE (no microphone) ────────────────────────────────────────────────

def text_mode():
    """Run Jarvis in text-only mode (no mic required)."""
    print_banner()
    print("TEXT MODE — type your commands below.\n")

    if not check_ollama():
        print("⚠️  Ollama is not running! Start it with: ollama serve\n")

    speak(f"Hello! I'm {ASSISTANT_NAME}, ready to help.")
    history = []

    while True:
        try:
            command = input("You: ").strip().lower()
            if not command:
                continue
            if command in ["quit", "exit", "bye", "goodbye"]:
                speak("Goodbye!")
                break

            print("🤖  Thinking...")
            response = ask_ollama(command, history)

            speak_text = response.get("speak", "")
            action     = response.get("action", "chat")
            params     = response.get("params", {})

            final_text = dispatch(action, params, speak_text)
            print(f"💬  {ASSISTANT_NAME}: {final_text}\n")
            speak(final_text)

            history.append({"role": "user",     "content": command})
            history.append({"role": "assistant", "content": final_text})

        except KeyboardInterrupt:
            speak("Goodbye!")
            break

# ─── ENTRY POINT ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if "--text" in sys.argv or "-t" in sys.argv:
        text_mode()
    else:
        main()
