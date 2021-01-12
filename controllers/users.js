const User = require('../models/user')

// Controller to render registration form
module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

// Controller for user registration
module.exports.register = async (req, res, next) => {
    try {
        const {username, email, password} = req.body
        const user = new User({email, username})
        const registeredUser = await User.register(user, password)

        // Also log the user in after they register (for a better experience)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Successfully registered!')
            res.redirect('/parks?page=1')
        })
    } catch(err) {
        req.flash('error', err.message)
        res.redirect('/register')
    }
}

// Controller for log in form
module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

// Controller for logging in
module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome back!')

    // This makes sure that when a user wants to go to a page but isn't logged in, after they log in they go to the same page they wanted to go to originally
    const redirectUrl = req.session.returnTo || '/parks?page=1'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

// Controller for logging out
module.exports.logout = (req, res) => {
    req.logout()    
    req.flash('success', 'Successfully logged out!')
    res.redirect('/parks?page=1')
}