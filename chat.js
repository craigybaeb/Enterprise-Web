module.exports = (io) => {
  return function(req, res){
    const room = req.room;

    io.on('connection', function(socket){
        socket.join(room);
      });
  res.render('pages/main')
  }
};
