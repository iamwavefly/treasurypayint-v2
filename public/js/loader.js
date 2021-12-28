// -- get DOM of loader src loader.gif
const loaderImg = document.querySelector(".loader");
// -- addEventListener load to window object

const openLoader = () => {
  loaderImg.classList.add("show-loader");
};
const closeLoader = () => {
  loaderImg.classList.remove("show-loader");
};

openLoader();

window.addEventListener("load", function () {
  closeLoader();
});
