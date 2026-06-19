const socket = io();

const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

let gridData = [];
let gridDataEnemy = [];
let secretEnemyBoard = [];
let currentSelectedShipButton = 0;
let shipRemaining = {
  1: 4,
  2: 3,
  3: 2,
  4: 1,
};
let myShips = [];
let enemyShipsKilled = 0;
let secretEnemyShips = [];

let isHorizontal = true;
let isMyTurn = false;

const container_button = document.querySelectorAll(".inner__button");
const buttons = document.querySelectorAll(".inner__button > button");

//ВЕРТИКАЛЬНІ КОРАБЛІ НА ПКМ
window.addEventListener("contextmenu", function (e) {
  e.preventDefault();
  isHorizontal = !isHorizontal;
});

//ФОРМУВАННЯ ТАБЛИЦІ
for (let row = 1; row <= 10; row++) {
  for (let col = 0; col < columns.length; col++) {
    gridData.push({
      Row: row,
      Column: columns[col],
      Status: 0,
    });
    gridDataEnemy.push({
      Row: row,
      Column: columns[col],
      Status: 0,
    });
  }
}

var enemy = new WebDataRocks({
  container: "#wdr-component-enemy",
  toolbar: false,
  report: {
    dataSource: {
      data: gridDataEnemy,
    },
    slice: {
      rows: [{ uniqueName: "Row" }],
      columns: [{ uniqueName: "Column" }],
      measures: [
        {
          uniqueName: "Status",

          aggregation: "none",
        },
      ],
    },

    options: {
      grid: {
        showGrandTotals: "off",
        showTotals: "off",

        showFilter: false,

        showHeaders: false,
      },
    },

    tableSizes: {
      columns: [
        { idx: 0, width: 40 },

        { idx: 1, width: 40 },

        { idx: 2, width: 40 },

        { idx: 3, width: 40 },

        { idx: 4, width: 40 },

        { idx: 5, width: 40 },

        { idx: 6, width: 40 },

        { idx: 7, width: 40 },

        { idx: 8, width: 40 },

        { idx: 9, width: 40 },

        { idx: 10, width: 40 },
      ],
    },
  },

  customizeCell: function (cell, data) {
    if (data.type === "value") {
      cell.text = " ";
    }

    if (data.value == 0) {
      cell.addClass("cell-water");
    }

    if (data.value == 1) {
      cell.addClass("cell-ship");
    }

    if (data.value == 2) {
      cell.addClass("cell-block");
    }
    if (data.value == 3) {
      cell.addClass("cell-hit");
    }
    if (data.value == 4) {
      cell.addClass("cell-miss");
    }
  },
});

var pivot = new WebDataRocks({
  container: "#wdr-component-player",

  toolbar: false,

  report: {
    dataSource: {
      data: gridData,
    },

    slice: {
      rows: [{ uniqueName: "Row" }],

      columns: [{ uniqueName: "Column" }],

      measures: [
        {
          uniqueName: "Status",

          aggregation: "none",
        },
      ],
    },

    options: {
      grid: {
        showGrandTotals: "off",

        showTotals: "off",

        showFilter: false,
        showHeaders: false,
      },
    },

    tableSizes: {
      columns: [
        { idx: 0, width: 40 },

        { idx: 1, width: 40 },

        { idx: 2, width: 40 },

        { idx: 3, width: 40 },

        { idx: 4, width: 40 },

        { idx: 5, width: 40 },

        { idx: 6, width: 40 },

        { idx: 7, width: 40 },

        { idx: 8, width: 40 },

        { idx: 9, width: 40 },

        { idx: 10, width: 40 },
      ],
    },
  },

  customizeCell: function (cell, data) {
    if (data.type === "value") {
      cell.text = " ";
    }

    if (data.value == 0) {
      cell.addClass("cell-water");
    }

    if (data.value == 1) {
      cell.addClass("cell-ship");
    }

    if (data.value == 2) {
      cell.addClass("cell-block");
    }

    if (data.value == 3) {
      cell.addClass("cell-hit");
    }
    if (data.value == 4) {
      cell.addClass("cell-miss");
    }
  },
});

