import React, { useState } from 'react'
import { Box, Drawer, Fab, IconButton, Typography, useTheme } from '@mui/material'
import SparklesIcon from "@mui/icons-material/AutoAwesome"; // Magic sparkle icon
import CloseIcon from "@mui/icons-material/Close";

const AiChat = () => {
  const [AiChatOpen, setAiChatOpen] = useState(false);
  const theme = useTheme();
  return (
    <React.Fragment>
    <Drawer anchor='left' open={AiChatOpen} onClose={()=>setAiChatOpen(false)} variant='persistent'
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