const path = window.location.pathname;
const container = document.querySelector(".container");
if (path.includes("register")) {
  container.classList.add("active");
}
const toggleForm = () => {
  container.classList.toggle("active");
};
