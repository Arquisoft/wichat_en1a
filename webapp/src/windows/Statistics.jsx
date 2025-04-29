import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider, Grid, Box, Tab, Tabs } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import NavBar from "../components/NavBarSignedIn";
import { useTranslation } from "react-i18next";
import { jwtDecode } from 'jwt-decode';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import "../css/Statistics.css";

// Computes statistics based on an array of score records
/*
Structure of the scores JSON object:
{
  "scores": [
    {
      "_id": "12gsegws33wt45",
      "userId": "Vicente",
      "score": 800,
      "gameMode": "basicQuiz",
      "questionsPassed": 8,
      "questionsFailed": 2,
      "accuracy": 80,
      "meanTimeToAnswer": 20,
      "createdAt": "2023-09-01T12:00:00.000Z",
      "__v": 0
    },
    ...
  ],
  "totalGames": 4
} 
*/
const computeUserStats = (scores) => {
  const totalGames = scores.length;
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalTime = 0;
  const gameHistory = [];
  const gameModeMap = {};

  scores.forEach((game) => {
    // Ensure default values in case a field is missing
    const correct = Number(game.questionsPassed) || 0;
    const wrong = Number(game.questionsFailed) || 0;
    const questions = correct + wrong;
    const timePerQ = game.meanTimeToAnswer || 0; // We could store only total time and calculate average later

    totalQuestions += questions;
    totalCorrect += correct;
    totalWrong += wrong;
    totalTime += timePerQ * questions;

    // Save a copy for the game history
    gameHistory.push({
      score: game.score,
      questionsAnswered: questions,
      correctAnswers: correct,
      wrongAnswers: wrong,
      accuracy: game.accuracy,
      date: game.createdAt,
      timePerQuestion: timePerQ
    });

    // Accumulate game mode stats
    const mode = game.gameMode || "unknown";
    if (!gameModeMap[mode]) {
      gameModeMap[mode] = { gamesPlayed: 0, totalScore: 0, totalTime: 0 };
    }
    gameModeMap[mode].gamesPlayed += 1;
    gameModeMap[mode].totalScore += game.score;
    gameModeMap[mode].totalTime += timePerQ;
  });

  // Calculate the overall average time per question
   const averageTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;

  // Create an array of stats per game mode
  const gameModeStats = Object.keys(gameModeMap).map((mode) => {
    const stats = gameModeMap[mode];
    return {
      mode,
      gamesPlayed: stats.gamesPlayed,
      avgScore: stats.gamesPlayed > 0 ? stats.totalScore / stats.gamesPlayed : 0,
      avgTime: stats.gamesPlayed > 0 ? stats.totalTime / stats.gamesPlayed : 0
    };
  });

  return {
    totalGames,
    totalQuestions,
    correctAnswers: totalCorrect,
    wrongAnswers: totalWrong,
    averageTimePerQuestion,
    gameHistory,
    gameModeStats,
  };
};

