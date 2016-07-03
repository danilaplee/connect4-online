var socket 	= require('socket.io');
var https   = require('https');
var uuid  	= require('uuid');
var fs      = require('fs')
var server_options = 
{
  key: fs.readFileSync(__dirname+'/.key'),
  cert: fs.readFileSync(__dirname+'/.crt')
}
var app = https.createServer(server_options, function(req, res) 
{
    res.writeHead(200, 
    {
        'Content-Type': 'text/html',
        "Access-Control-Allow-Origin": "https://danilaplee.github.io",
        "Access-Control-Allow-Credentials":true,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,HEAD,DELETE,OPTIONS',
        "Access-Control-Allow-Headers": "Content-Type"
    });

    res.end('<h1 style="font-family:Helvetica, Open-sans, Arial">THIS IS A CONNECT 4 SIGNALLING SERVER</h1>')

}).listen(443)

var io = require('socket.io').listen(app);

var game_sessions = {}

var getOtherPlayer = function(session, socket)
{
	var other_player = null;
	var player1  	 = session.player1.socket.id
	var player2  	 = session.player2.socket.id
	if(socket.id == player1) other_player = session.player2
	if(socket.id == player2) other_player = session.player1
	return other_player;

}

io.on('connection', function(socket) 
{
    socket.on('initSession', function(player_one)
    {	
    	var id = uuid.v4()
    	var new_session = 
    	{
    		'id':id,
    		'player1':{
    			profile:player_one,
    			socket:socket
    		},
    		'info':
    		{
    			'id':id,
    			'player1':player_one
    		}
    	}
    	game_sessions[id] = new_session
    	socket.emit('newSession', new_session.id)
    });

    socket.on('openSession', function(session_id, player_two)
    {
    	if(game_sessions[session_id])
    	{
	    	if(player_two) 
	    	{
	    		game_sessions[session_id].player2 = 
		    	{
		    		profile:player_two,
		    		socket:socket
		    	}
		    	game_sessions[session_id].info.player2 = player_two;
		    	game_sessions[session_id].player1.socket.emit('other_player', player_two)
		    }

	    	socket.emit('yourSession', game_sessions[session_id].info)
    	}
    })

    socket.on('transferCallData', function(session_id, rtc_data) 
    {
    	var session = game_sessions[session_id]
	    if(session) getOtherPlayer(session, socket).socket.emit('callData', rtc_data)
    })
    socket.on('dropBall', function(session_id, column)
    {
    	var session = game_sessions[session_id]
	    if(session) getOtherPlayer(session, socket).socket.emit('ballDropped', column)

    })
    socket.on('restartGame', function(session_id)
    {
        var session = game_sessions[session_id]
        if(session) 
        {
            var other_player, starting_player;
            var player1      = session.player1.socket.id
            var player2      = session.player2.socket.id
            if(socket.id == player1) 
            {
                other_player = session.player2
                starting_player = 2
            }
            if(socket.id == player2) 
            {
                other_player = session.player1
                starting_player = 1;
            }
            other_player.socket.emit('restartGame', starting_player)
            socket.emit('restartGame', starting_player)
        }

    })
});


// app.listen(3000);