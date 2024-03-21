const mongoose = require("mongoose");

// schema for the artworks
let artworkSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Artist: {
        type: String,
        required: true
    },
    Year: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    Medium: {
        type: String,
        required: true
    },
    Description: {
        type: [String],
        required: true
    },
    Poster: {
        type: String,
        required: true
    },
    likes: {
        type: [String],
        required: true,
    },
    reviews: [{
        username: {
            type: String,
            required: true
        },
        review: {
            type: [String],
            required: true
        }
    }]
})

module.exports = mongoose.model("Artwork", artworkSchema);