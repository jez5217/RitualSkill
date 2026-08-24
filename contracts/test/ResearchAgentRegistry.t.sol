// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {ResearchAgentRegistry} from "../src/ResearchAgentRegistry.sol";

contract ResearchAgentRegistryTest is Test {
    address constant SOVEREIGN_AGENT = 0x000000000000000000000000000000000000080C;
    address constant ASYNC_DELIVERY = 0x5A16214fF555848411544b005f7Ac063742f39F6;
    address constant TX_HASH_PRECOMPILE = 0x0000000000000000000000000000000000000830;

    ResearchAgentRegistry registry;
    address requester = makeAddr("requester");
    bytes32 constant FAKE_JOB_ID = keccak256("phase1-tx-hash");

    function setUp() public {
        registry = new ResearchAgentRegistry();
        // Empty `data` matches any calldata sent to TX_HASH_PRECOMPILE (it takes none anyway).
        vm.mockCall(TX_HASH_PRECOMPILE, bytes(""), abi.encode(FAKE_JOB_ID));
    }

    function _mockSovereignCall(bytes memory input) internal {
        vm.mockCall(SOVEREIGN_AGENT, input, "");
    }

    function _successResult(string memory text) internal pure returns (bytes memory) {
        ResearchAgentRegistry.StorageRef memory emptyRef = ResearchAgentRegistry.StorageRef("", "", "");
        ResearchAgentRegistry.StorageRef[] memory artifacts = new ResearchAgentRegistry.StorageRef[](0);
        return abi.encode(true, "", text, emptyRef, emptyRef, artifacts);
    }

    function _submitFixture() internal returns (bytes32 jobId) {
        bytes memory encodedRequest = abi.encodePacked("fake-encoded-sovereign-agent-request");
        _mockSovereignCall(encodedRequest);
        vm.prank(requester);
        jobId = registry.submitResearch("Latest Ritual Chain TEE research", encodedRequest);
    }

    function test_SubmitResearch_StoresRequestAndEmitsEvent() public {
        bytes memory encodedRequest = abi.encodePacked("fake-encoded-sovereign-agent-request");
        _mockSovereignCall(encodedRequest);

        vm.expectEmit(true, true, false, true);
        emit ResearchAgentRegistry.ResearchSubmitted(FAKE_JOB_ID, requester, "Latest Ritual Chain TEE research");

        vm.prank(requester);
        bytes32 jobId = registry.submitResearch("Latest Ritual Chain TEE research", encodedRequest);

        assertEq(jobId, FAKE_JOB_ID);

        (address storedRequester, string memory topic,, bool delivered, bool success,,) = registry.requests(jobId);
        assertEq(storedRequester, requester);
        assertEq(topic, "Latest Ritual Chain TEE research");
        assertFalse(delivered);
        assertFalse(success);

        bytes32[] memory userJobs = registry.getUserRequests(requester);
        assertEq(userJobs.length, 1);
        assertEq(userJobs[0], FAKE_JOB_ID);

        assertEq(registry.totalRequests(), 1);
        assertEq(registry.getAllJobIds()[0], FAKE_JOB_ID);
    }

    function test_SubmitResearch_RevertsOnPrecompileFailure() public {
        bytes memory encodedRequest = abi.encodePacked("bad-request");
        vm.mockCallRevert(SOVEREIGN_AGENT, encodedRequest, "boom");

        vm.expectRevert(ResearchAgentRegistry.PrecompileCallFailed.selector);
        vm.prank(requester);
        registry.submitResearch("topic", encodedRequest);
    }

    function test_OnSovereignAgentResult_OnlyAsyncDelivery() public {
        bytes32 jobId = _submitFixture();
        bytes memory result = _successResult("report text");

        vm.expectRevert(ResearchAgentRegistry.UnauthorizedCallback.selector);
        registry.onSovereignAgentResult(jobId, result);
    }

    function test_OnSovereignAgentResult_UnknownJobReverts() public {
        bytes memory result = _successResult("report text");
        vm.prank(ASYNC_DELIVERY);
        vm.expectRevert(ResearchAgentRegistry.UnknownJob.selector);
        registry.onSovereignAgentResult(keccak256("never-submitted"), result);
    }

    function test_OnSovereignAgentResult_StoresReportOnSuccess() public {
        bytes32 jobId = _submitFixture();
        bytes memory result = _successResult("Ritual Chain enshrines TEE-verified AI precompiles.");

        vm.expectEmit(true, false, false, true);
        emit ResearchAgentRegistry.ResearchDelivered(
            jobId, true, "Ritual Chain enshrines TEE-verified AI precompiles.", ""
        );

        vm.prank(ASYNC_DELIVERY);
        registry.onSovereignAgentResult(jobId, result);

        (,,, bool delivered, bool success, string memory report, string memory errorMessage) =
            registry.requests(jobId);
        assertTrue(delivered);
        assertTrue(success);
        assertEq(report, "Ritual Chain enshrines TEE-verified AI precompiles.");
        assertEq(errorMessage, "");
    }

    function test_OnSovereignAgentResult_TreatsAgentErrorAsFailure() public {
        bytes32 jobId = _submitFixture();
        ResearchAgentRegistry.StorageRef memory emptyRef = ResearchAgentRegistry.StorageRef("", "", "");
        ResearchAgentRegistry.StorageRef[] memory artifacts = new ResearchAgentRegistry.StorageRef[](0);
        bytes memory result = abi.encode(false, "executor timeout", "", emptyRef, emptyRef, artifacts);

        vm.prank(ASYNC_DELIVERY);
        registry.onSovereignAgentResult(jobId, result);

        (,,, bool delivered, bool success,, string memory errorMessage) = registry.requests(jobId);
        assertTrue(delivered);
        assertFalse(success);
        assertEq(errorMessage, "executor timeout");
    }

    function test_OnSovereignAgentResult_TreatsEmptyTextAsFailure() public {
        bytes32 jobId = _submitFixture();
        bytes memory result = _successResult("");

        vm.prank(ASYNC_DELIVERY);
        registry.onSovereignAgentResult(jobId, result);

        (,,, bool delivered, bool success,, string memory errorMessage) = registry.requests(jobId);
        assertTrue(delivered);
        assertFalse(success);
        assertEq(errorMessage, "agent returned no output");
    }

    function test_ReapExpired_RevertsBeforeWindow() public {
        bytes32 jobId = _submitFixture();
        vm.expectRevert(ResearchAgentRegistry.NotYetExpired.selector);
        registry.reapExpired(jobId);
    }

    function test_ReapExpired_MarksFailedAfterWindow() public {
        bytes32 jobId = _submitFixture();
        vm.roll(block.number + registry.EXPIRY_BLOCKS() + 1);

        registry.reapExpired(jobId);

        (,,, bool delivered, bool success,, string memory errorMessage) = registry.requests(jobId);
        assertTrue(delivered);
        assertFalse(success);
        assertEq(errorMessage, "expired: no delivery received within window");
    }

    function test_ReapExpired_RevertsIfAlreadyDelivered() public {
        bytes32 jobId = _submitFixture();
        vm.prank(ASYNC_DELIVERY);
        registry.onSovereignAgentResult(jobId, _successResult("done"));

        vm.roll(block.number + registry.EXPIRY_BLOCKS() + 1);
        vm.expectRevert(ResearchAgentRegistry.AlreadyDelivered.selector);
        registry.reapExpired(jobId);
    }

    function test_OnSovereignAgentResult_IdempotentCallback() public {
        bytes32 jobId = _submitFixture();
        bytes memory result = _successResult("first report");

        vm.prank(ASYNC_DELIVERY);
        registry.onSovereignAgentResult(jobId, result);

        vm.prank(ASYNC_DELIVERY);
        vm.expectRevert(ResearchAgentRegistry.AlreadyDelivered.selector);
        registry.onSovereignAgentResult(jobId, result);
    }
}
