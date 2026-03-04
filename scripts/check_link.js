const hre = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const linkAddress = "0x7798732310c3e91129c756C230D9cB21016758F4";

    // Normalize to checksummed address via lowercasing first
    const safeLinkAddress = hre.ethers.getAddress(linkAddress.toLowerCase());

    const LinkToken = await hre.ethers.getContractAt([
        "function balanceOf(address account) external view returns (uint256)"
    ], safeLinkAddress);

    const balance = await LinkToken.balanceOf(deployer.address);
    console.log("Deployer LINK Balance:", hre.ethers.formatEther(balance));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
