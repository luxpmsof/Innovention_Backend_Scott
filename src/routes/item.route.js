const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { createUserSchema, updateUserSchema, validateLogin } = require('../middleware/validators/userValidator.middleware');


router.get('/item/group', auth(), awaitHandlerFactory(itemController.getAllGroups)); // localhost:3000/api/v1/items/item/group
router.post('/item/group', auth(), awaitHandlerFactory(itemController.creatGroup)); // localhost:3000/api/v1/items/item/group
router.get('/item', auth(), awaitHandlerFactory(itemController.getAllItems)); // localhost:3000/api/v1/items/item
router.post('/item', auth(), awaitHandlerFactory(itemController.creatItem)); // localhost:3000/api/v1/items/item
router.get('/balance', auth(), awaitHandlerFactory(itemController.getBalance)); // localhost:3000/api/v1/items/item

router.post('/balance/plus', auth(), awaitHandlerFactory(itemController.plus)); // localhost:3000/api/v1/items/item
router.post('/balance/minus', auth(), awaitHandlerFactory(itemController.minus)); // localhost:3000/api/v1/items/item
module.exports = router;
