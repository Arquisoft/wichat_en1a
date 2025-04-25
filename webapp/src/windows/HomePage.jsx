/* HomePage.jsx */
import React, { useState, useRef } from 'react';
import { Card, Button, CardContent, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem, Icon, } from '@mui/material';
import VideogameAsset from '@mui/icons-material/VideogameAsset';
import School from '@mui/icons-material/School';
import AccessAlarm from '@mui/icons-material/AccessAlarm';
import DirectionsRun from '@mui/icons-material/DirectionsRun';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import NavBar from '../components/NavBarSignedIn';
import Roulette from '../components/RandomRoulette';
import '../css/HomePage.css';

const HomePage = () => {

  const [randomized, setRandomized] = useState(false);
  const [disableSwitch, setDisableSwitch] = useState(false);
  
  const [numQuestions] = useState(10);
  const [questionType, setQuestionType] = useState('all');
  const [timePerQuestion] = useState(60000);
  
  const { t } = useTranslation();
  
  const theme = useTheme();
  const scrollRef = useRef();

  const gameModes = [
    { id: 1, name: t('gameModes.basicQuiz.name'), description: t('gameModes.basicQuiz.description'), icon: <VideogameAsset />, mode: 'basicQuiz' },
    { id: 2, name: t('gameModes.expertDomain.name'), description: t('gameModes.expertDomain.description'), icon: <School />, mode: questionType === 'all' ? 'basicQuiz' : 'expertDomain' },
    { id: 3, name: t('gameModes.timeAttack.name'), description: t('gameModes.timeAttack.description'), icon: <AccessAlarm />, mode: 'timeAttack' },
    { id: 4, name: t('gameModes.endlessMarathon.name'), description: t('gameModes.endlessMarathon.description'), icon: <DirectionsRun />, mode: 'endlessMarathon' },
  ];

  const handleToggle = () => setRandomized((prev) => !prev);
  const handleChange = (e) => setQuestionType(e.target.value);

  return (
    <div className="window-container">
      <NavBar />
      <div className="menu-container">
        <h1 className="menu-title" id="home-title">
          {t('homePage.welcome')}
        </h1>
        <div className="menu-carousel" ref={scrollRef}>
          {gameModes.map((mode) => (
            <div key={mode.id} className="carousel-item">
              <Card
                className="menu-card"
                style={{ background: theme.palette.secondary.light }}
              >
                <CardContent>
                  <h2
                    className="menu-card-title"
                    style={{ color: theme.palette.accent.main }}
                  >
                    <Icon>{mode.icon}</Icon> {mode.name}
                  </h2>
                  <p
                    className="menu-card-description"
                    style={{ color: theme.palette.accent.main }}
                  >
                    {mode.description}
                  </p>
                  {mode.id === 2 && (
                    <>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={randomized}
                            onChange={handleToggle}
                            color="success"
                            disabled={disableSwitch}
                          />
                        }
                        label={
                          randomized
                            ? t('homePage.randomizeON')
                            : t('homePage.randomizeOFF')
                        }
                        sx={{ marginBottom: '0.5rem' }}
                      />
                      {!randomized ? (
                        <FormControl fullWidth sx={{ margin: '1rem 0 2rem' }}>
                          <InputLabel id="select-label">Topic</InputLabel>
                          <Select
                            labelId="select-label"
                            value={questionType}
                            label="Topic"
                            onChange={handleChange}
                          >
                            <MenuItem value="flag">{t('roulette.topics.flags')}</MenuItem>
                            <MenuItem value="science">
                              {t('roulette.topics.science')}
                            </MenuItem>
                            <MenuItem value="city">
                              {t('roulette.topics.cities')}
                            </MenuItem>
                            <MenuItem value="sport">
                              {t('roulette.topics.sports')}
                            </MenuItem>
                            <MenuItem value="celebrity">
                              {t('roulette.topics.celebrities')}
                            </MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Roulette
                          onSelectTopic={setQuestionType}
                          onClickSpin={() => setDisableSwitch(true)}
                        />
                      )}
                    </>
                  )}
                  <Button
                    id={`${mode.mode}Button`}
                    href={`/game?mode=${mode.mode}&numQuestions=${numQuestions}&questionType=${questionType}&timePerQuestion=${timePerQuestion}`}
                    sx={{
                      width: '100%',
                      padding: '0.5rem',
                      background: theme.palette.secondary.main,
                      color: theme.palette.accent.main,
                      border: `1px solid ${theme.palette.primary.main}`,
                      borderRadius: '0.5rem',
                      '&:hover': {
                        background: theme.palette.secondary.dark,
                        color: theme.palette.accent.light,
                      },
                    }}
                  >
                    {t('homePage.play')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
