import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import NavBar from '../components/NavBarSignedIn';
import { useTranslation } from 'react-i18next';
import '../css/Leaderboard.css';

const Leaderboard = () => {

  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  const { t } = useTranslation();
  
  // TODO: Replace with actual logged-in player ID from auth context
  const loggedInPlayerId = '0';

  // State to hold leaderboard data. 
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [error, setError] = useState(null);
  const gameModes = ['basicQuiz', 'expertDomain', 'timeAttack', 'endlessMarathon'];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Array of fetch promises for each game mode
        const requests = gameModes.map(mode =>
          fetch(`${gatewayUrl}/leaderboard/${mode}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Error fetching ${mode} leaderboard`);
              }
              return response.json();
            })
        );
        
        // Waiting for all fetch requests to complete
        const results = await Promise.all(requests);
        // Dictionary with keys as game mode names
        const data = {};
        gameModes.forEach((mode, index) => {
          data[mode] = results[index];
        });
        setLeaderboardData(data);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError(err.message);
      }
    };

    fetchLeaderboard();
  }, [gatewayUrl]);

  // Auxiliary function to render each game mode section
  const renderLeaderboardSection = (modeKey, modeDisplayName) => {
    const results = leaderboardData[modeKey] || [];
    return (
      <div key={modeKey} className="leaderboard-section">
        <Typography variant="h5" className="section-title">
          {modeDisplayName}
        </Typography>
        <Card variant="outlined" className="leaderboard-card">
          <CardContent>
            <List>
              {results.map((result, index) => (
                <React.Fragment key={result.id}>
                  <ListItem
                    className={result.id === loggedInPlayerId ? 'list-item highlighted' : 'list-item'}
                  >
                    <ListItemText 
                      primary={`${index + 1}. ${result.name}`}
                      secondary={`${t('score')}: ${result.score}`} 
                    />
                  </ListItem>
                  {index < results.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="window-container">
      <NavBar />
      <div className="leaderboard-container">
        <Typography variant="h3" align="center" gutterBottom>
          {t('leaderboard')}
        </Typography>
        {error && (
          <Typography color="error">
            {t('error')}: {error}
          </Typography>
        )}
        {leaderboardData ? (
          <div className="leaderboard-grid">
            {renderLeaderboardSection('basicQuiz', t('gameModes.basicQuiz.name'))}
            {renderLeaderboardSection('expertDomain', t('gameModes.expertDomain.name'))}
            {renderLeaderboardSection('timeAttack', t('gameModes.timeAttack.name'))}
            {renderLeaderboardSection('endlessMarathon', t('gameModes.endlessMarathon.name'))}
          </div>
        ) : (
          !error && <Typography>{t('loading')}</Typography>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
