# Sentiment model — training pipeline

A small, genuinely trained model backing the Classical Inference (`0x0800`)
demo on `/think`. Replaces what used to be a hardcoded +1/-1 wordlist with a
real softmax-regression classifier exported to ONNX and run client-side via
`onnxruntime-web` (WASM) — see `frontend/lib/sentimentModel.ts`.

## Model

Bag-of-words counts over a ~140-word vocabulary → linear layer (`Gemm`) →
`Softmax` over three classes (`NEGATIVE` / `NEUTRAL` / `POSITIVE`). Trained
with plain numpy gradient descent, no ML framework dependency beyond
`numpy` + `onnx` for the export.

## Files

| File | Purpose |
|---|---|
| `generate_dataset.py` | Builds `data/train.jsonl` / `data/val.jsonl` from templates + word banks (deterministic, fixed seed) |
| `train.py` | Trains the classifier, prints train/val accuracy, writes `frontend/public/models/sentiment/{model.onnx,vocab.json}` |
| `validate.py` | Sanity-checks the exported ONNX file against a few hand-written unseen sentences via `onnxruntime` |
| `data/*.jsonl` | The actual labeled dataset, one `{"text", "label"}` per line — committed so the training data is inspectable, not just the weights |

## Retraining

```bash
python -m venv .ml-venv
# Windows:
.ml-venv/Scripts/pip install numpy onnx onnxruntime
# macOS/Linux:
.ml-venv/bin/pip install numpy onnx onnxruntime

# from the repo root:
.ml-venv/Scripts/python ml/generate_dataset.py   # regenerate the dataset (edit word banks/templates first to change it)
.ml-venv/Scripts/python ml/train.py              # retrain + re-export model.onnx + vocab.json
.ml-venv/Scripts/python ml/validate.py            # spot-check on unseen sentences
```

`vocab.json` also carries the learned per-word, per-class weights (not just
the vocabulary list) — the frontend uses these to highlight which words
actually drove a prediction, using the same coefficients the ONNX graph's
`Gemm` node computes with, not an approximation.

## Extending this for the community

This is intentionally the simplest model that's still *real*: no external
dataset download, no GPU, no framework lock-in — anyone can read
`generate_dataset.py`, understand exactly what the model was trained on, and
retrain it in under a second on a laptop. A few natural next steps if someone
wants to take this further:

- Swap in a different/larger labeled dataset in `data/*.jsonl` (same schema)
  and rerun `train.py` — no code changes needed for a straight sentiment task.
- Add classes by extending `CLASSES` in `train.py` and adding matching labels
  to the dataset.
- Swap the linear model for something richer (e.g. an embedding + small MLP)
  — the ONNX export step and the frontend's `runSentiment()` contract
  (`{input: float32[1,V]} → {probabilities: float32[1,C]}`) stay the same as
  long as the new graph keeps that same input/output shape.
- The same export pattern (train in Python → ONNX → `onnxruntime-web` in the
  browser) generalizes to any other classical-inference precompile demo on
  this site — this is the reference implementation to copy.
