const express = require('express')
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Park = require('../models/park')
const Review = require('../models/review')
const { parkSchema, reviewSchema } = require('../schemas.js')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const reviews = require('../controllers/reviews')

// Require multer, which helps us parse files from request objects
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

// Route to submit a park review
router.post('/', isLoggedIn, upload.array('image'), validateReview, catchAsync(reviews.createReview))

// Route to delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router