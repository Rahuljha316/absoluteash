const mongoose = require("mongoose")

const questionSchema = mongoose.Schema({
	content: {
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
		required: true
	},
	quetype: {
		type: String,
		required: true
	},
	examtype: {
		type: String,
		required: true
	},
	difficultylevel: {
		type: String,
		required: true
	},
	queyear: {
		type: String,
		required: true
	},
	queshift: {
		type: String,
		required: true
	},
	showAns: {
		type: String,
		required: true
	},
	creationDate: {
		type: Date,
		required: true,
		default: Date.now
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
