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
//const Tesseract = require('tesseract.js');
//const MathJax = require('mathjax');

// Get the path to the mathjax plugin in node_modules
//const mathjaxPluginPath = require.resolve('@dimakorotkov/tinymce-mathjax');
// MathJax.Hub.Queue(function () {
//     // Your code here
//     var loader = MathJax.loader;
// });
// MathJax.Hub.Register.StartupHook("End", function () {
//     // Your code here
//     var loader = MathJax.loader;
// });
// Use path.join to construct the correct path
const mathjaxPluginRelativePath = '';

function removeHtmlAndGetSlug(htmlContent) {
  // Load the HTML content into Cheerio
  const $ = cheerio.load(htmlContent);

  // Extract text content from HTML
  const textContent = $.text();

  // Generate slug from the text content
  const slug = generateSlug(textContent);

  return slug;
}

function generateSlug(inputString) {
  return inputString
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 200);
}
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
exports.uploadImage = async (req, res, next) =>{
	const uploadedFile = req.file.filename;
	console.log('hello - '+process.env.DB_HOST);
  if (uploadedFile) {
    const filePath = 'http://localhost:3000/images/topics-images/'+ uploadedFile;
    res.json({ location: filePath , filename: uploadedFile});
  } else {
    res.status(500).json({ error: 'Failed to upload image' });
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
		console.log('Request '+req.body.video);
	       var quesImage = false;
    		var ansImage = false;
			if (req.files && req.files['image']) {
			  if (req.files['image'].length > 0) {
			    var quesImage = true;
			  }
			}
			if (req.files && req.files['imageAns']) {
			  if (req.files['imageAns'].length > 0) {
			    var ansImage = true;
			  }
			}
	    //latestRecordVal = latestRecordVal.split("-");
		console.log('Request body '+JSON.stringify(req.body));
			// console.log('Files 1'+req.files['image'][0].filename);
			// console.log('Files 2'+req.files['imageAns'][0].filename);
			const latestRecord = await Question.findOne().sort({ _id: -1 });
    		var latestRecordVal = latestRecord.content;
    		latestRecordVal = latestRecordVal.split('-');
    		const latestRecordValNum = parseInt(latestRecordVal[1]) + 1;
			if (!errors.isEmpty()) {
				input.errors = errors.array()
			} else {
				const { question,video,quetype,examtype,queshift,queyear,showAns,answerOne,answerTwo,answerThree,answerFour,answerFive,correctanswer,difficultylevel,topiccode,showFive,queId } = req.body
				const connectedUser = req.user
				//console.log('Request body '+JSON.stringify(req.body));
				// const newQuestion = await Question.findByIdAndUpdate(queId,{
				// 	imageName: quesImage ? req.files['image'][0].filename : "default-topic-image.png",
				// 	imageForAnsName: ansImage ? req.files['imageAns'][0].filename : "default-topic-image.png",
				// 	//topic: topicId,
				// 	video:video ?? "no-video",
				// 	quetype: quetype,
				// 	examtype:examtype,
				// 	queshift: queshift,
				// 	queyear:queyear,
				// 	showAns:showAns,
				// 	answerOne:answerOne,
				// 	answerTwo: answerTwo,
				// 	answerThree:answerThree,
				// 	answerFour:answerFour,
				// 	question:question,
				// 	answerFive:answerFive,
				// 	showFive : showFive,
				// 	correctanswer: Array.isArray(correctanswer) ? correctanswer.join(',') : correctanswer,
				// 	difficultylevel:difficultylevel,
				// 	topiccode:topiccode,
				// })
const filter = { _id: queId }; // Replace with the actual document ID
  const update = { $set: {
					imageName: quesImage ? req.files['image'][0].filename : "default-topic-image.png",
					imageForAnsName: ansImage ? req.files['imageAns'][0].filename : "default-topic-image.png",
					//topic: topicId,
					video:video ?? "no-video",
					quetype: quetype,
					examtype:examtype,
					queshift: queshift,
					slugText : removeHtmlAndGetSlug(question),
					queyear:queyear,
					showAns:showAns,
					answerOne:answerOne,
					answerTwo: answerTwo,
					answerThree:answerThree,
					answerFour:answerFour,
					question:question,
					answerFive:answerFive,
					showFive : showFive,
					correctanswer: Array.isArray(correctanswer) ? correctanswer.join(',') : correctanswer,
					difficultylevel:difficultylevel,
					topiccode:topiccode,
				} }; // Replace with the field you want to update
await Question.updateOne(filter, update, (err, result) => {
    if (err) {
      console.error('Error updating document:', err);
      return;
    }

    console.log('Document updated successfully:', result);
});
				//add this question to topic's questions as well as user's questions
				
				input.successMessage = "question successfull updated"
			}

			//input.topic = topic
		
		// const inputNew = {
		// 	title: "Ask A Question",
		// 	connectedUser: req.user
		// }
		// const topicL = await Topic.findById(req.params.id)
		// if (topic) {
		// 	inputNew.topic = topicL;
		// }
		res.redirect("/questions/"+topicId+"/edit");
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
			console.log('Image - Name : '+topic.imageName);
			const pathIm = 'D:/xampp/htdocs/drive-php/public/images/topics-images/'+topic.imageName;
			const tesseractCommand = `tesseract D:/xampp/htdocs/drive-php/public/images/topics-images/image-1703951323257.jpeg - eng+equ --psm 6 D:/xampp/htdocs/drive-php/equation_config.txt`;
			let textQues = '';
			// Execute the Tesseract command
			//exec(tesseractCommand, (error, stdout, stderr) => {
			  // if (error) {
			  //   console.error(`Error: ${error.message}`);
			  //   return;
			  // }
			  // if (stderr) {
			  //   console.error(`Tesseract Error: ${stderr}`);
			  //   return;
			  // }

			  // Print the recognized text to the console
			//   console.log('Recognized Text:');
			  
			//   console.log(stdout);
			//   textQues = textQues + stdout;

			//   Tesseract.recognize(
			//       'D:/xampp/htdocs/drive-php/public/images/topics-images/image-1703951323257.jpeg',
			//       'eng',
			//       // { logger: info => console.log(info) }
			//     ).then(({ data: { text } }) => {
			//       input.topic = topic;
			// 	  input.textp = textQues;
			// 	  input.pathque = mathjaxPluginRelativePath;
			// 	  input.optionp = topicCodes;
			//       res.render("edit-question", input);
			//       //res.render('index', { commandOutput: stdout, tesseractOutput: text });
			//     });
			// });
			input.topic = topic;
				  //input.textp = textQues;
				  //input.pathque = mathjaxPluginRelativePath;
				  input.optionp = topicCodes;
			 res.render("edit-question", input);
			console.log('Topic Data'+topic);
		
		//res.render("edit-question", input)
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			res.render("edit-question", input)
		} else {
			next(error)
		}
	}
}
