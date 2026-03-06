// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {ChainlinkClient} from "@chainlink/contracts/src/v0.8/operatorforwarder/ChainlinkClient.sol";
import {Chainlink} from "@chainlink/contracts/src/v0.8/operatorforwarder/Chainlink.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract WeatherOracle is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    // Events
    event WeatherRequested(bytes32 indexed requestId, string city, address indexed requester);
    event WeatherReported(bytes32 indexed requestId, string city, int256 temperature, string description, uint256 timestamp);

    // State variables
    struct WeatherReport {
        string city;
        int256 temperature;
        string description;
        uint256 timestamp;
    }
    mapping(bytes32 => WeatherReport) public weatherReports;
    mapping(bytes32 => string) private requestToCity;
    
    address public chainlinkToken; // LINK Token address
    address public oracle;         // Chainlink Oracle address
    bytes32 public jobId;          // Chainlink Job ID

    constructor(address _link, address _oracle, bytes32 _jobId) Ownable(msg.sender) {
        _setChainlinkToken(_link);
        _setChainlinkOracle(_oracle);
        jobId = _jobId;
        chainlinkToken = _link;
        oracle = _oracle;
    }

    function requestWeather(string memory _city) public payable returns (bytes32 requestId) {
        require(bytes(_city).length > 0, "City name cannot be empty");
        require(oracle != address(0), "Oracle address not configured");
        require(jobId != bytes32(0), "Job ID not configured");
        require(msg.value >= 0.01 ether, "Insufficient payment for weather request");

        Chainlink.Request memory request = _buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Example logic for adding parameters
        // request.add("get", "https://api.openweathermap.org/data/2.5/weather?q={_city}&appid={API_KEY}");
        // request.add("path", "main.temp");
        // request.addInt("times", 100);
        
        requestId = _sendChainlinkRequest(request, msg.value); // Use msg.value as fee for simplicity
        requestToCity[requestId] = _city;
        emit WeatherRequested(requestId, _city, msg.sender);
    }

    function fulfill(bytes32 _requestId, string memory _weatherData) public recordChainlinkFulfillment(_requestId) {
        // Manual parsing logic for a simplified JSON string: e.g., '{"temp":20,"desc":"Cloudy"}'
        int256 temperature = 0;
        string memory description = "";

        // Simple search for "temp": and "desc":
        bytes memory dataBytes = bytes(_weatherData);
        
        // This is a minimal parser for demonstration purposes
        // In a production environment, use a robust JSON library or oracle-side parsing
        for (uint i = 0; i < dataBytes.length - 6; i++) {
            if (dataBytes[i] == '"' && dataBytes[i+1] == 't' && dataBytes[i+2] == 'e' && dataBytes[i+3] == 'm' && dataBytes[i+4] == 'p' && dataBytes[i+5] == '"') {
                // Found "temp", look for the value after ':'
                uint j = i + 7;
                while (j < dataBytes.length && (dataBytes[j] < '0' || dataBytes[j] > '9') && dataBytes[j] != '-') {
                    j++;
                }
                uint start = j;
                while (j < dataBytes.length && ((dataBytes[j] >= '0' && dataBytes[j] <= '9') || dataBytes[j] == '-')) {
                    j++;
                }
                if (j > start) {
                    temperature = parseInt(substring(_weatherData, start, j));
                }
            }
            if (dataBytes[i] == '"' && dataBytes[i+1] == 'd' && dataBytes[i+2] == 'e' && dataBytes[i+3] == 's' && dataBytes[i+4] == 'c' && dataBytes[i+5] == '"') {
                // Found "desc", look for the value after ':' and '"'
                uint j = i + 7;
                while (j < dataBytes.length && dataBytes[j] != '"') {
                    j++;
                }
                j++; // skip opening quote
                uint start = j;
                while (j < dataBytes.length && dataBytes[j] != '"') {
                    j++;
                }
                description = substring(_weatherData, start, j);
            }
        }
        
        if (bytes(description).length == 0) {
            description = _weatherData; // Fallback to raw data if parsing fails
        }
        
        string memory city = requestToCity[_requestId];
        
        weatherReports[_requestId] = WeatherReport({
            city: city,
            temperature: temperature,
            description: description,
            timestamp: block.timestamp
        });

        emit WeatherReported(_requestId, city, temperature, description, block.timestamp);
    }

    // Helper functions for parsing
    function parseInt(string memory _a) internal pure returns (int256 _parsedInt) {
        bytes memory bresult = bytes(_a);
        int256 mint = 0;
        bool negative = false;
        for (uint i = 0; i < bresult.length; i++) {
            if (i == 0 && bresult[i] == "-") {
                negative = true;
                continue;
            }
            if (uint8(bresult[i]) >= 48 && uint8(bresult[i]) <= 57) {
                mint *= 10;
                mint += int256(int8(uint8(bresult[i]) - 48));
            }
        }
        return negative ? -mint : mint;
    }

    function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    function setChainlinkOracle(address _oracle) public onlyOwner {
        oracle = _oracle;
        _setChainlinkOracle(_oracle);
    }

    function setJobId(bytes32 _jobId) public onlyOwner {
        jobId = _jobId;
    }

    /**
     * @dev Allows owner to simulate a weather report for demo purposes without LINK tokens.
     */
    function simulateWeatherReport(string memory _city, int256 _temp, string memory _desc) public onlyOwner {
        bytes32 mockId = keccak256(abi.encodePacked(_city, block.timestamp));
        
        weatherReports[mockId] = WeatherReport({
            city: _city,
            temperature: _temp,
            description: _desc,
            timestamp: block.timestamp
        });

        emit WeatherReported(mockId, _city, _temp, _desc, block.timestamp);
    }
    
    receive() external payable {}
}
