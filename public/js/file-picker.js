const dropZone = document.querySelector("#drop-zone");
const fileInput = document.querySelector("#upload-img-input");
const browseFile = document.querySelector("#browse-file");
const submitImage = document.querySelector("#submit-user-image");
let successMsg = document.querySelector("#success-msg");
let sendableFile = "";

let uploaded_image;

browseFile.addEventListener("click", () => {
  fileInput.click();
});

dropZone.addEventListener("dragover", (event) => {
  event.stopPropagation();
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
});

dropZone.addEventListener("drop", (event) => {
  event.stopPropagation();
  event.preventDefault();
  const { files } = event.dataTransfer;
  document.querySelector("#file_name").textContent = files[0].name;
  readImage(files[0]);
  sendableFile = files[0];
});

fileInput.addEventListener("change", (event) => {
  const { files } = event.target;
  event.stopPropagation();
  event.preventDefault();
  const fileList = files;
  document.querySelector("#file_name").textContent = fileList[0].name;
  readImage(fileList[0]);
  sendableFile = files[0];
});

readImage = (file) => {
  const reader = new FileReader();
  reader.addEventListener("load", (event) => {
    uploaded_image = event.target.result;
    dropZone.innerHTML = "";
    dropZone.style.backgroundImage = `url(${uploaded_image})`;
  });
  reader.readAsDataURL(file);
};

submitImage.addEventListener("click", () => {
  submitImage.innerHTML = "uploading...";
  let formDate = new FormData();
  formDate.append("profile", sendableFile);
  fetch("http://localhost:4000/users/image-upload", {
    method: "post",
    body: formDate,
  }).then((data) => {
    if (data.status === 201) {
      submitImage.innerHTML = "Upload";
      successMsg.style.padding = "5px 8px";
      successMsg.style.marginBottom = "20px";
      successMsg.innerHTML = `<div>Profile image updated <span>(waiting for review)</span></div>`;

      setTimeout(() => {
        window.location = "/dashboard";
      }, 2000);
    }
  });
});
