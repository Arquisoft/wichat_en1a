import { React, useState }  from 'react'
import { Card, Button, CardContent, Switch, FormControlLabel, Icon } from '@mui/material';
import VideogameAsset from "@mui/icons-material/VideogameAsset"
import School from "@mui/icons-material/School"
import AccessAlarm from "@mui/icons-material/AccessAlarm"
import DirectionsRun from "@mui/icons-material/DirectionsRun"
import NavBar from '../components/NavBarSignedIn'
import { useTranslation } from 'react-i18next';
import { useTheme } from "@mui/material/styles";
import "../css/HomePage.css";

const HomePage = () => {

  const [randomized, setRandomized] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionType, setQuestionType] = useState("any");
  const [timePerQuestion, setTimePerQuestion] = useState(60000);

  const { t } = useTranslation();
  const theme = useTheme();

  const gameModes = [
    { id: 1, name: t('gameModes.basicQuiz.name'), description: t('gameModes.basicQuiz.description'), icon: <VideogameAsset />, mode: 'basic-quiz' },
    { id: 2, name: t('gameModes.expertDomain.name'), description: t('gameModes.expertDomain.description'), icon: <School />, mode: randomized ? 'roulette' : 'expert-domain' },
    { id: 3, name: t('gameModes.timeAttack.name'), description: t('gameModes.timeAttack.description'), icon: <AccessAlarm />, mode: 'time-attack' },
    { id: 4, name: t('gameModes.endlessMarathon.name'), description: t('gameModes.endlessMarathon.description'), icon: <DirectionsRun />, mode: 'endless-marathon' }
  ];

  const handleToggle = () => {
    setRandomized((prev) => !prev); // Toggle the randomization state
  };

  return (
    <div 
      className = "window-container"
      style = {{
        backgroundImage: `linear-gradient(to right, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`
      }}
    >
      <NavBar/>
      <div className = "menu-container">
        <h1 
          className = "menu-title"
          style={{
            color: `${theme.palette.secondary.light}`
          }}
        >
          {t('homePage.welcome')}
        </h1>
        <div className = "menu-grid">
          {gameModes.map((mode) => (
            <div key = {mode.id}>
              <Card 
                className = "menu-card"
                style={{
                  background: `${theme.palette.secondary.light}`
                }}  
              >
                <CardContent>
                  <h2 
                    className = "menu-card-title"
                    style = {{
                      color: `${theme.palette.accent.main}`
                    }}
                  ><Icon>{mode.icon} </Icon> {mode.name}</h2>
                  <p 
                    className = "menu-card-description"
                    style = {{
                      color: `${theme.palette.accent.main}`
                    }}  
                  >{mode.description}</p>
                  {/* Show a switch only for "Expert's domain" mode to randomize the topic */}
                  {mode.id === 2 && (
                    <FormControlLabel
                      control = {
                        <Switch 
                          checked = {randomized} 
                          onChange = {handleToggle} 
                          color = "success"
                        />
                      }
                      label = {randomized ? t('homePage.randomizeON') : t('homePage.randomizeOFF')}
                      sx = {{ marginBottom: "0.5rem" }}
                    />
                  )}
                  <Button
                    href={`/game?mode=${mode.mode}&numQuestions=${numQuestions}&questionType=${questionType}&timePerQuestion=${timePerQuestion}`}
                    sx={{
                      width: "100%",
                      padding: "0.5rem",
                      background: `${theme.palette.secondary.main}`,
                      color: `${theme.palette.accent.main}`,
                      border: `1px solid ${theme.palette.primary.main}`,
                      borderRadius: "0.5rem",
                      "&:hover": {
                        background: `${theme.palette.secondary.dark}`,
                        color: `${theme.palette.accent.light}`,
                      }
                    }}
                  >{t('homePage.play')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
