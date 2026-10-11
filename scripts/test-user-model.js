require('dotenv').config() 

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const connectDB = require('../config/db')
const User = require('../models/User')

const testUserModel = async () => {
    let createdUserId 

    try{
        await connectDB() 

        const username = `model_test_${Date.now()}`
        const passwordHash = await bcrypt.hash('test-only-password', 10)
        const createdUser = await User.create({
            name: 'Test User',
            username,
            passwordHash,
            gender: 'test'
        })
        createdUserId = createdUser._id 

        const foundUser = await User.findById(createdUserId).select('+passwordHash')

        console.log('Created and read user:', {
            id: foundUser.username,
            name: foundUser.name,
            hasPasswordHash: Boolean(foundUser.passwordHash)
        })
    }catch(error){
        console.error('User model test failed:', error)
        process.exitCode = 1 
    }finally{
        try {
            if(createdUserId){
                await User.deleteOne({_id: createdUserId})
                console.log('Test user cleaned up')
            }
        }finally {
            await mongoose.disconnect() 
        }
    }
}
testUserModel() 
