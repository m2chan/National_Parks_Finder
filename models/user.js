const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

// Define user schema
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

// Passport plugin adds username and password
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)



