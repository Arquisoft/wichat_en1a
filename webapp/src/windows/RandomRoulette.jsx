import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBarSignedIn';
import "../css/Roulette.css";

// Still to be confirmed with the client, but for now we will use these mock topics:
const topics = [
  t('roulette.topics.flags'),
  t('roulette.topics.cities'),
  t('roulette.topics.science'),
  t('roulette.topics.sports'),
  t('roulette.topics.celebrities')
];

export default function Roulette() {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    const turns = 8 + Math.floor(Math.random() * 10); // Between 8 and 17 turns
    const finalAngle = angle + turns * 360 + Math.floor(Math.random() * 360);
    setAngle(finalAngle);

    // Calculating the winning topic (the one in the section pointed by the pointer in the bottom):
    const sectorAngle = 360 / topics.length;
    const adjustedAngle = finalAngle % 360;
    const winningAngle = (adjustedAngle + sectorAngle / 2) % 360;
    const selectedIndex = (topics.length - Math.floor(winningAngle / sectorAngle)) % topics.length;

    setTimeout(() => {
      setSelectedTopic(topics[selectedIndex].toLowerCase());
      setSpinning(false);
    }, 3000);
  };

  const goToGame = () => {
    navigate(`/game?mode=expert-domain&topic=${encodeURIComponent(selectedTopic)}`);
  };

  return (
    <div className="window-container">
      <NavBar />
      <div className="roulette-container">
        <div className="roulette-wheel-container">
          <motion.div
            className="roulette-wheel"
            animate={{ rotate: angle }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            {topics.map((topic, index) => (
              <div
                key={topic}
                className="roulette-topic"
                style={{
                  transform: `rotate(${(index / topics.length) * 360 + 90}deg) translate(8rem)`
                }}
              >
                {topic}
              </div>
            ))}
          </motion.div>
        </div>
        <div className="pointer"></div>
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
