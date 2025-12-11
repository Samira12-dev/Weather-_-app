// ========================
// ELEMENTS
// ========================
const searchInputTop = document.getElementById("search-input");
const searchBtnTop = document.getElementById("search-btn");

const searchInputCity = document.getElementById("search-city");
const searchBtnCity = document.getElementById("search-btn-city");

const searchInputNotFound = document.getElementById("search-city-not-found");
const searchBtnNotFound = document.getElementById("search-btn-city-not-found");

const weatherContainer = document.querySelector(".container");
const searchCitySection = document.querySelector(".search_city");
const notFoundSection = document.querySelector(".not-found");

const cityNameElem = document.querySelector(".city-name");
const tempElem = document.getElementById("temp");
const tempTypeElem = document.querySelector(".temp-type");
const humidityValueElem = document.querySelectorAll("#humidity-value");
const windSpeedElem = document.querySelectorAll("#wind-speed");
const weatherImgElem = document.querySelector(".weather-summary-img");
const currentDateElem = document.querySelector(".current-date-text");

const tempTomorrowEl = document.getElementById("tempTommorow");
const tempTypeTomorrowEl = document.querySelector(".infoTomorrow .temp-type");
const iconTomorrowEl = document.querySelector(".infoTomorrow .icons");

const hourlyContainer = document.querySelector(".hourly-container");
const weeklyContainer = document.getElementById("weekly-container");

const toggleCheckbox = document.getElementById("toggle-checkbox");

const seeWeekBtn = document.querySelector(".see-week");
const weekSection = document.getElementById("week-section");
const backBtn = document.getElementById("back-btn");

// ========================
// API KEY
// ========================
const API_KEY = "df4f431ac41d64d7577407bdeeb4a196";

// ========================
// UTILITY FUNCTIONS
// ========================
function getWeatherIcon(id) {
    if (id >= 200 && id < 300) return "thunder.svg";
    if (id >= 300 && id < 600) return "rainy-5.svg";
    if (id >= 600 && id < 700) return "snowy-5.svg";
    if (id === 800) return "day.svg";
    if (id > 800) return "cloudy.svg";
    return "weather.svg";
}

function showSection(section) {
    weatherContainer.style.display = "none";
    searchCitySection.style.display = "none";
    notFoundSection.style.display = "none";

    section.style.display = "flex";
}

// ========================
// FETCH FUNCTIONS
// ========================
async function fetchWeather(city) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function fetchForecast(city) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

// ========================
// UPDATE FUNCTIONS
// ========================
function updateWeatherInfo(data) {
    cityNameElem.textContent = data.name;
    tempElem.textContent = Math.round(data.main.temp) + "°C";
    tempTypeElem.textContent = data.weather[0].main;

    humidityValueElem.forEach(el => el.textContent = data.main.humidity + "%");
    windSpeedElem.forEach(el => el.textContent = data.wind.speed + " km/h");

    weatherImgElem.src = `img/amcharts_weather_icons_1.0.0/animated/${getWeatherIcon(data.weather[0].id)}`;

    const now = new Date();
    currentDateElem.textContent = now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
}

async function updateForecasts(city) {
    const forecastData = await fetchForecast(city);
    if (!forecastData || forecastData.cod != "200") return;

    const today = new Date().toISOString().split("T")[0];

    // --- Tomorrow ---
    const tomorrowForecast = forecastData.list.find(f => !f.dt_txt.includes(today) && f.dt_txt.includes("12:00:00"));
    if (tomorrowForecast) {
        tempTomorrowEl.textContent = Math.round(tomorrowForecast.main.temp) + "°";
        tempTypeTomorrowEl.textContent = tomorrowForecast.weather[0].main;
        iconTomorrowEl.src = `img/amcharts_weather_icons_1.0.0/animated/${getWeatherIcon(tomorrowForecast.weather[0].id)}`;
    }

    // --- Hourly forecast (real clock times) ---
    hourlyContainer.innerHTML = "";
    forecastData.list.slice(0, 8).forEach((hour, index) => {
        const hourDate = new Date(hour.dt_txt);
        const hourLabel = hourDate.getHours() + ":00";

        const hourCard = `
            <div class="hour-card ${index === 0 ? "active" : ""}">
                <p class="time">${hourLabel}</p>
                <img src="img/amcharts_weather_icons_1.0.0/animated/${getWeatherIcon(hour.weather[0].id)}" 
                     alt="${hour.weather[0].main}" class="icons">
                <p class="temp">${Math.round(hour.main.temp)}°</p>
            </div>
        `;
        hourlyContainer.insertAdjacentHTML("beforeend", hourCard);
    });

    // --- Weekly forecast ---
    weeklyContainer.innerHTML = "";
    const dailyMap = {};
    forecastData.list.forEach(f => {
        const date = f.dt_txt.split(" ")[0];
        if (date !== today && !dailyMap[date] && f.dt_txt.includes("12:00:00")) {
            dailyMap[date] = f;
        }
    });

    Object.values(dailyMap).forEach(day => {
        const dayDate = new Date(day.dt_txt);
        const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" });
        const dayCard = `
            <div class="day-card">
                <p class="day-name">${dayName}</p>
                <img src="img/amcharts_weather_icons_1.0.0/animated/${getWeatherIcon(day.weather[0].id)}" class="icon">
                <p class="temp">${Math.round(day.main.temp)}°</p>
            </div>
        `;
        weeklyContainer.insertAdjacentHTML("beforeend", dayCard);
    });
}

// ========================
// SEARCH FUNCTION
// ========================
async function searchCity(city) {
    if (!city || city.trim() === "") return;

    try {
        const data = await fetchWeather(city);
        if (!data || data.cod !== 200) {
            showSection(notFoundSection);
            return;
        }

        updateWeatherInfo(data);
        showSection(weatherContainer);
        updateForecasts(city);
    } catch (err) {
        console.error(err);
        showSection(notFoundSection);
    }

    // Clear all search inputs
    searchInputTop.value = "";
    searchInputCity.value = "";
    searchInputNotFound.value = "";
}

// ========================
// EVENT LISTENERS
// ========================
// Top search
searchBtnTop.addEventListener("click", () => searchCity(searchInputTop.value));
searchInputTop.addEventListener("keydown", e => { if (e.key === "Enter") searchCity(searchInputTop.value); });

// Bottom search
searchBtnCity.addEventListener("click", () => searchCity(searchInputCity.value));
searchInputCity.addEventListener("keydown", e => { if (e.key === "Enter") searchCity(searchInputCity.value); });

// Not found search
searchBtnNotFound.addEventListener("click", () => searchCity(searchInputNotFound.value));
searchInputNotFound.addEventListener("keydown", e => { if (e.key === "Enter") searchCity(searchInputNotFound.value); });

// Theme toggle
toggleCheckbox.addEventListener("change", () => document.body.classList.toggle("dark-mode"));

// Weekly forecast toggle
seeWeekBtn.addEventListener("click", () => {
    weatherContainer.style.display = "none";
    weekSection.style.display = "block";
});
backBtn.addEventListener("click", () => {
    weekSection.style.display = "none";
    weatherContainer.style.display = "flex";
});

// ========================
// INITIAL SETUP
// ========================
showSection(searchCitySection);
