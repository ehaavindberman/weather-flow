// fresh air app clone

// todo: interpolate between hours 
// todo: start data at start of day
// todo: add precipitation percentage circle
// todo: change background color based on time
// todo: get high/low for the day 
// todo: allow user to pick F or C

async function getWeather(latlon) {
  const api_url = `/weather/${latlon}/hourly`;
  const response = await fetch(api_url);
  const json = await response.json();
  parseHourlyData(json);

  const daily_url = `/weather/${latlon}/daily`;
  const response_daily = await fetch(daily_url);
  const json_daily = await response_daily.json();
  parseDailyData(json_daily);
}

function parseDailyData(data) {
  // only taking first six days since that's what we have hourly data for
  // sunrise/sunset data[i].sunrise.value
  // temp high/low data[i].temp[0].min.value
  // weather code data[i].weather_code.value
  // moon phase data[i].moon_phase.value
  // date data[i].observation_time.value

  let row = document.getElementById('bottom-row');
  row.textContent = '';
  for (let i = 1; i < 7; i++) {

    let d = document.createElement('div');
    d.className = 'daily';
    row.appendChild(d);

    let dow = document.createElement('p');
    let date = new Date(data[i].observation_time.value);
    dow.textContent = date.toLocaleDateString('en-US', { weekday: 'short' });
    d.appendChild(dow);

    let weather = document.createElement('i');
    weather.className = "wi " + getWeatherName(data[i].weather_code.value).icon;
    d.appendChild(weather);

    let temp = document.createElement('p');
    temp.textContent = Math.round(data[i].temp[1].max.value);
    d.appendChild(temp);

    // add stuff to the overall

  } 

}

function parseHourlyData(data) {
  let tempArray = [];
  let labelArray = [];
  let precipArray = [];
  let newDayArray = [];
  let weatherNameArray = [];
  for (let i=0; i<data.length; i++) {

    tempArray.push(data[i].temp.value);

    weatherNameArray.push(getWeatherName(data[i].weather_code.value).name);

    let lab = parseDate(data[i].observation_time.value);
    if (lab.newday) {
      newDayArray.push(lab.val);
    }
    labelArray.push(lab.val);

    precipArray.push(data[i].precipitation_probability.value);

  }
  updateDeg(Math.round(tempArray[0]));
  updatePrecip(precipArray[0]);
  updateWeatherName(0,weatherNameArray);
  
  makeLineGraph(tempArray,precipArray,labelArray,newDayArray, weatherNameArray);
}

function parseDate(d) {
  let date = new Date(d);
  let hrs = date.getHours();
  let wkday = date.toLocaleDateString('en-US', { weekday: 'short' });
  let ampm = ' AM';
  let newday = false;
  if (hrs == 12) {
    ampm = ' PM';
  }
  if (hrs > 12) {
    hrs -= 12;
    ampm = ' PM';
  }
  if (hrs == 0) {
    hrs = 12
    newday = true;
  }

  return {val: hrs + ':00' + ampm + ' ' + wkday,
  newday: newday};
}


function makeLineGraph(temp, precip, labels, newDays, weatherName) {
  var ctx = document.getElementById('weather').getContext('2d');
  var wholeDiv = document.getElementById('container');
  wholeDiv.style.backgroundColor = 'rgb(153, 204, 255)';

  var annotations = newDays.map(function(val, index) {
    return {
        type: 'line',
        id: 'vline' + index,
        mode: 'vertical',
        scaleID: 'x-axis-0',
	      // borderDash: [2, 2],
        value: val,
        borderColor: 'rgb(255, 255, 255,.5)',
        borderWidth: 1
    }
  });


  var myChart = new Chart(ctx, {

    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        yAxisID: 'A',
        data: temp,
        borderColor: 'rgba(0,0,0,0)',
        backgroundColor: 'rgb(255, 255, 255,.5)',
        pointHoverRadius: 5,
        pointHoverBorderWidth: 4,
        pointHoverBorderColor: 'rgba(255,255,255,.5)'
      },
      {
        yAxisID: 'B',
        data: precip,
        backgroundColor: 'rgb(255, 255, 255,.5)',
        borderColor: 'rgba(0,0,0,0)',
        pointRadius: 0,
        pointHoverRadius: 0
      }]
    },  
    options: {
      responsive: true,
      maintainAspectRatio: false,
      annotation: {
       drawTime: 'afterDatasetsDraw',
        annotations: annotations
      },
      elements: {
        point: {
          radius: 0
        }
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          display: false
        }],
        yAxes: [{
          id: 'A',
          type: 'linear',
          display: false,
          gridLines: {
            display: false
          },
          ticks: {
            beginAtZero: true
          }
        }, {
          id: 'B',
          type: 'linear',
          display: false,
          gridLines: {
            display: false
          },
          ticks: {
            beginAtZero: true,
            suggestedMax: 200
          }
        }]
      },
      tooltips: {
        position: 'nearest',
        mode: 'index',
        axis: 'x',
        intersect: false,
        yPadding: 0,
        xPadding: 0,
        caretSize: 10,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 0,
        titleFontColor: '#fff',
        bodyFontSize: 0,
        displayColors: false,
        callbacks: {
          label: function(tooltipItem, data) {

            let label = Math.round(tooltipItem.yLabel);

            if (tooltipItem.datasetIndex == 0) {
              updateDeg(label);
            } else {
              updatePrecip(tooltipItem.yLabel);
            }
            updateWeatherName(tooltipItem.index, weatherName);
            
            // updateBgColor(tooltipItem.xLabel);
            return label;
          }
        }
      }
    }
  });
}

