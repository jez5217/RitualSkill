"""Generates a labeled sentiment dataset for the /think ONNX demo model.

Sentences are built from templates + word banks (dapp/blockchain-flavored
subjects crossed with generic sentiment vocabulary), then deduplicated and
shuffled. This keeps the corpus small but genuinely varied: no single word
is a hard giveaway on its own the way the old hardcoded wordlist was, so the
classifier has to learn real weights from co-occurrence across templates.
"""
import json
import random

random.seed(7)

SUBJECTS = [
    "the wallet connection", "the research agent", "the chat interface",
    "the on-chain callback", "the inference precompile", "the smart contract",
    "the transaction flow", "the UI", "the sync process", "the deployment",
    "the API response", "the checkout flow", "the dashboard", "the executor",
    "the encryption step", "the scheduler", "the passkey login", "the block explorer",
    "the gas estimate", "the callback delivery", "the model output", "the demo mode",
]

POS_ADJ = [
    "fast", "secure", "reliable", "smooth", "delightful", "impressive",
    "excellent", "amazing", "great", "wonderful", "trustworthy", "efficient",
    "elegant", "robust", "seamless", "intuitive", "solid", "polished",
]
NEG_ADJ = [
    "slow", "broken", "buggy", "insecure", "frustrating", "confusing",
    "terrible", "awful", "unreliable", "clunky", "laggy", "disappointing",
    "fragile", "sketchy", "unstable", "messy", "flaky", "painful",
]
NEUTRAL_ADJ = [
    "unchanged", "scheduled", "pending", "documented", "default", "standard",
    "identical", "ordinary", "typical", "unmodified",
]

POS_TEMPLATES = [
    "{subject} feels {adj} today.",
    "I love how {adj} {subject} is.",
    "{subject} was surprisingly {adj}.",
    "Great news, {subject} is now {adj}.",
    "Honestly {subject} has been {adj} all week.",
    "{subject} works great, really {adj}.",
    "I'm impressed, {subject} turned out {adj}.",
    "{subject} is {adj} and I'd recommend it.",
]
NEG_TEMPLATES = [
    "{subject} feels {adj} today.",
    "I hate how {adj} {subject} is.",
    "{subject} was surprisingly {adj}.",
    "Bad news, {subject} is now {adj}.",
    "Honestly {subject} has been {adj} all week.",
    "{subject} doesn't work, it's {adj}.",
    "I'm frustrated, {subject} turned out {adj}.",
    "{subject} is {adj} and I'd avoid it.",
]
NEUTRAL_TEMPLATES = [
    "{subject} is {adj} for this release.",
    "{subject} remains {adj} since the last update.",
    "The status of {subject} is {adj}.",
    "{subject} follows the {adj} configuration.",
]
NEUTRAL_FACTS = [
    "The block was produced at the expected interval.",
    "The transaction hash starts with 0x.",
    "The contract exposes eleven public functions.",
    "The precompile address is 0x0800.",
    "The meeting is scheduled for three o'clock.",
    "The package arrived on Tuesday.",
    "The report was generated at midnight.",
    "The config file lists three environment variables.",
    "The test suite has eleven passing cases.",
    "The README describes the project layout.",
    "The deploy script reads the RPC URL from the environment.",
    "The frontend lives in a separate directory from the contracts.",
    "The demo mode flag defaults to true.",
    "The wallet balance is denominated in the native token.",
    "The callback stores the result on chain.",
]

rows = []


def add(text, label):
    rows.append({"text": text, "label": label})


for subject in SUBJECTS:
    for adj in POS_ADJ:
        t = random.choice(POS_TEMPLATES)
        add(t.format(subject=subject.capitalize() if t.startswith("{subject}") else subject, adj=adj), "POSITIVE")
    for adj in NEG_ADJ:
        t = random.choice(NEG_TEMPLATES)
        add(t.format(subject=subject.capitalize() if t.startswith("{subject}") else subject, adj=adj), "NEGATIVE")
    for adj in NEUTRAL_ADJ:
        t = random.choice(NEUTRAL_TEMPLATES)
        add(t.format(subject=subject.capitalize() if t.startswith("{subject}") else subject, adj=adj), "NEUTRAL")

