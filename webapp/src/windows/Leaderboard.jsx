import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NavBar from '../components/NavBarSignedIn';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import '../css/Leaderboard.css';
// Swiper core and required modules
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import "swiper/css/navigation";

const Leaderboard = () => {

  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  const theme = useTheme();
  const scrollRef = useRef();
  const { t } = useTranslation();
  
  const getLoggedInUserId = () => {
      const token = sessionStorage.getItem("sessionToken");
      if (!token) return null;
      try {
        const decoded = jwtDecode(token);
        const userId = sessionStorage.getItem("loggedInUser") || decoded.userId;
        return userId;
      } catch (error) {
        console.error('Invalid token', error);
        return null;
      }
    };

  const loggedInPlayerId = getLoggedInUserId();
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [error, setError] = useState(null);
  const gameModes = useMemo(()=>['basicQuiz', 'expertDomain', 'timeAttack', 'endlessMarathon'],[]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Array of fetch promises for each game mode
        const requests = gameModes.map(mode =>
          fetch(`${gatewayUrl}/api/leaderboard/${mode}`)
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
      <SwiperSlide>
        <div 
          key={modeKey} 
          className="leaderboard-section"
        >
          <Typography variant="h5" className="section-title">
            {modeDisplayName}
          </Typography>
          <Card 
            variant="outlined" 
            className="leaderboard-card"
            style={{
              background: `${theme.palette.secondary.light}`
            }}
          >
            <CardContent>
              <List>
                {results.slice(0, 10).map((result, index) => (
                  <React.Fragment key={result.id}>
                    <ListItem
                      className={result.userId?.toString() === loggedInPlayerId?.toString() ? 'list-item highlighted' : 'list-item'}
                    >
                      <ListItemText 
                        primary={`${index + 1}. ${result.userId} ${result.userId?.toString() === loggedInPlayerId?.toString() ? '(You)' : ''}`}
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
      </SwiperSlide>
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
          <Swiper 
            modules={[Navigation]}
            navigation={true}
            spaceBetween={500}
            slidesPerView={1}
          >
            {gameModes.map(mode => renderLeaderboardSection(mode, t(`gameModes.${mode}.name`)))}
          </Swiper>
        ) : (
          !error && <Typography>{t('loading')}</Typography>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
