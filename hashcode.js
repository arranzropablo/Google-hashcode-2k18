let fs = require("fs");
let path = require("path");

fs.readFile(path.resolve(__dirname, 'd_metropolis.in'), 'UTF-8', function (err, data) {
    main(data);
});

let rows;
let cols;
let nVehicles;
let vehicles = []
let bonus;
let rides;
let steps;
let index;
let ride = {
    startRow: 0,
    startCol: 0,
    finishRow: 0,
    finishCol: 0,
    startEarliest: 0,
    finishLatest: 0
};
function main(data) {
    index = readFirstLine(data);
    for (let i = 1; i <= nVehicles; i++) {
        vehicles.push({ id: i, gas: steps, pos: { row: 0, column: 0 }, rides: [] })
    }
    for (let i = 0; i < rides; i++) {
        let distanciaMinima = Number.MAX_SAFE_INTEGER;
        let mejorCocheIdx = -1;
        index = getRide(data, index);
        let distFromBeginningToGoal = encontrarCamino({ row: ride.startRow, column: ride.startCol }, { row: ride.finishRow, column: ride.finishCol })

        for (let j = 0; j < vehicles.length; j++) {
            if (!vehicles.some(vehicle => {
                    let boolpos = vehicle.pos.row === vehicles[j].pos.row && vehicle.pos.column === vehicles[j].pos.column
                    let boolid = vehicle.id < vehicles[j].id
                    let boolgas = vehicle.gas >= vehicles[j].gas
                    return boolpos && boolid && boolgas
                })) {
                let dist = 0;
                if (vehicles[j].pos !== { row: ride.finishRow, column: ride.finishCol }) {
                    dist = encontrarCamino(vehicles[j].pos, { row: ride.startRow, column: ride.startCol })
                }
                if (dist + distFromBeginningToGoal <= vehicles[j].gas) {
                    if (dist === ride.startEarliest) {
                        //si la distancia es earliest start nos renta porqe da bonus
                        distanciaMinima = dist;
                        mejorCocheIdx = j;
                        j = vehicles.length;
                    } else if (dist < distanciaMinima) {
                        distanciaMinima = dist;
                        mejorCocheIdx = j
                    }
                }
            }
        }
        if (mejorCocheIdx !== -1) {
            //tenemos el mejor coche y la distancia
            let distanciaTotal = distFromBeginningToGoal + distanciaMinima
            vehicles[mejorCocheIdx].gas -= distanciaTotal;
            //devolver -1 si se ha quedado sin gasolina
            //en el A* hay qe tener en cuenta qe la posicion (SOLO EN EL CASO INICIAL) misma sirve
            vehicles[mejorCocheIdx].pos = { row: ride.finishRow, column: ride.finishCol };
            //sumar bonus y meter en el objeto de output
            vehicles[mejorCocheIdx].rides.push(i);
            let punt = 0;
            if (distanciaMinima < ride.startEarliest) {
                punt += bonus;
            }
            if (distanciaTotal < ride.finishLatest) {
                punt += distFromBeginningToGoal;
            }
            console.log(vehicles[mejorCocheIdx].rides);
            console.log(punt);
        }
    }
    let stringFinal = "";
    for (let i = 0; i < vehicles.length; i++) {
        stringFinal += vehicles[i].rides.length;
        for (let j = 0; j < vehicles[i].rides.length; j++) {
            stringFinal += " " + vehicles[i].rides[j];
        }
        stringFinal += '\n';
    }
    fs.writeFileSync(path.resolve(__dirname, 'd_metropolis.out'), stringFinal);
}

function readFirstLine(data) {
    let i = 0;
    let actData = 0;
    let actual = "";
    while (data[i] !== "\n") {
        if (!isNaN(data[i]) && data[i] !== " ") {
            if (actual !== "")
                actual += data[i];
            else
                actual = data[i];
        }
        else {
            parseInitialData(actual, actData);
            actual = "";
            actData++;
        }
        i++;
    }
    parseInitialData(actual, actData);
    return i + 1;
}

function parseInitialData(data, actData) {
    switch (actData) {
        case 0: rows = Number(data); break;
        case 1: cols = Number(data); break;
        case 2: nVehicles = Number(data); break;
        case 3: rides = Number(data); break;
        case 4: bonus = Number(data); break;
        case 5: steps = Number(data); break;
    }
};

function getRide(data, index) {
    let i = index;
    let actData = 0;
    let actual = "";
    while (data[i] !== "\n") {
        if (!isNaN(data[i]) && data[i] !== " ") {
            if (actual !== "")
                actual += data[i];
            else
                actual = data[i];
        }
        else {
            parseRide(actual, actData);
            actual = "";
            actData++;
        }
        i++;
    }
    parseRide(actual, actData);
    return i + 1;
};

function parseRide(data, actData) {
    switch (actData) {
        case 0: ride.startRow = Number(data); break;
        case 1: ride.startCol = Number(data); break;
        case 2: ride.finishRow = Number(data); break;
        case 3: ride.finishCol = Number(data); break;
        case 4: ride.startEarliest = Number(data); break;
        case 5: ride.finishLatest = Number(data); break;
    }
};


function encontrarCamino(casillaInicial, casillaFinal) {
    return Math.abs(casillaInicial.row - casillaFinal.row) + Math.abs(casillaInicial.column - casillaFinal.column)
}