#!/usr/bin/env python3
"""
JARVIS — Backend Server
Flask + SocketIO server that powers the web UI.
Handles voice, text, all skills, reminders, music.
"""

import os, sys, json, time, threading, subprocess
import webbrowser, datetime, requests, random
import speech_recognition as sr
import yfinance as yf
from flask import Flask, render_template_string, send_from_directory
from flask_socketio import SocketIO, emit

# ─── CONFIG ──────────────────────────────────────────────────────────────────
ASSISTANT_NAME  = "Jarvis"
WAKE_WORDS      = ["jarvis", "hey jarvis", "ok jarvis"]
OLLAMA_MODEL    = "llama3"
OLLAMA_URL      = "http://localhost:11434/api/generate"
VOICE           = "Daniel"   # British male — closest to real Jarvis
VOICE_RATE      = 175        # words per minute (175 = calm, deliberate)
PORT            = 5001
REMINDERS_FILE  = os.path.expanduser("~/.jarvis_reminders.json")
# ─────────────────────────────────────────────────────────────────────────────

app     = Flask(__name__)
sio     = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
history = []
awake   = False
listening_thread = None

SYSTEM_PROMPT = f"""You are {ASSISTANT_NAME} — Just A Rather Very Intelligent System.
You are the personal AI assistant of the user, modelled after the Jarvis from Iron Man.
You speak in a calm, precise, formal British tone. You are highly intelligent, slightly dry in humour,
always composed, and address the user as "sir". You are never casual. You are never sloppy.
Example phrases you use: "Right away, sir.", "Of course.", "Certainly.", "As you wish.",
"I've taken care of that.", "Might I suggest...", "I'm afraid that...", "Shall I proceed?"

Always respond with a valid JSON object ONLY — no extra text:
{{
  "speak": "what to say out loud (short)",
  "action": "action_name",
  "params": {{}}
}}

Available actions:
- "chat"           params: {{}}
- "open_app"       params: {{"app": "Spotify"}}
- "web_search"     params: {{"query": "..."}}
- "get_weather"    params: {{"city": "Dubai"}}
- "get_stock"      params: {{"ticker": "AAPL"}}
- "set_timer"      params: {{"seconds": 300}}
- "get_time"       params: {{}}
- "get_date"       params: {{}}
- "set_volume"     params: {{"level": 50}}
- "open_folder"    params: {{"path": "~/Desktop"}}
- "screenshot"     params: {{}}
- "lock_screen"    params: {{}}
- "battery"        params: {{}}
- "joke"           params: {{}}
- "play_music"     params: {{"app": "spotify"}}   -- app: "spotify" or "music"
- "pause_music"    params: {{"app": "spotify"}}
- "next_track"     params: {{"app": "spotify"}}
- "prev_track"     params: {{"app": "spotify"}}
- "now_playing"    params: {{"app": "spotify"}}
- "set_reminder"   params: {{"text": "call mom", "minutes": 30}}
- "list_reminders" params: {{}}

Return ONLY valid JSON. "speak" must be short, natural speech.
"""

# ─── TTS ─────────────────────────────────────────────────────────────────────

def speak(text: str):
    clean = text.replace('"', '\\"').replace("'", "\\'")
    os.system(f'say -v {VOICE} -r {VOICE_RATE} "{clean}"')

def speak_async(text: str):
    threading.Thread(target=speak, args=(text,), daemon=True).start()

# ─── OLLAMA ──────────────────────────────────────────────────────────────────

