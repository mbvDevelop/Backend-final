const router = require('express').Router();
const verify = require('../../middlewares/tokenVerify')

const { sendInquiry } = require('../controllers/form.controller')

// Crear un registro en la BBDD de formulario de contacto
router.post('/', verify, sendInquiry)

module.exports = router