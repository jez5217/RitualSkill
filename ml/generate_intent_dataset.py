"""Generates a labeled dataset for the LLM Chat demo's intent classifier.

Replaces demoLlm.ts's `.includes("ritual")` / `.includes("hello")` / `.includes("?")`
substring matching with a real trained model that picks which canned-response
bucket a chat message should route to: GREETING, RITUAL, QUESTION, or OTHER.
"""
import json
import random

random.seed(11)

GREETINGS = [
    "hi", "hello", "hey", "hey there", "yo", "hiya", "good morning", "good evening",
    "sup", "howdy", "hi there", "hello there", "morning", "hey folks", "greetings",
    "hi, how are you", "hello agent", "hey, anyone home", "yo whats up",
]

RITUAL_TOPICS = [
    "ritual", "ritual chain", "ritual team", "ritual foundation", "the ritual gateway",
    "ritual's precompiles", "ritual's TEE model", "ritual's tokenomics", "ritual testnet",
    "the sovereign agent precompile", "ritual's LLM precompile", "how ritual works",
    "ritual's roadmap", "who built ritual", "ritual's mainnet launch", "ritual docs",
]
RITUAL_TEMPLATES = [
    "what is {topic}?",
    "tell me about {topic}",
    "how does {topic} work?",
    "can you explain {topic}",
    "what's the deal with {topic}",
    "give me an overview of {topic}",
    "why should I care about {topic}",
    "is {topic} live yet?",
    "{topic}",
]

GENERAL_QUESTION_TOPICS = [
    "the weather today", "how to reset my password", "why the sky is blue",
    "how to center a div in CSS", "the capital of France", "how photosynthesis works",
    "how to debug a null pointer exception", "what time zone I'm in",
    "how compound interest works", "the best way to learn Python",
    "how to fix a flat tire", "what year the moon landing happened",
    "how to make sourdough bread", "why my code keeps crashing",
    "how neural networks learn", "what a REST API is",
]
QUESTION_TEMPLATES = [
    "what is {topic}?",
    "how does {topic} work?",
    "can you help me with {topic}?",
    "do you know {topic}?",
    "explain {topic} to me",
    "why is {topic} the way it is?",
]

OTHER_STATEMENTS = [
    "I like pizza.", "testing 123", "asdfgh", "run the deployment script",
    "print hello world", "this is a test message", "nice weather we're having",
    "just checking in", "ok thanks", "sounds good", "that makes sense",
    "I'll try that later", "my cat is sleeping on my keyboard", "brb",
    "let's schedule a call tomorrow", "here is my report for the week",
    "the meeting got moved to 3pm", "I already fixed that bug",
    "please ignore my last message", "sending you the file now",
    "that's a great point", "I disagree with that approach",
    "let me think about it", "here's what I found so far",
    "the server restarted on its own", "invoice attached below",
]

rows = []


def add(text, label):
    rows.append({"text": text, "label": label})


for g in GREETINGS:
    add(g, "GREETING")
    add(g.capitalize() + "!", "GREETING")

for topic in RITUAL_TOPICS:
    for t in random.sample(RITUAL_TEMPLATES, 4):
        add(t.format(topic=topic), "RITUAL")

for topic in GENERAL_QUESTION_TOPICS:
    for t in random.sample(QUESTION_TEMPLATES, 4):
        add(t.format(topic=topic), "QUESTION")

for s in OTHER_STATEMENTS:
    add(s, "OTHER")
    add(s.lower(), "OTHER")

# A handful of hand-written edge cases to sharpen the boundary between
# RITUAL and general QUESTION (both are phrased as questions; only the
# subject differs), which is the pair most likely to be confused.
EXTRA = [
    ("what does ritual chain do differently from other L1s?", "RITUAL"),
    ("how is ritual chain making it possible?", "RITUAL"),
    ("what does it mean to be a truly autonomous agent on ritual?", "RITUAL"),
    ("who is on the ritual team?", "RITUAL"),
    ("what precompiles does ritual ship?", "RITUAL"),
    ("is there a ritual discord?", "RITUAL"),
    ("what does it mean to be a truly autonomous agent?", "QUESTION"),
    ("what makes an agent autonomous?", "QUESTION"),
    ("who is on your team?", "QUESTION"),
    ("what's a discord server?", "QUESTION"),
    ("hey, what is ritual?", "RITUAL"),
    ("hi there, tell me about ritual", "RITUAL"),
]
for text, label in EXTRA:
    add(text, label)

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

with open("ml/data/intent_train.jsonl", "w", encoding="utf-8") as f:
    for r in train:
        f.write(json.dumps(r) + "\n")

with open("ml/data/intent_val.jsonl", "w", encoding="utf-8") as f:
    for r in val:
        f.write(json.dumps(r) + "\n")

from collections import Counter

print("train:", len(train), Counter(r["label"] for r in train))
print("val:", len(val), Counter(r["label"] for r in val))