const Statistics = () => {
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [userStats, setUserStats] = useState(null);

  const getLoggedInUserId = () => {
    const token = sessionStorage.getItem("sessionToken");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      const userId = sessionStorage.getItem("loggedInUser") || decoded.userId;
      return userId;
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  };
  
  const loggedInPlayerId = getLoggedInUserId();

  // Safe object to avoid nulls
  const safeStats = useMemo(() => {
    return {
      totalGames: userStats?.totalGames || 0,
      totalQuestions: userStats?.totalQuestions || 0,
      correctAnswers: userStats?.correctAnswers || 0,
      wrongAnswers: userStats?.wrongAnswers || 0,
      gameHistory: userStats?.gameHistory || [],
      gameModeStats: userStats?.gameModeStats || [],
      averageTimePerQuestion: userStats?.averageTimePerQuestion || 0,
    };
  }, [userStats]);

  // Colors for charts
  const CHART_COLORS = ["#80da9a", "#595dca", "#ffba4a", "#fc6b3d", "#3371ff"];

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (!loggedInPlayerId) {
          throw new Error("User not logged in.");
        }
        const response = await fetch(`${gatewayUrl}/api/scoresByUser/${loggedInPlayerId}`);
        const data = await response.json();
        if (!response.ok || !data) {
          setUserStats(computeUserStats([]));
          return;
        }
        setUserStats(computeUserStats(data.scores || []));
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        setUserStats(computeUserStats([]));
      }
    };
    fetchUserStats();
  }, [gatewayUrl, loggedInPlayerId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!userStats) {
    return (
      <div className="window-container">
        <NavBar />
        <Typography variant="h5" align="center" sx={{ mt: 5 }}>
          {t("statistics.loading")}
        </Typography>
      </div>
    );
  }

  if (safeStats.totalGames === 0) {
    return (
      <div className="window-container">
        <NavBar />
        <Box sx={{ width: "100%", maxWidth: 800, margin: "0 auto", padding: 5, textAlign: "center" }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t("statistics.title")}
          </Typography>
          <Typography variant="h6" component="p">
            {t("statistics.noData")}
          </Typography>
        </Box>
      </div>
    );
  }

  // Prepare data for the pie chart
  const pieChartData = [
    { name: t("statistics.correct"), value: safeStats.correctAnswers },
    { name: t("statistics.incorrect"), value: safeStats.wrongAnswers },
  ];

  // Prepare data for the game mode bar chart
  const gameModeData = safeStats.gameModeStats.map((mode) => ({
    name: t(`gameModes.${mode.mode}.name`),
    gamesPlayed: mode.gamesPlayed,
    avgScore: mode.avgScore,
  }));

  // Prepare data for the performance line chart
  const performanceData = safeStats.gameHistory.map((game) => ({
    date: game.date,
    score: game.score,
  }));

  return (
    <div className="window-container">
      <NavBar />
      <div className="statistics-container">
        <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" className="statistics-title">
            {t("statistics.title")}
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label={t("statistics.overview")}/>
              <Tab label={t("statistics.performance")}/>
              <Tab label={t("statistics.gameModes")}/>
            </Tabs>
          </Box>

          {/* Overview Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card 
                  className="statistics-card"
                  style={{
                    background: `${theme.palette.secondary.light}`
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {t("statistics.summary")}
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary={t("statistics.totalGames")}
                          secondary={safeStats.totalGames}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary={t("statistics.totalQuestions")}
                          secondary={safeStats.totalQuestions}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary={t("statistics.averageTime")}
                          secondary={`${safeStats.averageTimePerQuestion} ${t("statistics.seconds")}`}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary={t("statistics.correctAnswers")}
                          secondary={`${safeStats.correctAnswers} (${Math.round(
                            safeStats.totalQuestions > 0
                              ? (safeStats.correctAnswers / safeStats.totalQuestions) * 100
                              : 0
                          )}%)`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card 
                  className="statistics-card"
                  style={{
                    background: `${theme.palette.secondary.light}`
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {t("statistics.answerDistribution")}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Performance Tab */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card 
                  className="statistics-card"
                  style={{
                    background: `${theme.palette.secondary.light}`
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {t("statistics.performanceOverTime")}
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={performanceData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          name={t("statistics.score")}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card 
                  className="statistics-card"
                  style={{
                    background: `${theme.palette.secondary.light}`
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {t("statistics.recentGames")}
                    </Typography>
                    <List>
                      {safeStats.gameHistory.slice(0, 10).map((game, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={new Date(game.date).toLocaleDateString(
                                i18n.language === "es" ? "es-ES" : "en-US"
                              )}
                              secondary={`${t("statistics.score")} ${game.score} | ${t("statistics.questions")} ${game.questionsAnswered} | ${t("statistics.avgTime")} ${game.timePerQuestion} s`}
                            />
                          </ListItem>
                          {index < safeStats.gameHistory.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Game Modes Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card 
                  className="statistics-card"
                  style={{
                    background: `${theme.palette.secondary.light}`
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {t("statistics.gameModeComparison")}
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={gameModeData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="gamesPlayed"
                          fill="#8884d8"
                          name={t("statistics.gamesPlayed")}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="avgScore"
                          fill="#82ca9d"
                          name={t("statistics.avgScore")}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card 
                  className="statistics-card"
                  style={{
                    background: `${theme.palette.secondary.light}`
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {t("statistics.gameModeDetails")}
                    </Typography>
                    <List>
                      {safeStats.gameModeStats.map((mode, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={t(`gameModes.${mode.mode}.name`)}
                              secondary={`${t("statistics.gamesPlayed")} ${mode.gamesPlayed} | ${t("statistics.avgScore")} ${mode.avgScore} | ${t("statistics.avgTime")} ${mode.avgTime} s`}
                            />
                          </ListItem>
                          {index < safeStats.gameModeStats.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </div>
    </div>
  );
};

export default Statistics;
