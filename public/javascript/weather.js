// Converts weather between C and F

const convert = document.getElementById('convert-units')

convert.addEventListener('click', function() {
    const overallTemperatures = [...document.getElementsByClassName('overall-temp-convert')]
    const degrees = [...document.getElementsByClassName('degree')]
    const minTemperatures = [...document.getElementsByClassName('min-temp-convert')]
    const maxTemperatures = [...document.getElementsByClassName('max-temp-convert')]
    const feelsLikeTemperatures = [...document.getElementsByClassName('feels-like-convert')]
    const windSpeeds = [...document.getElementsByClassName('wind-speed-convert')]
    const windSpeedUnits = [...document.getElementsByClassName('wind-speed-unit')]
    const unitToggle = [...document.getElementsByClassName('unit-toggle')]
    
    let temperatureIndex = 0
    if (unitToggle[0].innerText === 'C') {
        unitToggle[0].innerText = 'F'
        temperatureIndex = 0
    } else {
        unitToggle[0].innerText = 'C'
        temperatureIndex = 1
    }

    for (let [i, temperature] of overallTemperatures.entries()) {
        temperature.innerText = weatherForecast[i].temp[temperatureIndex]
    }

    for (let [i, temperature] of minTemperatures.entries()) {
        temperature.innerText = weatherForecast[i].tempMin[temperatureIndex]
    }

    for (let [i, temperature] of maxTemperatures.entries()) {
        temperature.innerText = weatherForecast[i].tempMax[temperatureIndex]
    }

    for (let [i, temperature] of feelsLikeTemperatures.entries()) {
        temperature.innerText = weatherForecast[i].feelsLike[temperatureIndex]
    }

    for (let [i, windSpeed] of windSpeeds.entries()) {
        windSpeed.innerText = weatherForecast[i].windSpeed[temperatureIndex]
    }

    for (let windSpeedUnit of windSpeedUnits) {
        if (windSpeedUnit.innerText === ' kph ') {
            windSpeedUnit.innerText = ' mph '
        } else {
            windSpeedUnit.innerText = ' kph '
        }
    }

    for (let degree of degrees) {
        if (degree.innerText === 'C') {
            degree.innerText = 'F'
        } else {
            degree.innerText = 'C'
        }
    }
})