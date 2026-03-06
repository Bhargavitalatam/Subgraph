const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Account:", deployer.address);

    // Sepolia LINK Token Address
    const linkAddress = ethers.getAddress("0x7798732310c3e91129c756C230D9cB21016758F4".toLowerCase());
    const oracleAddress = ethers.getAddress("0xfE7FD5081f5B4b3De18882d6d01154AF1aA79114".toLowerCase());

    const linkToken = await ethers.getContractAt("@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol:LinkTokenInterface", linkAddress);
    const balance = await linkToken.balanceOf(deployer.address);
    console.log("Deployer LINK balance:", ethers.formatUnits(balance, 18));

    const contractBalance = await linkToken.balanceOf(oracleAddress);
    console.log("Contract LINK balance:", ethers.formatUnits(contractBalance, 18));

    if (balance > 0n && contractBalance === 0n) {
        console.log("Funding contract with 0.1 LINK...");
        const tx = await linkToken.transfer(oracleAddress, ethers.parseUnits("0.1", 18));
        await tx.wait();
        console.log("Funded!");

        const newBalance = await linkToken.balanceOf(oracleAddress);
        console.log("New Contract LINK balance:", ethers.formatUnits(newBalance, 18));
    } else if (contractBalance > 0n) {
        console.log("Contract already funded.");
    } else {
        console.log("Deployer has no LINK to fund the contract.");
    }
}

main().catch(console.error);
