import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import WeatherOracleABI from './contracts/WeatherOracle.json';
import WeatherForm from './components/WeatherForm';
import WeatherReportsList from './components/WeatherReportsList';

const weatherOracleAddress = process.env.REACT_APP_WEATHER_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000';
const subgraphUri = process.env.REACT_APP_SUBGRAPH_URI || 'http://localhost:8000/subgraphs/name/weather-oracle';

const client = new ApolloClient({
    uri: subgraphUri,
    cache: new InMemoryCache(),
});

function App() {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [network, setNetwork] = useState(null);
    const [contract, setContract] = useState(null);

    const updateWalletInfo = async (provider, acc) => {
        const bal = await provider.getBalance(acc);
        const net = await provider.getNetwork();
        setBalance(ethers.formatEther(bal));
        setNetwork(net.name);
    };

    useEffect(() => {
        const connectWalletOnLoad = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    const acc = accounts[0].address;
                    setAccount(acc);
                    await updateWalletInfo(provider, acc);
                    const signer = await provider.getSigner();
                    setContract(new ethers.Contract(weatherOracleAddress, WeatherOracleABI.abi, signer));
                }
            }
        };
        connectWalletOnLoad();
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const acc = accounts[0];
            setAccount(acc);
            await updateWalletInfo(provider, acc);
            const signer = await provider.getSigner();
            setContract(new ethers.Contract(weatherOracleAddress, WeatherOracleABI.abi, signer));
        } else {
            alert("Please install MetaMask!");
        }
    };

    return (
        <ApolloProvider client={client}>
            <div className="App" style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ color: '#2563eb' }}>Decentralized Weather Oracle</h1>
                    {!account ? (
                        <button
                            onClick={connectWallet}
                            style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <div style={{ color: '#64748b' }}>
                            <p>Connected: <strong>{account}</strong></p>
                            <p>Network: <strong>{network}</strong> | Balance: <strong>{balance} ETH</strong></p>
                        </div>
                    )}
                </header>

                <main style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gap: '40px' }}>
                    <section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>Request Weather Data</h2>
                        {contract ? (
                            <WeatherForm contract={contract} account={account} />
                        ) : (
                            <p>Please connect your wallet to request weather data.</p>
                        )}
                    </section>

                    <section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>Historical Reports</h2>
                        <WeatherReportsList />
                    </section>
                </main>
            </div>
        </ApolloProvider>
    );
}

export default App;
