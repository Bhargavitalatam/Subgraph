const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const newOwner = "0xAB16108855e5698533a3D7B43Cda8b98e7DdD9D6"; // User's MetaMask wallet
    const oracleAddress = "0xfE7FD5081f5B4b3De18882d6d01154AF1aA79114";

    const WeatherOracle = await ethers.getContractFactory("WeatherOracle");
    const oracle = WeatherOracle.attach(oracleAddress);

    const currentOwner = await oracle.owner();
    console.log("Current owner:", currentOwner);
    console.log("Transferring ownership to:", newOwner);

    const tx = await oracle.transferOwnership(newOwner);
    await tx.wait();

    const updatedOwner = await oracle.owner();
    console.log("New owner confirmed:", updatedOwner);
}

main().catch(console.error);
