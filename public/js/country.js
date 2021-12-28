const user__country = document.querySelector("#user__country")
const country__code = document.querySelector("#country__code")
user__country.addEventListener("change", country)
country__code.addEventListener("change", country)

function country() {
    country__code.selectedIndex = user__country.selectedIndex
}