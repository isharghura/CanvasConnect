let title = document.getElementById("title");
let year = document.getElementById("year");
let category = document.getElementById("category");
let medium = document.getElementById("medium");
let description = document.getElementById("description");
let poster = document.getElementById("poster");
let addArtwork = document.getElementById("addArtwork");

addArtwork.onclick = submitArtwork;

//after clicking on the add artwork button, will send a POST request to the server to add this artwork to the database
//if all the requirements are met it will respond with a 200 status
function submitArtwork() {
    let newArtwork = {
        Title: title.value,
        Year: year.value,
        Category: category.value,
        Medium: medium.value,
        Description: description.value,
        Poster: poster.value,
    }
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("submitted artwork!");
                location.reload();
            }
        }
    };
    req.open("POST", "/artworks");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(newArtwork));
}