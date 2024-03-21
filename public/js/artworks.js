title = document.getElementById("title");
artist = document.getElementById("artist");
category = document.getElementById("category");
search = document.getElementById("search");

search.onclick = searchForArtworks;

//sends the user inputs for the search bar to the server, who will check if there is an artwork that satisfies this query
function searchForArtworks() {
    let keywords = {
        title: title.value,
        artist: artist.value,
        category: category.value,
    }
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("searching!");
                location.reload();
            } else {
                alert("could not search!");
            }
        }
    };
    req.open("POST", "/search");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(keywords));
}