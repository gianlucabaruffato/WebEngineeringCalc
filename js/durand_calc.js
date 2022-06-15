const jsonURL = 'https://api.npoint.io/68404205d8a45adcfb9b'
async function fetchJson(jsonURL) {
    let response = await fetch(jsonURL)
    dataJson = await response.json()

    return dataJson
}

async function displayJson(){
    let data = await fetchJson(jsonURL)
}

displayJson()

function linealInterp(X1, Y1, X2, Y2, X) {
    const Y3 = Y1 + (X-X1)*(Y2-Y1)/(X2-X1);
    return parseFloat(Y3);
}

function mainCompute(factor) {
    d50 = parseFloat(document.getElementById('d50').value)
    let cv = parseFloat(document.getElementById('cv').value)
    let dataArray
    let cvIndexArray
    let dictIndexes

    switch(factor) {
        case 'durand':
            if (cv < 2 || cv > 15) {
                alert ('ERROR: Cv values out of range (2% ≤ Cv ≤ 15%)')
                return
            }
            if (d50 < 10 || d50 > 2000) {
                alert ('ERROR: d50 values out of range (10 ≤ d50 ≤ 2000)')
                return
            }
            dataArray = dataJson.durand
            cvIndexArray = [2, 5, 10, 15]
            dictIndexes = ['d', 2, 5, 10, 15]
            break
        case 'cave':
            if (cv < 5 || cv > 40) {
                alert ('ERROR: Cv values out of range (5% ≤ Cv ≤ 40%)')
                return
            }
            if (d50 < 10 || d50 > 3000) {
                alert ('ERROR: d50 values out of range (10 ≤ d50 ≤ 3000)')
                return
            }
            dataArray = dataJson.cave
            cvIndexArray = [5, 10, 20, 30, 40]
            dictIndexes = ['d', 5, 10, 20, 30, 40]
            break
    }


    let firstPairValuesDict = []
    let secondPairValuesDict = []
    let firstPairValues = []
    let secondPairValues= []

    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i].d >= d50) {
            firstPairValuesDict = dataArray[i]
            secondPairValuesDict = dataArray[i-1]

            if (i == 0) {   // in case d50 = 10 and there's no lower d50 to interpolate
                switch(factor) {
                    case 'durand':
                        secondPairValuesDict = {'d':0, 2:0, 5:0, 10:0, 15:0}
                        break
                    case 'cave':
                        secondPairValuesDict = {'d':0, 5:0, 10:0, 20:0, 30:0, 40:0}
                        break
                }
            }
            break
        }
    }

    console.log(firstPairValuesDict)
    console.log(secondPairValuesDict) 


    // Dictionary to array

    for (let index of dictIndexes) {
        firstPairValues.push(firstPairValuesDict[index])
        secondPairValues.push(secondPairValuesDict[index])
    }

    console.log(firstPairValues, secondPairValues) // Hasta aca OK

    // First interpolation with d50

    let interpolatedArray1 = [d50]

    for (let i = 1; i < firstPairValues.length; i++) {
        interpolatedValue = linealInterp(firstPairValues[0], firstPairValues[i], secondPairValues[0], secondPairValues[i], d50)
        interpolatedValue = Math.round(interpolatedValue * 1e3) / 1e3
        interpolatedArray1.push(interpolatedValue)
    }

    console.log(interpolatedArray1)
    

    for (let i = 1; i < cvIndexArray.length; i++) {
        if (cvIndexArray[i] >= cv) {
            let firstCvIndex = i
            let secondCvIndex = i-1

            interpolatedFl = linealInterp(cvIndexArray[firstCvIndex], interpolatedArray1[firstCvIndex+1],
                cvIndexArray[secondCvIndex], interpolatedArray1[secondCvIndex+1], cv)
            
            break
        }
    }

    document.getElementById('durand-result').innerHTML = interpolatedFl.toFixed(3)
    chartAddCurrent(d50, interpolatedFl)
    restoreZoomInCurrent()
}


const dataDurand = {
    labels: [10, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000, 2000],
    datasets: [{
        label: 'Cv = 2%',
        data: [0.1,0.2,0.4,0.544,0.632,0.72,0.93,1.1,1.17,1.206,1.23,1.302],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgb(75, 192, 192)',
        tension: 0.4,
    },{
        label: 'Cv = 5%',
        data: [0.124,0.248,0.496,0.662,0.746,0.83,1.08,1.29,1.375,1.396,1.4,1.35],
        borderColor: 'rgb(97, 68, 156)',
        backgroundColor: 'rgb(97, 68, 156)',
        tension: 0.4,
    },{
        label: 'Cv = 10%',
        data: [0.14,0.28,0.56,0.752,0.856,0.96,1.21,1.42,1.465,1.454,1.43,1.356],
        borderColor: 'rgb(248, 48, 206)',
        backgroundColor: 'rgb(248, 48, 206)',
        tension: 0.4,
    },{
        label: 'Cv = 15%',
        data: [0.148,0.296,0.592,0.792,0.896,1,1.27,1.47,1.505,1.482,1.45,1.362],
        borderColor: 'rgb(11, 191, 138)',
        backgroundColor: 'rgb(11, 191, 138)',
        tension: 0.4,
    },{
        label: 'Current',
        borderColor: 'rgba(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132)'
    }]
}

