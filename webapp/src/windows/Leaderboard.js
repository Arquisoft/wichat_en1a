import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import NavBar from '../components/NavBarSignedIn';
import { useTranslation } from 'react-i18next';
import '../css/Leaderboard.css';

const Leaderboard = () => {

  const { t } = useTranslation();
  
  // TODO: Replace with actual logged-in player ID from auth context
  const loggedInPlayerId = '0';

  // State to hold leaderboard data. 
  // TODO: Fetch this from the corresponding API. 
  const [leaderboardData, setLeaderboardData] = useState(null);

  // Sample data simulating API response for each game mode.
  // TODO: Extract this data from the corresponding API.
  useEffect(() => {
    const sampleData = {
      basicQuiz: [
        { id: '1', name: 'María', score: 850 },
        { id: '0', name: 'You', score: 740 },
        { id: '4', name: 'Vicente', score: 680 },
        { id: '2', name: 'Miguel', score: 590 },
        { id: '3', name: 'Javier', score: 540 }
      ],
      expertDomain: [
        { id: '2', name: 'Miguel', score: 770 },
        { id: '4', name: 'Vicente', score: 610 },
        { id: '3', name: 'Javier', score: 590 },
        { id: '1', name: 'María', score: 540 },
        { id: '0', name: 'You', score: 370 }
      ],
      timeAttack: [
        { id: '0', name: 'You', score: 1510 },
        { id: '1', name: 'María', score: 1460 },
        { id: '2', name: 'Miguel', score: 1280 },
        { id: '3', name: 'Javier', score: 1220 },
        { id: '4', name: 'Vicente', score: 1110 }
      ],
      endlessMarathon: [
        { id: '3', name: 'Javier', score: 1250 },
        { id: '4', name: 'Vicente', score: 1110 },
        { id: '1', name: 'María', score: 1050 },
        { id: '2', name: 'Miguel', score: 950 },
        { id: '0', name: 'You', score: 760 }
      ]
    };
    setLeaderboardData(sampleData);
  }, []);

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
        {leaderboardData ? (
          <div className="leaderboard-grid">
            {renderLeaderboardSection('basicQuiz', t('gameModes.basicQuiz.name'))}
            {renderLeaderboardSection('expertDomain', t('gameModes.expertDomain.name'))}
            {renderLeaderboardSection('timeAttack', t('gameModes.timeAttack.name'))}
            {renderLeaderboardSection('endlessMarathon', t('gameModes.endlessMarathon.name'))}
          </div>
        ) : (
          <Typography>{t('loading')}</Typography>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
