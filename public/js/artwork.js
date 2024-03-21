let likes = document.getElementById("likes");
let dislike = document.getElementById("dislike");
let review = document.getElementById("review");
let addReview = document.getElementById("addReview");

addReview.onclick = sendReview;
likes.onclick = like;
dislike.onclick = dislikeArt;

//asks the server to dislike an artwork via the artworkId
function dislikeArt() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("disliked!");
                location.reload();
            } else {
                alert("could not dislike!");
                location.reload();
            }
        }
    };
    req.open("POST", "/disliked/" + artworkId);
    req.setRequestHeader("Content-Type", "application/json");
    req.send();
}

//asks the server to like an artwork via the artworkId
function like() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("liked!");
                location.reload();
            }
            else {
                alert("could not like!");
                location.reload();
            }
        }
    };
    req.open("POST", "/liked/" + artworkId);
    req.setRequestHeader("Content-Type", "application/json");
    req.send();
}

//asks the server to add a review to the artwork via the artworkId
function sendReview() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("sent review!");
                review.value = '';
                location.reload();
            }
            else {
                alert("could not send review!");
                location.reload();
            }
        }
    };
    req.open("POST", "/reviewed/" + artworkId);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ review: review.value }));
}

//asks the server to remove a review via the artworkId
function remReview(text) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("deleted review!");
                location.reload();
            }
            else {
                alert("could not delete review!");
                location.reload();
            }
        }
    };
    req.open("POST", "/unreviewed/" + artworkId);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ review: text }));
}