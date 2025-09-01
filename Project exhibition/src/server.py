# server.py - serves static UI, REST endpoints for status/logs/enroll/verify, and runs background loops.
import uvicorn
from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from threading import Thread
import time, json, os
from pathlib import Path
from features import load_logs, aggregate_window
from model import train_and_save, load_model
from utils import append_event
from detector import evaluate_once, state, handle_verification_result
from config import LOG_PATH, MODEL_PATH

app = FastAPI()
# serve static UI folder
static_dir = Path(__file__).resolve().parent.parent / "static"
# app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Serve main page
@app.get("/", response_class=HTMLResponse)
async def index():
    return FileResponse(Path(__file__).parent.parent / "UI" / "index2.html")

# Endpoint: status (last score, last_status)
@app.get("/api/status")
def api_status():
    return JSONResponse(state)

# Endpoint: recent logs (last N)
@app.get("/api/logs")
def api_logs(n: int = 40):
    df = load_logs(limit=n)
    return JSONResponse(json.loads(df.to_json(orient="records", date_format="iso")) if not df.empty else [])

# Endpoint: recent events
@app.get("/api/events")
def api_events():
    p = Path("data/events.jsonl")
    if not p.exists():
        return JSONResponse([])
    rows = []
    with open(p, "r", encoding="utf-8") as f:
        for L in f:
            try:
                rows.append(json.loads(L))
            except:
                pass
    return JSONResponse(rows[-200:])

# Endpoint: train model (trains from current logs)
@app.post("/api/train")
def api_train():
    df = load_logs(limit=2000)
    if df.empty:
        return JSONResponse({"ok": False, "msg": "No logs to train from."})
    # build feature dataset: compute rolling aggregates across the log and train on those
    from features import aggregate_window
    Xs = []
    for i in range(6, min(len(df), 500)):
        window = aggregate_window(df.iloc[:i], window=6)
        if window is not None:
            Xs.append(window.iloc[0].to_dict())
    import pandas as pd
    Xdf = pd.DataFrame(Xs)
    model = train_and_save(Xdf)
    return JSONResponse({"ok": True, "msg": "Model trained."})

# Typing enrollment: client posts samples (list of timings arrays)
@app.post("/api/enroll")
async def api_enroll(payload: dict):
    # payload: {"samples": [[t1,t2,...], ...], "sentence": "..." }
    Path("data").mkdir(parents=True, exist_ok=True)
    with open(Path("data")/"typing_profile.json", "w", encoding="utf-8") as f:
        json.dump(payload, f)
    append_event({"timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"), "type":"enroll"})
    return JSONResponse({"ok": True})

# Verification: client posts a timing sample (single)
@app.post("/api/verify")
async def api_verify(payload: dict):
    # payload: {"timings": [...], "sentence": "..."}
    p = Path("data/typing_profile.json")
    if not p.exists():
        return JSONResponse({"ok": False, "msg": "No typing profile enrolled."})
    with open(p, "r", encoding="utf-8") as f:
        prof = json.load(f)
    ref_med = prof.get("samples_median")
    # Accept older format
    if ref_med is None:
        ref_med = prof.get("samples")
    candidate = payload.get("timings", [])
    # simple distance with padding
    import math
    L = max(len(ref_med), len(candidate))
    def pad(v):
        if len(v) < L and len(v) > 0:
            v = v + [sum(v)/len(v)]*(L-len(v))
        return v[:L]
    a = pad(candidate)
    b = pad(ref_med)
    dist = math.sqrt(sum((ai-bi)**2 for ai,bi in zip(a,b))) if len(a)>0 else float('inf')
    # tolerance: relative to median speed
    tol = (sum(abs(x) for x in b)/len(b))*0.7 + 0.05
    ok = dist < tol
    handle_verification_result(ok)
    append_event({"timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"), "type":"verify", "ok": ok, "dist": dist, "tol": tol})
    return JSONResponse({"ok": bool(ok), "dist": dist, "tol": tol})

# Background loop to periodically evaluate behaviour
def background_detector_loop():
    print("[server] background detector loop started")
    while True:
        try:
            ev = evaluate_once()
            # we just update state; UI will poll /api/status
        except Exception as e:
            append_event({"timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"), "type":"error", "msg": str(e)})
        time.sleep(5)

@app.on_event("startup")
def startup_event():
    # start detector background thread
    t = Thread(target=background_detector_loop, daemon=True)
    t.start()

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=False)
