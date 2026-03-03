const canvas = document.getElementById('canvas');
canvas.style.width = '100%';
canvas.style.height = '100%';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');

const cellSize = 25;

let camera = {
    x: 0,
    y: 0
}

let cells = [
    [0,0,"CellA"],
];
let hormones = {
    "0;0": "RightHormone"
};


let cellTypes = {
    "CellA": {
        "color": "black",
        "reactions": {
            "RightHormone": [
                ["emit", "right", "RightHormone"],
                ["create", "right", "CellA"],
                ["die"]
            ],
            "LeftHormone": [
                ["emit", "left", "LeftHormone"],
                ["create", "left", "CellA"],
                ["die"]
            ]
        }
    }
}

let hormonecolors = {
    "RightHormone": "red",
    "LeftHormone": "blue"
}

function getCell(cell) {
    return cellTypes[cell]
}

function react(cell, hormone, tickcells, tickhormones) {
    let x = cell[0]
    let y = cell[1]
    let reaction = getCell(cell[2]).reactions[hormone]

    for(let i = 0; i < reaction.length; i++) {
        let reactaction = reaction[i]
        if (reactaction[0] == "create") {
            let nx = x, ny = y;
            if (reactaction[1] == "up") ny--;
            else if (reactaction[1] == "down") ny++;
            else if (reactaction[1] == "left") nx--;
            else if (reactaction[1] == "right") nx++;
            const isOccupied = tickcells.some(c => c[0] === nx && c[1] === ny);

            if (!isOccupied) {
                tickcells.push([nx, ny, reactaction[2]]);
            }
        } else if (reactaction[0] == "die") {
            let index = tickcells.findIndex(c => c[0] === x && c[1] === y && c[2] === cell[2]);
            if (index !== -1) {
                tickcells.splice(index, 1);
            }
        } else if (reactaction[0] == "broadcast") {
            tickhormones[String(x+1) + ";" + String(y)] = reactaction[1]
            tickhormones[String(x-1) + ";" + String(y)] = reactaction[1]
            tickhormones[String(x) + ";" + String(y+1)] = reactaction[1]
            tickhormones[String(x) + ";" + String(y-1)] = reactaction[1]
        } else if (reactaction[0] == "emit") {
            let nx = x, ny = y;
            if (reactaction[1] == "up") ny--;
            else if (reactaction[1] == "down") ny++;
            else if (reactaction[1] == "left") nx--;
            else if (reactaction[1] == "right") nx++;

            tickhormones[String(nx) + ";" + String(ny)] = reactaction[2]
        } else if (reactaction[0] == "become") {
            let index = tickcells.findIndex(c => c[0] === x && c[1] === y);
            if (index !== -1) {
                tickcells[index][2] = reactaction[1];
            }
        }
    }
}

function tick() {
    let newHormones = structuredClone(hormones);
    let newCells = structuredClone(cells);

    for(let i = 0; i < cells.length; i++) {
        let coordKey = cells[i][0] + ";" + cells[i][1];
        let hormone = hormones[coordKey];
        if (hormone) {
            delete newHormones[coordKey]
            let r = getCell(cells[i][2]).reactions;
            if (Object.hasOwn(r, hormone)) {
                react(cells[i], hormone, newCells, newHormones);
            }
        }
    }

    hormones = structuredClone(newHormones);
    cells = structuredClone(newCells);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < cells.length; i++) {
        ctx.fillStyle = cellTypes[cells[i][2]].color;
        ctx.fillRect(cells[i][0]*cellSize-camera.x,cells[i][1]*cellSize-camera.y,cellSize,cellSize);
    }
    for (let [coords, type] of Object.entries(hormones)) {
        let [hx, hy] = coords.split(";").map(Number);
        ctx.fillStyle = hormonecolors[type];
        ctx.fillRect(hx*cellSize-camera.x,hy*cellSize-camera.y,cellSize/2,cellSize/2);
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key == "w") {
        camera.y -= cellSize
    } else if (e.key == "s") {
        camera.y += cellSize
    } else if (e.key == "a") {
        camera.x -= cellSize
    } else if (e.key == "d") {
        camera.x += cellSize
    }

    if (e.key == " ") {
        tick()
    }
})

const loop = setInterval(function() {
    render()
}, 100)

function debugData() {
    console.log(JSON.stringify(cells,null,2))
    console.log(JSON.stringify(hormones,null,2))
}