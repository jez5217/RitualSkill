// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ResearchAgentRegistry
/// @notice Submits research prompts to Ritual Chain's Sovereign Agent precompile (0x080C, direct
///         caller mode) and records results delivered via the async Phase 2 callback.
/// @dev ABI-encoding of the Sovereign Agent request happens off-chain (see the frontend's
///      `encodeAgentCallRequest`) because it requires ECIES-encrypting the provider secret to the
///      executor's TEE public key, which Solidity cannot do. This contract forwards the
///      pre-encoded payload, correlates it to a jobId, and manages callback security + storage.
///
///      jobId correlation: the Sovereign Agent precompile's Phase 2 callback identifies a job by
///      the tx hash of the Phase 1 submission transaction. This contract captures that hash via
///      the TX_HASH precompile (0x0830) *during* Phase 1 execution, so `requests[jobId]` is keyed
///      by exactly the value `onSovereignAgentResult` will later receive.
contract ResearchAgentRegistry {
    address constant SOVEREIGN_AGENT = 0x000000000000000000000000000000000000080C;
    address constant ASYNC_DELIVERY = 0x5A16214fF555848411544b005f7Ac063742f39F6;
    address constant TX_HASH_PRECOMPILE = 0x0000000000000000000000000000000000000830;

    /// @dev Mirrors the SovereignAgentParams StorageRef tuple: (platform, path, keyRef).
    struct StorageRef {
        string platform;
        string path;
        string keyRef;
    }

    struct ResearchRequest {
        address requester;
        string topic;
        uint64 submittedAtBlock;
        bool delivered;
        bool success;
        string report;
        string errorMessage;
    }

    mapping(bytes32 => ResearchRequest) public requests;
    mapping(address => bytes32[]) public requestsByUser;
    bytes32[] public allJobIds;

    event ResearchSubmitted(bytes32 indexed jobId, address indexed requester, string topic);
    event ResearchDelivered(bytes32 indexed jobId, bool success, string report, string errorMessage);

    /// @dev Conservative window (>> maxPollBlock in the encoded request) after which an
    ///      undelivered job is assumed lost (executor failure, TTL expiry with no cleanup, etc.)
    ///      and can be reaped by anyone. See "Escape Hatch for Stuck State" in ritual-dapp-contracts.
    uint256 public constant EXPIRY_BLOCKS = 8000;

    error PrecompileCallFailed();
    error TxHashUnavailable();
    error UnauthorizedCallback();
    error UnknownJob();
    error AlreadyDelivered();
    error NotYetExpired();

    modifier onlyAsyncDelivery() {
        if (msg.sender != ASYNC_DELIVERY) revert UnauthorizedCallback();
        _;
    }

    /// @notice Forwards a pre-encoded Sovereign Agent (0x080C) request and records it under `topic`.
    /// @dev The caller's EOA (msg.sender / tx signer) must already hold a sufficient, unexpired
    ///      RitualWallet deposit — the async fee check is against the signing EOA, not this
    ///      contract (see ritual-dapp-wallet).
    /// @param topic Human-readable research topic/prompt summary, stored for on-chain display.
    /// @param encodedAgentRequest The full 23-field ABI-encoded SovereignAgentParams payload.
    ///        Its `deliveryTarget` must equal `address(this)` and `deliverySelector` must equal
    ///        `this.onSovereignAgentResult.selector`, or the Phase 2 callback will never arrive.
    function submitResearch(string calldata topic, bytes calldata encodedAgentRequest)
        external
        returns (bytes32 jobId)
    {
        jobId = _currentTxHash();

        (bool ok,) = SOVEREIGN_AGENT.call(encodedAgentRequest);
        if (!ok) revert PrecompileCallFailed();

        requests[jobId] = ResearchRequest({
            requester: msg.sender,
            topic: topic,
            submittedAtBlock: uint64(block.number),
            delivered: false,
            success: false,
            report: "",
            errorMessage: ""
        });
        requestsByUser[msg.sender].push(jobId);
        allJobIds.push(jobId);

        emit ResearchSubmitted(jobId, msg.sender, topic);
    }

    /// @notice Phase 2 delivery callback. Called by the AsyncDelivery proxy once the sovereign
    ///         agent executor finishes the job (or fails / times out).
    function onSovereignAgentResult(bytes32 jobId, bytes calldata result) external onlyAsyncDelivery {
        ResearchRequest storage req = requests[jobId];
        if (req.requester == address(0)) revert UnknownJob();
        if (req.delivered) revert AlreadyDelivered();

        // Defensive decode per ritual-dapp-agents: success=false, a non-empty error, or empty
        // text are all treated as a hard failure rather than something to parse further.
        (bool success, string memory error, string memory text,,,) =
            abi.decode(result, (bool, string, string, StorageRef, StorageRef, StorageRef[]));

        bool ok = success && bytes(error).length == 0 && bytes(text).length > 0;

        req.delivered = true;
        req.success = ok;
        req.report = text;
        req.errorMessage = bytes(error).length > 0 ? error : (ok ? "" : "agent returned no output");

        emit ResearchDelivered(jobId, ok, text, req.errorMessage);
    }

    /// @notice Escape hatch for a job whose Phase 2 callback never arrives (executor failure,
    ///         TTL expiry, etc.). Callable by anyone once `EXPIRY_BLOCKS` has passed so the UI
    ///         never has to wait forever on a dead job.
    function reapExpired(bytes32 jobId) external {
        ResearchRequest storage req = requests[jobId];
        if (req.requester == address(0)) revert UnknownJob();
        if (req.delivered) revert AlreadyDelivered();
        if (block.number <= req.submittedAtBlock + EXPIRY_BLOCKS) revert NotYetExpired();

        req.delivered = true;
        req.success = false;
        req.errorMessage = "expired: no delivery received within window";

        emit ResearchDelivered(jobId, false, "", req.errorMessage);
    }

    function getUserRequests(address user) external view returns (bytes32[] memory) {
        return requestsByUser[user];
    }

    function getAllJobIds() external view returns (bytes32[] memory) {
        return allJobIds;
    }

    function totalRequests() external view returns (uint256) {
        return allJobIds.length;
    }

    function _currentTxHash() internal view returns (bytes32) {
        (bool ok, bytes memory out) = TX_HASH_PRECOMPILE.staticcall("");
        if (!ok || out.length == 0) revert TxHashUnavailable();
        return abi.decode(out, (bytes32));
    }

    /// @dev No RITUAL is expected to flow to this contract (Sovereign Agent has no
    ///      `deliveryValue` field), but a bare `receive()` guards against any refund path.
    receive() external payable {}
}
