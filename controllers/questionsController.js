const Question = require("./../models/question")
const Topic = require("../models/topic")
const User = require("./../models/user")
const Answer = require("./../models/answer")
const Topiccode = require("./../models/topiccode")
const multer = require("multer")
const path = require("path")
const validator = require("express-validator")
const handlebars = require("handlebars")


//photo upload etup
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "..", "public", "images", "topics-images"))
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
	}
})
exports.upload = multer({ storage: storage })

exports.getQuestionById = async (req, res, next) => {
	const input = {
		title: "question not found",
		connectedUser: req.user
	}

	try {
		const question = await Question.findById(req.params.id)
			.populate("user")
			.populate({
				path: "topic",
				populate: {
					path: "questions",
					match: { _id: { $ne: req.params.id } }
				}
			})
			.populate({
				path: "answers",
				populate: { path: "user" }
			})

		if (question) {
			input.title = question.content
			question.creationDate = new Date(parseInt(question.creationDate)).toDateString()
			input.question = question
			input.answersIds = question.answers.map((answer) => answer._id)
		}

		res.render("question", input)
	} catch (error) {
		if (error.message && error.message.incldues("Cast to ObjectId failed for value")) {
			res.render("question", input)
		} else {
			next(error)
		}
	}
}

exports.getCreateAnswerPage = async (req, res, next) => {
	const input = {
		title: "answer a question",
		connectedUser: req.user
	}

	try {
		const question = await Question.findById(req.params.id)
		if (question) {
			input.question = question
		}
		res.render("write-answer", input)
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			res.render("write-answer", input)
		} else {
			next(error)
		}
	}
}

exports.handleCreateAnswer = async (req, res, next) => {
	console.log(req.body)

	const input = {
		title: "write an answer",
		connectedUser: req.user
	}

	try {
		const { answer } = req.body
		const connectedUser = req.user
		const questionId = req.params.id

		const question = await Question.findById(questionId)

		if (question) {
			const newAnswer = await Answer.create({
				content: answer,
				imageName: req.file ? req.file.filename : "default-topic-image.png",
				user: connectedUser._id,
				question: questionId
			})

			//add this answer to question's answers as well as user's answers
			const updatedUser = await User.findByIdAndUpdate(
				connectedUser._id,
				{
					$push: { answers: newAnswer._id }
				},
				{
					new: true,
					useFindAndModify: false
				}
			)

			const updatedQuestion = await Question.findByIdAndUpdate(
				questionId,
				{
					$push: { answers: newAnswer._id }
				},
				{
					new: true,
					useFindAndModify: false
				}
			)

			input.question = question
			input.successMessage = "answer successfull created"
		}

		res.render("write-answer", input)
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			res.render("write-answer", input)
		} else {
			next(error)
		}
	}
}

exports.handleUpdateQuestion = async (req, res, next) => {
	const errors = validator.validationResult(req)
	const input = {
		title: "ask a question",
		connectedUser: req.user
	}

	try {
		const topicId = req.params.id
		//const topic = await Topic.findById(topicId)
		//console.log('Request '+req);
	    
	    //latestRecordVal = latestRecordVal.split("-");
		if (topic) {
			console.log('Files 1'+req.files['image'][0].filename);
			console.log('Files 2'+req.files['imageAns'][0].filename);
			const latestRecord = await Question.findOne().sort({ _id: -1 });
    		var latestRecordVal = latestRecord.content;
    		latestRecordVal = latestRecordVal.split('-');
    		const latestRecordValNum = parseInt(latestRecordVal[1]) + 1;
			if (!errors.isEmpty()) {
				input.errors = errors.array()
			} else {
				const { question,video,quetype,examtype,queshift,queyear,showAns,correctanswer,difficultylevel,topiccode } = req.body
				const connectedUser = req.user
				const newQuestion = await Question.create({
					imageName: req.files['image'][0] ? req.files['image'][0].filename : "default-topic-image.png",
					imageForAnsName: req.files['imageAns'][0] ? req.files['imageAns'][0].filename : "default-topic-image.png",
					//topic: topicId,
					video:video ?? "no-video",
					quetype: quetype,
					examtype:examtype,
					queshift: queshift,
					queyear:queyear,
					showAns:showAns,
					correctanswer: Array.isArray(correctanswer) ? correctanswer.join(',') : correctanswer,
					difficultylevel:difficultylevel,
					topiccode:topiccode,
				})

				//add this question to topic's questions as well as user's questions
				const updatedUser = await User.findByIdAndUpdate(
					connectedUser._id,
					{
						$push: { questions: newQuestion._id }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)

				const updatedTopic = await Topic.findByIdAndUpdate(
					topicId,
					{
						$push: { questions: newQuestion._id }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)
				input.successMessage = "question successfull updated"
			}

			input.topic = topic
		}
		// const inputNew = {
		// 	title: "Ask A Question",
		// 	connectedUser: req.user
		// }
		// const topicL = await Topic.findById(req.params.id)
		// if (topic) {
		// 	inputNew.topic = topicL;
		// }
		res.redirect("question")
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			res.render("ask-question", input)
		} else {
			next(error)
		}
	}
}

exports.getAskQuestionPage = async (req, res, next) => {
	const input = {
		title: "Ask A Question",
		connectedUser: req.user
	}
handlebars.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});
	const topicCodes = await Topiccode.find({}, (err, topiccodes) => { });
	try {
		const topic = await Question.findById(req.params.id)
		//console.log('topic'+topic.topiccode);
			topicCodes.forEach(async (topicCode) => {
				if(topic.topiccode == topicCode.PHY110101){
					topicCode.isSelected = true;
				}else{
					topicCode.isSelected = false;
				}
			});
			input.topic = topic;
			input.optionp = topicCodes;
		
		res.render("edit-question", input)
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			res.render("edit-question", input)
		} else {
			next(error)
		}
	}
}
