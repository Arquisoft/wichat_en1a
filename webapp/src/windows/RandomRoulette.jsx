import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBarSignedIn'
import "../css/Roulette.css";

const topics = [ /* TODO: Discuss the exact topics that we must include */
  "Flags",
  "Cities",
  "Celebrities / Famous",
  "Entertainment",
  "Sports",
  "Science"
];

export default function Roulette() {

  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigate = useNavigate();
  const {t} = useTranslation();

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    const turns = 10 + Math.floor(Math.random() * 5); // From 10 to 14 spins
    const finalAngle = angle + turns * 360 + Math.floor(Math.random() * 360);
    setAngle(finalAngle);

    setTimeout(() => {
      const selectedIndex =
        Math.floor(((finalAngle % 360) / 360) * topics.length) % topics.length;
      setSelectedTopic(topics[selectedIndex]);
      setSpinning(false);
    }, 3000);
  };

  const goToGame = () => {
    // Navega a la ventana del juego pasando el tema seleccionado por query
    navigate(`/game/expert-domain?topic=${encodeURIComponent(selectedTopic)}`);
  };

  return (
    <div className = "window-container">
        <NavBar/>
        <div className="roulette-container">
        <motion.div
            className="roulette-wheel"
            animate={{ rotate: angle }}
            transition={{ duration: 3, ease: "easeOut" }}
        >
            <div className="pointer"></div>
            {topics.map((topic, index) => (
            <div
                key={topic}
                className="roulette-topic"
                style={{
                transform: `rotate(${(index / topics.length) * 360}deg) translate(75px)`
                }}
            >
                {topic}
            </div>
            ))}
        </motion.div>
        <div className="buttons-container">
            <Button onClick={spin} disabled={spinning} variant="contained">
            {t('roulette.spin')}
            </Button>
            {selectedTopic && (
            <>
                <p className="selected-topic">{t('roulette.topic')} {selectedTopic}</p>
                <Button onClick={goToGame} variant="contained" color="primary">
                {t('roulette.next')}
                </Button>
            </>
            )}
        </div>
        </div>
    </div>
  );
}
