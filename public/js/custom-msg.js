const formMsgService = document.querySelector("#form-msg-service")
const popclicker = document.querySelector("#popclicker")
const btnclicker = document.querySelector("#btnclicker")

formMsgService.addEventListener("submit", function(e){
	e.preventDefault()
	popclicker.click()
})


btnclicker.addEventListener("click", function(e){
	e.preventDefault()
	location.href = "/dashboard"
})
