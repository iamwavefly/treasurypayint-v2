const menu = document.getElementById("menu");
const menu_close = document.getElementById("menu_close");
const menu__items = document.getElementById("menu__items");

menu.addEventListener("click", function() {
    menu__items.classList.add("open");
    menu.style.display = "none";
    menu_close.style.display = "block";
       
})

menu_close.addEventListener("click", function() {
    menu__items.classList.remove("open");
    menu.style.display = "block";
    menu_close.style.display = "none";
})