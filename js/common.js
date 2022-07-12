export function fFactor(re, rr) { //Reynolds and relative roughness
    const criticalRe = 2300
    let f

    if (re <= 2300) {
        // laminar flow
        f = 64/re
    } else {
        // turbulent flow
        let denom = 1.8*Math.log10(6.9/re+(rr/3.7)**1.11)
        let fGuess = 1/denom**2
        let g
        let gg

        for (let i = 0; i < 2; i++) {
            g = 1/fGuess**0.5 + 2*Math.log10(rr/3.7 + 2.51/(re*fGuess**0.5))
            gg = -0.5*(fGuess**(-1.5)) * (1 + 2*2.51/(Math.log(10)*re) / (rr/3.7+2.51/(re*fGuess**0.5)))
            fGuess = fGuess - g/gg
        }

        f = fGuess
    }

    return f
}