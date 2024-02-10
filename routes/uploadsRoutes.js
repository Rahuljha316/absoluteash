const express = require("express")
const router = express.Router()
const usersController = require("./../controllers/usersController")
const uploadsController = require("./../controllers/uploadsController")

//router.get('/:id', uploadsController.upload.single('file'),uploadsController.uploadImage)
router.post('/upload',usersController.checkAuthenticated, uploadsController.upload.single('file'),uploadsController.uploadImage)
module.exports = router