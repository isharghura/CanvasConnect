let title = document.getElementById("title");
let addWorkshop = document.getElementById("addWorkshop");

addWorkshop.onclick = createWorkshop;

//after clicking on the add workshop button, will send a POST request to the server to add this workshop to the user's workshops array
//if all the requirements are met it will respond with a 200 status
function createWorkshop() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("submitted workshop!");
                location.reload();
            }
        }
    };
    req.open("POST", "/workshops");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ workshop: title.value }));
}