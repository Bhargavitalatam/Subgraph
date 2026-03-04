# Decentralized Weather Oracle & Subgraph

This project implements a robust, decentralized weather data oracle using Chainlink Any API and a Subgraph for indexing historical on-chain reports. It provides a complete end-to-end solution from smart contracts to a functional frontend.

## Features
- **WeatherOracle Contract**: Solidity contract using Chainlink Any API to fetch off-chain weather data securely.
- **Access Control & Safety**: Implements OpenZeppelin's `Ownable` and robust error handling for configurations and payments.
- **Event-Driven Indexing**: Emits `WeatherRequested` and `WeatherReported` events for efficient off-chain indexing.
- **The Graph Subgraph**: Indexes historical reports with an idempotent mapping logic for fast, flexible GraphQL querying.
- **React Frontend**: Premium UI to request weather data, track transaction status, and view historical reports with dynamic polling.

## Project Structure
- `contracts/`: Solidity smart contracts (Hardhat project).
- `subgraph/`: GraphQL schema, manifest, and AssemblyScript mappings (The Graph Project).
- `frontend/`: React application using Ethers.js and Apollo Client.
- `scripts/`: Deployment scripts using environment variables.
- `test/`: Comprehensive unit tests for core contract logic.

## Live Demo (Sepolia Testnet)
- **WeatherOracle Address**: `0xfE7FD5081f5B4b3De18882d6d01154AF1aA79114`
- **Network**: Sepolia
- **Frontend URL**: [To be added after Render deployment]

## Detailed Setup & Deployment

### 1. Prerequisites
- **Node.js**: v18 or higher.
- **Docker & Docker Compose**: For local infrastructure.
- **MetaMask**: Connected to Sepolia or a local network.

### 2. Environment Configuration
Copy the template and fill in your details:
```bash
cp .env.example .env
```
Key variables:
- `RPC_URL`: Your Sepolia provider URL (Infura/Alchemy).
- `PRIVATE_KEY`: Your wallet's private key.
- `LINK_TOKEN_ADDRESS`: The LINK token address on your target network.
- `ORACLE_ADDRESS`: The Chainlink Oracle address.
- `JOB_ID`: The specific Job ID for string/JSON data fetching.

### 3. Smart Contract Deployment
1. Install dependencies: `npm install`
2. Compile contracts: `npx hardhat compile`
3. Deploy to Sepolia:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   *Note: Ensure your wallet has enough testnet ETH and LINK tokens.*

### 4. Subgraph Deployment
1. Start local nodes: `docker-compose up -d`
2. Initialize & Deploy:
   ```bash
   cd subgraph
   npm install
   npm run codegen
   npm run build
   npm run create-local
   npm run deploy-local
   ```
   *For hosted service, use `graph deploy` with your access token.*

### 5. Frontend Usage
1. Configure `.env` in `frontend/` with your deployed contract address and subgraph URI.
2. Start application:
   ```bash
   cd frontend
   npm install
   npm start
   ```
3. **Usage**: Connect wallet -> Input city -> Click "Request Weather" -> Wait for on-chain update.

## Chainlink Integration
The contract uses the `ChainlinkClient` to build and send requests. It initiates a GET request to a weather API (example endpoint in code), parses the JSON response using a custom on-chain parser, and stores the `temperature` and `description` in the `weatherReports` mapping.

## Chainlink Configuration Explained

The project uses Chainlink's **Any API** (GET > Uint256/String) pattern to fetch data.
- **Oracle Address**: This is the address of the decentralized oracle node that will process the request.
- **Job ID**: A unique identifier for the specific task run by the oracle (e.g., fetching a JSON value).
- **LINK Funding**: The `WeatherOracle` contract must be funded with LINK tokens to pay for requests. In this implementation, users pay the contract in ETH (`msg.value`), which the owner can use to manage LINK liquidity, or the contract handles internal swaps if integrated with a DEX.

## Smart Contract Testing Strategy

Our testing strategy focuses on **isolation** and **reproducibility**:
1.  **Unit Tests**: Located in `test/WeatherOracle.test.js`, using Hardhat and Chai.
2.  **Mocking**: We simulate the Chainlink Oracle fulfillment to verify-on chain logic (parsing, storage, state) without needing a live oracle run.
3.  **Scenario Coverage**:
    - **Happy Path**: Successful request, correct JSON parsing of complex strings, and event emission.
    - **Edge Cases**: Negative temperatures, empty descriptions, and unauthorized fulfillment attempts.
    - **Access Control**: Verifying that only the owner can change critical infrastructure addresses.

To run tests:
```bash
npx hardhat test
```

## Visuals & Screenshots

### Working Frontend
![Frontend Mockup](./frontend_mockup.png)
*Figure 1: UI showing the request form and polling-based history list.*

### Subgraph GraphQL Playground
![Subgraph Playground Mockup](./subgraph_playground_mockup.png)
*Figure 2: Querying historical indexed data via The Graph.*

## Architecture & Security
- **Advanced Decisions**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Security Audit**: See [SECURITY.md](./SECURITY.md)
- **Walkthrough**: See [walkthrough.md](./walkthrough.md)
