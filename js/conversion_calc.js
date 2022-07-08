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
        alert('Maximum amount of blank variables is 2, please check inputs for errors.')
        return
    }

    if (blankCount < 2) {
        alert('Please leave 2 variables blank at all times.')
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

function replaceResults(result, valueId, spanId) {

    if (isNaN(result)) {
        alert('Input values are not compatible, please check for errors.')
        return
    }
    
    document.getElementById(valueId).value = (result).toFixed(3)
    document.getElementById(spanId).classList.add("animation-class")

    calculationDone = true
    greenFields.push(spanId)
    // setTimeout(() => {  document.getElementById(spanId).classList.remove("animation-class") }, 1000);
}