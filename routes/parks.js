const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Joi = require('joi')
const Park = require('../models/park')
const { isLoggedIn, validatePark, isAuthor, paginate } = require('../middleware')
const parks = require('../controllers/parks')

// Multer helps parse files from request objects (user photos for reviews)
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

// Route for home parks page
router.get('/', paginate, catchAsync(parks.index))

// Route for search results
router.get('/filter', catchAsync(parks.filter))

// Route for form to add a new review
router.get('/:id/new', isLoggedIn, parks.renderNewReview)

// Route to display park page
router.get('/:id', catchAsync(parks.showPark))

module.exports = router