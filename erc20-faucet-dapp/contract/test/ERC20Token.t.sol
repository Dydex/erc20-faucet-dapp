// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ERC20Token} from "../src/ERC20Token.sol";

contract ERCTokenTest is Test {
    
    ERC20Token public erc20token;
    address owner; 
    address user1;
    address zeroAddress;
    uint256 maxsupply;
    address beneficiary;
    address beneficiary2;
    uint256 faucetAmt;

    function setUp() public {
        user1 = address(1);
        zeroAddress = address(0);
        owner = address(2);
        beneficiary =  address(3);
        beneficiary2 =  address(4);
        maxsupply = 10_000_000 * 10**18;
        faucetAmt = 10e18;
        erc20token = new ERC20Token(owner);
    }

    function testDeployment() public {
        bytes32 defaultAdmin = erc20token.DEFAULT_ADMIN_ROLE();
        bytes32 minterRole = erc20token.MINTER_ROLE();
        assertEq(erc20token.owner(), owner);
        assertEq(erc20token.maxsupply(), maxsupply);
        assertTrue(erc20token.hasRole(defaultAdmin, owner));
        assertTrue(erc20token.hasRole(minterRole, owner));
        assertEq(erc20token.faucetAmount(), faucetAmt);
        assertGt(address(erc20token).code.length, 0);
    }

    function testMint() public {
        uint mintAmt = 100e18;

        vm.startPrank(owner);
        vm.expectRevert(ERC20Token.InvalidAmount.selector);
        erc20token.mint(beneficiary, 0);
        erc20token.mint(beneficiary, mintAmt);
        vm.stopPrank();
        assertEq(erc20token.balanceOf(beneficiary), mintAmt);
    }

    function testRequestToken() public {
        vm.startPrank(beneficiary2);
        erc20token.requestToken();
        vm.expectRevert();
        erc20token.requestToken();
        vm.stopPrank();

        assertEq(erc20token.balanceOf(beneficiary2), faucetAmt);
    } 
       
}
