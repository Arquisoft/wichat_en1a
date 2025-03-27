import React, { useState } from 'react'
import { Box, Button, Drawer, Fab, IconButton, TextField, Typography, useTheme } from '@mui/material'
import SparklesIcon from "@mui/icons-material/AutoAwesome"; // Magic sparkle icon
import CloseIcon from "@mui/icons-material/Close";
import axios from 'axios';

const AiChat = ({question={
  question:"Please pass the question parameter",
  image:"no image",
  correctAnswerId:0,
  correctAnswer:"None",
  answers:{0:"None",1:"None",2:"None",3:"None"}}}) => {
    
  const gatewayUrl = process.env.GATEWAY_SERVICE_URL || 'http://localhost:8000';
  const theme = useTheme();
  
  const [AiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const askLlm = async () => {
    if (!userInput.trim()) return; // Avoid empty requests

    try {
      const response = await axios.post(`${gatewayUrl}/askllm`, {
        question: userInput,
        gameQuestion: question.question, // Replace with actual game question
        correctAnswer: question.correctAnswer // Replace with actual correct answer
      })

      // Update chat with the AI response
      setChatMessages([...chatMessages, { sender: "user", text: userInput }, { sender: "ai", text: response.data.answer }]);
      setUserInput(""); // Clear input field
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setChatMessages([...chatMessages, { sender: "ai", text: "Failed to get response. Try again." }]);
    }
  };

  return (
    <React.Fragment>
    <Drawer anchor='left' open={AiChatOpen} onClose={()=>setAiChatOpen(false)} variant='temporary'
      sx={{"& .MuiDrawer-paper": {
            backgroundColor: theme.palette.secondary.dark,
            color: theme.palette.primary.contrastText,
            width: 300,
            padding: 2}}}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingX: 2 }}>
      <Typography component="h2" variant="h6"><SparklesIcon/>AI Help Chat</Typography>
      <IconButton onClick={() => setAiChatOpen(false)}>
        <CloseIcon sx={{color:theme.palette.primary.contrastText}} />
      </IconButton>
      </Box>
      <Box flexGrow={1} sx={{ height: "70%", overflowY: "auto", p: 2 }}>
        {chatMessages.length === 0 ? (
          <Typography color="secondary" variant="body2">No messages yet...</Typography>
        ) : (
          chatMessages.map((msg, index) => (
            <Typography key={index} variant="body2" color="secondary" textAlign={msg.sender==="ai"?"left":"right"}>
              {msg.sender === "ai" ? "AI:" : "You:"} {msg.text}
            </Typography>
          ))
        )}
      </Box>
      <Box display="flex" mt={2}>
      <TextField
          fullWidth
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          sx={{ backgroundColor: theme.palette.secondary.light }}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button variant="contained" color="secondary" sx={{ ml: 1 }} onClick={askLlm}>➤</Button>
      </Box>
    </Drawer>
    {!AiChatOpen && (
      <Fab sx={{position:"fixed",bottom:20,left:20,backgroundColor:theme.palette.secondary.dark}}
      onClick={()=>setAiChatOpen(true)}>
        <SparklesIcon/>
      </Fab>
    )}
    </React.Fragment>
  )
}

export default AiChat