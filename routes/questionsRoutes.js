const express = require("express")
const router = express.Router()
const usersController = require("./../controllers/usersController")
const questionsController = require("./../controllers/questionsController")

router.get("/:id", questionsController.getQuestionById)
router.get("/:id/edit", questionsController.getAskQuestionPage)
router.put("/:id/edit", questionsController.handleUpdateQuestion)

router.get("/:id/answer", usersController.checkAuthenticated, questionsController.getCreateAnswerPage)
router.post("/:id/answer", usersController.checkAuthenticated,questionsController.upload.single("image"), questionsController.handleCreateAnswer)

module.exports = router
