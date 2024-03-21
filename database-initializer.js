const Artwork = require("./ArtworkModel");
const User = require("./UserModel");
const fs = require("fs");

let artworkData = [];

const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1/gallery');

//deletes the database and creates it again from scratch
//initializes all of the user and artwork model fields
//reads the gallery.json file, creates an artwork object based on the artwork model and adds to the database
//creates users (artists) out of the artworks' artists from gallery.json and adds them to the database
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
    await mongoose.connection.dropDatabase()
    console.log("Dropped database. Starting re-creation.");
    fs.readdir("./galleryData", async function (err, files) {
        if (err) {
            response.statusCode = 500;
            response.write("Server error.");
            response.end();
            return;
        }
        else {
            for (let i = 0; i < files.length; i++) {
                let gallery = require("./galleryData/" + files[i]);
                for (let j = 0; j < gallery.length; j++) {
                    let artwork = gallery[j];
                    let existingArtist = await User.findOne({ username: artwork.Artist })
                    if (!existingArtist) {
                        artwork.likes = [];
                        artwork.reviews = [];
                        let newUser = new User();
                        newUser.username = artwork.Artist;
                        newUser.password = "123";
                        newUser.isArtist = true;
                        newUser.following = [];
                        newUser.liked = [];
                        newUser.reviewed = [];
                        newUser.numArtwork = 0;
                        newUser.workshops = [];
                        newUser.notifications = [];
                        await newUser.save();
                    }
                    else {
                        existingArtist.numArtwork = (existingArtist.numArtwork || 0) + 1;
                        await existingArtist.save();
                    }
                };
                artworkData.push(...gallery);
            }
            Artwork.insertMany(artworkData);
        }
    })
});