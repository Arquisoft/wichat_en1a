import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const topics = [ "Flags", "Cities", "Celebrities / Famous", "Entertainment", "Sports", "Science" ];

export default function Roulette() {

    const [spinning, setSpinning] = useState(false);
    const [angle, setAngle] = useState(0);
    const [selectedTopic, setSelectedTopic] = useState(null);

    const spin = () => {

        if (spinning) return;
        setSpinning(true);

        const turns = 10 + Math.floor(Math.random() * 5); // From 10 to 14 turns
        const finalAngle = angle + turns * 360 + Math.floor(Math.random() * 360);
        setAngle(finalAngle);

        setTimeout(() => {
            const selectedIndex = Math.floor(((finalAngle % 360) / 360) * topics.length) % topics.length;
            setSelectedTopic(topics[selectedIndex]);
            setGirando(false);
        }, 3000);
    };

    return (
        <div className = "flex flex-col items-center gap-4 p-4">
            <motion.div
                className = "relative w-48 h-48 rounded-full border-4 border-gray-700 flex items-center justify-center"
                animate = {{ rotate: angle }}
                transition = {{ duration: 3, ease: "easeOut" }}
            >
            <div className = "absolute top-2 w-4 h-4 bg-red-500 rounded-full" />
            { topics.map((topic, index) => (
                <div
                    key = {topic}
                    className = "absolute"
                    style = {{
                        transform: `rotate(${(index / topics.length) * 360 } deg) translate(75px)`,
                    }}
                >
                { tema }
            </div>
            ))}
            </motion.div>
            <Button onClick = {spin} disabled = {spinning}>Spin</Button>
            {selectedTopic && <p className = "text-lg font-bold">Selected topic: {selectedTopic}</p>}
        </div>
    );
}
