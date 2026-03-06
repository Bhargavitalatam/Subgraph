const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    const WeatherOracle = await ethers.getContractFactory("WeatherOracle");
    const oracleAddress = "0xfE7FD5081f5B4b3De18882d6d01154AF1aA79114";
    const oracle = WeatherOracle.attach(oracleAddress);

    try {
        console.log("Checking oracle address:", oracleAddress);
        const code = await ethers.provider.getCode(oracleAddress);
        if (code === "0x") {
            console.log("Contract is NOT deployed at this address.");
            return;
        }

        const chainlinkToken = await oracle.chainlinkToken();
        const oracleNode = await oracle.oracle();
        const jobId = await oracle.jobId();

        console.log("chainlinkToken:", chainlinkToken);
        console.log("oracle node:", oracleNode);
        console.log("jobId:", jobId);

        const linkToken = await ethers.getContractAt("@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol:LinkTokenInterface", chainlinkToken);
        const balance = await linkToken.balanceOf(oracleAddress);
        console.log("Contract LINK balance:", ethers.formatUnits(balance, 18));

    } catch (e) {
        console.error("Error reading from contract:", e);
    }
}

main().catch(console.error);
