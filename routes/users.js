const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const users = require('../controllers/users')

// Grouped routes to register
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

// Grouped routes for logging in
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

// Route to log out
router.get('/logout', users.logout)

module.exports = router