//КНОПКИ
buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    currentSelectedShipButton = parseInt(button.getAttribute("data-size"));

    buttons.forEach((btn) => btn.classList.remove("active"));

    button.classList.add("active");
  });
});

//НАШЕ ПОЛЕ
pivot.on("cellclick", function (cellData) {
  if (cellData.type === "value") {
    if (cellData.type === "value") {
      let clickedRow = cellData.rows[0].caption;

      let clickedColumn = cellData.columns[0].caption;

      let r = parseInt(clickedRow);

      let c = columns.indexOf(clickedColumn);

      let clickedCell = gridData.find(
        (item) =>
          item.Row === parseInt(clickedRow) && item.Column === clickedColumn,
      );

      if (clickedCell.Status === 0) {
        setShip(r, c, currentSelectedShipButton, isHorizontal);
      }
    }
  }

  pivot.updateData({
    data: gridData,
  });
});

//ПОЛЕ СУПРОТИВНИКА
enemy.on("cellclick", function (cellData) {
  if (cellData.type === "value") {
    if (secretEnemyBoard.length === 0) {
      alert("Почекай, ворог ще не розставив кораблі!");
      return;
    }

    if (!isMyTurn) {
      alert("Зараз не твій хід! Почекай.");
      return;
    }

    let clickedRow = parseInt(cellData.rows[0].caption);
    let clickedColumn = cellData.columns[0].caption;

    let visibleEnemyCell = gridDataEnemy.find(
      (item) => item.Row === clickedRow && item.Column === clickedColumn,
    );

    if (visibleEnemyCell && visibleEnemyCell.Status === 0) {
      let secretCell = secretEnemyBoard.find(
        (item) => item.Row === clickedRow && item.Column === clickedColumn,
      );

      let isHit = false;
      let isKilled = false;
      let killedShipCells = [];

      if (secretCell && secretCell.Status === 1) {
        visibleEnemyCell.Status = 3;
        isHit = true;

        let targetShip = secretEnemyShips.find((ship) =>
          ship.cells.some(
            (c) => c.row === clickedRow && c.col === clickedColumn,
          ),
        );

        if (targetShip) {
          targetShip.hits++;

          if (targetShip.hits === targetShip.size) {
            isKilled = true;
            killedShipCells = targetShip.cells;
            enemyShipsKilled++;
            if (enemyShipsKilled === 10) {
              alert("Ви перемогли!");
            } else {
              alert("Корабель вбито!");
            }

            killedShipCells.forEach((killedCell) => {
              let r = killedCell.row;
              let c = columns.indexOf(killedCell.col);

              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  let nCol = columns[c + dc];
                  if (r + dr >= 1 && r + dr <= 10 && nCol) {
                    let neighbor = gridDataEnemy.find(
                      (item) => item.Row === r + dr && item.Column === nCol,
                    );
                    if (neighbor && neighbor.Status === 0) {
                      neighbor.Status = 4;
                    }
                  }
                }
              }
            });
          }
        }
      } else {
        visibleEnemyCell.Status = 4;
      }

      enemy.updateData({
        data: gridDataEnemy,
      });

      socket.emit("shoot", {
        row: clickedRow,
        col: clickedColumn,
        status: visibleEnemyCell.Status,
        killedCells: isKilled ? killedShipCells : null,
      });

      if (enemyShipsKilled === 10) {
        socket.emit("game_over");
        isMyTurn = false;

        let turnStatus = document.getElementById("turn-status");
        turnStatus.innerText = "Ви перемогли!";
        turnStatus.style.color = "gold";
      } else if (!isHit) {
        isMyTurn = false;
        updateTurnUI();
      }
    }
  }
});

//КНОПКА ДЛЯ ПОЧАТКУ ГРИ
let buttonReady = document.getElementById("button-ready");

