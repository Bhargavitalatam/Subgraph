import React, { useState } from 'react';

function WeatherForm({ contract, account }) {
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!city) return;

        setLoading(true);
        setStatus('Requesting weather for ' + city + '...');
        try {
            const tx = await contract.requestWeather(city, {
                value: 0 // In a real scenario, this would be the LINK fee or a payment
            });
            setStatus('Transaction sent: ' + tx.hash);
            await tx.wait();
            setStatus('Weather requested successfully! Wait for oracle fulfillment.');
            setCity('');
        } catch (err) {
            console.error(err);
            setStatus('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
                type="text"
                placeholder="Enter city name (e.g., London)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <button
                type="submit"
                disabled={loading || !city}
                style={{
                    padding: '12px',
                    backgroundColor: loading ? '#94a3b8' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                }}
            >
                {loading ? 'Processing...' : 'Request Weather'}
            </button>
            {status && <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '8px' }}>{status}</p>}
        </form>
    );
}

export default WeatherForm;
