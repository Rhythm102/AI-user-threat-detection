# features.py - load logs, aggregate a short window into a feature vector

import json
import pandas as pd
from pathlib import Path
from config import LOG_PATH, ROLLING_WINDOW

FEATURE_COLS = ["hour", "weekday", "process_count", "cpu_percent", "mem_percent"]

def load_logs(limit=None):
    p = Path(LOG_PATH)
    if not p.exists():
        return pd.DataFrame(columns=FEATURE_COLS + ["timestamp"])
    rows = []
    with open(p, "r", encoding="utf-8") as f:
        for line in f:
            try:
                rows.append(json.loads(line))
            except Exception:
                pass
    df = pd.DataFrame(rows)
    if limit:
        df = df.tail(limit)
    return df

def aggregate_window(df, window=ROLLING_WINDOW):
    if df is None or df.empty:
        return None
    tail = df.tail(window)
    agg = {}
    for col in ["process_count","cpu_percent","mem_percent","hour","weekday"]:
        agg[f"{col}_mean"] = float(tail[col].mean())
        agg[f"{col}_std"]  = float(tail[col].std() or 0.0)
        agg[f"{col}_min"]  = float(tail[col].min())
        agg[f"{col}_max"]  = float(tail[col].max())
    # return as single-row DataFrame for model
    return pd.DataFrame([agg])
