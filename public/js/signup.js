const eye = document.getElementById("eye")
const slash = document.querySelector("#eye-slash")
const password2 = document.getElementById("password2")
const password = document.getElementById("password")

function changeEye(){
    if (password.type === "password") {
        password.type = "text"
        password2.type = "text"
        eye.classList = "fa fa-eye-slash"
    } else {
        password.type = "password"
        password2.type = "password"
        eye.classList = "fa fa-eye"
    }
}