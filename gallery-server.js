const express = require('express');
const session = require('express-session');
const app = express();

app.set('view engine', 'pug')
app.set("views", "./public/pages");
app.use(express.static("public"));
app.use(express.json());

const User = require("./UserModel");
const Artwork = require("./ArtworkModel");
const mongoose = require("mongoose");

let currentUsername = null;

// creates a session
app.use(session({
    secret: "some secret here",
    resave: false,
    saveUninitialized: false
}));

// connects mongoose to the database
mongoose.connect('mongodb://127.0.0.1/gallery');

// runs the server
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
    app.listen(3000);
    console.log("Server listening http://localhost:3000/");
});

//authorization function, sees if the user is logged in if they're trying to access a page before letting them in, it not, then they must log in
function auth(req, res, next) {
    if (!req.session.loggedin) {
        console.log("you must log in!");
        res.render('login', { title: 'Login Page' });
        return;
    }
    next();
}

//renders a login page for the root path
app.get('/', async function (req, res) {
    res.render('login', { title: 'Login Page', data: req.session });
});

// renders a home page and passes in some objects to be used in the pug file (home.pug)
app.get('/home', auth, async function (req, res) {
    let user = await User.findOne({ username: req.session.username });
    let userNotifications = user.notifications || [];
    res.render('home', { title: 'Home Page', username: req.session.username, data: req.session, notifications: userNotifications });
});

//renders an add artwork page, which allows artists to add new artwork
app.get('/addArtwork', auth, async function (req, res) {
    console.log("opening the add artwork page!");
    res.render('addArtwork', { title: 'Add Artwork', data: req.session });
});

//renders an add workshop page, which allows artists to add new workshops
app.get('/addWorkshop', auth, async function (req, res) {
    console.log("opening the add workshop page!");
    res.render('addWorkshop', { title: 'Add Workshop', data: req.session });
});

// renders a profile page, it will pass in a lot of information about the user as objects that can be used in the pug file (profile.pug)
app.get('/profile', auth, async function (req, res) {
    let username = req.session.username;
    let user = await User.findOne({ username: req.session.username });
    let artworksLiked = await Artwork.find({ _id: { $in: user.liked } });
    let artworksReviewed = await Artwork.find({ _id: { $in: user.reviewed.map(entry => entry.artworkId) } });
    let reviews = user.reviewed;
    let artworks = [];
    let followedArtists = user.following;
    let followers = await User.find({ following: username });
    for (let artist of followedArtists) {
        let artwork = await Artwork.findOne({ Artist: artist });
        artworks.push(artwork);
    }
    res.render('profile', {
        title: 'Your Profile',
        data: req.session,
        user: user,
        artworksLiked: artworksLiked,
        artworksReviewed: artworksReviewed,
        following: followedArtists,
        artworks: artworks,
        reviews: reviews,
        followers: followers
    });
});

//renders an artworks page which uses pagination to display all of the artworks of the gallery, or all of the artworks with certain keywords in them
app.get('/artworks', auth, async function (req, res) {
    let artworks = [];
    if (req.session.artworks == null) {
        artworks = await db.collection("artworks").find().toArray();
    }
    else {
        artworks = await req.session.artworks;
    }
    let page = req.query.page || 1;
    let limit = 10;
    let numPages = Math.ceil(artworks.length / limit);
    let firstArt = (page - 1) * limit;
    let lastArt = firstArt + limit;
    let currentArtwork = artworks.slice(firstArt, lastArt);
    res.render('artworks', { title: 'Artworks', artworks: currentArtwork, current: page, totPages: numPages, data: req.session });
});

//redirects the user to the login page after clicking logout
app.get('/logout', auth, async function (req, res) {
    console.log('logged out');
    req.session.loggedin = false;
    currentUsername = null;
    res.redirect('/');
});

//renders an artwork page that displays information about that artwork
app.get('/artworks/:id', auth, async function (req, res) {
    let artworkId = req.params.id;
    let artwork = await Artwork.findOne({ _id: artworkId });
    let user = await User.findOne({ username: req.session.username });
    res.render('artwork', { title: artwork.Title, artwork: artwork, user: user, data: req.session });
})

//renders an artist page that displays information about that artist
app.get('/artist/:id', auth, async function (req, res) {
    let artworkId = req.params.id;
    let artwork = await Artwork.findOne({ _id: artworkId });
    let artist = artwork.Artist;
    let artworkByArtist = await Artwork.find({ Artist: artist });
    let user = await User.findOne({ username: artist });
    let workshops = user.workshops;
    let followers = await User.find({ following: artwork.Artist });
    res.render('artist', { title: artist, artworks: artworkByArtist, artworkId: artworkId, workshops: workshops, data: req.session, followers: followers });
});

//renders an artworks page with a filter for categories
app.get('/artworks/category/:category', auth, async function (req, res) {
    let category = req.params.category;
    let artworks = await Artwork.find({ Category: category });
    res.render('artworks', { title: category, artworks: artworks, data: req.session })
})

