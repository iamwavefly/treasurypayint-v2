const menu = document.getElementById("menu")
const menu_close = document.getElementById("menu_close")
const navbar_mobile = document.getElementById("menu__items")
const burger = document.getElementById("burger")
const menu_img = document.getElementById("menu_img").src

menu.addEventListener("click", function() {
    navbar_mobile.classList.add("open")
    menu.style.display = "none"
    menu_close.style.display = "inline"
       
})
menu_close.addEventListener("click", function() {
    navbar_mobile.classList.remove("open")
    menu.style.display = "inline"
    menu_close.style.display = "none"
    // burger.style.display = "inline"
 
})