export const TOKEN_ABI = [
  // --- functions ---
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function requestToken()",
  "function mint(address _to, uint256 _amount)",
  "function balanceOf(address account) view returns (uint256)",
  "function faucetAmount() view returns (uint256)",
  "function lastClaimed(address) view returns (uint256)",
  "function remainingTime() view returns (uint256)",
  "function maxsupply() view returns (uint256)",
  "function owner() view returns (address)",

  // --- errors ---
  "error AlreadyClaimed(uint256 timeRemaining)",
  "error InvalidAddress()",
  "error InvalidAmount()",
  "error MaxSupplyExceeded()",
];