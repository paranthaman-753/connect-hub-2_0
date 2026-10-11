require('dotenv').config()

const express = require('express')
const connectDB = require('./config/db')
const app = express() 

app.use(express.json()) 

app.get('/', (request, response) => {
    response.send('ConnectHub Phase 2 API is running')
})

const startServer = async () => {
    try{
        await connectDB()

        const PORT=process.env.PORT || 3001
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Phase 2 API running on port ${PORT}`)
        })
    }catch (error){
        console.error('MongoDB connection failed; API was not started:', error)
        process.exit(1)
    }
}

startServer() 