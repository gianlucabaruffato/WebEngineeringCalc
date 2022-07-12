let common

(async () => {
    common = await import('./common.js');
})()



const g = 32.17 // ft/s2

function mainCompute() {
    let d50 = parseFloat(document.getElementById('d50').value)
    let di = parseFloat(document.getElementById('Di').value)
    let s = parseFloat(document.getElementById('S').value)
    let cv = parseFloat(document.getElementById('cv').value)
    let v = parseFloat(document.getElementById('V').value)
    let vs = parseFloat(document.getElementById('Vs').value)
    let i = parseFloat(document.getElementById('i').value)

    if (isNaN(d50) || isNaN(di) || isNaN(s) || isNaN(cv) || isNaN(v) || isNaN(vs) || isNaN(i)) {
        alert('Please check inputs for errors.')
        return
    }

    // transform units to be able to use values in eq. (to ft and ft/s)

    let d50UnitsValue = document.getElementById('d50-units').value
    switch (d50UnitsValue) { 
        case '0': // input um
            d50 = d50/304800
            break
        case '1': // input mm
            d50 = d50/304.8
            break
        case '2': // input m
            d50 = d50*3.281
            break
    }

    let diUnitsValue = document.getElementById('di-units').value
    switch (diUnitsValue) { 
        case '0': // input um
            di = di/304800
            break
        case '1': // input mm
            di = di/304.8
            break
        case '2': // input m
            di = di*3.281
            break
    }

    cv = cv/100
    v = v*3.281
    vs = vs*3.281

    let parameter = 67*((g*di*(s-1))**0.5/v)**3*(vs/(g*(s-1)*d50)**0.5)**1.5
    let slurryPres = i*(1+parameter*cv)
    let vo = 3.22*(g*(s-1))**0.25*cv**0.33*(di*vs)**0.5*d50**(-0.25) // ft/s
    vo = vo/3.281

    replaceResults(parameter, slurryPres, vo)
}

function replaceResults(parameter, slurryPres, vo) {
    document.getElementById('pres-parameter').innerHTML = parameter.toFixed(3)
    document.getElementById('slurry-pres').innerHTML = slurryPres.toFixed(3)
    document.getElementById('vo').innerHTML = vo.toFixed(3)
}