buttonReady.addEventListener("click", () => {
  let allShipsPlaced = Object.values(shipRemaining).every((val) => val === 0);
  if (!allShipsPlaced) {
    alert("Розставьте усі кораблі!");
    return;
  }
  socket.emit("ships_ready", { board: gridData, ships: myShips });
  buttonReady.disabled = true;
  document.querySelector(".inner__button").style.display = "none";
  alert("Кораблі відправлено! Чекаємо на ворога...");
});

//ПОСТАНОВКА КОРАБЛЯ
function setShip(startRow, startColIndex, size, isHorizontal) {
  if (shipRemaining[size] <= 0) {
    return false;
  }

  const shipCells = [];

  for (let i = 0; i < size; i++) {
    const cell = isHorizontal
      ? getCell(startRow, columns[startColIndex + i])
      : getCell(startRow + i, columns[startColIndex]);

    if (!cell || cell.Status !== 0) {
      return false;
    }

    shipCells.push(cell);
  }

  shipCells.forEach((cell) => {
    cell.Status = 1;
  });

  let currentShipCoords = shipCells.map((cell) => ({
    row: cell.Row,
    col: cell.Column,
  }));
  myShips.push({
    cells: currentShipCoords,
    hits: 0,
    size: size,
  });

  shipCells.forEach((cell) => {
    const r = cell.Row;

    const c = columns.indexOf(cell.Column);

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const neighbor = getCell(r + dr, columns[c + dc]);

        if (neighbor && neighbor.Status === 0) {
          neighbor.Status = 2;
        }
      }
    }
  });

  pivot.updateData({
    data: gridData,
  });

  shipRemaining[size]--;

  let countSpan = document.getElementById("count-" + size);
  if (countSpan) {
    countSpan.innerText = shipRemaining[size];
  }

  if (shipRemaining[size] === 0) {
    let shipButton = document.getElementById("set-ship-" + size);
    if (shipButton) {
      shipButton.disabled = true;
      shipButton.classList.remove("active");
      currentSelectedShipButton = 0;
    }
  }
}

function getCell(row, colName) {
  if (row < 1 || row > 10 || !colName) {
    return undefined;
  }

  return gridData.find((item) => item.Row === row && item.Column === colName);
}

//ЧИ ГОТОВ ВОРОГ
socket.on("enemy_board_ready", (data) => {
  secretEnemyBoard = data.board;
  secretEnemyShips = data.ships;
  alert("Ворог розставив кораблі");
});

//ХІД
socket.on("enemy_shoot", (data) => {
  let myCell = gridData.find(
    (item) => item.Row === data.row && item.Column === data.col,
  );

  if (myCell) {
    myCell.Status = data.status;

    if (data.killedCells) {
      data.killedCells.forEach((killedCell) => {
        let r = killedCell.row;
        let c = columns.indexOf(killedCell.col);

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            let nCol = columns[c + dc];
            if (r + dr >= 1 && r + dr <= 10 && nCol) {
              let neighbor = gridData.find(
                (item) => item.Row === r + dr && item.Column === nCol,
              );
              if (neighbor && neighbor.Status === 0) {
                neighbor.Status = 4;
              }
            }
          }
        }
      });
    }

    pivot.updateData({
      data: gridData,
    });

    if (data.status === 4) {
      isMyTurn = true;
      updateTurnUI();
    }
  }
});

//ОНОВЛЕННЯ ЗАГЛОВКУ
function updateTurnUI() {
  const turnStatus = document.getElementById("turn-status");
  if (isMyTurn) {
    turnStatus.innerText = "Твій хід";
    turnStatus.style.color = "#93e896";
  } else {
    turnStatus.innerText = "Хід супротивника";
    turnStatus.style.color = "#f8a9cf";
  }
}

socket.on("set_turn", (turnValue) => {
  isMyTurn = turnValue;
  updateTurnUI();
});

socket.on("you_lose", () => {
  alert("Ворог знищив всі кораблі!");
  isMyTurn = false;

  let turnStatus = document.getElementById("turn-status");
  turnStatus.innerText = "Гру завершено! Ви програли!";
  turnStatus.style.color = "gray";
});
