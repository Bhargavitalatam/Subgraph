import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_WEATHER_REPORTS = gql`
  query GetWeatherReports {
    weatherReports(orderBy: timestamp, orderDirection: desc, first: 10) {
      id
      city
      temperature
      description
      timestamp
      requester
    }
  }
`;

function WeatherReportsList() {
    const { loading, error, data } = useQuery(GET_WEATHER_REPORTS, {
        pollInterval: 5000, // Poll every 5 seconds for updates
    });

    if (loading) return <p>Loading reports...</p>;
    if (error) return <p>Error loading reports: {error.message}</p>;

    return (
        <div style={{ display: 'grid', gap: '12px' }}>
            {data.weatherReports.length === 0 ? (
                <p>No reports found yet.</p>
            ) : (
                data.weatherReports.map((report) => (
                    <div key={report.id} style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>{report.city}</h3>
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                {new Date(parseInt(report.timestamp) * 1000).toLocaleString()}
                            </span>
                        </div>
                        <p style={{ margin: '4px 0', fontSize: '0.925rem' }}>
                            <strong>Temp:</strong> {report.temperature}°C | <strong>Desc:</strong> {report.description}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', wordBreak: 'break-all' }}>
                            Requester: {report.requester}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default WeatherReportsList;
