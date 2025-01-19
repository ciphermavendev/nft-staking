# NFT Staking Platform

A decentralized NFT staking platform built on Ethereum using Hardhat, allowing users to stake their NFTs and earn reward tokens.

## Features

- ERC721 NFT minting with customizable URI
- ERC20 reward token with time-locked minting
- Stake NFTs to earn rewards
- Daily reward distribution system
- Owner controls for reward rates
- Comprehensive testing suite
- Automated deployment scripts

## Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- An Ethereum wallet (e.g., MetaMask)
- Alchemy API key
- Etherscan API key (for verification)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/nft-staking.git
cd nft-staking
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Fill in your environment variables:
```
ALCHEMY_API_KEY=your_alchemy_api_key
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Testing

Run the test suite:
```bash
npx hardhat test
```

For coverage report:
```bash
npx hardhat coverage
```

## Deployment

1. To deploy to local network:
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

2. To deploy to Sepolia testnet:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Contract Addresses

Sepolia Testnet:
- StakingNFT: `[Contract Address]`
- RewardToken: `[Contract Address]`
- NFTStaking: `[Contract Address]`

## Usage

1. Mint NFTs:
```javascript
await stakingNFT.safeMint(address, tokenURI, { value: ethers.parseEther("0.1") });
```

2. Approve NFT for staking:
```javascript
await stakingNFT.approve(nftStakingAddress, tokenId);
```

3. Stake NFT:
```javascript
await nftStaking.stake(tokenId);
```

4. Check rewards:
```javascript
const rewards = await nftStaking.calculateRewards(tokenId);
```

5. Unstake and claim rewards:
```javascript
await nftStaking.unstake(tokenId);
```

## Contract Architecture

### StakingNFT
- ERC721 implementation
- Minting functionality
- URI storage
- Access control

### RewardToken
- ERC20 implementation
- Time-locked minting
- Maximum supply control
- Pausable transfers

### NFTStaking
- Staking mechanism
- Reward calculation
- Time-based distribution
- Security features

## Security Considerations

- ReentrancyGuard implemented
- Time-locked minting for reward tokens
- Access control for admin functions
- Comprehensive testing coverage
- Pull over push pattern for rewards

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- OpenZeppelin for secure contract implementations
- Hardhat for the development environment
- Ethereum community for best practices and standards

## Support

For support, please open an issue in the repository or reach out to the maintainers.