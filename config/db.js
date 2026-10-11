const mongoose = require('mongoose')

const connectDB = async() => {
    const uri = process.env.MONGO_DB_STRING

    if(!uri){
        throw new Error('MONGO_DB_STRING is missing from .env')
    }

    await mongoose.connect(uri, {dbName: 'connecthub'})

    console.log(`Connected to MongoDB database: ${mongoose.connection.name}`)

}
module.exports = connectDB