function updateDeg(num) {
  let t = document.getElementById('temp');
  t.innerHTML = num + ' &#176;F';
}
function updateBgColor(time) {
  // var wholeDiv = document.getElementById('container');
  // wholeDiv.style.backgroundColor = 'rgba(0,0,0,.8)';
}

function updatePrecip(pct) {
  let p = document.getElementById('precip');
  p.innerHTML = pct + '%';
}

function updateWeatherName(idx, weatherNameArr) {
  let p = document.getElementById('name');
  p.innerHTML = weatherNameArr[idx];
}

function getWeatherName(code) {
  weatherName = '';
  cssIconName = '';
  switch (code) {
    case 'freezing_rain_heavy':
      weatherName = 'Freezing Rain';
      cssIconName = 'wi-sleet';
      break;
    case 'freezing_rain_light':
      weatherName = 'Freezing Rain'; 
      cssIconName = 'wi-sleet';
      break; 
    case 'freezing_drizzle':
      weatherName = 'Freezing Drizzle'; 
      cssIconName = 'wi-sleet';
      break; 
    case 'ice_pellets_heavy': 
      weatherName = 'Hail';
      cssIconName = 'wi-hail';
      break; 
    case 'ice_pellets': 
      weatherName = 'Hail';
      cssIconName = 'wi-hail';
      break; 
    case 'ice_pellets_light': 
      weatherName = 'Hail';
      cssIconName = 'wi-hail';
      break; 
    case 'snow_heavy': 
      weatherName = 'Heavy Snow';
      cssIconName = 'wi-snow';
      break; 
    case 'snow': 
      weatherName = 'Snow';
      cssIconName = 'wi-snow';
      break; 
    case 'snow_light': 
      weatherName = 'Light Snow';
      cssIconName = 'wi-snow';
      break; 
    case 'flurries': 
      weatherName = 'Snow Flurries';
      cssIconName = 'wi-snow-wind';
      break; 
    case 'tstorm': 
      weatherName = 'Thunderstorms';
      cssIconName = 'wi-storm-showers';
      break; 
    case 'rain_heavy': 
      weatherName = 'Heavy Rain';
      cssIconName = 'wi-rain';
      break; 
    case 'rain': 
      weatherName = 'Rain';
      cssIconName = 'wi-rain';
      break; 
    case 'rain_light': 
      weatherName = 'Light Rain';
      cssIconName = 'wi-showers';
      break; 
    case 'drizzle': 
      weatherName = 'Drizzle';
      cssIconName = 'wi-showers';
      break; 
    case 'fog_light': 
      weatherName = 'Light Fog';
      cssIconName = 'wi-fog';
      break; 
    case 'fog': 
      weatherName = 'Fog';
      cssIconName = 'wi-fog';
      break; 
    case 'cloudy':
      weatherName = 'Cloudy'; 
      cssIconName = 'wi-cloudy';
      break; 
    case 'mostly_cloudy': 
      weatherName = 'Mostly Cloudy';
      cssIconName = 'wi-day-cloudy';
      break; 
    case 'partly_cloudy': 
      weatherName = 'Partly Cloudy';
      cssIconName = 'wi-day-cloudy';
      break; 
    case 'mostly_clear': 
      weatherName = 'Clear';
      cssIconName = 'wi-day-sunny';
      break; 
    case 'clear':
      weatherName = 'Clear';
      cssIconName = 'wi-day-sunny';
      break;
  }
  return {name: weatherName,icon: cssIconName};
}