const router = require('express').Router();
const { register, login, deleteUser, getUser, updateUser, updatePicture } = require('../controllers/user.controller');
const verify = require('../../middlewares/tokenVerify')
const multer = require('multer');

// Configuracion de multer
let config = multer.diskStorage({
  destination: function (req, file, cb) {
    // Configurar la url de desino de los archivos temporales
    cb(null, 'C:/Users/isa/Documents/Upgrade/login-proyecto-final/temp')
  },
  filename: function (req, file, cb) {
    // Cambiar el nombre del archivo a "file-<fecha actual>.<extension de archivo>"
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, 'file-' + Date.now() + '.' + extension)
  }
})

// Instancia de multer con la configuracion
const upload = multer({ storage: config });

// Register
router.post('/register', upload.single('file'), register);

// Log In
router.post('/login', login);

// Eliminar un usuario
router.delete('/', verify, deleteUser);

// Obtener info del usuario
router.get('/', verify, getUser);

// Actualizar info del usuario (solo user name)
router.put('/', verify, updateUser);

// Actualizar la foto del perfil del usuario
router.post('/update_picture', verify, upload.single('file'), updatePicture);

module.exports = router