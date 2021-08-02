const express = require("express");
const dotenv = require('dotenv');
const path = require('path');
const cors = require("cors");
const HttpException = require('./utils/HttpException.utils');
const errorMiddleware = require('./middleware/error.middleware');
const userRouter = require('./routes/user.route');
const itemRouter = require('./routes/item.route');
const operatorRouter = require('./routes/operator.route');
const commonRouter = require('./routes/common.route');

// Init express
const app = express();
// Init environment
dotenv.config({ path: path.join(__dirname, 'path/to/.env') });
// parse requests of content-type: application/json
// parses incoming requests with JSON payloads
app.use(express.json());
// enabling cors for all requests by using cors middleware
app.use(cors({ origin:"*",
    credentials:true}));
// Enable pre-flight
app.options("*", cors());

const port = Number(process.env.PORT || 3331);
app.use(`/api/v1/items`, itemRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/system`, operatorRouter);
app.use(`/api/dashboard`, commonRouter);
// 404 error
app.all('*', (req, res, next) => {
    const err = new HttpException(404, 'Endpoint Not Found');
    next(err);
});

// Error middleware
app.use(errorMiddleware);

// starting the server
app.listen(port, () =>
    console.log(`🚀 Server running on port ${port}!`));


module.exports = app;
