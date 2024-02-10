const Question = require("./../models/question")
const Topic = require("../models/topic")
const User = require("./../models/user")
const Answer = require("./../models/answer")
const Topiccode = require("./../models/topiccode")
const multer = require("multer")
const path = require("path")
const validator = require("express-validator")
const handlebars = require("handlebars")
const { exec } = require('child_process')
const cheerio = require('cheerio')

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "..", "public", "images", "topics-question"))
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
	}
})
exports.upload = multer({ storage: storage })
exports.uploadImage = async (req, res, next) =>{
	const uploadedFile = req.file.filename;
	console.log('hello - '+process.env.DB_HOST);
  if (uploadedFile) {
    const filePath = 'http://16.171.160.84:2222/images/topics-question/'+ uploadedFile;
    res.json({ location: filePath , filename: uploadedFile});
  } else {
    res.status(500).json({ error: 'Failed to upload image' });
  }
}