// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ResearchAgentRegistry} from "../src/ResearchAgentRegistry.sol";

contract DeployScript is Script {
    function run() external returns (ResearchAgentRegistry registry) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        registry = new ResearchAgentRegistry();
        vm.stopBroadcast();

        console.log("ResearchAgentRegistry deployed to:", address(registry));
        console.log("Set NEXT_PUBLIC_RESEARCH_REGISTRY to this address in frontend/.env.local");
    }
}
