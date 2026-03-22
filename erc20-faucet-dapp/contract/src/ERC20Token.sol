// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract ERC20Token is ERC20, AccessControl{
    address public owner;
    uint256 public maxsupply;
    uint256 public faucetAmount = 10 * 10**18;
    uint256 public remainingTime;

    mapping(address => uint256) public lastClaimed;

    error InvalidAddress();
    error InvalidAmount();
    error MaxSupplyExceeded();
    error AlreadyClaimed(uint256 timeRemaining);

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address _owner) ERC20("DpToken", "DpT") {
        if(_owner == address(0)) revert InvalidAddress();

        owner = _owner;

        maxsupply = 10_000_000 * 10**18;

        _grantRole(DEFAULT_ADMIN_ROLE, owner);

        _grantRole(MINTER_ROLE, owner);
    }

    function mint(address _to, uint _amount) external onlyRole(MINTER_ROLE){
        if(_amount == 0) revert InvalidAmount();

        if (_to == address(0)) revert InvalidAddress();

        if (totalSupply() + _amount > maxsupply) revert MaxSupplyExceeded();

        _mint(_to, _amount);
    }

    function requestToken() external {        
        if (msg.sender == address(0)) revert InvalidAddress();

        uint256 lastTime = lastClaimed[msg.sender];
        uint256 nextAllowedTime = lastTime + 1 days;

        if (lastTime != 0 && block.timestamp < nextAllowedTime) {
            remainingTime = nextAllowedTime - block.timestamp;
            revert AlreadyClaimed(remainingTime);
        }

        if (totalSupply() + faucetAmount > maxsupply) {
            revert MaxSupplyExceeded();
        }

        lastClaimed[msg.sender] = block.timestamp;

        _mint(msg.sender, faucetAmount);
    }


}