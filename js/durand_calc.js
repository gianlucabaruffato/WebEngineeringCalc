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

const g = 9.81

function linealInterp(X1, Y1, X2, Y2, X) {
    const Y3 = Y1 + (X-X1)*(Y2-Y1)/(X2-X1);
    return parseFloat(Y3);
}

function findSurrounding(value, array) {
    let Next = array.find(element => element > value)
    let NextIndex
    let PrevIndex
    let Prev


    if (Next == undefined) {
        Next = array[array.length-1]
        Prev = array[array.length-2]
        NextIndex = array.length-1
        PrevIndex = array.length-2
    } else {
        NextIndex = array.indexOf(Next)
        PrevIndex = array.indexOf(Next)-1
        Prev = array[PrevIndex]
    }

    return [Prev, Next, PrevIndex, NextIndex]
}

function changeGraphName(factor) {
    switch (factor) {
        case 'durand':
            document.getElementById('graph_name').innerHTML = "Durand's"
            break
        case 'cave':
            document.getElementById('graph_name').innerHTML = "Cave's"
            break
    }
}

function mainCompute(factor) {
    d50 = parseFloat(document.getElementById('d50').value)
    let cv = parseFloat(document.getElementById('cv').value)
    let dataArray
    let cvIndexArray
    let dictIndexes

    // transform d50 from input units to um
    let d50UnitsValue = document.getElementById('d50-units').value
    switch (d50UnitsValue) { 
        case '0': // input um
            break
        case '1': // input mm
            d50 = d50*1000
            break
        case '2': // input m
            d50 = d50*1000*1000
            break
    }

    switch(factor) {
        case 'durand':
            if (cv < 2 || cv > 15) {
                alert ('ERROR: Cv values out of range (2% ≤ Cv ≤ 15%)')
                return
            }
            if (d50 < 10 || d50 > 2000) {
                alert ('ERROR: d50 values out of range (10 μm ≤ d50 ≤ 2000 μm)')
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
                alert ('ERROR: d50 values out of range (10 μm ≤ d50 ≤ 3000 μm)')
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

    // Dictionary to array

    for (let index of dictIndexes) {
        firstPairValues.push(firstPairValuesDict[index])
        secondPairValues.push(secondPairValuesDict[index])
    }

    console.log(firstPairValues, secondPairValues) 

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
    slurryVelocityCalc(interpolatedFl)
}



// compute for Wilson's curves in separate function since methods are extremely different
function wilsonCompute() {
    const dArray = [0.1,0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,0.2,0.22,0.24,0.26,0.28,0.3,0.32,0.34,0.36,0.38,0.4,0.45,0.5,0.6]
    const graph1Array = [0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.25, 0.3, 0.4, 0.6, 0.8, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30]
    const graph2Array = [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.5, 4, 4.5, 5, 5.5,6]
    const resultArray = [0,0.097864769,0.179715302,0.25088968,0.31316726,0.364768683,0.411032028,0.453736655,0.489323843,0.523131673,0.551601423,0.604982206,0.645907473,0.679715302,0.709964413,0.736654804,0.790035587,0.830960854,0.862989324,0.889679715,0.927046263,0.955516014,0.973309609,0.987544484,1]

    let d50 = parseFloat(document.getElementById('d50').value)/1000
    let S = parseFloat(document.getElementById('S').value)

    // transform d50 from input units to um
    let d50UnitsValue = document.getElementById('d50-units').value
    switch (d50UnitsValue) { 
        case '0': // input um
            break
        case '1': // input mm
            d50 = d50*1000
            break
        case '2': // input m
            d50 = d50*1000*1000
            break
    }

    if (d50 > 30 || d50 < 0.15) {
        alert('d50 values out of range (150 μm ≤ d50 ≤ 30000 μm)')
        return
    }

    if (S > 6 || S < 1.1) {
        alert('SGs values out of range (1.1 ≤ SGs ≤ 6)')
        return
    }

    //interpolate to get value al line break (x = 1)

    let results1 = []
    
    // get index of next and prev d50


    let [d50Prev, d50Next, d50PrevIndex, d50NextIndex] = findSurrounding(d50, graph1Array)

    // get (x,y) for input d50 interpolating

    let x = linealInterp(d50Prev, dataJson.wilson.graph1[d50PrevIndex]['x'], d50Next, dataJson.wilson.graph1[d50NextIndex]['x'], d50)
    let y = linealInterp(d50Prev, dataJson.wilson.graph1[d50PrevIndex]['y'], d50Next, dataJson.wilson.graph1[d50NextIndex]['y'], d50)

    // for obtained d50 (point over graph 1) get Y value at X = 0

    for (let i = 0; i < dArray.length; i++) {
        let interpValue = linealInterp(0, dataJson.wilson.D[i]['y'], x, y, 1)
        if (interpValue >= 1 || interpValue <= 0) {
            results1.push(null)
        } else {
            results1.push(interpValue)
        }
    }

    // with results 1, do the same for graph 2 and get final results

    let results2 = []

    // get index of next and prev S

    let [sPrev, sNext, sPrevIndex, sNextIndex] = findSurrounding(S, graph2Array)

    // get (x,y) for S interpolating

    let x2 = linealInterp(sPrev, dataJson.wilson.graph2[sPrevIndex]['x'], sNext, dataJson.wilson.graph2[sNextIndex]['x'], S)
    let y2 = linealInterp(sPrev, dataJson.wilson.graph2[sPrevIndex]['y'], sNext, dataJson.wilson.graph2[sNextIndex]['y'], S)

    let interpValue2

    for (let i = 0; i < results1.length; i++) {
        if (results1[i] != null) {
            interpValue2 = linealInterp(0, results1[i], x2, y2, 1)
            if (interpValue2 < 0 || interpValue2 > 1) {
                results2.push(null)
            } else {
                results2.push(interpValue2)
            }
        } else {
            results2.push(null)
        }
    }

    let results3 = []

    for (let i = 0; i < results2.length; i++) {
        let [vPrev, vNext, vPrevIndex, vNextIndex] = findSurrounding(results2[i], resultArray)

        let finalValue = linealInterp(vPrev,
        dataJson.wilson.result[vPrevIndex]['x'],
        vNext,
        dataJson.wilson.result[vNextIndex]['x'],
        results2[i])
        
        if (finalValue == 1) {
            results3.push(null)
        } else {
            finalValue = Math.round(finalValue * 1e3) / 1e3
            results3.push(finalValue)
        }

    }

    summonChart(results3, 'wilson')
    config_velocity.options.scales.x.type = 'linear'
    config_velocity.options.scales.x.title.text = 'Internal Diameter [mm]'
    config_velocity.options.scales.x.title.display = true
    config_velocity.options.scales.x.title.font = {
        size: 16,
        weight: 'bold',
    }

    chart_velocity.update()
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
                        text: 'Fₗ',
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
                            return tooltipItems.dataset.label +', ' + tooltipItems.parsed.y + ' Fₗ'
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

let prevWidth = 0

function changeInput(chartData, input) {

    prevWidth = 1



    if (input == 'durand' || input == 'cave') {
        document.getElementById('input_fields').innerHTML = `
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text">Particle Size (d50)</span>
            <input type="number" step="0.01" max="2000" min="10" id="d50" class="form-control">
            <select class="form-select unit-dropdown" id="d50-units">
                <option value="0" selected>μm</option>
                <option value="1">mm</option>
                <option value="2">m</option>
            </select>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text" id="vol-input-text">Volume Concentration (Cv)</span>
            <input type="number" step="0.01" max="15" min="2" id="cv" class="form-control">
            <span class="input-group-text ">%</span>
        </div>
        <div class="d-flex justify-content-between">
            <div class="input-group mb-3" id="calculate-button">
                <button class="btn btn-primary" type="button" onclick="mainCompute('durand')">Calculate</button>
            </div>
            <div class="input-group mb-3"  style="width: 200px;">
                <span class="form-control durand-results" id="durand-result">-</span>
                <span class="input-group-text input-group-text-last">F<sub>L </sub></span>
            </div>
        </div>
        <hr>
        <p class="info-text">
            Optional: Specific gravity of solids in suspension (SG<sub>s</sub>). Input a value (SG<sub>s</sub> > 1) to 
            create a plot of minimum slurry velocity for pipe size.
        </p>
        <div class="d-flex justify-content-center input-group">
            <span class="input-group-text">SG<sub>s</sub></span>
            <input type="number" step="0.01" id="S" class="form-control form-factor" value="">
        </div>
        `    

        document.getElementById('results').innerHTML = `
        <p class="info-text" style="margin: 10px 0 10px 15px;">F<sub>L</sub> Factor Graph</p>
        <div>
            <canvas id="chart"></canvas>
            <div class="d-flex justify-content-center">
                <button type="button" class="btn btn-primary mt-2 zoom-btn" onclick="zoomInCurrent()">Zoom In Current</button>
                <button type="button" class="btn btn-primary mt-2 zoom-btn" onclick="restoreZoomInCurrent()">Restore Zoom</button>  
            </div>
        </div>
        <hr>
        <p class="info-text" style="margin: 10px 0 10px 15px;">
            <span id="graph_name">
                Durand's 
            </span>
            Limiting Settling Velocity (for STD. SCH.)
        </p>
        <div>
            <canvas id="chart_velocity"></canvas>
        </div>
        `
        createChart(chartData)
        chart.data = chartData
        chart.update()
        summonChart()

    } else {
        document.getElementById('input_fields').innerHTML = `
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text">Particle Size (d50)</span>
            <input type="number" step="0.01" max="2000" min="10" id="d50" class="form-control">
            <select class="form-select unit-dropdown" id="d50-units">
                <option value="0" selected>μm</option>
                <option value="1">mm</option>
                <option value="2">m</option>
            </select>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text" id="solid-input-text">Solids Specific Gravity (SG<sub>s</sub>)</span>
            <input type="number" step="0.01" id="S" class="form-control" value="">
        </div>
        <div class="d-flex justify-content-between">
            <div class="input-group mb-3" id="calculate-button">
                <button class="btn btn-primary" type="button" onclick="wilsonCompute()">Calculate</button>
            </div>
        </div>
        `    

        document.getElementById('results').innerHTML = `
        <p class="info-text" style="margin: 10px 0 10px 15px;">
        <span id="graph_name">
            Wilson's 
        </span>
        Limiting Settling Velocity (for internal diameter).
        </p>
        <div>
            <canvas id="chart_velocity"></canvas>
        </div>`

        summonChart(undefined, 'wilson')
        config_velocity.options.scales.x.type = 'linear'
        config_velocity.options.scales.x.max = 600
        config_velocity.options.scales.x.min = 100
        config_velocity.options.scales.x.title.text = 'Internal Diameter [mm]'
        config_velocity.options.scales.x.title.display = true
        config_velocity.options.scales.x.title.font = {
            size: 16,
            weight: 'bold',
        }
    
        chart_velocity.update()
    }

    resizeInputs()

    switch(input) {
        case 'durand':
            document.getElementById('calculate-button').innerHTML = `
            <button class="btn btn-primary" type="button" onclick="mainCompute('durand')">Calculate</button>
            `    
            changeGraphName('durand')
            break
        case 'cave':
            document.getElementById('calculate-button').innerHTML = `
            <button class="btn btn-primary" type="button" onclick="mainCompute('cave')">Calculate</button>
            `    
            changeGraphName('cave')
            break
        case 'wilson':
            document.getElementById('calculate-button').innerHTML = `
            <button class="btn btn-primary" type="button" onclick="wilsonCompute()">Calculate</button>
            `    
            break
    }

    restoreZoomInCurrent()
    chartClearCurrent()
    try {
        document.getElementById('durand-result').innerHTML = '-'
    } catch {}

    interpolatedFl = 'a' // to trigger isNaN later
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

function slurryVelocityCalc(Fl) {

    let S = parseFloat(document.getElementById('S').value)

    if (isNaN(S) || S <= 1) {
        return
    }

    let vArray = []

    for (let i = 0; i < dataJson.Tubing.length; i++) {
        let ID_mm = dataJson.Tubing[i]['ID_mm']
        let ID_m = ID_mm/1000
        let V = Fl * Math.sqrt(2*g*ID_m*(S-1))
        V = Math.round(V * 1e2) / 1e2
        
        vArray.push(V)
    }

    summonChart(vArray)
}

let config_velocity = {}
function createVelocityChart(arrayVelocity, labels) {
    // const labels = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29]
    

    const data = {
        labels: labels,
        datasets: [{
            label: 'Min. Flow Velocity for Slurry',
            data: arrayVelocity,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.25)',
            tension: 0.15,
            fill: true,
        }]
    }
    config_velocity = {
        type: 'line',
        data: data,
        options: {
            aspectRatio: 1.75,
            scales: {
                'y': {
                    display: true,
                    title: {
                        display: true,
                        text: 'm/s',
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
                            return tooltipItems.parsed.y + ' m/s'
                        }
                    }
                }
            }
        }
    }
    chart_velocity = new Chart(
        document.getElementById('chart_velocity'),
        config_velocity
    )
}

function summonChart(vArray, labels) {

    if (labels == undefined) {
        labels = [['DN 6', ' NPS 1/8'], ['DN 10', ' NPS 3/8'], ['DN 15',' NPS 1/2'], ['DN 20',' NPS 3/4'], ['DN 25',' NPS 1'], ['DN 32',' NPS 1 1/4'], 
        ['DN 40',' NPS 1 1/2'], ['DN 50',' NPS 2'], ['DN 65',' NPS 2 1/2'], ['DN 80',' NPS 3'], ['DN 90',' NPS 3 1/2'], ['DN 100',' NPS 4'], ['DN 125',' NPS 5'], ['DN 150',' NPS 6'], ['DN 200',' NPS 8'],
        ['DN 250',' NPS 10'], ['DN 300',' NPS 12'], ['DN 350',' NPS 14'], ['DN 400',' NPS 16'], 
        ['DN 450',' NPS 18'], ['DN 500',' NPS 20'], ['DN 550',' NPS 22'], ['DN 600',' NPS 24'], ['DN 650',' NPS 26'], ['DN 700',' NPS 28'], ['DN 750',' NPS 30'], ['DN 800',' NPS 32'], ['DN 850',' NPS 34'], ['DN 900',' NPS 36'], ['DN 1050',' NPS 42']]
    }

    if (labels == 'wilson') {
        labels = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 450, 500, 600]
    }

    let chartStatus = Chart.getChart("chart_velocity") 
    if (chartStatus != undefined) {  //Destroys existing chart if it exists to draw new one
        chartStatus.destroy()
    }
    createVelocityChart(vArray, labels)
}

summonChart()



function resizeInputs() {
    if (screen.width > 800  && prevWidth != screen.availWidth) {
        try {
            document.getElementById('vol-input-text').innerHTML = 'Volume Concentration (Cv)'
        } catch {}

        try {
            document.getElementById('solid-input-text').innerHTML = 'Solids Specific Gravity (SG<sub>s</sub>)'
        } catch {}

        prevWidth = screen.availWidth
    } else if (screen.width <= 800  && prevWidth != screen.availWidth){    
        try { 
            document.getElementById('vol-input-text').innerHTML = 'Vol. Concentration (Cv)'
        } catch {}
        try {
            document.getElementById('solid-input-text').innerHTML = 'Solids Spec. Grav. (SG<sub>s</sub>)'
        } catch {}

        prevWidth = screen.availWidth
        prevWidth = screen.availWidth
    }
}

resizeInputs()

window.addEventListener('resize', function(event){
    resizeInputs()
})