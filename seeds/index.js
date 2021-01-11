// To reseed database, just run this file again node seeds/index.js

const mongoose = require('mongoose')
const path = require('path')
const Park = require('../models/park')
const Review = require('../models/review')
const canada = require('./canada')
const unitedStates = require('./unitedstates')
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

const east = [
    'Newfoundland and Labrador',
    'Ontario',
    'Nova Scotia',
    'Quebec',
    'New Brunswick',
    'Prince Edward Island',
    'Maine',
    'Florida',
    'South Carolina',
    'North Carolina',
    'Michigan',
    'Virginia',
    'U.S. Virgin Islands'
]

const central = [
    'Nunavut',
    'Manitoba',
    'Saskatchewan',
    'South Dakota',
    'Texas',
    'Ohio',
    'Missouri',
    'Arkansas',
    'Indiana',
    'Kentucky',
    'North Dakota',
    'Minnesota'
]

const west = [
    'British Columbia',
    'Alberta',
    'Yukon',
    'Northwest Territories',
    'American Samoa',
    'Utah',
    'Colorado',
    'New Mexico',
    'California',
    'Oregon',
    'Alaska',
    'Montana',
    'Arizona',
    'Wyoming',
    'Nevada',
    'Hawaii',
    'Washington',
    'West Virginia'
]

// Seed parks
const seedDB = async () => {

    // Clear our database so we can insert new data
    await Park.deleteMany({})
    await Review.deleteMany({})
    
    for (let canadaPark of canadaParks) {
        let parkRegion = ''
        if (east.includes(canadaPark.location)) {
            parkRegion = 'East'
        } else if (central.includes(canadaPark.location)) {
            parkRegion = 'Central'
        } else {
            parkRegion = 'West'
        }

        canadaPark.activities.sort()

        const park = new Park({
            title: canadaPark.title,
            location: canadaPark.location,
            region: parkRegion,
            country: 'Canada',
            description: canadaPark.description,
            images: canadaPark.images,
            geometry: canadaPark.geometry,
            activities: canadaPark.activities.sort(),
            established: canadaPark.established,
            phone: canadaPark.phone,
            email: canadaPark.email,
            website: canadaPark.website,
            stars: canadaPark.stars,
            reviewCount: canadaPark.reviewCount,
            averageStars: canadaPark.stars/canadaPark.reviewCount
        })
        await park.save()
    }

    for (let USPark of USParks) {
        let parkRegion = ''
        if (east.includes(USPark.location)) {
            parkRegion = 'East'
        } else if (central.includes(USPark.location)) {
            parkRegion = 'Central'
        } else {
            parkRegion = 'West'
        }

        for (let i = 0; i < USPark.activities.length; i++) {
            USPark.activities[i] = USPark.activities[i].toLowerCase()
        }

        USPark.activities.sort()
        
        const park = new Park({
            title: USPark.title,
            location: USPark.location,
            region: parkRegion,
            country: 'United States',
            description: USPark.description,
            images: USPark.images,
            geometry: USPark.geometry,
            activities: USPark.activities,
            established: USPark.established,
            phone: USPark.phone,
            email: USPark.email,
            website: USPark.website,
            stars: USPark.stars,
            reviewCount: USPark.reviewCount,
            averageStars: USPark.stars/USPark.reviewCount
        })
        await park.save()
    }
}

// Close database connection to complete seed
seedDB().then(() => {
    mongoose.connection.close()
})