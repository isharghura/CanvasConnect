followBtn = document.getElementById("followBtn");
unfollowBtn = document.getElementById("unfollowBtn");

followBtn.onclick = follow;
unfollowBtn.onclick = unfollow;

//asks the server to add the artwork's artist to the user's following list via the artworkId
function follow() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("followed!");
                location.reload();
            }
        }
    };
    req.open("POST", "/follow/" + artworkId);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ artworkId: artworkId }));
}

//asks the server to removes the artwork's artist from the user's following list via the artworkId
function unfollow() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("unfollowed!");
                location.reload();
            }
        }
    };
    req.open("POST", "/unfollow/" + artworkId);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ artworkId: artworkId }));
}

//sends a request to the server asking to enroll the user in the workshop
function enrollInWorkshop(workshop) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("enrolled!");
                location.reload();
            }
        }
    };
    req.open("POST", "/enroll");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ workshop: workshop }));
}