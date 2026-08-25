// Browsers don't expose a reliable gender field on SpeechSynthesisVoice, so we
// match against known female-voice names shipped by major platforms/browsers,
// falling back to any name containing "female".
const FEMALE_VOICE_HINTS = [
  "samantha", "victoria", "karen", "moira", "tessa", "fiona", "zira", "hazel",
  "susan", "allison", "ava", "serena", "joanna", "salli", "kimberly", "aria",
  "jenny", "google us english", "google uk english female", "female",
];

export function pickFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const english = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  const pool = english.length ? english : voices;

  for (const hint of FEMALE_VOICE_HINTS) {
    const match = pool.find((v) => v.name.toLowerCase().includes(hint));
    if (match) return match;
  }
  return pool[0];
}
