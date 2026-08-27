const router = require("express").Router()

const notionRoute = require("./notion.routes.js")

router.use("/notion", notionRoute)

module.exports = router