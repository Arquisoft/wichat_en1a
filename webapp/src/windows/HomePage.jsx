import React, { useState } from 'react';
import { Card, Button, CardContent, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem, Icon, Box, Slider } from '@mui/material';
import VideogameAsset from '@mui/icons-material/VideogameAsset';
import School from '@mui/icons-material/School';
import AccessAlarm from '@mui/icons-material/AccessAlarm';
import DirectionsRun from '@mui/icons-material/DirectionsRun';
import AutoFixHigh from '@mui/icons-material/AutoFixHigh';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import NavBar from '../components/NavBarSignedIn';
import Roulette from '../components/RandomRoulette';
import '../css/HomePage.css';
// Swiper imports
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/bundle';

const HomePage = () => {

  const [randomized, setRandomized] = useState(false);
  const [disableSwitch, setDisableSwitch] = useState(false);
  
  const [numQuestions, setNumQuestions] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(60);

  const [questionType, setQuestionType] = useState('all');
  
  const { t } = useTranslation();
  
  const theme = useTheme();

  const gameModes = [
    { id: 1, name: t('gameModes.basicQuiz.name'), description: t('gameModes.basicQuiz.description'), icon: <VideogameAsset />, mode: 'basicQuiz' },
    { id: 2, name: t('gameModes.expertDomain.name'), description: t('gameModes.expertDomain.description'), icon: <School />, mode: questionType === 'all' ? 'basicQuiz' : 'expertDomain' },
    { id: 3, name: t('gameModes.timeAttack.name'), description: t('gameModes.timeAttack.description'), icon: <AccessAlarm />, mode: 'timeAttack' },
    { id: 4, name: t('gameModes.endlessMarathon.name'), description: t('gameModes.endlessMarathon.description'), icon: <DirectionsRun />, mode: 'endlessMarathon' },
    { id: 5, name: t('gameModes.custom.name'), description: t('gameModes.custom.description'), icon: <AutoFixHigh />, mode: 'custom' },
  ];

  const questionSliderMarks = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 20, label: '20' },
    { value: 25, label: '25' },
    { value: 30, label: '30' }
  ];

  const timeSliderMarks = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 20, label: '20' },
    { value: 25, label: '25' },
    { value: 30, label: '30' },
    { value: 35, label: '35' },
    { value: 40, label: '40' },
    { value: 45, label: '45' },
    { value: 50, label: '50' },
    { value: 55, label: '55' },
    { value: 60, label: '60' }
  ];

  const handleToggle = () => setRandomized((prev) => !prev);
  const handleChange = (e) => setQuestionType(e.target.value);

  return (
    <div className="window-container">
      <NavBar />
      <div className="menu-container">
        <h1 className="menu-title" id="home-title">{t('homePage.welcome')}</h1>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={100}
          slidesPerView={1}
        >
          {gameModes.map((mode) => {

            // Params for the game URL
            const selectedMode = mode.mode;
            const params = new URLSearchParams();
            params.set('mode', selectedMode);
            if (selectedMode !== 'endlessMarathon') {
              params.set('numQuestions', String(numQuestions));
            }
            if (selectedMode === 'timeAttack') {
              // Wait for TimeAttack mode to be implemented
            } else {
              params.set('timePerQuestion', String(timePerQuestion * 1000));
            }
            params.set('questionType', questionType);
            
            return (
              <SwiperSlide>
                <div key={mode.id}>
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
                      {/* Custom game mode only */}
                      { mode.id === 5 && (
                        <>
                          <Box sx={{ margin: '1rem 0' }}>
                            <p>{t('homePage.slider.questions')}</p>
                            <Slider 
                              value={numQuestions} 
                              onChange={(e, v) => setNumQuestions(v)}
                              defaultValue={10}
                              min={5}
                              max={30}
                              step={5}
                              valueLabelDisplay="auto"
                              marks={questionSliderMarks}
                            />
                          </Box>
                          <Box sx={{ margin: '1rem 0' }}>
                            <p>{t('homePage.slider.time')}</p>
                            <Slider
                              value={timePerQuestion}
                              onChange={(e, v) => setTimePerQuestion(v)}
                              defaultValue={60}
                              min={5}
                              max={60}
                              step={5}
                              valueLabelDisplay="auto"
                              marks={timeSliderMarks}
                            />
                          </Box>
                        </>
                      )}
                      {/* Topic selection (Expert's Domain & Custom game mode) */}
                      { (mode.id === 2 || mode.id === 5) && (
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
                              <InputLabel id="select-label">{t('homePage.selectTopic')}</InputLabel>
                              <Select
                                labelId="select-label"
                                value={questionType}
                                label={t('homePage.selectTopic')}
                                onChange={handleChange}
                              >
                                <MenuItem value="flag">{t('roulette.topics.flags')}</MenuItem>
                                <MenuItem value="science">{t('roulette.topics.science')}</MenuItem>
                                <MenuItem value="city">{t('roulette.topics.cities')}</MenuItem>
                                <MenuItem value="sport">{t('roulette.topics.sports')}</MenuItem>
                                <MenuItem value="celebrity">{t('roulette.topics.celebrities')}</MenuItem>
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
                        href={`/game?${params.toString()}`}
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
              </SwiperSlide>
            )
          })}
          </Swiper>
      </div>
    </div>
  );
};

export default HomePage;
