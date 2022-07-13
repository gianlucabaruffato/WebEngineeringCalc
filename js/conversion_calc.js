let calculationDone = false
let greenFields = []

function mainCompute() {

    // Removes green highlight from results if another calculation is made
    if (calculationDone) {
        for (let spanId of greenFields) {
            document.getElementById(spanId).classList.remove("animation-class")
        }
    }

    let sw = parseFloat(document.getElementById('Sw').value)
    let s = parseFloat(document.getElementById('S').value)
    let sm = parseFloat(document.getElementById('Sm').value)
    let cw = parseFloat(document.getElementById('Cw').value)/100
    let cv = parseFloat(document.getElementById('Cv').value)/100

    // First: Identify values left blank
    
    let swBlank = false
    let sBlank = false
    let smBlank = false
    let cwBlank = false
    let cvBlank = false

    let blankCount = 0

    if (isNaN(sw)) {swBlank = true; blankCount++}
    if (isNaN(s)) {sBlank = true; blankCount++}
    if (isNaN(sm)) {smBlank = true; blankCount++}
    if (isNaN(cw)) {cwBlank = true; blankCount++}
    if (isNaN(cv)) {cvBlank = true; blankCount++}

    if (blankCount > 2) {
        alert('Slurry Concentration Converter: Maximum amount of blank variables is 2, please check inputs for errors.')
        return
    }

    if (blankCount < 2) {
        alert('Slurry Concentration Converter: Please leave 2 variables blank at all times.')
        return
    }

    // Second: Calculate blank variables

    if (swBlank) {
        if (sBlank) {
            s = cw/cv*sm
        }

        if (cvBlank) {
            sw = s*(sm*cw-sm)/(sm*cw-s)
        } else if (cwBlank) {
            sw = (s*cv-sm)/(cv-1)
        } else {
            sw = s*(cv*(cw-1))/(cw*(cv-1))
        }

        replaceResults(sw, 'Sw', 'sw-text')
    }

    if (sBlank) {
        if (swBlank) {
            s = cw/cv*sm
        }

        if (smBlank) {
            s = sw*cw*(cv-1)/(cv*(cw-1))
        } else if (cwBlank) {
            s = sw+(sm-sw)/cv
        } else {
            s = sw*cw/(cw-1+sw/sm)
        }

        replaceResults(s, 'S', 's-text')
    }

    if (smBlank) {
        if (swBlank) {
            sm = s/(cw/cv)
        }

        if (cvBlank) {
            sm = sw/(1-cw*(1-sw/s))
        } else if (cwBlank) {
            sm = sw+cv*(s-sw)
        } else {
            sm = sw*(cv-1)/(cw-1)
        }

        replaceResults(sm, 'Sm', 'sm-text')
    }

    if (cwBlank) { // not returning %
        if (swBlank) {
            cw = s/sm*cv
        }

        if (cvBlank) {
            cw = s*(sm-sw)/(sm*(s-sw))
        } else if (smBlank) {
            cw = s*cv/(sw+cv*(s-sw))
        } else {
            cw = 1+sw*(cv-1)/sm
        }

        replaceResults(cw*100, 'Cw', 'cw-text')
    }

    if (cvBlank) { // not returning %
        if (swBlank) {
            cv = cw/(s/sm)
        }

        if (cwBlank) {
            cv = (sm-sw)/(s-sw)
        } else if (smBlank) {
            cv = sw/(sw-s+s/cw)
        } else {
            cv = 1+sm*(cw-1)/sw
        }

        replaceResults(cv*100, 'Cv', 'cv-text')
    }
}

