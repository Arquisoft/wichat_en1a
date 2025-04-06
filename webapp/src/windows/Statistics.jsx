import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider, Grid, Box, Tab, Tabs } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import NavBar from "../components/NavBarSignedIn";
import { useTranslation } from "react-i18next";
import "../css/Statistics.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

// Mock data - to be replaced with actual data fetching
const mockUserStats = {
  totalGames: 42,
  totalQuestions: 378,
  correctAnswers: 289,
  wrongAnswers: 89,
  averageTimePerQuestion: 12.5,
  gameHistory: [
    { date: "2023-01-01", score: 85, questionsAnswered: 20, timePerQuestion: 10.2 },
    { date: "2023-01-05", score: 90, questionsAnswered: 20, timePerQuestion: 9.8 },
    { date: "2023-01-10", score: 75, questionsAnswered: 20, timePerQuestion: 11.5 },
    { date: "2023-01-15", score: 95, questionsAnswered: 20, timePerQuestion: 8.7 },
    { date: "2023-01-20", score: 80, questionsAnswered: 20, timePerQuestion: 10.9 },
    { date: "2023-01-25", score: 88, questionsAnswered: 20, timePerQuestion: 9.3 },
  ],
  gameModeStats: [
    { mode: "easy", gamesPlayed: 15, avgScore: 92, avgTime: 8.5 },
    { mode: "medium", gamesPlayed: 20, avgScore: 78, avgTime: 12.3 },
    { mode: "hard", gamesPlayed: 7, avgScore: 65, avgTime: 18.7 },
  ],
};

const Statistics = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [userStats, setUserStats] = useState(mockUserStats);

  // Colors for charts
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

  useEffect(() => {
    // Here you would fetch the actual user statistics
    // Example: fetchUserStatistics(userId).then(data => setUserStats(data));
    // For now, we're using the mock data
    setUserStats(mockUserStats);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Prepare data for the pie chart
  const pieChartData = [
    { name: t("statistics.correct"), value: userStats.correctAnswers },
    { name: t("statistics.incorrect"), value: userStats.wrongAnswers },
  ];

  // Prepare data for the game mode bar chart
  const gameModeData = userStats.gameModeStats.map((mode) => ({
    name: t(`gameMode.${mode.mode}`),
    gamesPlayed: mode.gamesPlayed,
    avgScore: mode.avgScore,
  }));

  // Prepare data for the performance line chart
  const performanceData = userStats.gameHistory.map((game) => ({
    date: game.date,
    score: game.score,
  }));

  return (
    <div className="statistics-container">
      <NavBar />
      <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          className="statistics-title"
        >
          {t("statistics.title")}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label={t("statistics.overview")} />
            <Tab label={t("statistics.performance")} />
            <Tab label={t("statistics.gameModes")} />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className="statistics-card">
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {t("statistics.summary")}
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={t("statistics.totalGames")}
                        secondary={userStats.totalGames}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary={t("statistics.totalQuestions")}
                        secondary={userStats.totalQuestions}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary={t("statistics.averageTime")}
                        secondary={`${userStats.averageTimePerQuestion} ${t("statistics.seconds")}`}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary={t("statistics.correctAnswers")}
                        secondary={`${userStats.correctAnswers} (${Math.round(
                          (userStats.correctAnswers / userStats.totalQuestions) * 100
                        )}%)`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="statistics-card">
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <Card className="statistics-card">
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
              <Card className="statistics-card">
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {t("statistics.recentGames")}
                  </Typography>
                  <List>
                    {userStats.gameHistory.slice(0, 5).map((game, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={new Date(game.date).toLocaleDateString(
                              i18n.language === "es" ? "es-ES" : "en-US"
                            )}
                            secondary={`${t("statistics.score")}: ${game.score}% | ${t(
                              "statistics.questions"
                            )}: ${game.questionsAnswered} | ${t("statistics.avgTime")}: ${
                              game.timePerQuestion
                            }s`}
                          />
                        </ListItem>
                        {index < userStats.gameHistory.length - 1 && <Divider />}
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
              <Card className="statistics-card">
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
              <Card className="statistics-card">
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {t("statistics.gameModeDetails")}
                  </Typography>
                  <List>
                    {userStats.gameModeStats.map((mode, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={t(`gameMode.${mode.mode}`)}
                            secondary={`${t("statistics.gamesPlayed")}: ${
                              mode.gamesPlayed
                            } | ${t("statistics.avgScore")}: ${mode.avgScore}% | ${t(
                              "statistics.avgTime"
                            )}: ${mode.avgTime}s`}
                          />
                        </ListItem>
                        {index < userStats.gameModeStats.length - 1 && <Divider />}
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
  );
};

export default Statistics;