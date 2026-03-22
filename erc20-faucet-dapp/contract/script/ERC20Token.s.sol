// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {ERC20Token} from "../src/ERC20Token.sol";

contract ERC20TokenScript is Script {
    ERC20Token public erc20token;

    function setUp() public {}

    function run() public {
        address owner = vm.envAddress("OWNER");

        vm.startBroadcast();

        erc20token = new ERC20Token(owner);

        vm.stopBroadcast();
    }
}
