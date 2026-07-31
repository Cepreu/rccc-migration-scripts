import 'dotenv/config'
import cors from 'cors'
import bodyParser from 'body-parser'

import express from 'express'

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.get('/', (req,resp) => {
    resp.send('Welcome here!')
})

app.listen(8000, () => {
    console.log('Listening on port 8000!')
})