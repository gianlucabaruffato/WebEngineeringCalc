const jsonURL = 'https://api.npoint.io/6cac097003cb2aab5265'
async function fetchJson(jsonURL) {
    let response = await fetch(jsonURL)
    dataJson = await response.json()

    return dataJson
}

async function displayJson(){
    let data = await fetchJson(jsonURL)

    graph1 = dataJson.graph1
    graph2 = dataJson.graph2
    graph3 = dataJson.graph3
    graph4 = dataJson.graph4

    console.log(data)
}

displayJson()

function linealInterp(X1, Y1, X2, Y2, X) {
    const Y3 = Y1 + (X-X1)*(Y2-Y1)/(X2-X1);
    return parseFloat(Y3);
}


const sIndex = ['1.1', '1.5', '2', '2.65', '3', '4', '5', '6']
const xIndexGraph1 = [10, 8, 6, 4, 2, 1, 0.8, 0.6, 0.4, 0.2, 0.1, 0.08, 0.06, 0.04, 0.02, 0.01]

function mainCompute() {

    //////////////////////////
    //////// GRAPH 1 /////////
    //////////////////////////

    // Read S and d50. Then interpolate between known values to get data for input S
    let S = parseFloat(document.getElementById('S').value)
    let d50 = parseFloat(document.getElementById('d50').value)

    let sNext
    let sPrev

    // Get Next and Previous S to the one inputted
    for (let i = 0; i < sIndex.length; i++) {
        if (sIndex[i] > S) {
            sNext = sIndex[i]
            if (i == 0) {
                sPrev = sIndex[i]
            } else {
                sPrev = sIndex[i-1]
            }
            break
        }
    }

    // Interpolate S values to the one inputted
    let sPrevValues = graph1[sPrev]
    let sNextValues = graph1[sNext]
    let sInterpolatedValues = []

    let sPrevSecondInterpolation
    let sNextSecondInterpolation

    // console.log(sPrev, sNext)

    // console.log(sPrevValues)
    // console.log(sNextValues)

    for (let i = 0; i < graph1['5'].length; i++) {
        let yPrevValue = parseFloat(sPrevValues[i]['y'])
        let yNextValue = parseFloat(sNextValues[i]['y'])
        let interpolatedValue = linealInterp(sPrev, yPrevValue, sNext, yNextValue , S)
        interpolatedValue = Math.round(interpolatedValue * 1e3) / 1e3

        sInterpolatedValues.push(interpolatedValue)
    }

    // Get graph1 result
    let graph1Result 
    
    for (let i = 0; i < xIndexGraph1.length; i++) {
        if (d50 > xIndexGraph1[i]) {
            d50Next = xIndexGraph1[i]
            d50Prev = xIndexGraph1[i-1]
            sNextSecondInterpolation = sInterpolatedValues[i]
            sPrevSecondInterpolation = sInterpolatedValues[i-1]

            graph1Result = linealInterp(d50Prev, sPrevSecondInterpolation, d50Next, sNextSecondInterpolation, d50)
            graph1Result = Math.round(graph1Result * 1e3) / 1e3
            break
        }
    }



    // console.log(sInterpolatedValues)
    // console.log(sNextSecondInterpolation, sPrevSecondInterpolation)
    console.log('FINAL = ', graph1Result)

    //////////////////////////
    //////// GRAPH 2 /////////
    //////////////////////////

    const cvIndexGraph2 = [5, 10, 15, 20, 30, 40, 50]

    let cv = parseFloat(document.getElementById('cv').value)

    if (cv > 50 || cv < 5 || isNaN(cv)) {
        alert('Cv values out of range (5% < Cv < 50%)')
        return
    }

    let cvNext = cvIndexGraph2.find(element => element > cv)
    let cvPrevIndex = cvIndexGraph2.indexOf(cvNext)-1
    let cvPrev

    if (cvPrevIndex < 0) {
        cvPrev = 5 // first cv in case input cv matches it
    } else {
        cvPrev = cvIndexGraph2[cvPrevIndex]
    }

    // Interpolate values of known cv to input cv

    let cvPrevValues = graph2[cvPrev][0]
    let cvNextValues = graph2[cvNext][0]

    // remember that all curves share (0, 1) point so only interpolate final point

    let interpX2 = linealInterp(cvPrev, cvPrevValues['x'], cvNext, cvNextValues['x'], cv)
    let interpY2 = linealInterp(cvPrev, cvPrevValues['y'], cvNext, cvNextValues['y'], cv)



    // from graph 1 result (y) get value of graph 2 result (x)
    
    graph1Result = 1 - graph1Result // vertical axis between both graphs are inverted

    if (graph1Result < interpY2) {
        alert('Values from graph 1 are out of limits for graph 2.')
        return
    }

    let graph2Result = linealInterp(1, 0, interpY2, interpX2, graph1Result)
    
    // console.log(interpX2, interpY2)
    console.log(graph2Result)

    //////////////////////////
    //////// GRAPH 3 /////////
    //////////////////////////

    const indexGraph3 = [0.0001, 0.0002, 0.0003, 0.0004, 0.0006, 0.0008, 0.001, 0.002, 0.004, 0.008, 0.016]

    let Di = parseFloat(document.getElementById('Di').value)
    let dD = d50/Di     // Particle to impeller ratio

    if (dD > 0.016 || dD < 0.0001 || isNaN(dD)) {
        alert('Particle to impeller ratio out of range (0.0001 < d50/Di < 0.016)')
        return
    }

    let dDNext = indexGraph3.find(element => element > dD)
    let dDPrevIndex = indexGraph3.indexOf(dDNext)-1
    let dDPrev

    if (dDPrevIndex < 0) {
        dDPrev = 0.0001 // first cv in case input cv matches it
    } else {
        dDPrev = indexGraph3[dDPrevIndex]
    }

    // console.log(dDNext, dDPrev, dD)

    // Interpolate values of known dD to input dD

    let dDPrevValues = graph3[dDPrev][0]
    let dDNextValues = graph3[dDNext][0]

    // remember that all curves share (0, 1) point so only interpolate final point

    let interpX3 = linealInterp(dDPrev, dDPrevValues['x'], dDNext, dDNextValues['x'], dD)
    let interpY3 = linealInterp(dDPrev, dDPrevValues['y'], dDNext, dDNextValues['y'], dD)

    // from graph 2 result (x) get value of graph 3 result (y)
    
    if (graph2Result > interpX3) {
        alert('Values from graph 2 are out of limits for graph 3.')
        return
    }

    let graph3Result = linealInterp(0, 1, interpX3, interpY3, graph2Result)
    
    // console.log(interpX3, interpY3)
    console.log(graph3Result)

    //////////////////////////
    //////// GRAPH 4 /////////
    //////////////////////////

    graph4Input = graph3Result/2 + 0.5 // Reference point of axis is different for each graph

    // interpolate cv curves in graph 4

    const cvIndexGraph4 = [20, 30, 40, 50]

    let cvNext4
    let cvPrevIndex4
    let cvPrev4

    if (cv >= 20) {
        cvNext4 = cvIndexGraph4.find(element => element > cv)
        cvPrevIndex4 = cvIndexGraph4.indexOf(cvNext)-1
    
        if (cvPrevIndex4 < 0) {
            cvPrev4 = 20 // first cv in case input cv matches it
        } else {
            cvPrev4 = cvIndexGraph2[cvPrevIndex]
        }
    } else {
        cvNext4 = 30
        cvPrev4 = 20
        cv = 20
    }



    // Interpolate values of known cv to input cv

    let cvPrevValues4 = graph4[cvPrev4][0]
    let cvNextValues4 = graph4[cvNext4][0]

    // remember that all curves share (0, 1) point so only interpolate final point

    let interpX4 = linealInterp(cvPrev4, cvPrevValues4['x'], cvNext4, cvNextValues4['x'], cv)
    let interpY4 = linealInterp(cvPrev4, cvPrevValues4['y'], cvNext4, cvNextValues4['y'], cv)

    let graph4ResultY = graph4Input
    let graph4ResultX = linealInterp(1, 1, interpY4, interpX4, graph4Input) 

    graph4ResultX = graph4ResultX.toFixed(2)
    graph4ResultY = graph4ResultY.toFixed(2)

    console.log(interpX4, interpY4)
    console.log('HR',graph4ResultY,'ER', graph4ResultX)

    document.getElementById('er-result').innerHTML = graph4ResultX
    document.getElementById('hr-result').innerHTML = graph4ResultY

    chartsAddCurrents(d50, graph1Result, graph2Result, graph3Result, graph4ResultY, graph4ResultX)
}


