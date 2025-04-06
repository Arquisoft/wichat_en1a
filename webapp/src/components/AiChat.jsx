import React, { useRef, useState } from 'react'
import { Box, Button, Drawer, Fab, IconButton, TextField, Typography, useTheme } from '@mui/material'
import SparklesIcon from "@mui/icons-material/AutoAwesome"; // Magic sparkle icon
import CloseIcon from "@mui/icons-material/Close";
import axios from 'axios';

const AiChat = ({question={
  question:"Please pass the question parameter",
  image:"no image",
  correctAnswerId:0,
  correctAnswer:"None",
  answers:["No answer","No answer","No answer","No answer"]}}) => {
    
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const theme = useTheme();
  const aiChatRef = useRef(null);
  
  const [AiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const askLlm = async () => {
    if (!userInput.trim()) return; // Avoid empty requests

    try {
      const response = await axios.post(`${gatewayUrl}/askllm`, {
        question: userInput,
        gameQuestion: question.question, // Replace with actual game question
        correctAnswer: question.answers[question.correctAnswerId] // Replace with actual correct answer
      })

      // Update chat with the AI response
      setChatMessages([...chatMessages, { sender: "user", text: userInput }, { sender: "ai", text: response.data.answer }]);
      setUserInput(""); // Clear input field
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setChatMessages([...chatMessages, { sender: "ai", text: "Failed to get response. Try again." }]);
    }
  };
  const handleOpenChat=async ()=>{
    setAiChatOpen(true)
    setTimeout(()=>{
      aiChatRef.current?.focus()
    },100)
  }

  return (
    <React.Fragment>
    <Drawer 
      anchor='left' open={AiChatOpen} 
      onClose={()=>setAiChatOpen(false)} 
      variant='temporary'
      sx={{"& .MuiDrawer-paper": {
            backgroundColor: theme.palette.secondary.dark,
            color: theme.palette.primary.contrastText,
            width: 300,
            padding: 2}}}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingX: 2 }}>
        <Typography component="h2" variant="h6" data-testid="aiChatTitle"><SparklesIcon/>AI Help Chat</Typography>
        <IconButton onClick={() => setAiChatOpen(false)}>
          <CloseIcon sx={{color:theme.palette.primary.contrastText}} />
        </IconButton>
      </Box>
      <Box flexGrow={1} sx={{ overflowY: "auto", p: 2 }} data-testid="aiChatMsgs">
        {chatMessages.length === 0 ? (
          <Typography color="secondary" variant="body2">No messages yet...</Typography>
        ) : (
          chatMessages.map((msg, index) => (
            <Typography key={index} variant="body2" color="secondary" textAlign={msg.sender==="ai"?"left":"right"}>
              {msg.sender === "ai" ? "AI: " : "You: "}{msg.text}
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
          color="secondary"
          value={userInput}
          inputRef={aiChatRef}//to set the focus on the open handler
          onChange={(e) => setUserInput(e.target.value)}
          data-testid="aiChatUserInput"
          InputProps={{//cannot directly apply color to input component, must do this
            style: {
              color: theme.palette.primary.contrastText
            },
          }}
        />
        <Button variant="contained" color="secondary" sx={{ ml: 1 }} onClick={askLlm} data-testid="aiChatSendButton">➤</Button>
      </Box>
    </Drawer>
    {!AiChatOpen && (
      <Fab data-testid="aiChatFloatingButton"
        sx={{position:"fixed",bottom:20,left:20,backgroundColor:theme.palette.secondary.dark}}
      onClick={handleOpenChat}>
        <SparklesIcon/>
      </Fab>
    )}
    </React.Fragment>
  )
}

export default AiChat
