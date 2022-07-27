const router = require('express').Router();
const verify = require('../../middlewares/tokenVerify')

//const downloadUrl = cloudinary.image(result.public_id, ({flags : "attachment:" + fileName}))
//res.send(downloadUrl)