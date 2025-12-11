// ========================
// SELECT ELEMENTS
// ========================
const cityInput = document.querySelector('#search-city');
const searchBtnCity = document.querySelector('#search-btn-city');

const searchInputTop = document.querySelector('#search-input');
const searchBtnTop = document.querySelector('#search-btn');

const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search_city');
const weatherContainerInfo = document.querySelector('.container');

const countryName = document.querySelector('.city-name');
const tempText = document.querySelector('#temp');
const tempType = document.querySelector('.temp-type');
const humidityValue = document.querySelector('#humidity-value');
const windSpeed = document.querySelector('#wind-speed');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDate = document.querySelector('.current-date-text');

const weeklyContainer = document.getElementById("weekly-container");

const toggle = document.getElementById('toggle-checkbox');

const seeWeekBtn = document.querySelector(".see-week");
const weekSection = document.getElementById("week-section");
const backBtn = document.getElementById("back-btn");

const containerWeather = document.querySelector('.container_weather');

// ========================
// API KEY
// ========================
const apikey = 'df4f431ac41d64d7577407bdeeb4a196';

// ========================
// EVENT LISTENERS
// ========================

// SEARCH CITY TOP
searchBtnTop.addEventListener('click', () => searchCity(searchInputTop.value));
searchInputTop.addEventListener('keydown', (e) => { if(e.key === 'Enter') searchCity(searchInputTop.value); });

// SEARCH CITY BOTTOM
searchBtnCity.addEventListener('click', () => searchCity(cityInput.value));
cityInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') searchCity(cityInput.value); });

// THEME TOGGLE
toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});

// SEE FULL WEEK
seeWeekBtn.addEventListener("click", () => {
    containerWeather.style.display = "none";
    weekSection.style.display = "block";
});

// BACK BUTTON
backBtn.addEventListener("click", () => {
    weekSection.style.display = "none";
    containerWeather.style.display = "block";
});

// ========================
// FUNCTIONS
// ========================

async function searchCity(city) {
    if (!city || city.trim() === '') return;
    cityInput.value = '';
    searchInputTop.value = '';

    const data = await fetchWeather('weather', city);
    if(data.cod != 200){
        showSection(notFoundSection);
        return;
    }

    updateWeatherInfo(data);
    await updateForecasts(city);
    showSection(weatherContainerInfo);
}

// FETCH WEATHER DATA
async function fetchWeather(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apikey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

// UPDATE WEATHER INFO
function updateWeatherInfo(data) {
    const { name, main:{temp, humidity}, weather:[{main:id}], wind:{speed} } = data;

    countryName.textContent = name;
    tempText.textContent = Math.round(temp) + '°C';
    tempType.textContent = id;
    humidityValue.textContent = humidity + '%';
    windSpeed.textContent = speed + 'M/s';
    currentDate.textContent = new Date().toLocaleDateString('en-GB', {weekday:'short', day:'2-digit', month:'short'});
    weatherSummaryImg.src = `img/amcharts_weather_icons_1.0.0/animated/${getWeatherIcon(id)}`;
}

// GET WEATHER ICON
function getWeatherIcon(id){
    if(id <=232 )return 'thunder.svg';
    if(id <=531 )return 'rainy-7.svg';
    if(id <=622 )return 'snowy-6.svg';
    if(id <=781 )return 'weather.svg';
    if(id <=800 )return 'day.svg';
    return 'cloudy.svg';
}

// SHOW SECTION
function showSection(section){
    [weatherContainerInfo, searchCitySection, notFoundSection].forEach(s => s.style.display='none');
    section.style.display = 'flex';
}

// ========================
// FORECASTS
// ========================
async function updateForecasts(city) {
    const forecastData = await fetchWeather('forecast', city);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    weeklyContainer.innerHTML = '';

    forecastData.list.forEach(forecast => {
        if(forecast.dt_txt.includes(timeTaken) && !forecast.dt_txt.includes(todayDate)){
            const dateObj = new Date(forecast.dt_txt);
            const dateStr = dateObj.toLocaleDateString('en-US', {day:'2-digit', month:'short'});
            const temp = Math.round(forecast.main.temp);
            const icon = getWeatherIcon(forecast.weather[0].id);

            const dayCard = `
            <div class="day-card">
                <p class="day-name">${dateStr}</p>
                <img src="img/amcharts_weather_icons_1.0.0/animated/${icon}" class="icon">
                <p class="temp">${temp}°</p>
            </div>`;
            weeklyContainer.insertAdjacentHTML('beforeend', dayCard);
        }
    });
}
