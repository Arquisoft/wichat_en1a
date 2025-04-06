import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NavBar from '../components/NavBarSignedIn';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';

import '../css/Leaderboard.css';

const Leaderboard = () => {

  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  const theme = useTheme();
  const { t } = useTranslation();
  
  const getLoggedInUserId = () => {
    const token = localStorage.getItem('sessionToken');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.userId;
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  };

  const loggedInPlayerId = getLoggedInUserId();
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
          data[mode] = results[index].leaderboard || [];
        });
        setLeaderboardData(data);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError(err.message);
      }
    };

    fetchLeaderboard();
  }, [gatewayUrl,gameModes]);

  // Auxiliary function to render each game mode section
  const renderLeaderboardSection = (modeKey, modeDisplayName) => {
    const results = leaderboardData[modeKey] || [];
    return (
      <div 
        key={modeKey} 
        className="leaderboard-section"
      >
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
                      primary={`${index + 1}. ${result.userId}`}
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
    <div 
      className="window-container"
      style = {{
        backgroundImage: `linear-gradient(to right, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
        height: '100vh',
      }}
    >
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
            {gameModes.map(mode => renderLeaderboardSection(mode, t(`gameModes.${mode}.name`)))}
          </div>
        ) : (
          !error && <Typography>{t('loading')}</Typography>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
