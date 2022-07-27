const router = require('express').Router();
const {register, login, deleteUser, getUser, updateUser, updatePicture} = require('../controllers/auth.controller');
const verify = require('../../middlewares/tokenVerify')
const multer = require('multer');

var patata = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/Users/isa/Documents/Upgrade/login-proyecto-final/temp')
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, 'file-' + Date.now() + '.' + extension)
  }
})

const upload = multer({storage: patata});

// Register
router.post('/register', upload.single('file'), register);

//Log In
router.post('/login', login);

router.delete('/', verify, deleteUser);

router.get('/', verify, getUser);

router.put('/', verify, updateUser);

router.post('/update_picture', verify, upload.single('file'), updatePicture);

module.exports = router