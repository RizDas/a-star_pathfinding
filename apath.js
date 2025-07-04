let rows = 20,
  cols = 20;
let grid = document.getElementById("grid");
let cells = [];
let startCell = null,
  endCell = null;
let mode = "start";
let allowDiagonal = false;

function generateGrid() {
  rows = parseInt(document.getElementById("rowsInput").value);
  cols = parseInt(document.getElementById("colsInput").value);
  allowDiagonal = document.getElementById("diagonalToggle").checked;

  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 30px)`;

  cells = [];
  startCell = null;
  endCell = null;
  mode = "start";

  for (let i = 0; i < rows * cols; i++) {
    const div = document.createElement("div");
    div.className = "cell";
    div.dataset.index = i;
    div.addEventListener("click", () => handleCellClick(div));
    grid.appendChild(div);
    cells.push(div);
  }
}

function handleCellClick(cell) {
  if (mode === "start") {
    if (startCell) startCell.classList.remove("start");
    cell.classList.remove("wall", "end");
    cell.classList.add("start");
    startCell = cell;
    mode = "end";
  } else if (mode === "end") {
    if (endCell) endCell.classList.remove("end");
    cell.classList.remove("wall", "start");
    cell.classList.add("end");
    endCell = cell;
    mode = "wall";
  } else {
    if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
      cell.classList.toggle("wall");
    }
  }
}

function getNeighbors(index) {
  const x = index % cols;
  const y = Math.floor(index / cols);
  const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  const diagonal = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  const allDirs = allowDiagonal ? directions.concat(diagonal) : directions;

  return allDirs
    .map(([dx, dy]) => {
      const nx = x + dx,
        ny = y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        const ni = ny * cols + nx;
        if (!cells[ni].classList.contains("wall")) return ni;
      }
      return null;
    })
    .filter((n) => n !== null);
}

function heuristic(a, b) {
  const ax = a % cols,
    ay = Math.floor(a / cols);
  const bx = b % cols,
    by = Math.floor(b / cols);
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function startPathfinding() {
  if (!startCell || !endCell) {
    alert("Please set Start and End points.");
    return;
  }

  const start = parseInt(startCell.dataset.index);
  const end = parseInt(endCell.dataset.index);

  const openSet = [start];
  const cameFrom = {};
  const gScore = Array(rows * cols).fill(Infinity);
  const fScore = Array(rows * cols).fill(Infinity);

  gScore[start] = 0;
  fScore[start] = heuristic(start, end);

  const interval = setInterval(() => {
    if (openSet.length === 0) {
      clearInterval(interval);
      alert("No path found!");
      return;
    }

    let current = openSet.reduce((a, b) => (fScore[a] < fScore[b] ? a : b));
    if (current === end) {
      clearInterval(interval);
      animatePath(cameFrom, current);
      return;
    }

    openSet.splice(openSet.indexOf(current), 1);
    if (
      !cells[current].classList.contains("start") &&
      !cells[current].classList.contains("end")
    )
      cells[current].classList.add("visited");

    for (let neighbor of getNeighbors(current)) {
      const tempG = gScore[current] + 1;
      if (tempG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tempG;
        fScore[neighbor] = tempG + heuristic(neighbor, end);
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }, 15);
}

function animatePath(cameFrom, current) {
  const path = [];
  while (cameFrom[current]) {
    current = cameFrom[current];
    if (!cells[current].classList.contains("start")) path.unshift(current);
  }

  let i = 0;
  const pathInterval = setInterval(() => {
    if (i >= path.length) {
      clearInterval(pathInterval);
      return;
    }
    cells[path[i]].classList.add("path");
    i++;
  }, 30);
}

function eraseWalls() {
  for (let cell of cells) {
    cell.classList.remove("wall");
  }
}

function resetGrid() {
  for (let cell of cells) {
    cell.className = "cell";
  }
  startCell = null;
  endCell = null;
  mode = "start";
}

document.getElementById("wallDensity").addEventListener("input", function () {
  const scaledValue = Math.round(this.value * 0.4); // Scale 0–100 to 0–40
  document.getElementById("densityValue").textContent = scaledValue;
});

function addRandomWalls() {
  const raw = parseInt(document.getElementById("wallDensity").value);
  const density = (raw * 0.4) / 100; // Scales 0–100 slider to 0–0.4 actual density

  for (let cell of cells) {
    if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
      if (Math.random() < density) {
        cell.classList.add("wall");
      } else {
        cell.classList.remove("wall");
      }
    }
  }
}

// Theme toggle
document.getElementById("themeToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("dark", e.target.checked);
});

// On load
window.onload = generateGrid;
