const router = require('express').Router();
const {register, login, deleteUser, getUser, updateUser} = require('../controllers/auth.controller');
const verify = require('../../middlewares/tokenVerify')
// Register
router.post('/register', register);
//Log In
router.post('/login', login);

router.delete('/', verify, deleteUser);

router.get('/', verify, getUser);

router.put('/', verify, updateUser);

module.exports = router