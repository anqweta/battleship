const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
let gridData = [];
let currentSelectedShipButton = 0;
let oneCellShipPlaced = 4;
let twoCellShipPlaced = 3;
let threeCellShipPlaced = 2;
let fourCellShipPlaced = 1;
let isHorizontal = true;
const container_button = document.querySelectorAll('.inner__button');
const buttons = document.querySelectorAll('.inner__button > button');

window.addEventListener('contextmenu', function (e) { 
    e.preventDefault();
    isHorizontal = !isHorizontal;

});

for (let row = 1; row <= 10; row++) { 
    for (let col = 0; col < columns.length; col++) {
        gridData.push({
            "Row": row,
            "Column": columns[col],
            "Status": 0
        });
    }
}

var pivot = new WebDataRocks({
            container: "#wdr-component",
            toolbar: false, // Отключаем верхнюю панель инструментов библиотеки
            report: {
                dataSource: {
                    data: gridData // Передаем наш сгенерированный массив
                },
                slice: {
                    rows: [
                        { uniqueName: "Row" } // Строки 1-10
                    ],
                    columns: [
                        { uniqueName: "Column" } // Столбцы А-К
                    ],
                    measures: [
                        { 
                            uniqueName: "Status", 
                            aggregation: "none" // Не пытаемся складывать слова
                        }
                    ]
                },
                options: {
                    grid: {
                        showGrandTotals: "off", // Выключаем общие итоги (11-я строка/столбец)
                        showTotals: "off",
                        showFilter: false,      // Убираем иконки фильтрации в заголовках
                        showHeaders: false      // Убираем лишние системные заголовки библиотеки
                    }
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
        { idx: 10, width: 40 }
    ]
        }
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
            }
        });

buttons.forEach((button, index) => { 
    button.addEventListener('click', () => { 
        currentSelectedShipButton = parseInt(button.getAttribute('data-size'));
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

pivot.on("cellclick", function (cellData) { 
    setSingleDeskShip(cellData);
    setDoubleDeskShip(cellData);
    pivot.updateData({
                data: gridData
                });
});

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