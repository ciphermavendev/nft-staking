// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract RewardToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    // Maximum supply of tokens
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    // Minting timeout to prevent instant minting
    uint256 public mintTimeout;
    uint256 public constant MINT_DELAY = 24 hours;
    
    constructor() ERC20("Reward Token", "RWT") Ownable(msg.sender) {
        // Initial mint of 10 million tokens to owner
        _mint(msg.sender, 10_000_000 * 10**18);
        mintTimeout = block.timestamp + MINT_DELAY;
    }

    // Mint new tokens (only owner)
    function mint(address to, uint256 amount) public onlyOwner {
        require(block.timestamp >= mintTimeout, "Minting is time-locked");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
        mintTimeout = block.timestamp + MINT_DELAY;
    }

    // Pause token transfers (only owner)
    function pause() public onlyOwner {
        _pause();
    }

    // Unpause token transfers (only owner)
    function unpause() public onlyOwner {
        _unpause();
    }

    // Burn tokens from a specific address (only owner)
    function burnFrom(address account, uint256 amount) public override onlyOwner {
        _burn(account, amount);
    }

    // Required overrides
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }

    // View functions
    function getMaxSupply() external pure returns (uint256) {
        return MAX_SUPPLY;
    }

    function getMintTimeout() external view returns (uint256) {
        return mintTimeout;
    }

    function getRemainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    // Transfer with memo
    function transferWithMemo(address to, uint256 amount, string memory memo) 
        external 
        returns (bool) 
    {
        require(bytes(memo).length <= 100, "Memo too long");
        emit TransferMemo(msg.sender, to, amount, memo);
        return transfer(to, amount);
    }

    // Events
    event TransferMemo(
        address indexed from,
        address indexed to,
        uint256 value,
        string memo
    );
}