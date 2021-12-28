const toggler = document.querySelector(".toggler");
const toggles = document.querySelector(".toggles");
const con = document.querySelector(".con");

toggler.addEventListener("click", () => {
    toggles.classList.toggle("active");
    con.classList.toggle("active");
})

