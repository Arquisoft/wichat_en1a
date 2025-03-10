import { React, useState }  from 'react'
import { Card, Button, CardContent, Switch, FormControlLabel } from '@mui/material';
import NavBar from '../components/NavBarSignedIn'
import "../MainMenu.css";

const gameModes = [
  { id:1, name:"Normal game", description:"Play a basic quiz game. You will be presented with an image, a question related to the image, and a set of possible answers. Try to choose the correct answer. You can also ask the AI chat for a hint!", image: require("../img/normal.jpg") },
  { id:2, name:"Expert's domain", description:"Play a basic game, but focused on an specific topic. Show your knowledge on your favourite topic, or let the randomized spinning wheel decide for you to make the game more challenging!", image: require("../img/expert.jpg") },
  { id:3, name:"Time attack", description:"In this game mode, the time is the limit. Try to answer as fast as you can and as much questions as possible before the timer goes to 0!", image: require("../img/time_attack.jpg") },
  { id:4, name:"Endless marathon", description:"Endless mode, no question limit. Keep answering questions until you miss while you climb up in the leaderboard!", image: require("../img/endless.jpg") }
];

const MainMenuPage = () => {

  const [randomized, setRandomized] = useState(false);

  const handleToggle = () => {
    setRandomized((prev) => !prev); // Toggle the randomization state
  };

  return (
    <div className="window-container">
      <NavBar/>
      <div className="menu-container">
        <h1 className="menu-title">
          Welcome to WiChat game! Select a game mode to start playing:
        </h1>
        <div className="menu-grid">
          {gameModes.map((mode) => (
            <div key={mode.id}>
              <Card className="menu-card">
                <img src={mode.image} alt={mode.name + " gamemode logo"}/>
                <CardContent>
                  <h2 className="menu-card-title">{mode.name}</h2>
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
                      label={randomized ? "Randomize Topic: ON" : "Randomize Topic: OFF"}
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
                  }}>Play</Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainMenuPage;
