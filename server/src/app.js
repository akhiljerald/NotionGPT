const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const notionGPTRoutes = require("./routes/index.routes")

const app = express()

const PORT = process.env.SERVER_PORT || 8081
const DB_URI = process.env.DB_URI

if (!DB_URI) {
    console.error("DB_URI is not set. Copy server/.env.example to server/.env and fill it in.")
    process.exit(1)
}

mongoose
    .connect(DB_URI)
    .then(() => console.log("Connected to DB"))
    .catch((e) => {
        console.error("Failed to connect to DB:", e.message)
        process.exit(1)
    })

app.use(cors())
app.options("*", cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (request, response) => {
    response.json({ ok: true, db: mongoose.connection.readyState === 1 })
})

app.use('/v1', notionGPTRoutes)

// Anything a route handler throws or forwards lands here as JSON rather than HTML.
app.use((error, request, response, next) => {
    console.error("Unhandled error:", error)
    response.status(error.status || 500).json({ message: error.message || "Internal server error" })
})

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}/v1`))