def ask_ollama(user_message: str) -> dict:
    # Fast-path: handle simple commands without Ollama
    msg = user_message.lower().strip()
    if any(x in msg for x in ["what time", "current time", "the time"]):
        return {"speak": "", "action": "get_time", "params": {}}
    if any(x in msg for x in ["what day", "what date", "today's date", "the date"]):
        return {"speak": "", "action": "get_date", "params": {}}
    if "battery" in msg:
        return {"speak": "", "action": "battery", "params": {}}
    if "screenshot" in msg:
        return {"speak": "", "action": "screenshot", "params": {}}
    if "joke" in msg:
        return {"speak": "", "action": "joke", "params": {}}
    if any(x in msg for x in ["lock screen", "lock the screen"]):
        return {"speak": "", "action": "lock_screen", "params": {}}
    if any(x in msg for x in ["pause music", "stop music", "pause the music"]):
        return {"speak": "", "action": "pause_music", "params": {"app": "spotify"}}
    if any(x in msg for x in ["play music", "resume music", "play spotify"]):
        return {"speak": "", "action": "play_music", "params": {"app": "spotify"}}
    if any(x in msg for x in ["next track", "next song", "skip"]):
        return {"speak": "", "action": "next_track", "params": {"app": "spotify"}}
    if any(x in msg for x in ["previous track", "prev track", "go back"]):
        return {"speak": "", "action": "prev_track", "params": {"app": "spotify"}}
    if any(x in msg for x in ["what's playing", "now playing", "what is playing"]):
        return {"speak": "", "action": "now_playing", "params": {"app": "spotify"}}
    if any(x in msg for x in ["my reminders", "list reminders", "show reminders"]):
        return {"speak": "", "action": "list_reminders", "params": {}}

    context = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history[-8:]])
    prompt  = f"{context}\nUSER: {user_message}\nASSISTANT:"
    payload = {
        "model":   OLLAMA_MODEL,
        "prompt":  prompt,
        "system":  SYSTEM_PROMPT,
        "stream":  False,
        "format":  "json",
        "options": {"temperature": 0.7, "num_predict": 256}
    }
    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=30)
        r.raise_for_status()
        raw = r.json().get("response", "{}")
        # Try direct parse first
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass
        # Try extracting JSON block from response
        import re
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            return json.loads(match.group())
        # Fallback: treat as plain chat response
        return {"speak": raw.strip(), "action": "chat", "params": {}}
    except requests.exceptions.ConnectionError:
        return {"speak": "Ollama is not running. Start it with: ollama serve",
                "action": "chat", "params": {}}
    except Exception as e:
        return {"speak": f"Something went wrong: {str(e)}", "action": "chat", "params": {}}

# ─── SKILLS ──────────────────────────────────────────────────────────────────

def skill_open_app(app):
    subprocess.Popen(["open", "-a", app])
    return f"Opening {app}."

def skill_web_search(query):
    webbrowser.open(f"https://www.google.com/search?q={query.replace(' ', '+')}")
    return f"Searching for {query}."

def skill_get_weather(city):
    try:
        r = requests.get(f"https://wttr.in/{city.replace(' ', '+')}?format=3", timeout=5)
        return r.text.strip() if r.ok else f"Couldn't get weather for {city}."
    except Exception:
        return "Weather service unavailable."

def skill_get_stock(ticker):
    try:
        info  = yf.Ticker(ticker.upper()).fast_info
        price = round(info.last_price, 2)
        prev  = round(info.previous_close, 2)
        chg   = round(price - prev, 2)
        dir_  = "up" if chg >= 0 else "down"
        return f"{ticker.upper()} is at ${price}, {dir_} {abs(chg)} from yesterday."
    except Exception:
        return f"Couldn't fetch {ticker}."

def skill_set_timer(seconds):
    def _t(s):
        time.sleep(s)
        msg = f"Your {s}-second timer is done!"
        speak(msg)
        sio.emit("jarvis_message", {"text": msg, "type": "timer"})
        subprocess.run(["osascript", "-e",
            f'display notification "Timer done!" with title "{ASSISTANT_NAME}"'])
    threading.Thread(target=_t, args=(int(seconds),), daemon=True).start()
    m, s = divmod(int(seconds), 60)
    label = f"{m}m {s}s" if m else f"{s}s"
    return f"Timer set for {label}."

def skill_battery():
    out = subprocess.run(["pmset", "-g", "batt"], capture_output=True, text=True).stdout
    for line in out.split("\n"):
        if "%" in line:
            pct    = line.strip().split(";")[0].strip()
            status = line.strip().split(";")[1].strip() if ";" in line else ""
            return f"Battery is at {pct}, {status}."
    return "Couldn't read battery."

def skill_set_volume(level):
    os.system(f"osascript -e 'set volume output volume {max(0,min(100,int(level)))}'")
    return f"Volume set to {level}%."

def skill_screenshot():
    ts   = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    path = os.path.expanduser(f"~/Desktop/jarvis_{ts}.png")
    subprocess.run(["screencapture", "-x", path])
    return f"Screenshot saved to Desktop."

def skill_joke():
    jokes = [
        "Why do programmers prefer dark mode? Light attracts bugs.",
        "A SQL query walks into a bar and asks two tables: can I join you?",
        "Why do Java devs wear glasses? They don't C-sharp.",
        "I told my computer I needed a break. Now it won't stop sending me Kit-Kat ads.",
        "There are 10 kinds of people: those who understand binary, and those who don't.",
    ]
    return random.choice(jokes)