//renders an artworks page with a filter for mediums
app.get('/artworks/medium/:medium', auth, async function (req, res) {
    let medium = req.params.medium;
    let artworks = await Artwork.find({ Medium: medium });
    res.render('artworks', { title: medium, artworks: artworks, data: req.session })
})

//when a user inputs information into the textbox on the login page and clicks 'register', this will create a user out of that information and add to the database
app.post('/users', async function (req, res) {
    let isNew = true;
    let newUser = new User();
    newUser.username = req.body.uname;
    newUser.password = req.body.password;
    newUser.isArtist = false;
    newUser.following = [];
    newUser.liked = [];
    newUser.reviewed = [];
    newUser.numArtwork = 0;
    newUser.workshops = [];
    newUser.notifications = [];
    const users = await User.find();
    users.forEach(user => {
        if (user.username == newUser.username) {
            isNew = false;
        }
    });
    if (newUser.username == '' || newUser.password == '' || !isNew) {
        res.status(400).send("Bad request error");
        console.log("that username is taken!");
        return;
    }
    else {
        newUser.save();
        console.log("saved username");
        res.sendStatus(200);
    }
});

//checks the database for the user credentials, if those credentials are correct it will
//allow the user to login, otherwise it will send a bad request error and ask the user to try again
app.post('/tokens', async function (req, res) {
    let isValidUser = false;
    let uname = req.body.uname;
    let pass = req.body.password;

    if (req.session.loggedin) {
        console.log("someone is already logged in!");
        res.status(400).send("Bad request error");
        return;
    }

    const users = await User.find();
    users.forEach(user => {
        if (user.username == uname && user.password == pass) {
            isValidUser = true;
            req.session.loggedin = true;
            req.session.username = uname;
            req.session.password = pass;
            req.session.isArtist = user.isArtist;
        }
    });
    if (uname === '' || pass == '' || !isValidUser) {
        res.status(400).send("Bad request error");
        console.log("that username or password does not exist! (or someone is already logged in)");
        return;
    }
    else {
        res.sendStatus(200);
        console.log("logged in as " + uname);
        currentUsername = uname;
    }
});

//checks if the user has uploaded artwork before, if not it will prompt the user to add artwork
//after successfully creating an artwork, the patron will become an artist
app.post('/profile', auth, async function (req, res) {
    let updatedUser = await User.findOne({ username: req.session.username });
    if (updatedUser.numArtwork == 0) {
        console.log(updatedUser.numArtwork);
        console.log("need more artwork!");
        return res.status(400).send("need more artwork!");
    }
    updatedUser.isArtist = !updatedUser.isArtist;
    req.session.isArtist = updatedUser.isArtist;
    console.log("switched!");
    await updatedUser.save();
    res.sendStatus(200);
})

//checks if the user has liked this artwork before, or if this artwork belongs to the current user
//adds the artworkId to the user.liked array also adds the username to the artwork.liked array
app.post('/liked/:id', auth, async function (req, res) {
    let artworkId = req.params.id;
    let username = req.session.username;
    let artwork = await Artwork.findById(artworkId);
    if (artwork.likes.includes(username)) {
        console.log("already liked this artwork!");
        return res.status(400).send("Bad request error");
    }
    if (artwork.Artist == username) {
        console.log("cannot like your own artwork!");
        return res.status(400).send("Bad request error");
    }
    console.log("liked!");
    artwork.likes.push(username);
    await artwork.save();
    let user = await User.findOne({ username: username });
    user.liked.push(artworkId);
    await user.save();
    res.sendStatus(200);
})

//checks if the user has liked this artwork before
//removes the artworkId from the user.liked array also removes the username from the artwork.liked array
app.post('/disliked/:id', auth, async function (req, res) {
    let artworkId = req.params.id;
    let username = req.session.username;
    let artwork = await Artwork.findById(artworkId);
    if (!artwork.likes.includes(username)) {
        console.log("cannot dislike an artwork that has not been liked!");
        return res.status(400).send("Bad request error");
    }
    console.log("disliked!");
    artwork.likes = artwork.likes.filter(user => user != username);
    await artwork.save();
    let user = await User.findOne({ username: username });
    user.liked = user.liked.filter(id => id != artworkId);
    await user.save();
    res.sendStatus(200);
})

//checks to see if the review was made the by artist
//if not then it will add this review to the artwork's reviews array
//adds the artworkId and review to the user.reviewed array
app.post('/reviewed/:id', auth, async function (req, res) {
    let review = req.body.review;
    let artworkId = req.params.id;
    let username = req.session.username;
    let artwork = await Artwork.findById(artworkId);
    if (artwork.Artist == username) {
        console.log("cannot like your own artwork!");
        return res.status(400).send("Bad request error");
    }
    console.log("reviewed!");
    artwork.reviews.push({ username: username, review: review });
    await artwork.save();
    let user = await User.findOne({ username: username });
    user.reviewed.push({ artworkId: artworkId, reviewText: review });
    await user.save();
    res.sendStatus(200);
})

