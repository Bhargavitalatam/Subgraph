# Architecture Overview

## Decentralized Weather Data Oracle

The project uses a modular architecture combining real-time data retrieval with efficient historical indexing.

### Components

1.  **WeatherOracle Smart Contract (Solidity)**
    *   **Chainlink Any API**: Uses the Any API pattern to fetch weather data from off-chain sources (e.g., OpenWeatherMap).
    *   **Fulfillment Logic**: Securely receives and parses data from the Chainlink Oracle.
    *   **Storage**: Maintains a mapping of request IDs to weather reports for recent data.
    *   **Events**: Emits `WeatherRequested` and `WeatherReported` for Subgraph indexing.

2.  **The Graph Subgraph**
    *   **Indexing**: Listens for `WeatherReported` events emitted by the `WeatherOracle`.
    *   **Entities**: Stores weather reports in a queryable format with fields for city, temperature, description, etc.
    *   **GraphQL API**: Exposes an endpoint for the frontend to query historical data efficiently.

3.  **React Frontend**
    *   **User Interface**: Allows users to input a city and request weather data.
    *   **Integration**: Uses Ethers.js for contract interaction and Apollo Client for Subgraph queries.
    *   **Real-time Updates**: Polls the Subgraph for the latest reports.

### Data Flow

1.  User enters a city in the React frontend.
2.  Frontend calls `requestWeather` on the `WeatherOracle` contract.
3.  Contract sends a request to the Chainlink Oracle.
4.  Chainlink Oracle fetches data from the weather API and calls `fulfill` on the `WeatherOracle` contract.
5.  `WeatherOracle` contract emits `WeatherReported` event.
6.  The Graph Node indexes the event and updates the GraphQL API.
7.  The React frontend polls for new data and displays the latest report in the list.

### Design Decisions

*   **Gas Efficiency**: Historical data is indexed off-chain in the Subgraph instead of stored permanently on-chain to save gas.
*   **Modularity**: Decoupled the oracle from the indexing layer, allowing for future extensions (e.g., adding more sources).
*   **Security**: Used OpenZeppelin's `Ownable` for administrative functions and Chainlink's `recordChainlinkFulfillment` modifier for secure callbacks.