# ─── MUSIC CONTROL ───────────────────────────────────────────────────────────

def _applescript(script: str) -> str:
    r = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    return r.stdout.strip()

def _music_app_name(app: str) -> str:
    return "Spotify" if "spotify" in app.lower() else "Music"

def skill_play_music(app="spotify"):
    name = _music_app_name(app)
    _applescript(f'tell application "{name}" to play')
    return f"Playing music on {name}."

def skill_pause_music(app="spotify"):
    name = _music_app_name(app)
    _applescript(f'tell application "{name}" to pause')
    return f"Music paused."

def skill_next_track(app="spotify"):
    name = _music_app_name(app)
    _applescript(f'tell application "{name}" to next track')
    return f"Skipping to next track."

def skill_prev_track(app="spotify"):
    name = _music_app_name(app)
    _applescript(f'tell application "{name}" to previous track')
    return f"Going back to previous track."

def skill_now_playing(app="spotify"):
    name = _music_app_name(app)
    if name == "Spotify":
        track  = _applescript('tell application "Spotify" to name of current track')
        artist = _applescript('tell application "Spotify" to artist of current track')
    else:
        track  = _applescript('tell application "Music" to name of current track')
        artist = _applescript('tell application "Music" to artist of current track')
    if track:
        return f"Now playing: {track} by {artist}."
    return "Nothing is playing right now."

# ─── REMINDERS ───────────────────────────────────────────────────────────────

def load_reminders():
    if os.path.exists(REMINDERS_FILE):
        try:
            return json.load(open(REMINDERS_FILE))
        except Exception:
            return []
    return []

def save_reminders(reminders):
    json.dump(reminders, open(REMINDERS_FILE, "w"), indent=2)

def skill_set_reminder(text: str, minutes: int):
    reminders = load_reminders()
    fire_at   = (datetime.datetime.now() + datetime.timedelta(minutes=int(minutes))).isoformat()
    reminders.append({"text": text, "fire_at": fire_at, "done": False})
    save_reminders(reminders)
    return f"Reminder set: '{text}' in {minutes} minute{'s' if int(minutes) != 1 else ''}."

def skill_list_reminders():
    reminders = [r for r in load_reminders() if not r["done"]]
    if not reminders:
        return "You have no pending reminders."
    lines = []
    for r in reminders:
        dt  = datetime.datetime.fromisoformat(r["fire_at"])
        rel = dt - datetime.datetime.now()
        mins = int(rel.total_seconds() / 60)
        lines.append(f"• {r['text']} — in {max(0, mins)} min")
    return "Your reminders: " + ", ".join(lines)

def reminder_watcher():
    """Background thread that fires reminders."""
    while True:
        time.sleep(30)
        reminders = load_reminders()
        changed   = False
        now       = datetime.datetime.now()
        for r in reminders:
            if r["done"]:
                continue
            if datetime.datetime.fromisoformat(r["fire_at"]) <= now:
                r["done"] = True
                changed   = True
                msg       = f"Reminder: {r['text']}"
                speak_async(msg)
                sio.emit("jarvis_message", {"text": msg, "type": "reminder"})
                subprocess.run(["osascript", "-e",
                    f'display notification "{r["text"]}" with title "Jarvis Reminder"'])
        if changed:
            save_reminders(reminders)

# ─── DISPATCHER ──────────────────────────────────────────────────────────────

def dispatch(action: str, params: dict, fallback: str) -> str:
    a = action.lower()
    if a == "open_app":       return skill_open_app(params.get("app", "Finder"))
    if a == "web_search":     return skill_web_search(params.get("query", ""))
    if a == "get_weather":    return skill_get_weather(params.get("city", "Dubai"))
    if a == "get_stock":      return skill_get_stock(params.get("ticker", "AAPL"))
    if a == "set_timer":      return skill_set_timer(params.get("seconds", 60))
    if a == "get_time":       return f"It's {datetime.datetime.now().strftime('%I:%M %p')}."
    if a == "get_date":       return f"Today is {datetime.datetime.now().strftime('%A, %B %d, %Y')}."
    if a == "set_volume":     return skill_set_volume(params.get("level", 50))
    if a == "open_folder":
        p = os.path.expanduser(params.get("path", "~/Desktop"))
        subprocess.Popen(["open", p])
        return fallback or f"Opening {p}."
    if a == "screenshot":     return skill_screenshot()
    if a == "lock_screen":
        os.system("pmset displaysleepnow")
        return fallback or "Locking the screen."
    if a == "battery":        return skill_battery()
    if a == "joke":           return skill_joke()
    if a == "play_music":     return skill_play_music(params.get("app", "spotify"))
    if a == "pause_music":    return skill_pause_music(params.get("app", "spotify"))
    if a == "next_track":     return skill_next_track(params.get("app", "spotify"))
    if a == "prev_track":     return skill_prev_track(params.get("app", "spotify"))
    if a == "now_playing":    return skill_now_playing(params.get("app", "spotify"))
    if a == "set_reminder":   return skill_set_reminder(params.get("text", ""), params.get("minutes", 10))
    if a == "list_reminders": return skill_list_reminders()
    return fallback or "I'm not sure how to help with that."

