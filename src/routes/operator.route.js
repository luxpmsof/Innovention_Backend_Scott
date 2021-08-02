const express = require('express');
const router = express.Router();
const operController = require('../controllers/operator.controller');
const auth = require('../middleware/operator_auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { createUserSchema, updateUserSchema, validateLogin } = require('../middleware/validators/userValidator.middleware');


router.get('/companies', auth(), awaitHandlerFactory(operController.getAllCompanies)); // localhost:3000/api/v1/system/companies
router.post('/approve', auth(), awaitHandlerFactory(operController.approve)); // localhost:3000/api/v1/system/approve

router.get('/id/:id', auth(), awaitHandlerFactory(operController.getUserById)); // localhost:3000/api/v1/users/id/1
router.get('/username/:username', auth(), awaitHandlerFactory(operController.getUserByuserName)); // localhost:3000/api/v1/users/usersname/julia
router.post('/currentUser', auth(), awaitHandlerFactory(operController.getCurrentUser)); // localhost:3000/api/v1/users/currentUser
router.post('/regist', createUserSchema, awaitHandlerFactory(operController.createUser)); // localhost:3000/api/v1/regist
router.patch('/id/:id', auth(Role.Admin), updateUserSchema, awaitHandlerFactory(operController.updateUser)); // localhost:3000/api/v1/users/id/1 , using patch for partial update
router.delete('/id/:id', auth(Role.Admin), awaitHandlerFactory(operController.deleteUser)); // localhost:3000/api/v1/users/id/1


router.post('/login', validateLogin, awaitHandlerFactory(operController.userLogin)); // localhost:3000/api/v1/users/login

module.exports = router;
