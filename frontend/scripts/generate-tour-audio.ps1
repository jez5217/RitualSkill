Add-Type -AssemblyName System.Speech

$outDir = Join-Path $PSScriptRoot "..\public\audio\siggy-tour"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$scenes = @(
  @{ file = "01-ritual-introduction.wav"; text = "Ritual Chain is a blockchain built around native AI precompiles -- smart contracts that can think, see, hear, and act. This is a guided tour of every one Ritual ships, built directly into the chain itself, running here in Demo Mode -- no wallet or testnet required." },
  @{ file = "02-ai-inference.wav"; text = "The Think page covers three ways a contract can reason. LLM Chat calls a hosted language model directly. Classical Inference runs a small O-N-N-X model synchronously, inline, in the same block -- and on this site, that demo is backed by a real trained model, not a simulation. Fully Homomorphic Encryption inference computes directly on encrypted data inside a trusted execution environment, so not even the operator sees your input." },
  @{ file = "03-see-hear-act.wav"; text = "The See, Hear, Act page is about a contract reaching outward. HTTP Call lets it fetch live data from any API. Multimodal generation produces images, audio, and video on demand. And Long-Running HTTP handles slower external calls asynchronously, delivering the result back on chain through a callback." },
  @{ file = "04-autonomous-agents.wav"; text = "This is the one feature on the whole site with a real deployed contract behind it. Submit a research topic, and the Sovereign Agent precompile dispatches it to a trusted execution environment, which researches the topic and calls back with a report -- stored on chain, readable by anyone, no backend database required. The Persistent Agent alongside it demonstrates an agent with memory across conversations." },
  @{ file = "05-memory-scheduling.wav"; text = "The Scheduler lets a contract register a recurring call, so an agent can act on a timer without any off-chain cron job watching it. Decentralized key management, or D-K-M-S, handles key derivation for an agent's identity across encrypted workflows." },
  @{ file = "06-authentication.wav"; text = "Passkey login lets a wallet be created and used with device biometrics instead of a seed phrase, backed by transaction-level passkey signing. Ed25519 signature verification is available directly as a precompile for contracts that need to verify it natively." },
  @{ file = "07-secret-encryption.wav"; text = "The Secrets page uses real encryption, not a mock. It generates a throwaway key pair right in your browser and encrypts against it with the same scheme the live submission flow uses, so the ciphertext you see is genuinely encrypted. Access control and the ex-four-oh-two micropayment protocol are covered alongside it." },
  @{ file = "08-ritual-wallet.wav"; text = "Every wallet on Ritual is a smart contract wallet. This page walks through its balance and fee model, the nine states an asynchronous job moves through from submission to settlement, and the registry of trusted execution environment operators that carry out the work." },
  @{ file = "09-global-finale.wav"; text = "That's every AI precompile Ritual ships today, all runnable right now with no wallet and no testnet. Pick any page from the navigation above and try it for yourself." }
)

foreach ($scene in $scenes) {
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $synth.SelectVoice("Microsoft Zira Desktop")
  $synth.Rate = -1
  $path = Join-Path $outDir $scene.file
  $synth.SetOutputToWaveFile($path, (New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(24000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)))
  $synth.Speak($scene.text)
  $synth.SetOutputToNull()
  $synth.Dispose()
  Write-Output "wrote $path"
}
