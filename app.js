if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')
const flash = require('connect-flash')
const User = require('./models/user')

// Require passport for username and passwords
const passport = require('passport')
const LocalStrategy = require('passport-local')

// This helps with ejs styling
const ejsMate = require('ejs-mate')

const Park = require('./models/park')
const Review = require('./models/review')
const methodOverride = require('method-override')

// Require routes
const parkRoutes = require('./routes/parks')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

// Enable sessions (for auth and cookies)
const session = require('express-session')

// Security
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

// Use Mongo session store
const MongoDBStore = require('connect-mongo')(session)
const secret = process.env.SECRET || 'developmentsecret'

// USE FOR PRODUCTION
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/national-parks4'

// USE FOR DEVELOPMENT
// const dbUrl = 'mongodb://localhost:27017/national-parks4'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// Store session in Mongo
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', function (e) {
    console.log('Error with session store', e)
})

// Configure session parameters
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // Cookies can only accessed on an HTTP Secure connection, but local host is not secure so this breaks things
        // secure: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: Date.now() + (1000 * 60 * 60 * 24 * 7)
    }
}
app.use(session(sessionConfig))

// Passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

// Tells passport how to add and remove the user from the session
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Security middleware
app.use(mongoSanitize())
app.use(helmet())
const scriptSrcUrls = [
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "https://cdnjs.cloudflare.com",
    "https://ajax.googleapis.com",
    "https://www.googletagmanager.com"
]

const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "https://cdnjs.cloudflare.com",
    "https://ajax.googleapis.com",
    "https://fonts.gstatic.com"
]

const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
    "https://www.google-analytics.com/"
]

const fontSrcUrls = [
    "https://fonts.gstatic.com",
    "https://fonts.googleapis.com"
]

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'","'unsafe-eval'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "filesystem:",
                "https://res.cloudinary.com/dsykt6xxf/",
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls, "https://cdnjs.cloudflare.com"],
            mediaSrc: ["https://res.cloudinary.com/"]
        },
    })
);

// Enable locals and flashes
app.use(flash())
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    next()
})

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/parks', parkRoutes)
app.use('/parks/:id/reviews', reviewRoutes)

app.get('/map', async (req, res) => {
    const parks = await Park.find({})
    res.render('map', { parks })
})
app.get('/about', async (req, res) => {
    res.render('about')
})

app.use('/', userRoutes)

// Serve static assets in the public folder
app.use(express.static(path.join(__dirname, 'public')))

// Catch all for unrecognized routes
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

// Catch errors
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) {
        err.message = 'Oh no, something went wrong!'
    }
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