function vtmCompute () {
    for (let spanId of greenFields) {
        document.getElementById(spanId).classList.remove("animation-class")
    }

    let s = parseFloat(document.getElementById('S').value)
    let sw = parseFloat(document.getElementById('Sw').value)
    let cw = parseFloat(document.getElementById('Cw').value)/100
    let cv = parseFloat(document.getElementById('Cv').value)/100
    let mfrs = parseFloat(document.getElementById('mfrs').value)
    let mfrl = parseFloat(document.getElementById('mfrl').value)
    let mfrm = parseFloat(document.getElementById('mfrm').value)
    let vfrl = parseFloat(document.getElementById('vfrl').value)
    let vfrm = parseFloat(document.getElementById('vfrm').value)

    let mfrsBlank = false
    let mfrlBlank = false
    let mfrmBlank = false
    let vfrlBlank = false
    let vfrmBlank = false

    let blankCount = 0

    if (isNaN(mfrs)) {mfrsBlank = true; blankCount++}
    if (isNaN(mfrl)) {mfrlBlank = true; blankCount++}
    if (isNaN(mfrm)) {mfrmBlank = true; blankCount++}
    if (isNaN(vfrl)) {vfrlBlank = true; blankCount++}
    if (isNaN(vfrm)) {vfrmBlank = true; blankCount++}

    let blankCountPrevSection = 0

    if (isNaN(sw)) {blankCountPrevSection++}
    if (isNaN(s)) {blankCountPrevSection++}
    if (isNaN(cw)) {blankCountPrevSection++}
    if (isNaN(cv)) {blankCountPrevSection++}

    if (blankCount != 4) {
        alert('Volume to Mass Flow Converter: Please input only one value and leave the rest blank.')
        return
    }

    if (blankCountPrevSection != 0) {
        alert('Volume to Mass Flow Converter: Please fill out all of the values in the Slurry Conversion section before using this section of the calculator.')
        return
    }

    if (mfrsBlank == false) {
        mfrl = (mfrs-cw*mfrs)/cw
        mfrm = mfrs + mfrl
        vfrl = mfrl/sw
        vfrm = (mfrs/s)+(mfrl/sw)

        replaceResults(mfrl, 'mfrl', 'mfrl-text')
        replaceResults(mfrm, 'mfrm', 'mfrm-text')
        replaceResults(vfrl, 'vfrl', 'vfrl-text')
        replaceResults(vfrm, 'vfrm', 'vfrm-text')
    } else if (mfrlBlank == false) {
        mfrs = (cw*mfrl)/(1-cw)
        mfrm = mfrs + mfrl
        vfrl = mfrl/sw
        vfrm = (mfrs/s)+(mfrl/sw)

        replaceResults(mfrs, 'mfrs', 'mfrs-text')
        replaceResults(mfrm, 'mfrm', 'mfrm-text')
        replaceResults(vfrl, 'vfrl', 'vfrl-text')
        replaceResults(vfrm, 'vfrm', 'vfrm-text')
    } else if (mfrmBlank == false) {
        mfrs = cw*mfrm
        mfrl = mfrm - mfrs
        vfrl = mfrl/sw
        vfrm = (mfrs/s)+(mfrl/sw)

        replaceResults(mfrs, 'mfrs', 'mfrs-text')
        replaceResults(mfrl, 'mfrl', 'mfrl-text')
        replaceResults(vfrl, 'vfrl', 'vfrl-text')
        replaceResults(vfrm, 'vfrm', 'vfrm-text')
    } else if (vfrlBlank == false) {
        mfrl = vfrl*sw
        mfrs = (cw*mfrl)/(1-cw)
        mfrm = mfrs + mfrl
        vfrm = (mfrs/s)+(mfrl/sw)

        replaceResults(mfrl, 'mfrl', 'mfrl-text')
        replaceResults(mfrm, 'mfrm', 'mfrm-text')
        replaceResults(mfrs, 'mfrs', 'mfrs-text')
        replaceResults(vfrm, 'vfrm', 'vfrm-text')
    } else if (vfrmBlank == false) {
        vfrl = cv*vfrm
        mfrl = vfrl*sw
        mfrs = (cw*mfrl)/(1-cw)
        mfrm = mfrs + mfrl

        replaceResults(mfrl, 'mfrl', 'mfrl-text')
        replaceResults(mfrm, 'mfrm', 'mfrm-text')
        replaceResults(mfrs, 'mfrs', 'mfrs-text')
        replaceResults(vfrl, 'vfrl', 'vfrl-text')
    }
}

function replaceResults(result, valueId, spanId) {

    if (isNaN(result)) {
        alert('Input values are not compatible, please check for errors.')
        return
    }
    
    document.getElementById(valueId).value = Math.round(result*1e3)/1e3
    document.getElementById(spanId).classList.add("animation-class")

    calculationDone = true
    greenFields.push(spanId)
    // setTimeout(() => {  document.getElementById(spanId).classList.remove("animation-class") }, 1000);
}

function clearResults(section) {
    for (let spanId of greenFields) {
        document.getElementById(spanId).classList.remove("animation-class")
    }

    switch (section) {
        case '1':
            document.getElementById('Sw').value = ''
            document.getElementById('S').value = ''
            document.getElementById('Sm').value = ''
            document.getElementById('Cw').value = ''
            document.getElementById('Cv').value = ''
            break
        case '2':
            document.getElementById('vfrl').value = ''
            document.getElementById('vfrm').value = ''
            document.getElementById('mfrs').value = ''
            document.getElementById('mfrl').value = ''
            document.getElementById('mfrm').value = ''
    }
}

let prevWidth = 0

function resizeInputs() {
    if (screen.width > 800  && prevWidth != screen.width) {
        $('#cv-text').html('Volume Concentration (Cv)')
        $('#cw-text').html('Weight Concentration (Cw)')
        $('#sm-text').html('SG of mixture (SG<sub>m</sub>)')
        $('#mfrs-text').html('Mass Flow Rate (Solids)')
        $('#mfrl-text').html('Mass Flow Rate (Liquid)')
        $('#mfrm-text').html('Mass Flow Rate (Mixture)')
        $('#vfrl-text').html('Volume Flow Rate (Liquid)')
        $('#vfrm-text').html('Volume Flow Rate (Mixture)')

        prevWidth = screen.width
    } else if (screen.width <= 800  && prevWidth != screen.width){
        $('#cv-text').html('Vol. Concent. (Cv)')
        $('#cw-text').html('Wgt. Concent. (Cw)')
        $('#sm-text').html('SG of mixt. (SG<sub>m</sub>)')
        $('#mfrs-text').html('Mass Flow (Solids)')
        $('#mfrl-text').html('Mass Flow (Liquid)')
        $('#mfrm-text').html('Mass Flow (Mixture)')
        $('#vfrl-text').html('Vol. Flow (Liquid)')
        $('#vfrm-text').html('Vol. Flow (Mixture)')

        prevWidth = screen.width
    }
}

resizeInputs()

window.addEventListener('resize', function(event){
    resizeInputs()
})
