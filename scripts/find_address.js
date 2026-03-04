const hre = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Account:", deployer.address);
    const nonce = await hre.ethers.provider.getTransactionCount(deployer.address);
    console.log("Current Nonce:", nonce);

    if (nonce > 0) {
        const deployedAddress = hre.ethers.getCreateAddress({
            from: deployer.address,
            nonce: nonce - 1
        });
        console.log("Contract deployed at (nonce " + (nonce - 1) + "):", deployedAddress);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
