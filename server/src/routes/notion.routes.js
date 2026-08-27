const router = require("express").Router()

const { notionController } = require("../controllers/index.controllers.js")

router.get("/", (request, response) => {
    response.json({ message: "notion routes are up" })
})

router.get("/databaseList/:access_token", notionController.getAllDatabaseList)

router.get("/pageList/:access_token", notionController.getAllPageList)

router.post('/template', notionController.template)

router.post('/createOauthToken', notionController.oauthCreateToken)

module.exports = router
