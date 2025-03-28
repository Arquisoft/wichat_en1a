import { React, useState }  from 'react'
import { Card, Button, CardContent, Switch, FormControlLabel, Icon } from '@mui/material';
import VideogameAsset from "@mui/icons-material/VideogameAsset"
import School from "@mui/icons-material/School"
import AccessAlarm from "@mui/icons-material/AccessAlarm"
import DirectionsRun from "@mui/icons-material/DirectionsRun"
import NavBar from '../components/NavBarSignedIn'
import { useTranslation } from 'react-i18next';
import "../HomePage.css";

const HomePage = () => {

  const [randomized, setRandomized] = useState(false);
  const {t} = useTranslation();

  const gameModes = [
    { id: 1, name: t('gameModes.basicQuiz.name'), description: t('gameModes.basicQuiz.description'), icon: <VideogameAsset/> },
    { id: 2, name: t('gameModes.expertDomain.name'), description: t('gameModes.expertDomain.description'), icon: <School/> },
    { id: 3, name: t('gameModes.timeAttack.name'), description: t('gameModes.timeAttack.description'), icon: <AccessAlarm/> },
    { id: 4, name: t('gameModes.endlessMarathon.name'), description: t('gameModes.endlessMarathon.description'), icon: <DirectionsRun/> }
  ];

  const handleToggle = () => {
    setRandomized((prev) => !prev); // Toggle the randomization state
  };

  return (
    <div className="window-container">
      <NavBar/>
      <div className="menu-container">
        <h1 className="menu-title">
          {t('homePage.welcome')}
        </h1>
        <div className="menu-grid">
          {gameModes.map((mode) => (
            <div key={mode.id}>
              <Card className="menu-card">
                <CardContent>
                  <h2 className="menu-card-title"><Icon>{mode.icon} </Icon> {mode.name}</h2>
                  <p className="menu-card-description">{mode.description}</p>
                  {/* Show a switch only for "Expert's domain" mode to randomize the topic */}
                  {mode.id === 2 && (
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={randomized} 
                          onChange={handleToggle} 
                          color="success"
                        />
                      }
                      label={randomized ? t('homePage.randomizeON') : t('homePage.randomizeOFF')}
                      sx={{ marginBottom: "0.5rem" }}
                    />
                  )}
                  <Button href="/game" className="menu-card-button" 
                  sx={{
                    width: "100%",
                    padding: "0.5rem",
                    backgroundColor: "rgb(69, 128, 98)",
                    color: "white",
                    border: "1px solid rgb(5, 31, 2)",
                    borderRadius: "0.5rem",
                    "&:hover": {
                      backgroundColor: "rgb(35, 45, 19)"
                    }
                  }}>{t('homePage.play')}</Button>
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
