const notifAlert = document.querySelectorAll(".notif_alert");
const walletTab = document.querySelectorAll(".wallet-tab");
const tabContents = document.querySelectorAll(".tab-panel");

notifAlert.forEach((res) => {
  res.addEventListener("change", (event) => {
    openLoader();
    const { name, checked } = event.target;
    const userId = event.target.getAttribute("data-user_id");
    fetch(`http://localhost:4000/users/alert/${name}/${checked}/${userId}`, {
      method: "post",
    })
      .then((res) => {
        closeLoader();
      })
      .catch((err) => {
        closeLoader();
      });
  });
});

// walletTab.forEach((res) => {
//   res.addEventListener("change", (event) => {
//     const { name, checked } = event.target;
//     const contentId = event.target.getAttribute("data-tab");
//     const content = document.getElementById(`tabset-${contentId}`);
//     if (checked) {
//       content.classList.add("show-wallet-form");
//       res.classList.add("active");
//     }
//   });
// });
