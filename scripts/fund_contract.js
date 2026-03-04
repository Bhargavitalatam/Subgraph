const hre = require("hardhat");
require("dotenv").config();

async function main() {
    const contractAddress = hre.ethers.getAddress("0xfE7FD5081f5B4b3De18882d6d01154AF1aA79114");
    const linkAddress = hre.ethers.getAddress("0x7798732310c3e91129c756C230D9cB21016758F4");
    const [deployer] = await hre.ethers.getSigners();

    const LinkToken = await hre.ethers.getContractAt([
        "function balanceOf(address account) external view returns (uint256)",
        "function transfer(address to, uint256 amount) external returns (bool)"
    ], linkAddress);

    const deployerBalance = await LinkToken.balanceOf(deployer.address);
    console.log("Deployer LINK Balance:", hre.ethers.formatEther(deployerBalance));

    if (deployerBalance > 0n) {
        // Transfer 5 LINK
        const amount = hre.ethers.parseEther("5"); // Adjust if needed
        const transferAmount = deployerBalance < amount ? deployerBalance : amount;

        console.log("Transferring " + hre.ethers.formatEther(transferAmount) + " LINK to " + contractAddress + "...");
        const tx = await LinkToken.transfer(contractAddress, transferAmount);
        await tx.wait();
        console.log("Transfer successful!");
    } else {
        console.log("Deployer has no LINK. Please fund " + deployer.address + " with LINK from https://faucets.chain.link/sepolia");
    }

    const contractBalance = await LinkToken.balanceOf(contractAddress);
    console.log("Contract LINK Balance:", hre.ethers.formatEther(contractBalance));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
