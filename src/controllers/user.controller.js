const UserModel = require('../models/user.model');
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const {resultSet} = require("../utils/common.utils");
dotenv.config();
const bson = require('bson');
/******************************************************************************
 *                              User Controller
 ******************************************************************************/
class UserController {
    getAllUsers = async (req, res, next) => {
        let userList = await UserModel.find();
        if (!userList.length) {
            throw new HttpException(404, 'Users not found');
        }

        userList = userList.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        const data = {
            data : userList,
            current:1,
            pageSize:'20',
            total: userList.length

        }
        res.send(resultSet(true,{...data},'ok'));
    };

    getUserById = async (req, res, next) => {
        const user = await UserModel.findOne({ id: req.params.id });
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.send(userWithoutPassword);
    };

    getUserByuserName = async (req, res, next) => {
        const user = await UserModel.findOne({ username: req.params.username });
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.send(userWithoutPassword);
    };

    getCurrentUser = async (req, res, next) => {
        const { password, ...userWithoutPassword } = req.currentUser;
        console.log(userWithoutPassword);
        res.send(resultSet(true,userWithoutPassword,'success'));
    };

    createUser = async (req, res, next) => {
        this.checkValidation(req);

        await this.hashPassword(req);
        req._id = new bson.ObjectId();
        const result = await UserModel.create(req.body);

        if (!result) {
            throw new HttpException(500, 'Something went wrong',resultSet(false,{},'Something went wrong'));
        }

        res.status(201).send(resultSet(true,{},'success'));
    };

    updateUser = async (req, res, next) => {
        this.checkValidation(req);

        await this.hashPassword(req);

        const { confirm_password, ...restOfUpdates } = req.body;

        // do the update query and get the result
        // it can be partial edit
        const result = await UserModel.update(restOfUpdates, req.params.id);

        if (!result) {
            throw new HttpException(404, 'Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        const message = !affectedRows ? 'User not found' :
            affectedRows && changedRows ? 'User updated successfully' : 'Updated faild';

        res.send({ message, info });
    };

    deleteUser = async (req, res, next) => {
        const result = await UserModel.delete(req.params.id);
        if (!result) {
            throw new HttpException(404, 'User not found');
        }
        res.send('User has been deleted');
    };

    userLogin = async (req, res, next) => {
        this.checkValidation(req);

        const { email, password: pass } = req.body;
        console.log("userLogin",email)
        const user = await UserModel.findOne({ email });

        if (!user) {
            throw new HttpException(401, 'Unable to login!');
        }

        const isMatch = await bcrypt.compare(pass, user.password);

        if (!isMatch) {
            throw new HttpException(401, 'Incorrect password!');
        }

        // user matched!
        const secretKey = process.env.SECRET_JWT || "";
        const role = user.role === 'admin' ? ['admin','master'] : user.role;
        const token = jwt.sign({
            user_id: user.uid.toString(),
            _id: user._id.toString(),
            role:role,
            type:role,
            organizationId:user.bid.toString(),
            username:user.first_nm + " " + user.last_nm
        }, secretKey, {
            expiresIn: '24h'
        });

        const { password,role:currentAuthority } = user;
        const data = { token :token,role}

        res.send(resultSet(true,{  token,currentAuthority ,data},'success'));
    };

    checkValidation = (req) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            throw new HttpException(400, 'Validation faild', errors);
        }
    }

    // hash password if it exists
    hashPassword = async (req) => {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 8);
        }
    }
}



/******************************************************************************
 *                               Export
 ******************************************************************************/
module.exports = new UserController;
