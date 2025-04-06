jest.mock('../src/models/score-model', () => {
    const mSave = jest.fn();
    const mFindOne = jest.fn();
    const mFind = jest.fn();

    const mScore = {
        save: mSave,
        findOne: mFindOne,
        find: mFind,
    };

    return { Score: mScore };
});

const { saveScore, updateScore, getScoresByUser, getLeaderboard } = require('../src/services/game-service');
const { Score } = require('../src/models/score-model');

describe('game-service error handling', () => {
    it('should throw an error when saveScore fails', async () => {
        Score.save.mockRejectedValueOnce(new Error('Error saving score'));

        try {
            await saveScore('user123', 100, 'basicQuiz', 18, 2, 80);
        } catch (error) {
            expect(error).toEqual(new Error('Error saving score'));
        }
    });

    it('should throw an error when updateScore fails', async () => {
        Score.findOne.mockRejectedValueOnce(new Error('Error finding score'));

        try {
            await updateScore('user123', 200, 'basicQuiz', 16, 4, 80);
        } catch (error) {
            expect(error).toEqual(new Error('Error finding score'));
        }
    });

    it('should throw an error when getScoresByUser fails', async () => {
        Score.find.mockRejectedValueOnce(new Error('Error fetching scores'));

        try {
            await getScoresByUser('user123', 'basicQuiz');
        } catch (error) {
            expect(error).toEqual(new Error('Error fetching scores'));
        }
    });

    it('should throw an error when getLeaderboard fails', async () => {
        Score.find.mockRejectedValueOnce(new Error('Error fetching leaderboard'));

        try {
            await getLeaderboard('basicQuiz');
        } catch (error) {
            expect(error).toEqual(new Error('Error fetching leaderboard'));
        }
    });


});
