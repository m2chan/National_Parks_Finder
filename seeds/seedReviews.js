const User = require('../models/user')
const Review = require('../models/review')
const Park = require('../models/park')
const mongoose = require('mongoose')
const reviews = require('./reviews')
require('dotenv').config();

// USE FOR PRODUCTION
const dbUrl = process.env.DB_URL 

// USE FOR DEVELOPMENT
// const dbUrl = 'mongodb://localhost:27017/national-parks4'


mongoose.connect(dbUrl, {
    useNewURLParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

const adjectives = [
    'agreeable',
    'ambitious',
    'brave',
    'calm',
    'delightful',
    'eager',
    'gentle',
    'happy',
    'jolly',
    'kind',
    'lively',
    'nice',
    'obedient',
    'polite',
    'proud',
    'thankful',
    'friendly',
    'witty',
    'wonderful',
    'zealous',
    'clever',
    'determined',
    'energetic',
    'generous',
    'fearless',
    'capable',
    'shy',
    'busy',
    'cautious',
    'curious',
    'amusing',
    'pleasant',
    'entertaining',
    'creative',
    'charming',
    'philosophical',
    'marvelous',
    'sincere',
    'thoughtful',
    'helpful',
    'loving',
    'optimistic',
    'neat',
    'reliable',
    'gregarious',
    'creative',
    'lucky',
    'popular',
    'quiet',
    'wise'
]

const animals = [
    'bear',
    'bird',
    'cat',
    'chicken',
    'cow',
    'dog',
    'dolphin',
    'duck',
    'eagle',
    'elephant',
    'fox',
    'frog',
    'giraffe',
    'goat',
    'horse',
    'kangaroo',
    'lion',
    'owl',
    'panda',
    'rabbit',
    'seal',
    'squirrel',
    'tiger',
    'turtle',
    'leopard',
    'beaver',
    'whale',
    'chipmunk',
    'platypus',
    'hedgehog',
    'monkey',
    'gorilla',
    'moose',
    'porcupine',
    'otter',
    'walrus',
    'zebra',
    'penguin',
    'goose',
    'flamingo',
    'alligator',
    'crocodile',
    'tortoise',
    'seahorse',
    'falcon',
    'woodpecker',
    'ostrich',
    'swan',
    'ladybug',
    'bison' 
]


const createUser = async () => {
    
    while (true) {
        try {
            let randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
            randomAdjective = randomAdjective.slice(0, 1).toUpperCase() + randomAdjective.substring(1)

            let randomAnimal = animals[Math.floor(Math.random() * animals.length)]
            randomAnimal = randomAnimal.slice(0, 1).toUpperCase() + randomAnimal.substring(1)

            let username, password
            username = password = randomAdjective + ' ' + randomAnimal

            let email = randomAdjective + '.' + randomAnimal + '@email.com' 

            let user = new User({ email, username })
            let registeredUser = await User.register(user, password)
            return registeredUser
        } catch (e) {
            continue
        }
    }
}

const createReview = async (userId, body, rating, year, month, day) => {
    console.log(userId)
    const review = new Review({
        body: body,
        rating: rating,
        date: {
            year: year,
            month: month,
            day: day
        },
        author: userId
    })
    await review.save()
    return review
}

const driver = async () => {

    const parks = await Park.find()
    await User.deleteMany({})
    await Review.deleteMany({})

    for (let park of parks) {
        console.log(park.title)
        for (let populatedReview of parkReviews[park.title]) {
            let month = Math.floor(Math.random() * (13 - 6) + 6)
            let year = 2020
            
            if (month === 13) {
                month = 1
                year = 2021
            } 

            let day = Math.floor(Math.random() * (30) + 1)
            let newUser = await createUser()

            const review = await createReview(newUser._id, populatedReview.body, populatedReview.rating, year, month, day)
            park.reviews.push(review)
        }
        await park.save()
    }
    console.log('done')
}

driver()