const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const LINK_TOKEN = hre.ethers.getAddress(process.env.LINK_TOKEN_ADDRESS.trim().toLowerCase());
    const ORACLE = hre.ethers.getAddress(process.env.ORACLE_ADDRESS.trim().toLowerCase());
    const JOB_ID = process.env.JOB_ID.trim();

    const jobIdBytes = hre.ethers.toUtf8Bytes(JOB_ID);
    const jobIdBytes32 = hre.ethers.zeroPadValue(jobIdBytes, 32);

    const WeatherOracle = await hre.ethers.getContractFactory("WeatherOracle");
    const weatherOracle = await WeatherOracle.deploy(LINK_TOKEN, ORACLE, jobIdBytes32);
    await weatherOracle.waitForDeployment();

    const addr = await weatherOracle.getAddress();
    fs.writeFileSync("new_contract_address.txt", addr);
    console.log("NEW CONTRACT ADDRESS:", addr);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
