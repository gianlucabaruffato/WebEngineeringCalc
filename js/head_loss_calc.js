(async () => {
    common = await import('./common.js');
})()

let hl

function mainCompute() {
    let di = parseFloat($('#Di').val())
    let l = parseFloat($('#l').val())
    let q = parseFloat($('#q').val())
    let ro = parseFloat($('#ro').val())
    let mu = parseFloat($('#mu').val())
    let e = parseFloat($('#e').val())

    const inputList = [di, l, q, ro, mu, e]

    for (let i = 0; i < inputList.length; i++) {
        if (isNaN(inputList[i])) {
            alert('Please check inputs for errors.')
            return
        }
    }

    let di_mm

    let diUnitsValue = document.getElementById('di-units').value
    switch (diUnitsValue) { 
        case '0': // input in
            di_mm = di*25.4
            di = di/39.37
            break
        case '1': // input mm
            di_mm = di
            di = di/1000
            break
        case '2': // input m
            di_mm = di*1000
            break
    }

    let qUnitsValue = document.getElementById('q-units').value
    switch (qUnitsValue) { 
        case '0': // input m3/S
            break
        case '1': // input m3/h
            q = q/3600
            break
        case '2': // input l/h
            q = q*2.77e-7
            break
    }

    let v = q/(3.1416*di**2/4)

    console.log(v)

    let re = ro*v*di/mu
    let rr = e/di_mm

    let f = common.fFactor(re, rr)

    hl = f*l/di*ro*v*v/2

    re = Math.round(re)
    f = Math.round(f * 1e5) / 1e5
    hl = Math.round(hl * 1e3) / 1e3

    $('#re').html(re)
    $('#f').html(f)
    $('#pl').html(hl)
    $('#result-units').val(0)
}

function changeResultsUnits() {
    let value = $('#result-units').val()
    console.log(value)

    switch (value) {
        case '0': 
            hl2 = hl
            break
        case '1': //kpa
            hl2 = hl/1000
            break
        case '2': //mbar
            hl2 = hl/100
            break
        case '3': //bar
            hl2 = hl*1e-5
            break
        case '4': //psi
            hl2 = hl/6895
            break
    }

    $('#pl').html(Math.round(hl2 * 1e3) / 1e3)
}

let isArrowRotated = false
let prevWidth = 0

function resizeInputs() {
    if (screen.width > 800  && prevWidth != screen.width) {
        $('#di-text').html('Internal Diameter (Di)')
        $('#mu-text').html('Dynamic Viscosity (μ)')
        prevWidth = screen.width
    } else if (screen.width <= 800  && prevWidth != screen.width){
        $('#di-text').html('Int. Diameter (Di)')
        $('#mu-text').html('Dyn. Viscosity (μ)')
        prevWidth = screen.width
    }
}

resizeInputs()

window.addEventListener('resize', function(event){
    resizeInputs()
})