//removes the review from the artwork's reviews array
//removes the artworkId and review from the user.reviewed array
app.post('/unreviewed/:id', auth, async function (req, res) {
    let reviewText = req.body.review
    let artworkId = req.params.id;
    let username = req.session.username;
    let artwork = await Artwork.findById(artworkId);
    let index = artwork.reviews.findIndex(review => review.review == reviewText);
    if (index != -1) {
        artwork.reviews.splice(index, 1);
        await artwork.save();
        let user = await User.findOne({ username: username });
        user.reviewed = user.reviewed.filter(entry => entry.artworkId != artworkId || entry.reviewText != reviewText);
        await user.save();
        res.sendStatus(200);
    }
    else {
        console.log("could not find that review!");
        return res.status(400).send("Bad request error");
    }
});

//adds the artist's name to the user.following array
app.post('/follow/:id', auth, async function (req, res) {
    let artworkId = req.params.id;
    let artwork = await Artwork.findOne({ _id: artworkId });
    let artist = artwork.Artist;
    let user = await User.findOne({ username: req.session.username });
    if (user.following.includes(artist)) {
        console.log("already following this artist!");
        return res.status(400).send("Bad request error");
    }
    console.log("following!");
    user.following.push(artist);
    await user.save();
    res.sendStatus(200);
})

//removes the artist's name from the user.following array
app.post('/unfollow/:id', auth, async function (req, res) {
    let artworkId = req.params.id;
    let artwork = await Artwork.findOne({ _id: artworkId });
    let artist = artwork.Artist;
    let user = await User.findOne({ username: req.session.username });
    if (!user.following.includes(artist)) {
        console.log("can't unfollow this artist, because you're not following them!");
        return res.status(400).send("Bad request error");
    }
    console.log("unfollowed!");
    user.following.pull(artist);
    await user.save();
    res.sendStatus(200);
})

//creates a query based on what the user inputted and searches the database artworks collection for this query and returns a list of artworks
app.post('/search', auth, async function (req, res) {
    let result = req.body;
    let query = {};
    let artworks = [];
    if (result.title != '') {
        query.Title = { $regex: new RegExp(result.title, 'i') };
    }
    if (result.artist != '') {
        query.Artist = { $regex: new RegExp(result.artist, 'i') };
    }
    if (result.category != '') {
        query.Category = { $regex: new RegExp(result.category, 'i') };
    }
    if (Object.keys(query).length !== 0) {
        artworks = await Artwork.find(query);
        req.session.artworks = artworks;
    } else {
        artworks = await Artwork.find();
        req.session.artworks = artworks;
    }
    res.redirect('/artworks');
});

//adds an artwork to the artwork collection if it satisfies all requirements
//sends a notification to all users who follow that artist indicating that the artist has uploaded a new artwork
app.post('/artworks', auth, async function (req, res) {
    let artwork = req.body;
    let title = artwork.Title;
    let existingArtwork = await Artwork.findOne({ Title: title });
    if (existingArtwork) {
        console.log("that title already exists!");
        return res.status(400).send("Bad request error");
    }
    if ((artwork.Title == '' || artwork.Year == '' || artwork.Category == '' || artwork.Medium == '' || artwork.Description == '' || artwork.Poster == '')) {
        console.log("must satisfy all fields!");
        return res.status(400).send("Bad request error");
    }
    let newArtwork = new Artwork();
    let username = req.session.username;
    newArtwork.Title = artwork.Title;
    newArtwork.Artist = username;
    newArtwork.Year = artwork.Year;
    newArtwork.Category = artwork.Category;
    newArtwork.Medium = artwork.Medium;
    newArtwork.Description = artwork.Description;
    newArtwork.Poster = artwork.Poster;
    newArtwork.likes = []
    newArtwork.reviews = [];
    await newArtwork.save();
    let user = await User.findOne({ username: username });
    user.numArtwork++;
    user.isArtist = true;
    req.session.isArtist = true;
    await user.save();
    let followers = await User.find({ following: username });
    let notification = username + " just added an artwork: " + newArtwork.Title;
    followers.forEach(async follower => {
        follower.notifications.push(notification);
        await follower.save();
    })
    res.sendStatus(200);
})

//adds a workshop to artist's workshops array if it satisfies the requirement
//sends a notification to all users who follow that artist indicating that the artist has created a new workshop
app.post('/workshops', auth, async function (req, res) {
    let workshop = req.body.workshop;
    let username = req.session.username;
    if (workshop == '') {
        console.log("must satisfy the field!");
        return res.status(400).send("Bad request error");
    }
    let user = await User.findOne({ username: req.session.username });
    user.workshops.push(workshop);
    await user.save();
    let followers = await User.find({ following: username });
    let notification = username + " just added a workshop: " + workshop;
    followers.forEach(async follower => {
        follower.notifications.push(notification);
        await follower.save();
    })
    res.sendStatus(200);
})

//notifies the user that they have enrolled in the artist's workshop
app.post('/enroll', auth, async function (req, res) {
    console.log("enrolled in " + req.body.workshop);
    res.sendStatus(200);
})

app.get('*', async function (req, res) {
    return res.status(400).send("Page not found, try again...");
})