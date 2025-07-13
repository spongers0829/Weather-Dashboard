// Dark Mode Triggered by Click
const themeToggle = document.querySelector('#flexSwitchCheckChecked');
themeToggle.addEventListener('click', changeTheme);

// User Theme Preference
const userTheme = localStorage.getItem('theme');
if (userTheme === 'dark') {
  themeToggle.click();
}

// Dark Mode Theme Change
function changeTheme() {
  document.querySelector('body').classList.toggle('dark');
  if (document.querySelector('body').classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
}

// Touch hover fix
document.addEventListener('touchstart', function () {}, true);

// API & Location Setup
const apiKey = '62b039f8311079712478a1f47699e0e4';
const apiWeather = 'https://api.openweathermap.org/data/2.5/weather';
const apiOneCall = 'https://api.openweathermap.org/data/2.5/onecall';
let units = 'imperial';
const locationHeading = document.querySelector('#location');
const geolocationButton = document.querySelector('#geolocation-btn');

const userLocation = localStorage.getItem('location');
if (userLocation) {
  updateWeatherByName(userLocation);
} else {
  updateWeatherByName('ADDIS ABABA');
}

// City Search
function updateWeatherByName(location) {
  axios
    .get(`${apiWeather}?q=${location}&appid=${apiKey}&units=${units}`)
    .then(displayCurrentTemperature)
    .catch(() =>
      alert(
        'There was a problem with your request! Try again or check back later.'
      )
    );
}

// Geolocation
geolocationButton.addEventListener('click', function () {
  navigator.geolocation.getCurrentPosition(getLocation);
});

function getLocation(position) {
  const lon = position.coords.longitude;
  const lat = position.coords.latitude;

  axios
    .get(`${apiWeather}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`)
    .then(displayCurrentTemperature);
}

// Search functionality
function searchCity(event) {
  event.preventDefault();
  const searchInput = document.querySelector('#search-input').value;
  if (searchInput) {
    updateWeatherByName(searchInput);
  }
}
document.querySelector('.search-form').addEventListener('submit', searchCity);

// Toggle Celsius ↔ Fahrenheit
const allTemps = document.querySelectorAll('#temp-now, .temps, .faded-temp');
const fahrenheit = document.querySelectorAll('.fahrenheit');
const celsius = document.querySelector('.celsius');
const windUnit = document.querySelector('#wind-unit');

function toggleTemp(event) {
  event.preventDefault();
  if (celsius.innerHTML === 'C') {
    celsius.innerHTML = 'F';
    fahrenheit.forEach(el => (el.innerHTML = 'C'));
    allTemps.forEach(
      el => (el.textContent = Math.round((el.innerHTML - 32) * (5 / 9)))
    );
    windUnit.innerHTML = `km/h`;
    units = 'metric';
  } else {
    celsius.innerHTML = 'C';
    fahrenheit.forEach(el => (el.innerHTML = 'F'));
    allTemps.forEach(
      el => (el.textContent = Math.round(el.innerHTML * (9 / 5) + 32))
    );
    windUnit.innerHTML = `mph`;
    units = 'imperial';
  }
  updateWeatherByName(locationHeading.textContent);
}
celsius.addEventListener('click', toggleTemp);

// DOM references
const currentTemp = document.querySelector('#temp-now');
const highTemp = document.querySelector('#high-temp');
const lowTemp = document.querySelector('#low-temp');
const feelsLikeTemp = document.querySelector('#feels-like');
const tempDescription = document.querySelector('#description-temp');
const wind = document.querySelector('#wind');
const humidity = document.querySelector('#humidity');
const visibility = document.querySelector('#visibility');
const clouds = document.querySelector('#clouds');
const sunrise = document.querySelector('#sunrise-time');
const sunset = document.querySelector('#sunset-time');
const scenery = document.querySelector('#scenery');
const conditionMsg = document.querySelector('#condition-msg');
const todaysDate = document.querySelector('#today');

// Display weather
function displayCurrentTemperature(response) {
  if (response.status == 200) {
    const data = response.data;

    // Timezone offset
    const timezoneOffset = data.timezone;

    // Date & Time for that city
    const localNow = new Date(
      Date.now() + timezoneOffset * 1000 - new Date().getTimezoneOffset() * 60000
    );
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    // Date statement
    const dateStatement = `${localNow.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })} at ${localNow.toLocaleTimeString([], options)}`;
    todaysDate.innerHTML = `${dateStatement}`;

    // Sunset/Sunrise time
    const sunriseTime = new Date(
      (data.sys.sunrise + timezoneOffset) * 1000 - new Date().getTimezoneOffset() * 60000
    );
    const sunsetTime = new Date(
      (data.sys.sunset + timezoneOffset) * 1000 - new Date().getTimezoneOffset() * 60000
    );

    sunrise.innerHTML = sunriseTime.toLocaleTimeString([], options);
    sunset.innerHTML = sunsetTime.toLocaleTimeString([], options);

    // Scenery Image (day or night)
    const currentHour = localNow.getHours();
    const sunriseHour = sunriseTime.getHours();
    const sunsetHour = sunsetTime.getHours();
    if (currentHour < sunriseHour || currentHour >= sunsetHour) {
      scenery.src =
        'https://images.pexels.com/photos/186980/pexels-photo-186980.jpeg?cs=srgb&dl=pexels-tahir-shaw-50609-186980.jpg&fm=jpg';
    } else {
      scenery.src = './assets/day-landscape.png';
    }

    // Weather update
    locationHeading.innerHTML = `${data.name}, ${data.sys.country}`;
    currentTemp.innerHTML = `${Math.round(data.main.temp)}`;
    highTemp.innerHTML = `${Math.round(data.main.temp_max)}`;
    lowTemp.innerHTML = `${Math.round(data.main.temp_min)}`;
    feelsLikeTemp.innerHTML = `${Math.round(data.main.feels_like)}`;
    tempDescription.innerHTML = `${data.weather[0].description}`;
    wind.innerHTML = `${Math.round(data.wind.speed)}`;
    humidity.innerHTML = `${data.main.humidity}`;
    visibility.innerHTML = `${Math.round(data.visibility / 1000)}`;
    clouds.innerHTML = `${data.clouds.all}`;

    // Icon
    axios.get('./icon.json').then(icon => {
      for (let i = 0; i < icon.data.length; i++) {
        if (
          data.weather[0].icon === icon.data[i].icon &&
          data.weather[0].id === icon.data[i].id
        ) {
          const mainWeatherIcon = document.querySelector('.default-main-icon');
          mainWeatherIcon.setAttribute('src', icon.data[i].src);
          mainWeatherIcon.setAttribute('alt', icon.data[i].alt);
        }
      }
    });

    // Message
    const weatherType = data.weather[0].main;
    if (
      weatherType === 'Rain' ||
      weatherType === 'Drizzle' ||
      weatherType === 'Clouds'
    ) {
      conditionMsg.innerHTML = `<i class="fa-solid fa-umbrella"></i> Umbrella Required`;
    } else if (weatherType === 'Thunderstorm' || weatherType === 'Tornado') {
      conditionMsg.innerHTML = `<i class="fa-solid fa-cloud-bolt"></i> Stay Indoors`;
    } else if (weatherType === 'Snow') {
      conditionMsg.innerHTML = `<i class="fa-solid fa-snowflake"></i> Dress Warm`;
    } else if (weatherType === 'Clear') {
      conditionMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Ideal Conditions`;
    } else if (
      weatherType === 'Mist' ||
      weatherType === 'Fog' ||
      weatherType === 'Haze'
    ) {
      conditionMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Poor Visibility`;
    } else {
      conditionMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Poor Air Quality`;
    }

    getForecast(response.data.coord);
    localStorage.setItem('location', `${data.name}`);
  }
}

// Forecast Section
function getForecast(coordinates) {
  axios
    .get(
      `${apiOneCall}?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=${units}`
    )
    .then(displayForecast);
}

function displayForecast(response) {
  const dewPoint = document.querySelector('#dew-point');
  dewPoint.innerHTML = `${Math.round(response.data.current.dew_point)}`;

  const forecastData = response.data.daily;
  const forecastContainer = document.querySelector('.full-forecast');
  let forecastHTML = '';
  forecastData.forEach(function (day, index) {
    if (index < 7) {
      forecastHTML += `<div class="daily m-2 m-md-0">
        <p>${formatDay(day.dt)}</p>
        <img src="./assets/loading.svg" class="weather-icon forecast-icon mb-2" height="45px" width="50px"/>
        <p>
          <span class="temps">${Math.round(day.temp.max)}</span>°<span class="fahrenheit">${units === 'metric' ? 'C' : 'F'}</span><br/>
          <span class="daily-low">
            <span class="forecast-low temps">${Math.round(day.temp.min)}</span>°<span class="fahrenheit">${units === 'metric' ? 'C' : 'F'}</span>
          </span>
        </p>
      </div>`;

      axios.get('./icon.json').then(icon => {
        for (let i = 0; i < icon.data.length; i++) {
          if (
            day.weather[0].id === icon.data[i].id &&
            day.weather[0].icon === icon.data[i].icon
          ) {
            forecastHTML = forecastHTML.replace(
              'src="./assets/loading.svg"',
              `src="${icon.data[i].src}"`
            );
          }
        }
        forecastContainer.innerHTML = forecastHTML;
      });
    }
  });
}

function formatDay(unix) {
  const date = new Date(unix * 1000);
  const day = date.getDay();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[day];
}

// Global Forecast
const cityTemps = document.querySelectorAll('.global-temps');
const cityWeatherDesc = document.querySelectorAll('.global-descriptions');
const cityNames = document.querySelectorAll('.global-name');
const countryNames = document.querySelectorAll('.country-name');
const cities = [
  'Seattle', 'Rabat', 'London', 'Paris', 'Delhi',
  'Jakarta', 'Manila', 'Shanghai', 'Tokyo', 'Cairo',
  'Dhaka', 'New York', 'Istanbul', 'Los Angeles', 'Munich', 'Dubai'
];

cities.sort(() => Math.random() - 0.5);

function displayGlobalTemperature() {
  for (let i = 0; i < 5; i++) {
    axios
      .get(`${apiWeather}?q=${cities[i]}&appid=${apiKey}&units=${units}`)
      .then(response => {
        const data = response.data;
        cityNames[i].innerHTML = `${data.name}`;
        countryNames[i].innerHTML = `${data.sys.country}`;
        cityTemps[i].innerHTML = Math.round(data.main.temp);
        cityWeatherDesc[i].innerHTML = `${data.weather[0].description}`;
        axios.get('./icon.json').then(icon => {
          for (let k = 0; k < icon.data.length; k++) {
            if (
              data.weather[0].id === icon.data[k].id &&
              data.weather[0].icon === icon.data[k].icon
            ) {
              let globalWeatherIcon = document.querySelectorAll('.global-icon');
              globalWeatherIcon[i].setAttribute('src', icon.data[k].src);
              globalWeatherIcon[i].setAttribute('alt', icon.data[k].alt);
            }
          }
        });
      });
  }
}

let globalContainers = document.querySelectorAll('.global-item');
for (let i = 0; i < 5; i++) {
  globalContainers[i].addEventListener('click', () => {
    updateWeatherByName(cities[i]);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

displayGlobalTemperature();
