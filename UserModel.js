const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// schema for the users
let userSchema = Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isArtist: {
        type: Boolean,
        required: true,
    },
    following: {
        type: [String],
        required: true,
    },
    liked: {
        type: [String],
        required: true,
    },
    reviewed: [{
        artworkId: {
            type: String,
            required: true
        },
        reviewText: {
            type: String,
            required: true
        }
    }],
    numArtwork: {
        type: Number,
        required: true
    },
    workshops: {
        type: [String],
        required: true
    },
    notifications: {
        type: [String],
        required: true,
    }
});

module.exports = mongoose.model("User", userSchema);
