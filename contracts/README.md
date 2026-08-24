# Research Agent Contracts (Foundry)

`ResearchAgentRegistry.sol` — calls Ritual Chain's Sovereign Agent precompile (`0x080C`, direct
caller mode) and records research results delivered via the async callback.

See the repo-root `README.md` for full setup and deployment instructions.

`lib/` (forge-std) isn't committed — restore it before building:

```bash
forge install foundry-rs/forge-std --no-git
```

## Quick commands

```bash
forge build
forge test -vv

# Deploy (requires a funded PRIVATE_KEY in .env)
source .env
forge script script/Deploy.s.sol:DeployScript --rpc-url $RITUAL_RPC_URL --broadcast -vvvv
```
