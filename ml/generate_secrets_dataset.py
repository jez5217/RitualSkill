"""Generates a labeled dataset for the new Secrets-page classifier.

Ties directly into a real field on two live precompiles: HTTP (0x0801) and
LLM (0x0802) both take a `piiEnabled` bool, and the Secrets page's whole
point is deciding what needs ECIES encryption before it goes on-chain. This
dataset trains a classifier to flag text that looks like it discloses a
secret/API-key/PII versus text that's safe to send in plaintext -- a lexical
"should this be encrypted?" classifier, not a regex entity extractor (a
bag-of-words model can't reliably parse exact email/phone/SSN structure, but
it's well-suited to recognizing the *vocabulary* around disclosing one).
"""
import json
import random

random.seed(23)

API_KEY_TEMPLATES = [
    "sk-{a}{b}{c}{d}",
    "sk-proj-{a}{b}{c}",
    "pk_live_{a}{b}{c}",
    "AKIA{a}{b}{c}",
    "ghp_{a}{b}{c}{d}",
    "Bearer {a}{b}{c}",
    "eyJ{a}.{b}.{c}",
]
SECRET_SENTENCES = [
    "here's my API key: {key}",
    "my api key is {key}",
    "API_KEY={key}",
    "OPENAI_API_KEY={key}",
    "use this token: {key}",
    "auth token: {key}",
    "the secret key is {key}",
    "password: {key}",
    "my password is {key}",
    "client secret: {key}",
    "set the env var to {key}",
    "paste this into your .env file: {key}",
    "this is my private key {key}",
    "don't share this key: {key}",
    "rotate this key after use: {key}",
]

PII_SENTENCES = [
    "my email is {name}@{domain}.com",
    "contact me at {name}@{domain}.com",
    "reach out to {name}@{domain}.com if you need anything",
    "you can email {name} at {name}@{domain}.com",
    "call me at 555-{d3}-{d4}",
    "my phone number is 555-{d3}-{d4}",
    "text me at (555) {d3}-{d4}",
    "my social security number is {d3}-{d2}-{d4}",
    "ssn: {d3}-{d2}-{d4}",
    "my credit card number is 4111 1111 1111 {d4}",
    "card number 4111-1111-1111-{d4}",
    "here's my home address: {num} Maple Street, Springfield",
    "I live at {num} Oak Avenue, apartment {num2}",
    "my date of birth is 03/14/1990",
    "my full name is {name} {name2} and my address is {num} Elm Street",
]

NAMES = ["john", "sarah", "mike", "priya", "wei", "fatima", "carlos", "emma", "liam", "noor"]
DOMAINS = ["gmail", "yahoo", "outlook", "example", "protonmail", "company"]

SAFE_STATEMENTS = [
    "I like pizza.", "testing 123", "run the deployment script",
    "print hello world", "this is a test message", "nice weather we're having",
    "just checking in", "ok thanks", "sounds good", "that makes sense",
    "I'll try that later", "my cat is sleeping on my keyboard", "brb",
    "let's schedule a call tomorrow", "here is my report for the week",
    "the meeting got moved to 3pm", "I already fixed that bug",
    "please ignore my last message", "sending you the file now",
    "that's a great point", "I disagree with that approach",
    "let me think about it", "here's what I found so far",
    "the server restarted on its own", "invoice attached below",
    "the weather today is sunny", "how to center a div in CSS",
    "the capital of France is Paris", "how photosynthesis works",
    "how to debug a null pointer exception", "what time zone am I in",
    "how compound interest works", "the best way to learn Python",
    "how to fix a flat tire", "what year the moon landing happened",
    "how to make sourdough bread", "why does my code keep crashing",
    "how neural networks learn", "what a REST API is",
    "deploy the contract to testnet", "the build passed all tests",
    "can you review my pull request", "the response status was 200",
    "the function returns a promise", "I refactored the login page",
    "the chart shows steady growth", "let's meet in the lobby at noon",
    "the coffee machine is broken again", "traffic was bad this morning",
    "the demo went well today", "I updated the README",
]


def add(rows, text, label):
    rows.append({"text": text, "label": label})


def gen_key():
    letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return "".join(random.choice(letters) for _ in range(random.choice([8, 12, 16])))


def rand_digits(n):
    return "".join(random.choice("0123456789") for _ in range(n))


rows = []

for _ in range(90):
    tmpl = random.choice(API_KEY_TEMPLATES)
    key = tmpl.format(a=gen_key(), b=gen_key(), c=gen_key(), d=gen_key())
    sentence = random.choice(SECRET_SENTENCES).format(key=key)
    add(rows, sentence, "SECRET")

for _ in range(90):
    tmpl = random.choice(PII_SENTENCES)
    sentence = tmpl.format(
        name=random.choice(NAMES),
        name2=random.choice(NAMES),
        domain=random.choice(DOMAINS),
        d2=rand_digits(2),
        d3=rand_digits(3),
        d4=rand_digits(4),
        num=random.randint(1, 9999),
        num2=random.randint(1, 40),
    )
    add(rows, sentence, "SECRET")

for s in SAFE_STATEMENTS:
    add(rows, s, "SAFE")
    add(rows, s.lower(), "SAFE")
    add(rows, s.capitalize(), "SAFE")

# Hand-written edge cases: sentences that mention key/password/email/phone as
# a TOPIC without actually disclosing one -- the hardest boundary for a
# lexical classifier, included so it isn't fooled by the word alone.
EDGE = [
    ("what's the best way to store an API key safely?", "SAFE"),
    ("how do I rotate my password regularly?", "SAFE"),
    ("what format does an email address usually take?", "SAFE"),
    ("how many digits are in a phone number?", "SAFE"),
    ("explain what a social security number is used for", "SAFE"),
    ("should API keys ever be committed to git?", "SAFE"),
    ("what is ECIES encryption used for?", "SAFE"),
    ("how does the piiEnabled flag work on the HTTP precompile?", "SAFE"),
    ("here is the encrypted secret blob for the executor", "SAFE"),
    ("the secrets access control contract manages permissions", "SAFE"),
]
for text, label in EDGE:
    add(rows, text, label)

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

with open("ml/data/secrets_train.jsonl", "w", encoding="utf-8") as f:
    for r in train:
        f.write(json.dumps(r) + "\n")

with open("ml/data/secrets_val.jsonl", "w", encoding="utf-8") as f:
    for r in val:
        f.write(json.dumps(r) + "\n")

from collections import Counter

print("train:", len(train), Counter(r["label"] for r in train))
print("val:", len(val), Counter(r["label"] for r in val))
