import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Snackbar, List, ListItem } from '@mui/material';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const GetQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get(`${apiEndpoint}/questions`);
            setQuestions(response.data);

            setOpenSnackbar(true);
        } catch (error) {
            setError(error.response ? error.response.data.error : 'Error de conexión');
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
            <Typography component="h1" variant="h5">
                Fetch Questions
            </Typography>


            <Button variant="contained" color="primary" onClick={fetchQuestions}>
                Get Questions
            </Button>

            {questions.length === 0 ? (
                <Typography>No questions available.</Typography>
            ) : (
                <List>
                    {questions.map((question, index) => (
                        <ListItem key={index}>
                            <Typography variant="h6">{question.question}</Typography>

                            {/* Mostrar imagen de la bandera si está disponible */}
                            {question.image && (
                                <img src={question.image} alt="question image" width="100" height="60" />
                            )}

                            <ul>
                                {Array.isArray(question.options) && question.options.map((option, i) => (
                                    <li key={i}>{option}</li> // Muestra las respuestas
                                ))}
                            </ul>
                        </ListItem>
                    ))}
                </List>
            )}



            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message="Questions fetched successfully"
            />

            {/* Snackbar para mostrar errores */}
            {error && (
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError('')}
                    message={`Error: ${error}`}
                />
            )}
        </Container>
    );
};

export default GetQuestions;
