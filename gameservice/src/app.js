const bodyParser = require('body-parser');
const gameRouter = require('./routes/game-routes');

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());
app.use(gameRouter);

module.exports = app;
