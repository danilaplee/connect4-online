var socket 	= require('socket.io');
var http    = require('http');
var uuid  	= require('uuid');
var fs      = require('fs')
var app     = require('express')()
var parser  = require('body-parser')
var request  = require('request');
var matrix_url = "http://localhost:8008/_matrix"
var matrix  = 
{
    root:"root",
    pass:"danilacool"
}

var server  = http.createServer(app).listen(2529)
    
var io      = require('socket.io').listen(server, {resource:"/c4/socket.io/"});

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
    })

    socket.on('replaceGameSocket', function(player, id)
    {
        var game = game_sessions[id]
        console.log("======= replacing socket for game #"+id+" =======")
        console.log(game)
        console.log(player)
        if(game.player1 != null && JSON.stringify(game.player1.profile) == JSON.stringify(player)) game.player1.socket = socket;
        if(game.player2 != null && JSON.stringify(game.player2.profile) == JSON.stringify(player)) game.player2.socket = socket;
    })

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
var makeMatrixUser = function(user)
{
    return new Promise(function(resolve, reject)
    {
        var ops = 
        {
            url: matrix_url+'/client/r0/register?kind=user',
            method: 'POST',
            json: 
            {
                "password": user.password,
                "username": user.name,
                "bind_email": false,
                "auth": {"type":"m.login.dummy"}
            }
        };
        request(ops, function(err, res, body)
        {
            if(err) console.error(JSON.stringify(err));
            console.log('===== matrix register result, code: '+res.statusCode+' =====')
            resolve(body)
        })
    })
}
app.use(parser.json())

app.use(function(req, res, next) 
{
    res.set({
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials":true,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,HEAD,DELETE,OPTIONS',
        "Access-Control-Allow-Headers": "Content-Type"
    });
    next()
})

app.get('/c4/', function(req,res){

    res.set({
        'Content-Type': 'text/html',
    })
    res.send('<h1 style="font-family:Helvetica, Open-sans, Arial">THIS IS A CONNECT 4 SIGNALLING SERVER</h1>')
})

app.post('/c4/register', function(req,res)
{
    console.log(req.body)
    try {
        var user = {
            user:req.body.name,
            password:req.body.password
        }

        makeMatrixUser(user)
        .then(function(result)
        {
            res.send(result);
        })
    }
    catch(err){
        console.error(err)
    }
})