# ─── PROCESS COMMAND ─────────────────────────────────────────────────────────

def process_command(command: str):
    """Process a command and emit result to all connected clients."""
    global history
    sio.emit("user_message",    {"text": command})
    sio.emit("jarvis_thinking", {"state": True})

    response   = ask_ollama(command)
    speak_text = response.get("speak", "")
    action     = response.get("action", "chat")
    params     = response.get("params", {})
    final_text = dispatch(action, params, speak_text)

    sio.emit("jarvis_thinking", {"state": False})
    sio.emit("jarvis_message",  {"text": final_text, "action": action})
    speak_async(final_text)

    history.append({"role": "user",      "content": command})
    history.append({"role": "assistant", "content": final_text})
    history = history[-20:]   # keep last 10 exchanges

# ─── VOICE LISTENER ──────────────────────────────────────────────────────────

recognizer = sr.Recognizer()
recognizer.energy_threshold      = 300
recognizer.dynamic_energy_threshold = True

def voice_listener():
    global awake
    print(f"[VOICE] Listening for wake word: 'Hey Jarvis'")
    while True:
        try:
            with sr.Microphone() as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.3)
                try:
                    audio = recognizer.listen(source, timeout=8, phrase_time_limit=10)
                except sr.WaitTimeoutError:
                    continue
            try:
                text = recognizer.recognize_google(audio).lower().strip()
            except (sr.UnknownValueError, sr.RequestError):
                continue

            if not awake:
                if any(w in text for w in WAKE_WORDS):
                    awake = True
                    sio.emit("wake_state", {"awake": True})
                    speak_async("Yes?")
                    print("[VOICE] Awake!")
            else:
                if any(x in text for x in ["go to sleep", "sleep", "stand by"]):
                    awake = False
                    sio.emit("wake_state", {"awake": False})
                    speak_async("Standing by.")
                    continue
                print(f"[VOICE] Command: {text}")
                sio.emit("wake_state", {"awake": True})
                threading.Thread(target=process_command, args=(text,), daemon=True).start()
                awake = False  # go back to wake-word mode after each command
        except Exception as e:
            print(f"[VOICE ERROR] {e}")
            time.sleep(1)

# ─── SOCKET EVENTS ───────────────────────────────────────────────────────────

@sio.on("text_command")
def handle_text(data):
    command = data.get("command", "").strip()
    if command:
        threading.Thread(target=process_command, args=(command,), daemon=True).start()

@sio.on("connect")
def on_connect():
    emit("jarvis_message", {"text": f"Online. Say 'Hey Jarvis' or type below.", "type": "system"})
    emit("wake_state", {"awake": awake})

# ─── HTML UI (served inline) ──────────────────────────────────────────────────

HTML = open(os.path.join(os.path.dirname(__file__), "jarvis_ui.html")).read()

@app.route("/")
def index():
    return HTML

# ─── MAIN ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"""
╔══════════════════════════════════════════════════╗
║     J A R V I S  Server — http://localhost:{PORT}  ║
╚══════════════════════════════════════════════════╝""")

    # Start reminder watcher
    threading.Thread(target=reminder_watcher, daemon=True).start()

    # Start voice listener
    threading.Thread(target=voice_listener, daemon=True).start()

    # Open browser
    threading.Timer(1.5, lambda: webbrowser.open(f"http://localhost:{PORT}")).start()

    speak_async(f"{ASSISTANT_NAME} is online.")
    sio.run(app, host="0.0.0.0", port=PORT, debug=False, allow_unsafe_werkzeug=True)
