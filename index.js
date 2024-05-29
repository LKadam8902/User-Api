require('dotenv').config();
const express=require('express')
const mongoose=require('mongoose')
const routes = require('./routes');


const PORT=process.env.PORT||3000

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const database=mongoose.connection

database.on('error', (error) => {
    console.log(error)
})

database.on('connected', () => {
    console.log('Database Connected');
})

const app=express()

app.use(express.json());


app.listen(PORT,()=>{
    console.log('Server Started at ${3000}')
})

app.use('/api', routes)
const router = express.Router()

module.exports = router;