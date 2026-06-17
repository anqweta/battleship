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

let isHorizontal = true;
let isMyTurn = false;

const container_button = document.querySelectorAll(".inner__button");
const buttons = document.querySelectorAll(".inner__button > button");

window.addEventListener("contextmenu", function (e) {
  e.preventDefault();
  isHorizontal = !isHorizontal;
});

socket.on("enemy_board_ready", (enemyBoard) => {
  secretEnemyBoard = enemyBoard;
  alert("Ворог розставив кораблі");
});

socket.on("enemy_shoot", (data) => {
  // data містить { row, col, status }

  // Шукаємо клітинку, в яку вистрілив ворог, на НАШІЙ дошці
  let myCell = gridData.find(
    (item) => item.Row === data.row && item.Column === data.col,
  );

  if (myCell) {
    // Оновлюємо статус нашої клітинки (ставимо 3 - підбито, або 4 - промах)
    myCell.Status = data.status;

    // Оновлюємо нашу таблицю, щоб ми побачили дірку в своєму кораблі або сплеск води
    pivot.updateData({
      data: gridData,
    });

    isMyTurn = true;
    updateTurnUI();
  }
});

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
  toolbar: false, // Отключаем верхнюю панель инструментов библиотеки
  report: {
    dataSource: {
      data: gridDataEnemy, // Передаем наш сгенерированный массив
    },
    slice: {
      rows: [
        { uniqueName: "Row" }, // Строки 1-10
      ],
      columns: [
        { uniqueName: "Column" }, // Столбцы А-К
      ],
      measures: [
        {
          uniqueName: "Status",

          aggregation: "none", // Не пытаемся складывать слова
        },
      ],
    },

    options: {
      grid: {
        showGrandTotals: "off", // Выключаем общие итоги (11-я строка/столбец)

        showTotals: "off",

        showFilter: false, // Убираем иконки фильтрации в заголовках

        showHeaders: false, // Убираем лишние системные заголовки библиотеки
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
      cell.addClass("cell-hit"); // Клас для підбитого корабля
    }
    if (data.value == 4) {
      cell.addClass("cell-miss"); // Клас для промаху
    }
  },
});

var pivot = new WebDataRocks({
  container: "#wdr-component-player",

  toolbar: false, // Отключаем верхнюю панель инструментов библиотеки

  report: {
    dataSource: {
      data: gridData, // Передаем наш сгенерированный массив
    },

    slice: {
      rows: [
        { uniqueName: "Row" }, // Строки 1-10
      ],

      columns: [
        { uniqueName: "Column" }, // Столбцы А-К
      ],

      measures: [
        {
          uniqueName: "Status",

          aggregation: "none", // Не пытаемся складывать слова
        },
      ],
    },

    options: {
      grid: {
        showGrandTotals: "off", // Выключаем общие итоги (11-я строка/столбец)

        showTotals: "off",

        showFilter: false, // Убираем иконки фильтрации в заголовках

        showHeaders: false, // Убираем лишние системные заголовки библиотеки
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
      cell.addClass("cell-hit"); // Клас для підбитого корабля
    }
    if (data.value == 4) {
      cell.addClass("cell-miss"); // Клас для промаху
    }
  },
});

buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    currentSelectedShipButton = parseInt(button.getAttribute("data-size"));

    buttons.forEach((btn) => btn.classList.remove("active"));

    button.classList.add("active");
  });
});

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

enemy.on("cellclick", function (cellData) {
  // 1. Виправили на три дорівнює (===)
  if (cellData.type === "value") {
    if (secretEnemyBoard.length === 0) {
      alert("Почекай, ворог ще не розставив кораблі!");
      return;
    }

    if (!isMyTurn) {
      alert("Зараз не твій хід! Почекай.");
      return;
    }

    // 2. Додали parseInt(), щоб перетворити рядок "1" у число 1
    let clickedRow = parseInt(cellData.rows[0].caption);
    let clickedColumn = cellData.columns[0].caption;

    let visibleEnemyCell = gridDataEnemy.find(
      (item) => item.Row === clickedRow && item.Column === clickedColumn,
    );

    // Додаємо перевірку, чи взагалі знайшлась клітинка, і чи туди ще не стріляли
    if (visibleEnemyCell && visibleEnemyCell.Status === 0) {
      let secretCell = secretEnemyBoard.find(
        (item) => item.Row === clickedRow && item.Column === clickedColumn,
      );

      // 3. УСЯ логіка пострілу тепер ВСЕРЕДИНІ цих фігурних дужок
      if (secretCell && secretCell.Status === 1) {
        visibleEnemyCell.Status = 3; // Влучив
      } else {
        visibleEnemyCell.Status = 4; // Промазав
      }

      enemy.updateData({
        data: gridDataEnemy,
      });

      socket.emit("shoot", {
        row: clickedRow,
        col: clickedColumn,
        status: visibleEnemyCell.Status,
      });
      isMyTurn = false;
      updateTurnUI();
    }
  }
});

