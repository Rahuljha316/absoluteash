const mongoose = require("mongoose")

const topicCodeSchema = mongoose.Schema({
	PHY110101: {
		type: String,
		required: true,
		unique: true
	},
	General_Physics: {
		type: String,
		required: true,
		unique: true
	},
	General_Concepts: {
		type: String,
		required: true,
		unique: true
	},
	// description: {
	// 	type: String
	// },
	// imageName: {
	// 	type: String,
	// 	required: true
	// },
	// concept: {
	// 	type: String,
	// 	required: true
	// },
	// creationDate: {
	// 	type: Date,
	// 	required: true,
	// 	default: Date.now
	// },
	// user: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: "User"
	// },
	// questions: [
	// 	{
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: "Question"
	// 	}
	// ],
	// usersFollowers: [
	// 	{
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: "User"
	// 	}
	//]
})

module.exports = mongoose.model("Topiccode", topicCodeSchema)