const chartAreaBorder = {
    id: 'chartAreaBorder',
    beforeDraw(chart, args, options) {
      const {ctx, chartArea: {left, top, width, height}} = chart;
      ctx.save();
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth;
      ctx.setLineDash(options.borderDash || []);
      ctx.lineDashOffset = options.borderDashOffset;
      ctx.strokeRect(left, top, width, height);
      ctx.restore();
    }
};



const colorArray3 = ['#006292', '#126b9a', '#1f75a2', '#2b7eaa', '#3787b2', '#4291b9', '#4f9ac0', '#5ca4c5', '#6badca', '#7bb6cd', '#8fbfcc', '#c3c3a5']



const data1 = {
    labels: [0.01, 0.02, 0.04, 0.06, 0.08, 0.1, 0.2, 0.4, 0.6, 0.8, 1, 2, 4, 6, 8, 10],
 
    datasets: [{
        label: '6',
        data: [0,0.07731958762886598,0.24570446735395188,0.33505154639175255,0.3951890034364261,0.436426116838488,0.5601374570446735,0.6529209621993127,0.6993127147766323,0.7285223367697594,0.7474226804123711,0.8041237113402062,0.8487972508591065,0.8711340206185567,0.8848797250859106,0.8934707903780068],
        borderColor: '#6acbd7',
        backgroundColor: '#6acbd7',
        tension: 0.4,
    },{
        label: '5',
        data: [0,0.04639175257731959,0.16494845360824742,0.24570446735395188,0.29896907216494845,0.3316151202749141,0.4467353951890034,0.5326460481099656,0.570446735395189,0.6030927835051546,0.6168384879725086,0.6666666666666666,0.7130584192439863,0.7336769759450171,0.7457044673539519,0.7525773195876289],
        borderColor: '#5bb7cf',
        backgroundColor: '#5bb7cf',
        tension: 0.4,
    },{
        label: '4',
        data: [0,0.022336769759450172,0.10824742268041238,0.17353951890034364,0.2268041237113402,0.25601374570446733,0.3539518900343643,0.4261168384879725,0.4587628865979381,0.4793814432989691,0.4948453608247423,0.5360824742268041,0.5652920962199313,0.584192439862543,0.5962199312714777,0.6030927835051546],
        borderColor: '#4ca3c6',
        backgroundColor: '#4ca3c6',
        tension: 0.4,
    },{
        label: '3',
        data: [0,0.00859106529209622,0.06013745704467354,0.1013745704467354,0.140893470790378,0.16323024054982818,0.23539518900343642,0.29381443298969073,0.3178694158075601,0.33505154639175255,0.3487972508591065,0.3797250859106529,0.4106529209621993,0.42439862542955326,0.4329896907216495,0.4415807560137457],
        borderColor: '#3c90be',
        backgroundColor: '#3c90be',
        tension: 0.4,
    },{
        label: '2.65',
        data: [0,0.00859106529209622,0.041237113402061855,0.07216494845360824,0.1013745704467354,0.12027491408934708,0.1838487972508591,0.22852233676975944,0.24742268041237114,0.2646048109965636,0.2766323024054983,0.3024054982817869,0.3316151202749141,0.3436426116838488,0.352233676975945, 0.359106529209622],
        borderColor: '#2d7cb6',
        backgroundColor: '#2d7cb6',
        tension: 0.4,
    },{
        label: '2',
        data: [0,0.005154639175257732,0.013745704467353952,0.02577319587628866,0.041237113402061855,0.04810996563573883,0.09621993127147765,0.13573883161512026,0.1529209621993127,0.16666666666666666,0.17869415807560138,0.20103092783505155,0.22164948453608246,0.23024054982817868,0.23711340206185566,0.23711340206185566],
        borderColor: '#1e69ae',
        backgroundColor: '#1e69ae',
        tension: 0.4,
    },{
        label: '1.5',
        data: [0,0.003436426116838488,0.006872852233676976,0.013745704467353952,0.018900343642611683,0.02577319587628866,0.04639175257731959,0.07216494845360824,0.0859106529209622,0.09450171821305842,0.1013745704467354,0.11683848797250859,0.12886597938144329,0.13573883161512026,0.13573883161512026,0.13917525773195877],
        borderColor: '#0f56a5',
        backgroundColor: '#0f56a5',
        tension: 0.4,
    },{
        label: '1.1',
        data: [0,0.003436426116838488,0.005154639175257732,0.006872852233676976,0.012027491408934707,0.012027491408934707,0.018900343642611683,0.030927835051546393,0.037800687285223365,0.0429553264604811,0.0429553264604811,0.05326460481099656,0.061855670103092786,0.061855670103092786,0.06357388316151202,0.06701030927835051],
        borderColor: '#00429d',
        backgroundColor: '#00429d',
        tension: 0.4,
    }]
}

