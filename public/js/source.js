const btn1 = document.getElementById("btn1")
const btn2 = document.getElementById("btn2")
const btn3 = document.getElementById("btn3")
const btn4 = document.getElementById("btn4")
const img_wrapper_form = document.getElementById("img_wrapper_form")


const form__inner = document.getElementById("form__inner")
const form__inner2 = document.getElementById("form__inner2")

const transaction = document.getElementById("transaction__wrapper")
const transaction2 = document.getElementById("transaction__wrapper2")

transaction2.style.display = "none"
form__inner2.classList.add("remove__form")
form__inner.classList.add("remove__form")
procceed__btn.style.display = "none"


btn1.addEventListener("click", function(e) {
    e.preventDefault()
    btn1.classList.add("clicked")
    btn2.classList.remove("clicked")
    transaction.remove()
    transaction2.style.display = "flex"
})
btn2.addEventListener("click", function(e) {
    e.preventDefault()
    btn2.classList.add("clicked")
    btn1.remove()
    btn2.innerHTML = "To my linked account"
    transaction.style.background = "none"

    procceed__btn.style.display = "flex"   
    img_wrapper_form.style.display = "none"

    form__inner.classList.remove("remove__form")
    form__inner2.classList.add("remove__form")
})
btn3.addEventListener("click", function(e) {
    e.preventDefault()
    btn3.classList.add("clicked")
    btn4.classList.remove("clicked")

    form__inner.classList.remove("remove__form")
    form__inner2.classList.add("remove__form")
    procceed__btn.style.display = "flex"   
    img_wrapper_form.style.display = "none"
})
btn4.addEventListener("click", function(e) {
    e.preventDefault()
    btn4.classList.add("clicked")
    btn3.classList.remove("clicked")

    form__inner.classList.add("remove__form")
    form__inner2.classList.remove("remove__form")

    procceed__btn.style.display = "flex"   
    img_wrapper_form.style.display = "none"
})