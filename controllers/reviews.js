const Park = require('../models/park')
const Review = require('../models/review')
const { cloudinary } = require('../cloudinary')

// Controller to create review
module.exports.createReview = async (req, res, next) => {
    const park = await Park.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    let today = new Date
    review.date = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate
    }
    park.reviews.push(review)
    park.stars += parseInt(req.body.review.rating)
    park.reviewCount += 1
    park.averageStars = (park.stars / park.reviewCount)

    if (req.files) {
        userUpload = req.files.map(f => ({ url: f.path, filename: f.filename }))
        review.images = userUpload
        park.images.push(...userUpload)
    }

    await park.save()
    await review.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/parks/${park._id}`)
}

// Controller to delete review
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    const park = await Park.findById(id)

    let imagesToDelete = []
    if (review.images) {
        for (let image of review.images) {
            imagesToDelete.push(image.filename)
        }
    }

    if (imagesToDelete) {
        // Delete from Cloudinary
        for (let filename of imagesToDelete) {
            await cloudinary.uploader.destroy(filename)
        }

        // Delete from Mongo
        await park.updateOne({ $pull: { images: { filename: { $in: imagesToDelete } } } })
    }

    await Review.findByIdAndDelete(reviewId)
    await Park.findByIdAndUpdate(id, { $pull: { reviews: reviewId} })
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/parks/${id}`)
}