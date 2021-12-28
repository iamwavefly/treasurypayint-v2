const taostContainer = document.querySelector("#taost-container");
const toastMessage = document.querySelector("#toast-message");

const showToast = (message, type) => {
  taostContainer.classList.add("show");
  taostContainer.classList.add(type);
  toastMessage.innerHTML = message;

  setTimeout(() => {
    taostContainer.classList.remove("show");
    taostContainer.classList.remove(type);
    toastMessage.innerHTML = "";
  }, 5000);
};
