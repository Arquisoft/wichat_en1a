import React from 'react'
import { Avatar, Box, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import NavBarSignedIn from '../components/NavBarSignedIn'
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ResultsPage = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();  

  const stats = JSON.parse(sessionStorage.getItem("gameResults"))||[];
  const lastGamemode=sessionStorage.getItem('lastGamemode');
  const lastTopic=sessionStorage.getItem('lastTopic');
  const lastQuestionNum=sessionStorage.getItem('lastQuestionNum');
  const timePerQuestion=sessionStorage.getItem('timePerQuestion');
  const handlePlayAgain = () => {
    navigate(`/game?mode=${lastGamemode}&numQuestions=${lastQuestionNum}&questionType=${lastTopic}&timePerQuestion=${timePerQuestion}`);
  };
  return (
    <Box>
      <NavBarSignedIn />
      <Box style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
        <Card sx={{textAlign:"center",bgcolor:"secondary.light"}}>
          <CardContent>
            <Avatar sx={{ margin: "auto", width: 60, height: 60 }} />
            <Typography id="results-title" component="h2" variant="h5">{t("results.title")}</Typography>
            {(stats.length!==0)?(<>
            <TableContainer sx={{padding:"1rem"}}>
              <Table data-testid='statsTable'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("results.header.name")}</TableCell>
                    <TableCell>{t("results.header.value")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell id={stat.name+"-gameStat"} data-testId={stat.name}>{t("results.stat."+stat.name)}</TableCell>
                      <TableCell data-testId={stat.value}>{stat.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button data-testId="playAgainButton" onClick={handlePlayAgain} fullWidth variant='outlined'>Play again</Button>
            </>):(<Typography variant='body1'>{t("results.none")}</Typography>)}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default ResultsPage