let buttonReady = document.getElementById("button-ready");

buttonReady.addEventListener("click", () => {
  socket.emit("ships_ready", gridData);
  buttonReady.disabled = true;
});

function setShip(startRow, startColIndex, size, isHorizontal) {
  if (shipRemaining[size] <= 0) {
    return false;
  }

  const shipCells = [];

  for (let i = 0; i < size; i++) {
    const cell = isHorizontal
      ? getCell(startRow, columns[startColIndex + i])
      : getCell(startRow + i, columns[startColIndex]);

    if (!cell) {
      return false;
    }

    shipCells.push(cell);
  }

  shipCells.forEach((cell) => {
    cell.Status = 1;
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
}

function getCell(row, colName) {
  if (row < 1 || row > 10 || !colName) {
    return undefined;
  }

  return gridData.find((item) => item.Row === row && item.Column === colName);
}

function updateTurnUI() {
  const turnStatus = document.getElementById("turn-status");
  if (isMyTurn) {
    turnStatus.innerText = "Твій хід";
    turnStatus.style.color = "green";
  } else {
    turnStatus.innerText = "Хід супротивника";
    turnStatus.style.color = "red";
  }
}

socket.on("set_turn", (turnValue) => {
  isMyTurn = turnValue;
  updateTurnUI();
});

/*


function setSingleDeskShip(cellData) {

if (currentSelectedShipButton == 1  && oneCellShipPlaced > 0) {

    if (cellData.type === "value") {

    let clickedRow = cellData.rows[0].caption;

    let clickedColumn = cellData.columns[0].caption;

    let r = parseInt(clickedRow);

    let c = columns.indexOf(clickedColumn);

    let clickedCell = gridData.find(item => item.Row === parseInt(clickedRow) && item.Column === clickedColumn);

    let blockedCells = [

        [r, columns[c + 1]],  

        [r, columns[c - 1]],

        [r + 1, columns[c]],  

        [r - 1, columns[c]],

        [r + 1, columns[c + 1]],

        [r - 1, columns[c - 1]],

        [r + 1, columns[c - 1]],

        [r - 1, columns[c + 1]]  

];

    if (clickedCell) {

        if (clickedCell.Status === 0) {

            clickedCell.Status = 1;

            oneCellShipPlaced--;    

            pivot.updateData({

            data: gridData

            });


            blockedCells.forEach(coords => {

let nRow = coords[0];

let nCol = coords[1];


if (nRow >= 1 && nRow <= 10 && nCol !== undefined) {

    let neighbor = gridData.find(item => item.Row === nRow && item.Column === nCol);

    if (neighbor && neighbor.Status === 0) {

        neighbor.Status = 2;

    }

}

});

        }

    }

}

}

}


function setDoubleDeskShip(cellData) {

if (currentSelectedShipButton == 2 && twoCellShipPlaced > 0) {

    if (cellData.type === "value") {

        let clickedRow = cellData.rows[0].caption;

        let clickedColumn = cellData.columns[0].caption;

        let r = parseInt(clickedRow);

        let c = columns.indexOf(clickedColumn);

        let clickedCell = gridData.find(item => item.Row === parseInt(clickedRow) && item.Column === clickedColumn);

        if (isHorizontal) {

            let secondCell = gridData.find(item => item.Row === parseInt(clickedRow) && item.Column === columns[c + 1]);

            let blockedCells = [

                [r, columns[c - 1]],

                [r + 1, columns[c]],

                [r - 1, columns[c]],

                [r + 1, columns[c + 1]],

                [r - 1, columns[c - 1]],

                [r + 1, columns[c - 1]],

                [r - 1, columns[c + 1]],

                [r, columns[c + 2]],

                [r - 1, columns[c - 1]],

                [r - 1, columns[c + 2]],

                [r + 1, columns[c + 2]]

            ];

            if (clickedCell) {

                if (clickedCell.Status === 0) {

                    clickedCell.Status = 1;

                    secondCell.Status = 1;

                    twoCellShipPlaced--;

                    pivot.updateData({

                        data: gridData

                    });

                }

            }

                blockedCells.forEach(coords => {

let nRow = coords[0];

let nCol = coords[1];


if (nRow >= 1 && nRow <= 10 && nCol !== undefined) {

    let neighbor = gridData.find(item => item.Row === nRow && item.Column === nCol);

    if (neighbor && neighbor.Status === 0) {

        neighbor.Status = 2;

    }

}

});

        }

        

    }

}

}


*/
