const router = require('express').Router();
const verify = require('../../middlewares/tokenVerify')
const multer = require('multer');
const { uploadFile, searchFiles, listAllFiles, deleteFile } = require('../controllers/files.controller')

// config de multer 
let config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/Users/isa/Documents/Upgrade/login-proyecto-final/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Instancia de multer con la configuracion
let upload = multer({ storage: config })

// Subir archivo
router.post('/upload', verify, upload.single('file'), uploadFile);

// Buscar archivo
router.get('/search', verify, searchFiles);

// Listar archivo
router.get('/', verify, listAllFiles);

// Eliminar archivo
router.delete('/', verify, deleteFile);

module.exports = router

