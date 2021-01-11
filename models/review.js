const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Define image schema
const ImageSchema = new Schema({
    url: String,
    filename: String
})

// Define review schema
const ReviewSchema = new Schema({
    body: String,
    rating: Number,
    date: Object,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
    images: {
        type: [ImageSchema], 
        required: false}
})

// Determine text month
ReviewSchema.virtual('monthInText').get(function () {
    let textMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December']
    return textMonths[this.date.month - 1]
})

module.exports = mongoose.model('Review', ReviewSchema)

