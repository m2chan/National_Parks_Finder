const Park = require('../models/park')
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const axios = require('axios')

// Controller for index page
module.exports.index = async (req, res) => {
    page = res.page
    const startIndex = (page.currentPage - 1) * page.limit

    const parks = await Park
        .find()
        .limit(page.limit)
        .skip(startIndex)
        .sort({ title: 'asc', reviewCount: 'desc' })
        .exec()

    res.render('parks/index', { parks, page })
}

// Controller for filter page
module.exports.filter = async (req, res) => {
    const page = {
        previous: undefined,
        next: undefined,
        display: [],
        limit: 10
    }

    page.currentPage = parseInt(req.query.page)
    const startIndex = (page.currentPage - 1) * page.limit

    let { search, country, region, activity, rating, top} = req.query
    let results = new Array()
    let count = 0

    if (search.length) {
        
        count += 1

        let cleanSearch = search.trim().split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ')
        let searchResults = await Park
            .find({
                title: { $regex: `${cleanSearch}` }
            })

        let searchSet = new Set()
        for (let element of searchResults) {
            searchSet.add(JSON.stringify(element._id))
        }
        results.push(searchSet)
    }

    if (country.length) {

        count += 1

        if (country === 'united-states') {
            cleanCountry = 'united states'
        } else {
            cleanCountry = country
        }

        cleanCountry = cleanCountry.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ')

        let countryResults = await Park
            .find({
                country: cleanCountry
            })

        let countrySet = new Set()
        for (let element of countryResults) {
            countrySet.add(JSON.stringify(element._id))
        }
        results.push(countrySet)
    }

    if (region.length) {

        count += 1

        cleanRegion = region.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ')

        let regionResults = await Park.find({
            region: cleanRegion
        })

        let regionSet = new Set()
        for (let element of regionResults) {
            regionSet.add(JSON.stringify(element._id))
        }
        results.push(regionSet)
    }

    if (activity.length) {

        count += 1

        let activityResults = await Park.find({
            activities: activity
        })

        let activitySet = new Set()
        for (let element of activityResults) {
            activitySet.add(JSON.stringify(element._id))
        }
        results.push(activitySet)
    }

    if (rating.length) {

        count += 1

        let lowerBound = 3
        let upperBound = 5

        if (rating === '4.5') {
            lowerBound = 4.5
        } else if (rating === '4') {
            lowerBound = 4
        } else if (rating === '3.5') {
            lowerBound = 3.5
        }

        let ratingResults = await Park.find({
            averageStars: { $gte: lowerBound, $lte: upperBound }
        })

        let ratingSet = new Set()
        for (let element of ratingResults) {
            ratingSet.add(JSON.stringify(element._id))
        }
        results.push(ratingSet)
    }

    if (top.length) {

        count += 1

        let topRatedResults = await Park
            .find()
            .or([
                { country: 'Canada', stars: { $gte: 8200 } },
                { country: 'United States', stars: { $gte: 51000 } }
            ])

        let topRatedSet = new Set()
        for (let element of topRatedResults) {
            topRatedSet.add(JSON.stringify(element._id))
        }
        results.push(topRatedSet)
    }

    let current = results.pop()

    while (results.length > 0) {
        let next = results.pop()
        let intersection = new Set([...next].filter(x => current.has(x)))
        current = intersection
    }

    if (current && current.size) {
        let matches = [...current]
        let totalMatches = matches.length
        matches = matches.map(x => JSON.parse(x))

        let query = null
        if (rating.length) {
            query = Park
                .find()
                .where('_id')
                .in(matches)
                .sort({ averageStars: 'desc', reviewCount: 'desc', title: 'asc' })
                .limit(page.limit)
                .skip(startIndex)

        } else {
            query = Park
                .find()
                .where('_id')
                .in(matches)
                .sort({ title: 'asc', averageStars: 'desc', reviewCount: 'desc' })
                .limit(page.limit)
                .skip(startIndex)
        }

        let promise = query.exec()
        let parks = await promise.then(parks => {
            return parks
        })

        // Pagination

        page.totalPages = Math.ceil(matches.length / page.limit)

        if (page.currentPage === 1) {
            page.display.push(page.currentPage)
            let pageToAdd = page.currentPage + 1
            if (pageToAdd <= page.totalPages) {
                page.next = pageToAdd
            }
            let count = 0
            while (pageToAdd <= page.totalPages && count < 2) {
                page.display.push(pageToAdd)
                pageToAdd += 1
                count += 1
            }
            page.displayActiveIndex = 0
        } else if (page.currentPage === page.totalPages) {
            page.display.push(page.currentPage)
            let pageToAdd = page.currentPage - 1
            if (pageToAdd >= 1) {
                page.previous = pageToAdd
            }
            let count = 0
            while (pageToAdd >= 1 && count < 2) {
                page.display.push(pageToAdd)
                pageToAdd -= 1
                count += 1
            }
            page.display.sort((a, b) => a - b)
            page.displayActiveIndex = 2
        } else {
            page.previous = page.currentPage - 1
            page.display.push(page.currentPage - 1)
            page.display.push(page.currentPage)
            page.next = page.currentPage + 1
            page.display.push(page.currentPage + 1)
            page.displayActiveIndex = 1
        }

        let queryString = new URLSearchParams(req.query).toString()
        page.queryString = queryString.slice(0, -1)
        res.render('parks/filter', { parks, search, country, region, activity, rating, top, totalMatches, page, count })
    } else {
        if (count > 0) {
            req.flash('error', 'No park meets these criteria!')
        }
        res.redirect('/parks?page=1')
    }
}