for fact in NEUTRAL_FACTS:
    add(fact, "NEUTRAL")
    add(fact, "NEUTRAL")  # light upweight so NEUTRAL isn't starved relative to templated rows

# Extra hand-written mixed/edge examples for a bit of realism at the tails.
EXTRA = [
    ("Ritual makes on-chain AI feel fast and secure.", "POSITIVE"),
    ("The checkout kept crashing and the whole flow felt broken.", "NEGATIVE"),
    ("The UI is great but the sync was really slow and buggy.", "NEGATIVE"),
    ("Support was slow to respond but eventually fixed the issue nicely.", "POSITIVE"),
    ("Not bad, but not great either, just an average experience.", "NEUTRAL"),
    ("The agent returned a clear and accurate research report.", "POSITIVE"),
    ("The executor timed out twice before finally settling.", "NEGATIVE"),
    ("The passkey flow signed in without any friction at all.", "POSITIVE"),
    ("Gas estimates were wildly off and the transaction failed.", "NEGATIVE"),
    ("The scheduler fired on time, exactly as configured.", "NEUTRAL"),
    ("This deployment was a total disaster, everything crashed.", "NEGATIVE"),
    ("What a catastrophe, the whole migration failed overnight.", "NEGATIVE"),
    ("Dealing with this integration has been an absolute nightmare.", "NEGATIVE"),
    ("The rollout crashed twice before anyone noticed the failure.", "NEGATIVE"),
    ("The API kept failing and nothing about it made sense.", "NEGATIVE"),
    ("Everything about this release just fell apart immediately.", "NEGATIVE"),
    ("The build failed again, this pipeline is a disaster.", "NEGATIVE"),
    ("I'm thrilled with how this feature turned out.", "POSITIVE"),
    ("The team is delighted with the fantastic new results.", "POSITIVE"),
    ("This update is flawless, everything just works perfectly.", "POSITIVE"),
    ("The onboarding experience was stellar from start to finish.", "POSITIVE"),
    ("Superb work on this release, truly a pleasure to use.", "POSITIVE"),
    ("The migration went perfectly, not a single hiccup.", "POSITIVE"),
    ("This is a fantastic improvement over the previous version.", "POSITIVE"),
    ("The invoice was generated at the start of the month.", "NEUTRAL"),
    ("The checkout kept crashing and the whole flow felt broken.", "NEGATIVE"),
    ("The sync kept failing and the whole app felt unstable.", "NEGATIVE"),
    ("The wallet connection kept crashing and felt completely broken.", "NEGATIVE"),
    ("The dashboard kept glitching and the whole session felt frustrating.", "NEGATIVE"),
    ("The onboarding kept stalling but the whole flow still felt promising.", "NEUTRAL"),
    ("The server restarted according to the usual maintenance window.", "NEUTRAL"),
    ("The changelog lists four updates for this version.", "NEUTRAL"),
    ("The ticket was assigned to the on-call engineer.", "NEUTRAL"),
]
for text, label in EXTRA:
    add(text, label)

# Dedupe while preserving a stable order, then shuffle.
seen = set()
deduped = []
for r in rows:
    key = (r["text"], r["label"])
    if key in seen:
        continue
    seen.add(key)
    deduped.append(r)

random.shuffle(deduped)

n_val = max(1, len(deduped) // 8)
val = deduped[:n_val]
train = deduped[n_val:]

with open("ml/data/train.jsonl", "w", encoding="utf-8") as f:
    for r in train:
        f.write(json.dumps(r) + "\n")

with open("ml/data/val.jsonl", "w", encoding="utf-8") as f:
    for r in val:
        f.write(json.dumps(r) + "\n")

from collections import Counter

print("train:", len(train), Counter(r["label"] for r in train))
print("val:", len(val), Counter(r["label"] for r in val))
