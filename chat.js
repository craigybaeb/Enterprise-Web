module.exports = function(io) {
  return function(req, res){
    var room = req.room;

    io.on('connection', function(socket){
        socket.join(room);
      });
  res.render('pages/main')
  }
};
