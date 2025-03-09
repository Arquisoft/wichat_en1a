import { React, useState}  from 'react'
import { Card, Typography, Link, Grid, CardContent } from '@mui/material';
import NavBar from '../components/NavBarSignedIn'
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const gameModes = [
  { id:1, name:"Normal game", description:"Play a basic quiz game. You will be presented with an image, a question related to the image, and a set of possible answers. Try to choose the correct answer. You can also ask the AI chat for a hint!", image:"img/normal.jpg" },
  { id:2, name:"Expert's domain", description:"Play a basic game, but focused on an specific topic. Show your knowledge on your favourite topic, or let the randomized spinning wheel decide for you to make the game more challenging!", image:"img/expert.jpg" },
  { id:3, name:"Time attack", description:"In this game mode, the time is the limit. Try to answer as fast as you can and as much questions as possible before the timer goes to 0!", image:"img/time_attack.jpg" },
  { id:4, name:"Endless marathon", description:"Endless mode, no question limit. Keep answering questions until you miss while you climb up in the leaderboard!", image:"img/endless.jpg" }
];

const MainMenuPage = () => {

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="w-full flex justify-end p-4">
        <Button onClick={onLogout} variant="destructive" className="flex items-center gap-2">
          <LogOut size={16}/> Logout
        </Button>
      </div>
      <motion.h1 className="text-3x1 font-bold mb-6" initial={{opacity:0}} animate={{opacity:1}}>
        Main Menu
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4x1">
        {gameModes.map((mode) => (
          <motion.div key={mode.id} whileHover={{scale:1.05}}>
            <Card className="overflow-hidden rounded-2x1 shadow-1g">
              <img src={mode.image} alt={mode.name} className="w-full h-48 object-cover"/>
              <CardContent className="p-4 text-center">
                <h2 className="text-x1 font-semibold mb-2">{mode.name}</h2>
                <p className="text-gray-600 mb-4">{mode.description}</p>
                <Button variant="default">Play</Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default MainMenuPage;
