const ItemModel = require('../models/item.model');
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const {resultSet} = require("../utils/common.utils");
dotenv.config();

/******************************************************************************
 *                              User Controller
 ******************************************************************************/
class ItemController {
    getAllGroups = async (req, res, next) => {
        const params = {bid:req.bid};
        let userList = await ItemModel.findItemGroup(params);

        /**
        userList = userList.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
**/
        //res.send(userList);
        const data = {data:userList};
        res.send(resultSet(true, {...data},'success'));
    };

    creatGroup = async (req, res, next) => {
        const {description,unit_cd,currency_cd,item_group_cd,item_group_nm,unit_adjust,unit_cost} =req.body;



        const result = await ItemModel.createItemGroup(description,unit_cd,currency_cd,item_group_cd,item_group_nm,unit_adjust,unit_cost,req.bid);
        if (!result) {
            throw new HttpException(500, 'Something went wrong',resultSet(false,{},'Something went wrong'));
        }

        res.status(201).send(resultSet(true,{},'success'));
    };

    getAllItems = async (req, res, next) => {
        const {pageSize,gid} = req.query;
        console.log('req',req.bid);

        let userList = await ItemModel.findItem({...req.query,bid:req.bid});
       /**
        if (!userList.length) {
            throw new HttpException(404, 'Users not found');
        }
        **/

        userList = userList.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        //res.send(userList);
        const data = {data:userList};
        res.send(resultSet(true, {...data},'success'));
    };
    creatItem = async (req, res, next) => {

        const {gid,description,unit_cd,currency_cd,item_cd,item_nm,unit_adjust,unit_cost,color,weight,material,size} =req.body;

        const result = await ItemModel.createItem(gid,description,unit_cd,currency_cd,item_cd,item_nm,unit_adjust,unit_cost,color,weight,material,size,req.bid);
        if (result === -1) {
            res.status(201).send(resultSet(false,{},'fail'));
        } else {
            res.status(201).send(resultSet(true,{},'success'));
        }

    };

    getBalance = async (req, res, next) => {
        const {pageSize,gid} = req.query;

        let userList = await ItemModel.findBalance({...req.query,bid:req.bid});
        /**
         if (!userList.length) {
            throw new HttpException(404, 'Users not found');
        }
         **/

        userList = userList.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        //res.send(userList);
        const data = {data:userList};
        res.send(resultSet(true, {...data},'success'));
    };


    plus = async (req, res, next) => {


        const result = await ItemModel.plus(req.body);
        if (!result) {
            res.status(201).send(resultSet(false,{},'fail'));
        }else {
            res.status(201).send(resultSet(true,{},'success'));
        }

    };

    minus = async (req, res, next) => {

        const result = await ItemModel.minus(req.body);
        if (!result) {
            res.status(201).send(resultSet(false,{},'fail'));
        }else {
            res.status(201).send(resultSet(true,{},'success'));
        }
    };



    getUserById = async (req, res, next) => {
        const user = await OperatorModel.findOne({ id: req.params.id });
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.send(userWithoutPassword);
    };

    getUserByuserName = async (req, res, next) => {
        const user = await OperatorModel.findOne({ username: req.params.username });
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

        const result = await OperatorModel.create(req.body);

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
        const result = await OperatorModel.update(restOfUpdates, req.params.id);

        if (!result) {
            throw new HttpException(404, 'Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        const message = !affectedRows ? 'User not found' :
            affectedRows && changedRows ? 'User updated successfully' : 'Updated faild';

        res.send({ message, info });
    };

    deleteUser = async (req, res, next) => {
        const result = await OperatorModel.delete(req.params.id);
        if (!result) {
            throw new HttpException(404, 'User not found');
        }
        res.send('User has been deleted');
    };

    userLogin = async (req, res, next) => {
        this.checkValidation(req);

        const { email, password: pass } = req.body;

        const user = await OperatorModel.findOne({ email });

        if (!user) {
            throw new HttpException(401, 'Unable to login!');
        }

        const isMatch = await bcrypt.compare(pass, user.password);

        if (!isMatch) {
            throw new HttpException(401, 'Incorrect password!');
        }

        // user matched!
        const secretKey = process.env.SECRET_JWT || "";
        const token = jwt.sign({ user_id: user.id.toString() }, secretKey, {
            expiresIn: '24h'
        });

        const { password,role:currentAuthority } = user;

        res.send(resultSet(true,{  token,currentAuthority },'success'));
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
module.exports = new ItemController;
