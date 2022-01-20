const path = window.location.pathname;
const container = document.querySelector(".container");
if (path.includes("register")) {
  container.classList.add("active");
}
const toggleForm = () => {
  container.classList.toggle("active");
};

const password1 = document.getElementById("password1");
const password2 = document.getElementById("password2");
const password3 = document.getElementById("password3");
const eye1 = document.querySelector(".eye1");
const eyeOff1 = document.querySelector(".eye-off1");
const eye2 = document.querySelector(".eye2");
const eyeOff2 = document.querySelector(".eye-off2");
const eye3 = document.querySelector(".eye3");
const eyeOff3 = document.querySelector(".eye-off3");

function view1() {
  password1.type = "text";
  eye1.style.display = "none";
  eyeOff1.style.display = "block";
}

function hide1() {
  password1.type = "password";
  eye1.style.display = "block";
  eyeOff1.style.display = "none";
}

function view2() {
  password2.type = "text";
  eye2.style.display = "none";
  eyeOff2.style.display = "block";
}

function hide2() {
  password2.type = "password";
  eye2.style.display = "block";
  eyeOff2.style.display = "none";
}

function view3() {
  password3.type = "text";
  eye3.style.display = "none";
  eyeOff3.style.display = "block";
}

function hide3() {
  password3.type = "password";
  eye3.style.display = "block";
  eyeOff3.style.display = "none";
}
