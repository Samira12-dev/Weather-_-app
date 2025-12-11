const cityInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

searchBtn.addEventListener('click', ()=>{
    console.log(cityInput.value)
})









//  toggle mode
 const toggle = document.getElementById('toggle-checkbox');
toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});
