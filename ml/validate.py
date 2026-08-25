"""Sanity-checks the exported ONNX model against fresh, unseen sentences."""
import json
import re

import numpy as np
import onnxruntime as ort

with open("frontend/public/models/sentiment/vocab.json", encoding="utf-8") as f:
    meta = json.load(f)
classes = meta["classes"]
vocab = {w: i for i, w in enumerate(meta["vocab"])}

session = ort.InferenceSession("frontend/public/models/sentiment/model.onnx")


def vectorize(text):
    x = np.zeros((1, len(vocab)), dtype=np.float32)
    for tok in re.split(r"\W+", text.lower()):
        j = vocab.get(tok)
        if j is not None:
            x[0, j] += 1.0
    return x


samples = [
    "The new dashboard feels incredibly smooth and reliable.",
    "This deployment was an absolute disaster, everything broke.",
    "The block was produced at the expected interval.",
    "I'm not sure how I feel about the redesign, it's fine I guess.",
    "The support team was slow but very helpful in the end.",
]

for text in samples:
    probs = session.run(["probabilities"], {"input": vectorize(text)})[0][0]
    pred = classes[int(np.argmax(probs))]
    dist = ", ".join(f"{c}={p:.2f}" for c, p in zip(classes, probs))
    print(f"[{pred:8s}] {text}\n           {dist}")
