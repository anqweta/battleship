const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

let readyPlayers = 0;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Гравець підключився!");

  socket.on("shoot", (data) => {
    socket.broadcast.emit("enemy_shoot", data);
  });

  socket.on("disconnect", () => {
    console.log("Гравець вийшов");
    readyPlayers = 0;
  });

  // ПОЧАТОК БЛОКУ: Коли хтось натиснув кнопку "Я готовий"
  socket.on("ships_ready", (board) => {
    readyPlayers++; // 1. Додаємо +1 до лічильника готових гравців

    socket.broadcast.emit("enemy_board_ready", board); // 2. Відправляємо кораблі другу

    // 3. УСЯ логіка ходів має бути ТУТ, всередині події ships_ready!
    if (readyPlayers === 1) {
      socket.emit("set_turn", false);
    } else if (readyPlayers === 2) {
      socket.emit("set_turn", true);
      socket.broadcast.emit("set_turn", false);
      readyPlayers = 0; // Обнуляємо для наступної гри
    }
  });
  // КІНЕЦЬ БЛОКУ
});

http.listen(3000, () => {
  console.log("Сервер працює!");
});