const data2 = {

    labels: [1, 0],

    datasets: [{
        label: '5%',
        borderColor: colorArray3[0],
        backgroundColor: colorArray3[0],
        data: [
            {
                "x": 0.209819225,
                "y": 0
            },
            {
                "x": 0,
                "y": 1
            }
        ]
    },{
        label: '10%',
        borderColor: colorArray3[1],
        backgroundColor: colorArray3[1],
        data: [
            {
                "x": 0.450888121,
                "y": 0
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '15%',
        borderColor: colorArray3[2],
        backgroundColor: colorArray3[2],
        data: [
            {
                "x": 0.712035588,
                "y": 0
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '20%',
        borderColor: colorArray3[3],
        backgroundColor: colorArray3[3],
        data: [
            {
                "x": 1,
                "y": 0
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '30%',
        borderColor: colorArray3[4],
        backgroundColor: colorArray3[4],
        data: [
            {
                "x": 1,
                "y": 0.256473146
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '40%',
        borderColor: colorArray3[5],
        backgroundColor: colorArray3[5],
        data: [
            {
                "x": 1,
                "y": 0.421166794
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '50%',
        borderColor: colorArray3[6],
        backgroundColor: colorArray3[6],
        data: [
            {
                "x": 1,
                "y": 0.571753448
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    }]

}

const data3 = {

    labels: [1, 0],
    datasets: [{
        label: '0.016',
        borderColor: colorArray3[0],
        backgroundColor: colorArray3[0],
        data: [
            {
                "x": 0.319903583,
                "y": 0
            },
            {
                "x": 0,
                "y": 1
            }
        ]
    },{
        label: '0.008',
        borderColor: colorArray3[1],
        backgroundColor: colorArray3[1],
        data: [
            {
                "x": 0.391491574,
                "y": 0
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '0.004',
        borderColor: colorArray3[2],
        backgroundColor: colorArray3[2],
        data: [
            {
                "x": 0.46084244,
                "y": 0
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '0.002',
        borderColor: colorArray3[3],
        backgroundColor: colorArray3[3],
        data: [
            {
                "x": 0.588358549,
                "y": 0
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '0.001',
        borderColor: colorArray3[4],
        backgroundColor: colorArray3[4],
        data: [
            {
                "x": 0.82101952,
                "y": 0
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '0.0008',
        borderColor: colorArray3[5],
        backgroundColor: colorArray3[5],
        data: [
            {
                "x": 0.928412009,
                "y": 0
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '0.0006',
        borderColor: colorArray3[6],
        backgroundColor: colorArray3[6],
        data: [
            {
                "x": 1,
                "y": 0.122065087
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '0.0004',
        borderColor: colorArray3[7],
        backgroundColor: colorArray3[7],
        data: [
            {
                "x": 1,
                "y": 0.274635942
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '0.0003',
        borderColor: colorArray3[8],
        backgroundColor: colorArray3[8],
        data: [
            {
                "x": 1,
                "y": 0.403753748
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '0.0002',
        borderColor: colorArray3[9],
        backgroundColor: colorArray3[9],
        data: [
            {
                "x": 1,
                "y": 0.577461756
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    },{
        label: '0.0001',
        borderColor: colorArray3[10],
        backgroundColor: colorArray3[10],
        data: [
            {
                "x": 1,
                "y": 0.765248946
            },
            {
                "x": 0,
                "y": 1
            }
        ] 
    }]

}

const data4 = {

    labels: [1, 0],

    datasets: [{
        label: 'Cv 5%',
        borderColor: '#14856b',
        backgroundColor: '#14856b',
        data: [
            {
                "x": 0.5,
                "y": 0.501166468
            },
            {
                "x": 1,
                "y": 1
            }
        ]
    },{
        label: 'Cv 10%',
        borderColor: '#269a70',
        backgroundColor: '#269a70',
        data: [
            {
                "x": 0.5,
                "y": 0.583328201
            },
            {
                "x": 1,
                "y": 1
            }
        ] 
    },{
        label: 'Cv 15%',
        borderColor: '#3cae76',
        backgroundColor: '#3cae76',
        data: [
            {
                "x": 0.5,
                "y": 0.620887023
            },
            {
                "x": 1,
                "y": 1
            }
        ] 
    },{
        label: '> Cv 20%',
        borderColor: '#5bc17f',
        backgroundColor: '#5bc17f',
        data: [
            {
                "x": 0.5,
                "y": 0.652577279
            },
            {
                "x": 1,
                "y": 1
            }
        ] 
    }]

}

const config1 = {
    type: 'line',
    data: data1,
    options: {

        responsive: true,
        maintainAspectRatio: false,
        elements: {
            point:{
                radius: 2
            }
        },        
        scales: {
            'y': {
                display: true,
                position: 'right',
                reverse: true,
                max: 1,
                min: 0,
                title: {
                    display: false,
                },
                ticks: {
                    display: true,
                    precision: 3,
                    color: 'rgba(107, 107, 107, 0)',
                }
            },
            'x': {
                display: true,
                type: 'logarithmic',
                max: 10,
                min: 0.01,
                position: 'top',
                title: {
                    display: true,
                    text: 'd50 [mm] (X Axis) | SGs (Curves)',
                    font: {
                        size: 16,
                        weight: 'bold',
                    }
                },
                ticks: {
                    display: true,
                    maxRotation: 0,
                    minRotation: 0

                }

            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 10,
                }
            },
            tooltip: {
                enabled: false
            },
            chartAreaBorder: {
                borderColor: '#4F4F4F',
                borderWidth: 2,
            }
        }
    },
    plugins: [chartAreaBorder],
}

const config2 = {
    type: 'line',
    data: data2,
    options: {
        showLine: true,
        aspectRatio: 1.5,
        responsive: true,
        maintainAspectRatio: false,
        endPoint: 200,
        scales: {
            'y': {
                display: true,
                reverse: false,
                max: 1,
                min: 0,
                title: {
                    display: false,
                    text: 'Fₗ',
                    font: {
                        size: 16,
                        weight: 'bold',
                    }
                },
                ticks: {
                    display: false
                }
            },
            'x': {
                display: true,
                reverse: true,
                position: 'top',
                type: 'linear',
                title: {
                    display: true,
                    text: 'Solids concentration by volume (Cv)',
                    font: {
                        size: 16,
                        weight: 'bold',
                    }
                },
                ticks: {
                    display: true,
                    color: 'rgba(107, 107, 107, 0)'
                }

            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 10,
                }
            },
            tooltip: {
                enabled: false
            },
            chartAreaBorder: {
                borderColor: '#4F4F4F',
                borderWidth: 2,
            }
        }
    },
    plugins: [chartAreaBorder],
}


const config3 = {
    type: 'scatter',
    data: data3,
    options: {
        showLine: true,
        aspectRatio: 1.5,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            'y': {
                display: true,
                reverse: true,
                max: 1,
                min: 0,
                title: {
                    display: false,
                    text: 'Fₗ',
                    font: {
                        size: 16,
                        weight: 'bold',
                    }
                },
                ticks: {
                    display: false
                }
            },
            'x': {
                display: true,
                reverse: true,
                type: 'linear',
                title: {
                    display: true,
                    text: 'd50/Di',
                    font: {
                        size: 16,
                        weight: 'bold',
                    }
                },
                ticks: {
                    display: true,
                    color: 'rgba(107, 107, 107, 0)'
                }

            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                }
            },
            tooltip: {
                enabled: false
            },
            chartAreaBorder: {
                borderColor: '#4F4F4F',
                borderWidth: 2,
            }
        }
    },
    plugins: [chartAreaBorder],
}


const config4 = {
    type: 'scatter',
    data: data4,
    options: {
        showLine: true,
        aspectRatio: 1.5,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            'y': {
                display: true,
                reverse: true,
                position: 'right',
                max: 1,
                min: 0.5,
                title: {
                    display: true,
                    text: 'Head Ratio HR',
                    font: {
                        size: 16,
                        weight: 'bold',
                    }
                },
                ticks: {
                    display: true,
                    precision: 4,
                }
            },
            'x': {
                display: true,
                reverse: false,
                max: 1,
                min: 0.5,
                type: 'linear',
                title: {
                    display: true,
                    text: 'Efficiency Ratio ER',
                    font: {
                        size: 16,
                        weight: 'bold',
                    }
                },
                ticks: {
                    display: true
                }

            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                }
            },
            tooltip: {
                enabled: false
            },
            chartAreaBorder: {
                borderColor: '#4F4F4F',
                borderWidth: 2,
            }
        }
    },
    plugins: [chartAreaBorder],
}


function chartsAddCurrents(d50, graph1Result, graph2Result, graph3Result,
    graph4ResultY, graph4ResultX) {
    let dict2 = {
        annotations: {
            lineCurrentX: {
                type: 'line',
                xMax: d50,
                yMax: 1-graph1Result,
                xMin: d50,
                yMin: 0,
                borderDash: [10,5],
                borderColor: 'rgb(71, 71, 71)',

            },
            lineCurrentY: {
                type: 'line',
                xMax: d50,
                yMax: 1-graph1Result,
                xMin: 0,
                yMin: 1-graph1Result,
                borderDash: [10,5],
                borderColor: 'rgb(71, 71, 71)',
            },
            pointCurrent: {
                type: 'point',
                xValue: d50,
                yValue: 1-graph1Result,
                backgroundColor: 'rgba(255, 99, 132)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 2,

                radius: 5
            }

        }
    }

    let dict1 = {
        annotations: {
            lineCurrentX: {
                type: 'line',
                xMax: graph2Result,
                yMax: graph1Result,
                xMin: graph2Result,
                yMin: 0,
                borderDash: [10,5],
                borderColor: 'rgb(71, 71, 71)',

            },
            lineCurrentY: {
                type: 'line',
                xMax: graph2Result,
                yMax: graph1Result,
                xMin: 0,
                yMin: graph1Result,
                borderDash: [10,5],
                borderColor: 'rgb(71, 71, 71)',
            },
            pointCurrent: {
                type: 'point',
                xValue: graph2Result,
                yValue: graph1Result,
                backgroundColor: 'rgba(255, 99, 132)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 2,

                radius: 5
            }

        }
    }

    let dict3 = {
        annotations: {
            lineCurrentX: {
                type: 'line',
                xMax: graph2Result,
                yMax: graph3Result,
                xMin: graph2Result,
                yMin: 0,
                borderDash: [10,5],
                borderColor: 'rgb(71, 71, 71)',

            },
            lineCurrentY: {
                type: 'line',
                xMax: graph2Result,
                yMax: graph3Result,
                xMin: 0,
                yMin: graph3Result,
                borderDash: [10,5],
                borderColor: 'rgb(71, 71, 71)',
            },
            pointCurrent: {
                type: 'point',
                xValue: graph2Result,
                yValue: graph3Result,
                backgroundColor: 'rgba(255, 99, 132)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 2,

                radius: 5
            }

        }
    }

    let dict4 = {
        annotations: {
            lineCurrentX: {
                type: 'line',
                xMax: 1,
                yMax: graph4ResultY,
                xMin: 0,
                yMin: graph4ResultY,
                borderDash: [10,5],
                borderColor: 'rgb(71, 71, 71)',

            },
            lineCurrentY: {
                type: 'line',
                xMax: graph4ResultX,
                yMax: graph4ResultY,
                xMin: graph4ResultX,
                yMin: 1,
                borderDash: [10,5],
                borderColor: 'rgb(71, 71, 71)',
            },
            pointCurrent: {
                type: 'point',
                xValue: graph4ResultX,
                yValue: graph4ResultY,
                backgroundColor: 'rgba(255, 99, 132)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 2,

                radius: 5
            },
            resultsLabel: {
                type: 'label',
                xValue: 0.90,
                yValue: 0.6,
                backgroundColor: 'rgba(211, 211, 211, 0.55)',
                borderWidth: 2,
                borderColor: '#A2A2A2',
                content: ['Results:',`HR: ${graph4ResultY}`,`ER: ${graph4ResultX}`],
                font: {
                  size: 18
                }
              }

        }
    }

    

    chart2.config.options.plugins.annotation = dict2
    chart2.update()

    chart.config.options.plugins.annotation = dict1
    chart.update()

    chart3.config.options.plugins.annotation = dict3
    chart3.update()

    chart4.config.options.plugins.annotation = dict4
    chart4.update()

}


function createCharts() {

    if (screen.width > 600) {

        document.getElementById('chart_section').innerHTML = `
        <div class="d-flex flex-row pump_chart justify-content-center" style="margin: auto;">
            <canvas id="chart" class="row"></canvas>
            <canvas id="chart2" class="row"></canvas>
        </div>
        <div class="d-flex flex-row pump_chart justify-content-center" style="margin: auto; margin-top: -13px;">
            <canvas id="chart3" class="row"></canvas>
            <canvas id="chart4" class="row"></canvas>
        </div>`

        chart = new Chart(
            document.getElementById('chart'),
            config2
        )
        
        chart2 = new Chart(
            document.getElementById('chart2'),
            config1
        )
        
        chart3 = new Chart(
            document.getElementById('chart3'),
            config3
        )
        
        chart4 = new Chart(
            document.getElementById('chart4'),
            config4
        )
    } else {
        document.getElementById('chart_section').innerHTML = `Please rotate your phone to display graphs (screen width too small).`
    }

}

function resizeInputs() {
    if (screen.width > 800) {
        document.getElementById('inputs').innerHTML = `
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text">Particle Size (d50)</span>
            <input type="number" step="0.01" max="2000" min="10" id="d50" class="form-control" value="0.5">
            <span class="input-group-text">mm</span>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text">Volume Concentration (Cv)</span>
            <input type="number" step="0.01" max="15" min="2" id="cv" class="form-control" value="30">
            <span class="input-group-text ">%</span>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text">Solids Specific Gravity (SG<sub>s)</span>
            <input type="number" step="0.01" max="15" min="2" id="S" class="form-control" value="2.65">
            <span class="input-group-text ">%</span>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text">Internal Diameter (Di)</span>
            <input type="number" step="0.01" max="15" min="2" id="Di" class="form-control" value="400">
            <span class="input-group-text ">%</span>
        </div>
        <div class="d-flex justify-content-between">
            <div class="input-group mb-3" id="calculate-button">
            <button class="btn btn-primary" type="button" onclick="mainCompute()">Calculate</button>
        </div>
        </div>`
    } else {
        document.getElementById('inputs').innerHTML = `
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text">Particle Size (d50)</span>
            <input type="number" step="0.01" max="2000" min="10" id="d50" class="form-control" value="0.5">
            <span class="input-group-text">mm</span>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text">Vol. Concentration (Cv)</span>
            <input type="number" step="0.01" max="15" min="2" id="cv" class="form-control" value="30">
            <span class="input-group-text ">%</span>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text">Solids Spec. Grav. (SG<sub>s)</span>
            <input type="number" step="0.01" max="15" min="2" id="S" class="form-control" value="2.65">
            <span class="input-group-text ">%</span>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text durand-input-text">Internal Diameter (Di)</span>
            <input type="number" step="0.01" max="15" min="2" id="Di" class="form-control" value="400">
            <span class="input-group-text ">%</span>
        </div>
        <div class="d-flex justify-content-between">
            <div class="input-group mb-3" id="calculate-button">
            <button class="btn btn-primary" type="button" onclick="mainCompute()">Calculate</button>
        </div>
        </div>`
    }
}

createCharts()
resizeInputs()

window.addEventListener('resize', function(event){
    createCharts()
    resizeInputs()
  });

