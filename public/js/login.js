let uname = document.getElementById("username");
let pass = document.getElementById("password");
let registerBtn = document.getElementById("register");
let loginBtn = document.getElementById("login");

loginBtn.onclick = login;
registerBtn.onclick = register;

//sends the username and password of the user to the server, which will check if these are valid (if they exist or not in the database)
function register() {
    let newUser = {
        uname: uname.value,
        password: pass.value,
    };
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                uname.value = '';
                pass.value = '';
                alert("registered!");
            } else {
                alert("that username is taken!");
            }
        }
    };
    req.open("POST", "/users");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(newUser));
}

//asks the server to log the user in based on the username and password, the server will check the database to see if it's correct
function login() {
    let auser = {
        uname: uname.value,
        password: pass.value,
    };
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                uname.value = '';
                pass.value = '';
                window.location.href = '/home';
                alert("logged in!");
            } else {
                alert("that username or password does not exist! (or someone is already logged in)");
            }
        }
    };
    req.open("POST", "/tokens");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(auser));
}
