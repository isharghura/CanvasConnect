let switchAccountType = document.getElementById("switchAccountType");
let div = document.getElementById("main");

switchAccountType.onclick = switchAccType;

//sends a request to remove a like from that artwork
function remLike(artworkId) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("deleted like!");
                location.reload();
            }
        }
    };
    req.open("POST", "/disliked/" + artworkId);
    req.setRequestHeader("Content-Type", "application/json");
    req.send();
}

//sends a request to remove a review from that artwork
function remReview(id, text) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("deleted review!");
                location.reload();
            }
        }
    };
    req.open("POST", "/unreviewed/" + id);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ review: text }));
}

//sends a request to switch account type to the server, server checks if the user has uploaded any artwork, if not it will prompt the user to add an artwork before
//switching the user account type to artist
function switchAccType() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("switched!");
                location.reload();
            }
            else {
                window.location.href = '/addArtwork';
            }
        }
    };
    req.open("POST", "/profile");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ isArtist: isArtistValue }));
}

//if the user has not uploaded any artwork, this function calls a request to get addArtwork, redirecting the user
function goToAddArtwork() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("redirecting to the add artwork page!");
            }
        }
    };
    req.open("GET", "/addArtwork");
    req.setRequestHeader("Content-Type", "application/json");
    req.send();
}