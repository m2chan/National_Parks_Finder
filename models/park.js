const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema


// Separate out an image schema so we can more easily manipulate Cloudinary images
const ImageSchema = new Schema({
    url: String,
    filename: String
})

// This allows us to pass virtual properties as JSON to client side Javascript, since Mongoose virtuals aren't included in JSON stringify
const opts = {toJSON: {virtuals: true}} 

// Define park schema
const ParkSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    country: String,
    region: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ], 
    activities: [String],
    established: Number,
    phone: String,
    email: String,
    website: String,
    stars: Number,
    reviewCount: Number,
    averageStars: Number
}, opts)

// Virtual property to list activities, capitalizing the first activity
ParkSchema.virtual('listActivities').get(function () {
    let result = ''
    this.activities[0] = this.activities[0].split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ')
    for (let activity of this.activities) {
        result += activity + ", "
    }
    result = result.substring(0, result.length - 2)
    return result
})

// Capitalize each activity
ParkSchema.virtual('capitalizeActivities').get(function () {
    for (let i = 0; i < this.activities.length; i++) {
        this.activities[i] = this.activities[i].split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ')
    }
    return this.activities
})

// Calculate average rating
ParkSchema.virtual('averageRating').get(function () {
    return (this.stars / this.reviewCount).toFixed(1)
})

// Generate pop up HTML for map page
ParkSchema.virtual('properties.popUpText').get(function () {
    return `<strong><a href="/parks/${this._id}">${this.title}</a></strong><br>
            ${this.location}, ${this.country} <br>
            <span class="filled-star">&#11089;</span> <strong>${this.averageRating}</strong> (${this.reviewCount.toLocaleString()}) <br>
            Activities: ${this.listActivities}`
})

// Generage rating classifications
ParkSchema.virtual('rating').get(function () {
    if (this.country === 'Canada') {
        if (this.stars >= 8200) {
            return 'Top Rated'
        } else if (this.stars >= 1170) {
            return 'Good'
        } else {
            return 'Average'
        }
    } else {
        if (this.stars >= 51000) {
            return 'Top Rated'
        } else if (this.stars >= 4500) {
            return 'Good'
        } else {
            return 'Average'
        }
    }
})

// Middleware that lets us delete all the reviews associated with a park when we delete park
ParkSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Park', ParkSchema)

