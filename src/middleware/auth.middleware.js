const HttpException = require('../utils/HttpException.utils');
const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const auth = (...roles) => {
    return async function (req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            const bearer = 'Bearer ';

            if (!authHeader || !authHeader.startsWith(bearer)) {
                throw new HttpException(401, 'Access denied. No credentials sent!');
            }

            const token = authHeader.replace(bearer, '');
            //const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGZhN2Q0MWQxMjkxYjM5MDE1MzQzMGIiLCJ1c2VybmFtZSI6IjExMTExMTExIiwidHlwZSI6Im1hc3RlciIsIm9yZ2FuaXphdGlvbklkIjoiNjBmYTdjMDBjZTUyNjAzODZlNjgzYTk2IiwiaWF0IjoxNjI3Mjc5OTY5fQ.3Tnf00uCu_EpU8gR79e5cw1hF12WF8mOVQNsriZBdJY'
            const secretKey = process.env.SECRET_JWT || "";


            // Verify Token
            const decoded = jwt.verify(token, secretKey);
            console.log("info",decoded);
            const user = await UserModel.findOne({ uid: decoded.user_id });

            if (!user) {
                throw new HttpException(401, 'Authentication failed!');
            }

            // check if the current user is the owner user
            const ownerAuthorized = req.params.id == user.id;

            // if the current user is not the owner and
            // if the user role don't have the permission to do this action.
            // the user will get this error
            if (!ownerAuthorized && roles.length && !roles.includes(user.role)) {
                throw new HttpException(401, 'Unauthorized');
            }

            // if the user has permissions
            req.currentUser = user;
            console.log('checked token',user.bid)
            req.bid = user.bid;
            next();

        } catch (e) {
            e.status = 401;
            console.log(e.message)
            next(e);
        }
    }
}

module.exports = auth;
