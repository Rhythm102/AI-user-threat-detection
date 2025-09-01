import pandas as pd
from features import load_features
from model import train_model, save_model

if __name__ == "__main__":
    features = load_features(window=1000)
    model = train_model(features)
    save_model(model)
    print("[*] Model trained and saved.")
