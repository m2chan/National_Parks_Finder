const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { filter } = require('../controllers/parks')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'NationalParks',
        allowedFormats: ['jpeg', 'png', 'jpg'],
        width: 600,
        height: 400,
        crop: 'lfill',
        gravity: 'auto',
        quality: 90
    }
})

module.exports = {
    cloudinary, 
    storage
}
