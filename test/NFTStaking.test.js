const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Staking System", function () {
    let StakingNFT, stakingNFT;
    let RewardToken, rewardToken;
    let NFTStaking, nftStaking;
    let owner, user1, user2;
    const TOKEN_URI = "ipfs://QmExample";

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy StakingNFT
        StakingNFT = await ethers.getContractFactory("StakingNFT");
        stakingNFT = await StakingNFT.deploy();

        // Deploy RewardToken
        RewardToken = await ethers.getContractFactory("RewardToken");
        rewardToken = await RewardToken.deploy();

        // Deploy NFTStaking
        NFTStaking = await ethers.getContractFactory("NFTStaking");
        nftStaking = await NFTStaking.deploy(
            await stakingNFT.getAddress(),
            await rewardToken.getAddress()
        );

        // Fund staking contract with rewards
        const rewardAmount = ethers.parseEther("1000000");
        await rewardToken.transfer(await nftStaking.getAddress(), rewardAmount);
    });

    describe("Contract Deployment", function () {
        it("Should deploy with correct initial state", async function () {
            expect(await stakingNFT.name()).to.equal("Staking NFT");
            expect(await stakingNFT.symbol()).to.equal("SNFT");
            expect(await rewardToken.name()).to.equal("Reward Token");
            expect(await rewardToken.symbol()).to.equal("RWT");
        });

        it("Should set correct addresses in staking contract", async function () {
            expect(await nftStaking.nftToken()).to.equal(await stakingNFT.getAddress());
            expect(await nftStaking.rewardToken()).to.equal(await rewardToken.getAddress());
        });
    });

    describe("NFT Minting", function () {
        it("Should allow minting NFTs", async function () {
            await stakingNFT.connect(user1).safeMint(user1.address, TOKEN_URI, {
                value: ethers.parseEther("0.1")
            });
            expect(await stakingNFT.ownerOf(0)).to.equal(user1.address);
            expect(await stakingNFT.tokenURI(0)).to.equal(TOKEN_URI);
        });

        it("Should fail minting without sufficient payment", async function () {
            await expect(
                stakingNFT.connect(user1).safeMint(user1.address, TOKEN_URI, {
                    value: ethers.parseEther("0.05")
                })
            ).to.be.revertedWith("Insufficient payment");
        });
    });

    describe("Staking Functionality", function () {
        beforeEach(async function () {
            // Mint NFT to user1
            await stakingNFT.connect(user1).safeMint(user1.address, TOKEN_URI, {
                value: ethers.parseEther("0.1")
            });
            // Approve staking contract
            await stakingNFT.connect(user1).approve(await nftStaking.getAddress(), 0);
        });

        it("Should allow staking NFT", async function () {
            await nftStaking.connect(user1).stake(0);
            const stakeInfo = await nftStaking.stakes(0);
            expect(stakeInfo.owner).to.equal(user1.address);
            expect(await stakingNFT.ownerOf(0)).to.equal(await nftStaking.getAddress());
        });

        it("Should calculate rewards correctly", async function () {
            await nftStaking.connect(user1).stake(0);
            
            // Advance time by 1 day
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");

            const reward = await nftStaking.calculateRewards(0);
            expect(reward).to.equal(ethers.parseEther("100")); // 100 tokens per day
        });

        it("Should allow unstaking and claiming rewards", async function () {
            await nftStaking.connect(user1).stake(0);
            
            // Advance time
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");

            const initialBalance = await rewardToken.balanceOf(user1.address);
            await nftStaking.connect(user1).unstake(0);
            
            expect(await stakingNFT.ownerOf(0)).to.equal(user1.address);
            expect(await rewardToken.balanceOf(user1.address)).to.be.gt(initialBalance);
        });

        it("Should not allow unauthorized unstaking", async function () {
            await nftStaking.connect(user1).stake(0);
            await expect(
                nftStaking.connect(user2).unstake(0)
            ).to.be.revertedWith("Not stake owner");
        });
    });

    describe("Reward Token Functionality", function () {
        it("Should handle reward distribution correctly", async function () {
            await stakingNFT.connect(user1).safeMint(user1.address, TOKEN_URI, {
                value: ethers.parseEther("0.1")
            });
            await stakingNFT.connect(user1).approve(await nftStaking.getAddress(), 0);
            
            // Stake NFT
            await nftStaking.connect(user1).stake(0);
            
            // Advance time
            await ethers.provider.send("evm_increaseTime", [86400 * 2]); // 2 days
            await ethers.provider.send("evm_mine");
            
            const expectedReward = ethers.parseEther("200"); // 100 tokens * 2 days
            expect(await nftStaking.calculateRewards(0)).to.equal(expectedReward);
        });
    });

    describe("Owner Functions", function () {
        it("Should allow owner to set reward rate", async function () {
            const newRate = ethers.parseEther("200"); // 200 tokens per day
            await nftStaking.setRewardRate(newRate);
            expect(await nftStaking.rewardRate()).to.equal(newRate);
        });

        it("Should not allow non-owner to set reward rate", async function () {
            await expect(
                nftStaking.connect(user1).setRewardRate(ethers.parseEther("200"))
            ).to.be.revertedWithCustomError(nftStaking, "OwnableUnauthorizedAccount");
        });
    });
});