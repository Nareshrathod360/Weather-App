const resultDiv = document.getElementById("result");
const body = document.body;
const apiKey = "f7e93052c154ca5b7aa326cc6ca3b8ad";

// On page load: ask for location
window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            error => {
                resultDiv.innerHTML = "⚠️ Please enter a city name to get weather!";
            }
        );
    } else {
        resultDiv.innerHTML = "⚠️ Geolocation not supported. Please enter a city name!";
    }
});

// Manual city search
async function getWeatherByCity() {
    const city = document.getElementById("cityInput").value;
    if (!city) {
        resultDiv.innerHTML = "⚠️ Please enter a city name!";
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod === "404") {
        resultDiv.innerHTML = "❌ City not found!";
        return;
    }

    const lat = data.coord.lat;
    const lon = data.coord.lon;

    getWeatherByCoords(lat, lon);
}

// Fetch weather by coordinates
async function getWeatherByCoords(lat, lon) {
    // Current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const currentRes = await fetch(currentUrl);
    const currentData = await currentRes.json();

    const iconCode = currentData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

   let weatherMain = currentData.weather[0].main.toLowerCase();

    // Dynamic background
    if (weatherMain.includes("cloud")) {
        body.style.background = "linear-gradient(to right, #bdc3c7, #2c3e50)";
    } else if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
        body.style.background = "linear-gradient(to top, #4e54c8, #8f94fb)";
    } else if (weatherMain.includes("clear")) {
        body.style.background = "linear-gradient(to top, #f6d365, #fda085)";
    } else if (weatherMain.includes("snow")) {
        body.style.background = "linear-gradient(to top, #e0eafc, #cfdef3)";
    } else if (weatherMain.includes("mist") || weatherMain.includes("fog")) {
        body.style.background = "linear-gradient(to top, #757f9a, #d7dde8)";
    } else {
        body.style.background = "linear-gradient(to top, #4facfe, #00f2fe)";
    }


    // Display current weather
    resultDiv.innerHTML = `
        <h3>${currentData.name}</h3>
        <img src="${iconUrl}" alt="Weather icon">
        <p style="color:white;">🌡 Temperature: <b>${currentData.main.temp}°C</b></p>
        <p style="color:white;">🌥 Weather: <b>${currentData.weather[0].description}</b></p>
        <p style="color:white;">💧 Humidity: <b>${currentData.main.humidity}%</b></p>
        <p style="color:white;">🌬 Wind: <b>${currentData.wind.speed} m/s</b></p>
        <h4> 5-Day Forecast</h4>
        <div id="forecast" class="forecast"></div>
    `;

    // hide search box
    document.getElementById("searchBox").style.display = "none";


    // 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();
    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";

    const dailyForecasts = forecastData.list.filter(f => f.dt_txt.includes("12:00:00"));
    dailyForecasts.forEach(f => {
        const date = new Date(f.dt_txt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
        const icon = `https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png`;
        const temp = f.main.temp;

        forecastDiv.innerHTML += `
            <div class="day">
                <p>${date}</p>
                <img src="${icon}" alt="icon">
                <p>${temp}°C</p>
            </div>
        `;
    });
}