const dataCave = {
    labels: [10,20,40,60,80,100,200,400,600,800,1000,2000,3000],
    datasets: [{
        label: 'Cv = 5%',
        data: [0.4700,0.5884,0.7068,0.7761,0.8252,0.8633,0.9817,1.1001,1.1720,1.2300,1.2620,1.3390,1.3600],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgb(75, 192, 192)',
        tension: 0.4,
    },{
        label: 'Cv = 10%',
        data: [0.4699,0.5958,0.7217,0.7953,0.8475,0.8880,1.0139,1.1398,1.2090,1.2600,1.2940,1.3660,1.3860],
        borderColor: 'rgb(97, 68, 156)',
        backgroundColor: 'rgb(97, 68, 156)',
        tension: 0.4,
    },{
        label: 'Cv = 20% & 40%',
        data: [0.4700,0.6053,0.7406,0.8198,0.8759,0.9195,1.0548,1.1901,1.2680,1.3100,1.3340,1.3860,1.3990],
        borderColor: 'rgb(248, 48, 206)',
        backgroundColor: 'rgb(248, 48, 206)',
        tension: 0.4,
    },{
        label: 'Cv = 30%',
        data: [0.4699,0.6146,0.7592,0.8438,0.9039,0.9504,1.0951,1.2398,1.3050,1.3400,1.3600,1.3950,1.4000],
        borderColor: 'rgb(11, 191, 138)',
        backgroundColor: 'rgb(11, 191, 138)',
        tension: 0.4,
    },{
        label: 'Current',
        borderColor: 'rgba(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132)'
    }]
}

function createChart(inputData) {    
    const data = inputData
    
    config = {
        type: 'line',
        data: data,
        options: {
            aspectRatio: 1.5,
            scales: {
                'y': {
                    display: true,
                    title: {
                        display: true,
                        text: 'FL',
                        font: {
                            size: 16,
                            weight: 'bold',
                        }
                    }
                },
                'x': {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'd50 [μm]',
                        font: {
                            size: 16,
                            weight: 'bold',
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(tooltipItems) {
                            return tooltipItems.dataset.label +', ' + tooltipItems.parsed.y + ' FL'
                        },
                        title: function(tooltipTitle) {
                            return 'd50 = ' + tooltipTitle[0].label + ' [μm]'
                        }
                    }
                },
            }
        }
    }
    chart = new Chart(
        document.getElementById('chart'),
        config
    )
}

createChart(dataDurand)

function changeInput(chartData, input) {
    chart.data = chartData
    chart.update()

    switch(input) {
        case 'durand':
            document.getElementById('calculate-button').innerHTML = `<button class="btn btn-primary" type="button" onclick="mainCompute('durand')">Calculate</button>`
            break
        case 'cave':
            document.getElementById('calculate-button').innerHTML = `<button class="btn btn-primary" type="button" onclick="mainCompute('cave')">Calculate</button>`
            break
    }

    restoreZoomInCurrent()
    chartClearCurrent()
    document.getElementById('durand-result').innerHTML = '-'
    interpolatedFl = 'a'
}



function chartAddCurrent(xCurrent, yCurrent) {
    let dict = {
        annotations: {
            lineCurrentX: {
                type: 'line',
                xMax: xCurrent,
                yMax: yCurrent,
                xMin: xCurrent,
                yMin: 0,
                borderDash: [10,5],
                borderColor: 'rgb(71, 71, 71)',

            },
            lineCurrentY: {
                type: 'line',
                xMax: xCurrent,
                yMax: yCurrent,
                xMin: 0,
                yMin: yCurrent,
                borderDash: [10,5],
                borderColor: 'rgb(71, 71, 71)',
            },
            pointCurrent: {
                type: 'point',
                xValue: xCurrent,
                yValue: yCurrent,
                backgroundColor: 'rgba(255, 99, 132)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 2,

                radius: 5
            }

        }
    }

    chart.config.options.plugins.annotation = dict
    chart.update()
}

function chartClearCurrent() {
    let dict = {
        annotations: {
        }
    }

    chart.config.options.plugins.annotation = dict
    chart.update()
}


function zoomInCurrent() {
    try {
        config.options.scales['x'].max = d50*1.35
        config.options.scales['x'].min = d50/1.5
    
        config.options.scales['y'].min = interpolatedFl*0.8
        config.options.scales['y'].max = interpolatedFl*1.2
    
        chart.update()
    } catch {
        restoreZoomInCurrent()
    }
}

function restoreZoomInCurrent() {
    isDurandInputSelected = document.getElementById('btnradio1').checked

    if (isDurandInputSelected) {
        config.options.scales['x'].max = 2000
        config.options.scales['x'].min = 0
    
        config.options.scales['y'].min = 0
        config.options.scales['y'].max = 1.6
    } else {
        config.options.scales['x'].max = 3000
        config.options.scales['x'].min = 0
    
        config.options.scales['y'].min = 0.4
        config.options.scales['y'].max = 1.4
    }


    chart.update()
}