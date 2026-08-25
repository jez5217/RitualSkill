"""Trains the LLM Chat demo's intent classifier -- same approach as train.py
(numpy softmax regression over a bag-of-words vocabulary, exported to ONNX),
applied to a different task: routing a chat message to GREETING / RITUAL /
QUESTION / OTHER instead of picking a canned reply via substring matching.
"""
import json
import os
import re
from collections import Counter

import numpy as np
import onnx
from onnx import TensorProto, helper

CLASSES = ["GREETING", "OTHER", "QUESTION", "RITUAL"]
LABEL_TO_IDX = {label: i for i, label in enumerate(CLASSES)}

VOCAB_SIZE = 300
MIN_FREQ = 1  # dataset is small; keep every word that appears at all
EPOCHS = 500
LR = 0.5
L2 = 1e-3

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "is", "was", "were", "are", "be",
    "been", "it", "its", "this", "that", "of", "to", "in", "on", "for", "with",
    "at", "as", "by", "from", "has", "had", "have", "you", "i", "we", "they",
    "do", "does", "my",
}


def tokenize(text: str):
    return [t for t in re.split(r"\W+", text.lower()) if t]


def load_jsonl(path: str):
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def build_vocab(rows):
    counts = Counter()
    for r in rows:
        counts.update(set(tokenize(r["text"])))
    vocab_words = [w for w, c in counts.items() if c >= MIN_FREQ and w not in STOPWORDS]
    vocab_words.sort(key=lambda w: (-counts[w], w))
    vocab_words = vocab_words[:VOCAB_SIZE]
    return {w: i for i, w in enumerate(vocab_words)}


def vectorize(rows, vocab):
    X = np.zeros((len(rows), len(vocab)), dtype=np.float32)
    y = np.zeros(len(rows), dtype=np.int64)
    for i, r in enumerate(rows):
        for tok in tokenize(r["text"]):
            j = vocab.get(tok)
            if j is not None:
                X[i, j] += 1.0
        y[i] = LABEL_TO_IDX[r["label"]]
    return X, y


def softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    ez = np.exp(z)
    return ez / ez.sum(axis=1, keepdims=True)


def train(X, y, n_classes, epochs=EPOCHS, lr=LR, l2=L2):
    n, v = X.shape
    W = np.zeros((v, n_classes), dtype=np.float64)
    b = np.zeros(n_classes, dtype=np.float64)
    Y = np.eye(n_classes)[y]
    for _ in range(epochs):
        logits = X @ W + b
        probs = softmax(logits)
        grad_logits = (probs - Y) / n
        grad_W = X.T @ grad_logits + l2 * W
        grad_b = grad_logits.sum(axis=0)
        W -= lr * grad_W
        b -= lr * grad_b
    return W.astype(np.float32), b.astype(np.float32)


def accuracy(X, y, W, b):
    preds = (X @ W + b).argmax(axis=1)
    return float((preds == y).mean())


def export_onnx(W, b, out_path):
    vocab_size, n_classes = W.shape
    input_tensor = helper.make_tensor_value_info("input", TensorProto.FLOAT, [1, vocab_size])
    output_tensor = helper.make_tensor_value_info("probabilities", TensorProto.FLOAT, [1, n_classes])
    w_init = helper.make_tensor("W", TensorProto.FLOAT, W.shape, W.flatten().tolist())
    b_init = helper.make_tensor("b", TensorProto.FLOAT, b.shape, b.flatten().tolist())
    gemm_node = helper.make_node("Gemm", inputs=["input", "W", "b"], outputs=["logits"], alpha=1.0, beta=1.0, transB=0)
    softmax_node = helper.make_node("Softmax", inputs=["logits"], outputs=["probabilities"], axis=1)
    graph = helper.make_graph(
        [gemm_node, softmax_node], "intent_linear", [input_tensor], [output_tensor], initializer=[w_init, b_init]
    )
    model = helper.make_model(graph, producer_name="ritual-dapp-ml", opset_imports=[helper.make_opsetid("", 13)])
    model.ir_version = 8
    onnx.checker.check_model(model)
    onnx.save(model, out_path)


def main():
    train_rows = load_jsonl("ml/data/intent_train.jsonl")
    val_rows = load_jsonl("ml/data/intent_val.jsonl")

    vocab = build_vocab(train_rows)
    X_train, y_train = vectorize(train_rows, vocab)
    X_val, y_val = vectorize(val_rows, vocab)

    W, b = train(X_train, y_train, len(CLASSES))

    print(f"vocab size: {len(vocab)}")
    print(f"train accuracy: {accuracy(X_train, y_train, W, b):.3f}")
    print(f"val accuracy:   {accuracy(X_val, y_val, W, b):.3f}")

    out_dir = "frontend/public/models/intent"
    os.makedirs(out_dir, exist_ok=True)
    export_onnx(W, b, f"{out_dir}/model.onnx")

    vocab_words_in_order = sorted(vocab, key=lambda w: vocab[w])
    with open(f"{out_dir}/vocab.json", "w", encoding="utf-8") as f:
        json.dump({"classes": CLASSES, "vocab": vocab_words_in_order}, f)

    print(f"wrote {out_dir}/model.onnx and {out_dir}/vocab.json")


if __name__ == "__main__":
    main()
