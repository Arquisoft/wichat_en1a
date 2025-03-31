import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
import "../css/Roulette.css";

export default function Roulette({onSelectTopic, onClickSpin}) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  const { t } = useTranslation();

  // Still to be confirmed with the client, but for now we will use these mock topics:
  const topics = [
    t('roulette.topics.flags'),
    t('roulette.topics.science'),
    t('roulette.topics.cities'),
    t('roulette.topics.sports'),
    t('roulette.topics.celebrities')
  ];

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    onClickSpin();

    const turns = 8 + Math.floor(Math.random() * 10); // Between 8 and 17 turns
    const finalAngle = angle + turns * 360 + Math.floor(Math.random() * 360);
    setAngle(finalAngle);

    // Calculating the winning topic (the one in the section pointed by the pointer in the bottom):
    const sectorAngle = 360 / topics.length;
    const adjustedAngle = finalAngle % 360;
    const winningAngle = (adjustedAngle + sectorAngle / 2) % 360;
    const selectedIndex = (topics.length - Math.floor(winningAngle / sectorAngle)) % topics.length;

    setTimeout(() => {
      const topic = topics[selectedIndex].toLowerCase();
      setSelectedTopic(topic);
      onSelectTopic(topic); // Call the function passed as prop
      // setSpinning(false); // Uncomment for testing several spins in a row
    }, 3000);
  };

  return (
    <div className="roulette-container">
      <div className="roulette-wheel-container">
        <motion.div
          className="roulette-wheel"
          animate={{ rotate: angle }}
          transition={{ duration: 3, ease: "easeOut" }}
          sx={{ borderColor: 'accent.light'}}
        >
          {topics.map((topic, index) => (
            <div
              key={topic}
              className="roulette-topic"
              style={{
                transform: `rotate(${(index / topics.length) * 360 + 90}deg) translate(8rem)`,
                color: 'accent.main'
              }}
            >
              {topic}
            </div>
          ))}
        </motion.div>
      </div>
      <div 
        className="pointer"
        sx={{
          borderBottomColor: 'accent.main'
        }}
      ></div>
      <div className="buttons-container">
        <Button onClick={spin} disabled={spinning} variant="contained">
          {t('roulette.spin')}
        </Button>
        {selectedTopic && (<p className="selected-topic">{t('roulette.topic')} {selectedTopic}</p>)}
      </div>
    </div>
  );
}
