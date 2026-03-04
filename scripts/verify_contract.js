const hre = require("hardhat");

async function main() {
    const address = "0xfE7FD5081f5B4b3De18882d6d01154AF1aA79114";
    const code = await hre.ethers.provider.getCode(address);
    if (code !== "0x") {
        console.log("Contract exists at " + address);
    } else {
        console.log("No contract at " + address);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
