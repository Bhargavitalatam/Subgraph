const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WeatherOracle", function () {
    let WeatherOracle;
    let weatherOracle;
    let owner;
    let addr1;
    let oracle;
    let linkToken;
    const jobId = ethers.encodeBytes32String("ca98ee09b580422ba470447401567581");

    beforeEach(async function () {
        [owner, addr1, oracle, linkToken] = await ethers.getSigners();

        WeatherOracle = await ethers.getContractFactory("WeatherOracle");
        weatherOracle = await WeatherOracle.deploy(
            linkToken.address,
            oracle.address,
            jobId
        );
        await weatherOracle.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right oracle", async function () {
            expect(await weatherOracle.oracle()).to.equal(oracle.address);
        });

        it("Should set the right jobId", async function () {
            expect(await weatherOracle.jobId()).to.equal(jobId);
        });
    });

    describe("Access Control", function () {
        it("Should only allow owner to set oracle", async function () {
            await expect(weatherOracle.connect(addr1).setChainlinkOracle(addr1.address))
                .to.be.revertedWithCustomError(weatherOracle, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);

            await weatherOracle.setChainlinkOracle(addr1.address);
            expect(await weatherOracle.oracle()).to.equal(addr1.address);
        });

        it("Should only allow owner to set jobId", async function () {
            const newJobId = ethers.encodeBytes32String("newJobId");
            await expect(weatherOracle.connect(addr1).setJobId(newJobId))
                .to.be.revertedWithCustomError(weatherOracle, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);

            await weatherOracle.setJobId(newJobId);
            expect(await weatherOracle.jobId()).to.equal(newJobId);
        });
    });

    describe("Requesting Weather", function () {
        it("Should emit WeatherRequested event and handle payment", async function () {
            const city = "London";
            const fee = ethers.parseEther("0.1");
            await expect(weatherOracle.requestWeather(city, { value: fee }))
                .to.emit(weatherOracle, "WeatherRequested")
                .withArgs(ethers.anything, city, owner.address);

            const balance = await ethers.provider.getBalance(await weatherOracle.getAddress());
            expect(balance).to.equal(fee);
        });
    });

    describe("Fulfilling Weather", function () {
        let requestId;
        const city = "London";

        beforeEach(async function () {
            const tx = await weatherOracle.requestWeather(city, { value: ethers.parseEther("0.1") });
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => {
                try {
                    const parsed = weatherOracle.interface.parseLog(log);
                    return parsed.name === "WeatherRequested";
                } catch (e) {
                    return false;
                }
            });
            requestId = weatherOracle.interface.parseLog(event).args.requestId;
        });

        it("Should only allow oracle to fulfill", async function () {
            const weatherData = '{"temp":25,"desc":"Sunny"}';
            await expect(weatherOracle.connect(addr1).fulfill(requestId, weatherData))
                .to.be.revertedWith("Source must be the oracle of the request");
        });

        it("Should parse JSON weather data correctly and emit WeatherReported", async function () {
            const weatherData = '{"temp":25,"desc":"Sunny"}';

            await expect(weatherOracle.connect(oracle).fulfill(requestId, weatherData))
                .to.emit(weatherOracle, "WeatherReported")
                .withArgs(requestId, city, 25, "Sunny", ethers.anything);

            const report = await weatherOracle.weatherReports(requestId);
            expect(report.city).to.equal(city);
            expect(report.temperature).to.equal(25);
            expect(report.description).to.equal("Sunny");
        });

        it("Should handle negative temperatures", async function () {
            const weatherData = '{"temp":-5,"desc":"Freezing"}';

            await weatherOracle.connect(oracle).fulfill(requestId, weatherData);
            const report = await weatherOracle.weatherReports(requestId);
            expect(report.temperature).to.equal(-5);
            expect(report.description).to.equal("Freezing");
        });
    });
});

