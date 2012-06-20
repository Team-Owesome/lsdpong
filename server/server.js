var io = require('socket.io').listen(18815);

var TEST_CLIENT="TEST_CLIENT";
var TEST_SERVER="TEST_SERVER";

io.sockets.on('connection', function (socket) {
  socket.on(TEST_CLIENT, function (data) {
    console.log("incomming request");
    socket.emit(TEST_SERVER, {text:TEST_SERVER});
  });
});