// Controller for adding a new review
module.exports.renderNewReview = async (req, res) => {
    const park = await Park.findById(req.params.id)
    res.render('parks/review', { park })
}

// Controller for park details page
module.exports.showPark = async (req, res) => {
    
    // Since reviews themselves have authors, we want a nested populate so we populate the park with it's reviews, then populate each review with it's author as well
    const park = await Park.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')

    if (!park) {
        req.flash('error', 'Cannot find that park')
        return res.redirect('/parks?page=1')
    }

    const weatherKey = process.env.WEATHER_KEY

    const getWeatherForecast = async (latitude, longitude) => {
        try {
            const result = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely,alerts&appid=${weatherKey}&units=metric`)
            return result.data
        } catch (e) {
            console.log('error', e)
            return null
        }
    }

    const weatherData = await getWeatherForecast(park.geometry.coordinates[1], park.geometry.coordinates[0])
    const weatherForecast = []

    const directionKey = {
        'NE': [22.5, 67.5],
        'E': [67.5, 112.5],
        'SE': [112.5, 157.5],
        'S': [157.5, 202.5],
        'SW': [202.5, 247.5],
        'W': [247.5, 292.5],
        'NW': [292.5, 337.5]
    }

    const dayKey = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday'
    }

    const date = new Date()

    const convertCtoF = (tempC) => ((tempC * 9 / 5) + 32)
    const convertMetricToImperial = (kph) => (kph / 1.609)

    for (let i = 0; i < 3; i++) {
        let windDirection = 'N'
        for (let direction in directionKey) {
            if (weatherData.daily[i].wind_deg >= directionKey[direction][0] && weatherData.daily[i].wind_deg <= directionKey[direction][1]) {
                windDirection = direction
                break
            }
        }

        const day = dayKey[(date.getDay() + i)%7]
        const fullDate = (date.getMonth() + 1) + '/' + (date.getDate() + i) + '/' + date.getFullYear()

        let entry = {
            'day': day,
            'fullDate': fullDate,
            'main': weatherData.daily[i].weather[0].main,
            'description': weatherData.daily[i].weather[0].description.slice(0, 1).toUpperCase() + weatherData.daily[i].weather[0].description.slice(1),
            'icon': weatherData.daily[i].weather[0].icon,
            'temp': [weatherData.daily[i].temp.day.toFixed(0), convertCtoF(weatherData.daily[i].temp.day).toFixed(0)],
            'feelsLike': [weatherData.daily[i].feels_like.day.toFixed(0), convertCtoF(weatherData.daily[i].feels_like.day).toFixed(0)],
            'tempMin': [weatherData.daily[i].temp.min.toFixed(1), convertCtoF(weatherData.daily[i].temp.min).toFixed(1)],
            'tempMax': [weatherData.daily[i].temp.max.toFixed(1), convertCtoF(weatherData.daily[i].temp.max).toFixed(1)],
            'humidity': weatherData.daily[i].humidity.toFixed(0),
            'windSpeed': [weatherData.daily[i].wind_speed.toFixed(0), convertMetricToImperial(weatherData.daily[i].wind_speed).toFixed(0)],
            'windDirection': windDirection,
            'pop': (weatherData.daily[i].pop * 100).toFixed(0)
        }
        weatherForecast.push(entry)
    }
    res.render('parks/show', { park, weatherForecast })
}
