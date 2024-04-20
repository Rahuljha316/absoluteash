const mongoose = require("mongoose")

const questionSchema = mongoose.Schema({
	content: {
		type: String,
		required: true
	},
	question: {
		type: String,
		required: true
	},
	imageName: {
		type: String,
		required: true
	},
	imageForAnsName: {
		type: String,
		required: true
	},
	video: {
		type: String,
		required: false
	},
	topiccode: {
		type: String,
		required: true
	},
	correctanswer: {
		type: String,
		required: false
	},
	quetype: {
		type: String,
		required: false
	},
	examtype: {
		type: String,
		required: true
	},
	difficultylevel: {
		type: String,
		required: false
	},
	queyear: {
		type: String,
		required: true
	},
	queshift: {
		type: String,
		required: false
	},
	showAns: {
		type: String,
		required: true
	},
	showFive: {
		type: String,
		required: false
	},
	answerOne: {
		type: String,
		required: false
	},
	answerTwo: {
		type: String,
		required: false
	},
	slugText: {
		type: String,
		required: true
	},
	answerThree: {
		type: String,
		required: false
	},
	answerFour: {
		type: String,
		required: false
	},
	answerFive: {
		type: String,
		required: false
	},
	creationDate: {
		type: Date,
		required: true,
		default: Date.now
	},
	numericanswer: {
		type: String,
		required: false
	},
	integeranswer: {
		type: String,
		required: false
	},
	answerExplanation: {
		type: String,
		required: false
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User"
	},
	topic: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Topic"
	},
	answers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Answer"
		}
	]
})

module.exports = mongoose.model("Question", questionSchema)
