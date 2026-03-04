const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const LINK_TOKEN = hre.ethers.getAddress(process.env.LINK_TOKEN_ADDRESS.trim().toLowerCase());
    const ORACLE = hre.ethers.getAddress(process.env.ORACLE_ADDRESS.trim().toLowerCase());
    const JOB_ID = process.env.JOB_ID.trim();

    if (!LINK_TOKEN || !ORACLE || !JOB_ID) {
        throw new Error("Please set LINK_TOKEN_ADDRESS, ORACLE_ADDRESS, and JOB_ID in your .env file");
    }

    const jobIdBytes = hre.ethers.toUtf8Bytes(JOB_ID);
    const jobIdBytes32 = hre.ethers.zeroPadValue(jobIdBytes, 32);

    const WeatherOracle = await hre.ethers.getContractFactory("WeatherOracle");
    const weatherOracle = await WeatherOracle.deploy(
        LINK_TOKEN,
        ORACLE,
        jobIdBytes32
    );


    await weatherOracle.waitForDeployment();

    console.log("WeatherOracle deployed to:", await weatherOracle.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
