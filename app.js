import express from 'express'
import { engine } from 'express-handlebars'
import bodyParser from 'body-parser'
// import mongoose from 'mongoose'
import admin from './routes/admin.js'

const app = express()



app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use('/admin', admin)

const PORT = 8081

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`)
})
