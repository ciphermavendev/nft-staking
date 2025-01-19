// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTStaking is ReentrancyGuard, Ownable {
    struct StakeInfo {
        address owner;
        uint256 timestamp;
    }
    
    IERC721 public nftToken;
    IERC20 public rewardToken;
    
    uint256 public rewardRate = 100 * 10**18; // 100 tokens per day
    uint256 public constant SECONDS_IN_DAY = 86400;
    
    mapping(uint256 => StakeInfo) public stakes;
    
    event NFTStaked(address indexed owner, uint256 tokenId, uint256 timestamp);
    event NFTUnstaked(address indexed owner, uint256 tokenId, uint256 timestamp);
    event RewardsClaimed(address indexed owner, uint256 reward);
    
    constructor(address _nftToken, address _rewardToken) Ownable(msg.sender) {
        nftToken = IERC721(_nftToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    function stake(uint256 tokenId) external nonReentrant {
        require(nftToken.ownerOf(tokenId) == msg.sender, "Not token owner");
        
        nftToken.transferFrom(msg.sender, address(this), tokenId);
        
        stakes[tokenId] = StakeInfo({
            owner: msg.sender,
            timestamp: block.timestamp
        });
        
        emit NFTStaked(msg.sender, tokenId, block.timestamp);
    }
    
    function calculateRewards(uint256 tokenId) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[tokenId];
        if (stakeInfo.owner == address(0)) return 0;
        
        uint256 timeStaked = block.timestamp - stakeInfo.timestamp;
        return (timeStaked * rewardRate) / SECONDS_IN_DAY;
    }
    
    function unstake(uint256 tokenId) external nonReentrant {
        StakeInfo memory stakeInfo = stakes[tokenId];
        require(stakeInfo.owner == msg.sender, "Not stake owner");
        
        uint256 reward = calculateRewards(tokenId);
        
        delete stakes[tokenId];
        
        nftToken.transferFrom(address(this), msg.sender, tokenId);
        
        if (reward > 0) {
            require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
            emit RewardsClaimed(msg.sender, reward);
        }
        
        emit NFTUnstaked(msg.sender, tokenId, block.timestamp);
    }
    
    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        rewardRate = _rewardRate;
    }
    
    function withdrawRewards(uint256 amount) external onlyOwner {
        require(rewardToken.transfer(msg.sender, amount), "Transfer failed");
    }

    // View functions
    function getStakeInfo(uint256 tokenId) external view returns (address owner, uint256 timestamp) {
        StakeInfo memory stakeInfo = stakes[tokenId];
        return (stakeInfo.owner, stakeInfo.timestamp);
    }

    function getRewardRate() external view returns (uint256) {
        return rewardRate;
    }

    function getTotalRewards(address _owner) external view returns (uint256 totalRewards) {
        for (uint256 i = 0; i < nftToken.balanceOf(_owner); i++) {
            uint256 tokenId = nftToken.tokenOfOwnerByIndex(_owner, i);
            if (stakes[tokenId].owner == _owner) {
                totalRewards += calculateRewards(tokenId);
            }
        }
        return totalRewards;
    }
}