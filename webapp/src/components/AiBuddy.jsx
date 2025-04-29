import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Avatar, useTheme } from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AiBuddy = ({ answerCommented }) => {

  const theme = useTheme();
  const { t } = useTranslation();
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  
  const [finishedThought,setFinishedThought] = useState(false);
  const [thought,setThought] = useState("");

  const think = useCallback( async () =>{ 
    try {
        const response = await axios.post(`${gatewayUrl}/api/aiBuddy`, { answerCommented });
        setThought(response.data.answer);  
      } catch (err) {
        setThought("I really can't think of anything."); 
      } finally {
        setFinishedThought(true);  
      }
  },[answerCommented,gatewayUrl]);

  useEffect(()=>{
    if (!finishedThought) {
        think();
    }
  },[finishedThought,think]);

  return (
    <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        alignContent:'center'
      }}>
        {/* Speech bubble */}
        <Paper
          variant='outlined'
          sx={{
            p: 2,
            borderRadius: 3,
            position: 'relative',
            border: '0.5rem solid',
            borderColor: theme.palette.secondary.dark,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -15,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 20,
              height: 20,
              borderRight: '0.5rem solid',
              borderBottom: '0.5rem solid',
              borderColor: theme.palette.secondary.dark,
              zIndex: -1
            }
          }}
        >
          <Typography 
            variant="body2" 
            align="center"
            sx={{ fontWeight: 400 }}
          >
            {finishedThought?thought:t("aiBuddy.thinking")}
          </Typography>
        </Paper>
  
        {/* AI Avatar */}
        <Avatar
          src="wichat_logo.png"
          sx={{
            width: '6rem',
            height: '6rem',
            bgcolor: theme.palette.secondary.dark,
            mt: 3,
            border: '0.2rem solid',
            borderColor: theme.palette.primary.main
          }}
        >
          {/* Empty avatar to match the silhouette in the image */}
        </Avatar>
      </Box>
  );
};

export default AiBuddy;