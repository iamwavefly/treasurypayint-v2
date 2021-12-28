const edit__user = document.getElementById("edit__user")
const first_name = document.getElementById("first_name")
const other_name = document.getElementById("other_name")
const address = document.getElementById("address")
const city = document.getElementById("city")
const state = document.getElementById("state")

edit__user.addEventListener("click", function() {
    first_name.removeAttribute("readOnly")
    other_name.removeAttribute("readOnly")
    address.removeAttribute("readOnly")
    city.removeAttribute("readOnly")
    state.removeAttribute("readOnly")
    first_name.autofocus
})