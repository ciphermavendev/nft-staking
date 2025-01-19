const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy StakingNFT
    const StakingNFT = await hre.ethers.getContractFactory("StakingNFT");
    const stakingNFT = await StakingNFT.deploy();
    await stakingNFT.waitForDeployment();
    console.log("StakingNFT deployed to:", await stakingNFT.getAddress());

    // Deploy RewardToken
    const RewardToken = await hre.ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy();
    await rewardToken.waitForDeployment();
    console.log("RewardToken deployed to:", await rewardToken.getAddress());

    // Deploy NFTStaking with NFT and Reward token addresses
    const NFTStaking = await hre.ethers.getContractFactory("NFTStaking");
    const nftStaking = await NFTStaking.deploy(
        await stakingNFT.getAddress(),
        await rewardToken.getAddress()
    );
    await nftStaking.waitForDeployment();
    console.log("NFTStaking deployed to:", await nftStaking.getAddress());

    // Fund the staking contract with reward tokens
    const rewardAmount = hre.ethers.parseEther("1000000"); // 1 million tokens
    await rewardToken.transfer(await nftStaking.getAddress(), rewardAmount);
    console.log("Transferred", hre.ethers.formatEther(rewardAmount), "tokens to staking contract");

    // Verify contracts on Etherscan
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("Waiting for block confirmations...");
        
        await stakingNFT.waitForDeployment();
        await rewardToken.waitForDeployment();
        await nftStaking.waitForDeployment();

        await hre.run("verify:verify", {
            address: await stakingNFT.getAddress(),
            constructorArguments: [],
        });

        await hre.run("verify:verify", {
            address: await rewardToken.getAddress(),
            constructorArguments: [],
        });

        await hre.run("verify:verify", {
            address: await nftStaking.getAddress(),
            constructorArguments: [
                await stakingNFT.getAddress(),
                await rewardToken.getAddress(),
            ],
        });
    }

    // Print deployment summary
    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("StakingNFT:", await stakingNFT.getAddress());
    console.log("RewardToken:", await rewardToken.getAddress());
    console.log("NFTStaking:", await nftStaking.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });