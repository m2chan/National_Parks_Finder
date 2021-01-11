const ExpressError = require('./utils/ExpressError')
const { reviewSchema } = require('./schemas.js')
const Park = require('./models/park')
const Review = require('./models/review')
const { model } = require('./models/review')

// Passport uses the session id to determine whether a user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in!')
        return res.redirect('/login')
    }
    next()
}

// Validation middleware with Joi
module.exports.validateReview = (req, res, next) => {
    console.log(req.body)
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

// Middleware to check that the current user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to edit this page!')
        return res.redirect(`/parks/${id}`)
    }
    next()
}

// Middleware to paginate the main home page
module.exports.paginate = async (req, res, next) => {
    const page = {
        limit: 10,
        previous: undefined,
        next: undefined,
        display: []
    }
    page.currentPage = parseInt(req.query.page)
    const limit = 10

    page.totalPages = Math.ceil((await Park.countDocuments().exec()) / limit)
    page.totalPages = 0
    
    
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
    res.page = page
    next()
}

