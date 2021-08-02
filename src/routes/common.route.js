const express = require('express');
const router = express.Router();
const commonController = require('../controllers/common.controller');
const auth = require('../middleware/operator_auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { createUserSchema, updateUserSchema, validateLogin } = require('../middleware/validators/userValidator.middleware');


router.get('/',  awaitHandlerFactory(commonController.dashboard)); // localhost:3000/api/v1/system/companies

module.exports = router;
