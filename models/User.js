const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true, 
        trim: true,
        lowercase: true,
        unique: true 
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
   },
   gender: {
    type: String,
    required: true,
    trim: true 
   }
})

module.exports = mongoose.model('User', userSchema)

