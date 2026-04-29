from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from flask import Flask, jsonify, redirect, request, send_file

BASE_DIR = Path(__file__).resolve().parent
HTML_FILE = BASE_DIR / "networking_exercise.html"
PROGRESS_FILE = BASE_DIR / "progress.json"

app = Flask(__name__)

DEFAULT_PROGRESS: dict[str, Any] = {
    "quizzesSolved": 0,
    "bestScore": 0,
    "lastScenario": "",
    "lastStage": "arp",
}

MODES = [
    {"key": "arp", "label": "ARP solo", "description": "Aprende cuándo se usa ARP y cuándo no."},
    {"key": "arp-dns", "label": "ARP + DNS", "description": "Añade resolución de nombres a la práctica."},
    {"key": "arp-dns-dhcp", "label": "ARP + DNS + DHCP", "description": "Incluye obtención de configuración IP."},
    {"key": "full", "label": "ARP + DNS + DHCP + servidor", "description": "Flujo completo con TCP/HTTP y cierre."},
]


def read_progress() -> dict[str, Any]:
    if not PROGRESS_FILE.exists():
        return DEFAULT_PROGRESS.copy()
    try:
        data = json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
        return {**DEFAULT_PROGRESS, **data}
    except json.JSONDecodeError:
        return DEFAULT_PROGRESS.copy()


def write_progress(payload: dict[str, Any]) -> dict[str, Any]:
    state = {**read_progress(), **payload}
    PROGRESS_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")
    return state


@app.get("/")
def index() -> Any:
    return send_file(HTML_FILE)


@app.get("/arp")
def arp_mode() -> Any:
    return redirect("/?mode=arp", code=302)


@app.get("/arp-dns")
def arp_dns_mode() -> Any:
    return redirect("/?mode=arp-dns", code=302)


@app.get("/dhcp")
def dhcp_mode() -> Any:
    return redirect("/?mode=arp-dns-dhcp", code=302)


@app.get("/full")
def full_mode() -> Any:
    return redirect("/?mode=full", code=302)


@app.get("/api/modes")
def api_modes() -> Any:
    return jsonify(MODES)


@app.get("/api/progress")
def api_progress_get() -> Any:
    return jsonify(read_progress())


@app.post("/api/progress")
def api_progress_post() -> Any:
    payload = request.get_json(silent=True) or {}
    return jsonify(write_progress(payload))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
