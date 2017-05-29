//////////////////////////////// WEB SERVER SETUP ////////////////////////////////

// Include static file webserver library...
var _mStatic = require('node-static');

// Include HTTP server library...
var _mHTTP = require('http');

// Assume we're running on the Heroku Cloud...
var _mPort = process.env.PORT;
//var _mDirectory = __dirname + '/public';
var _mDirectory = __dirname + '/';

// If we're NOT on Heroku, readjust Port/Directory for localhost...
if (typeof _mPort === undefined || !_mPort) {
    _mPort = 8080;
    //_mDirectory = './public';
    _mDirectory = './';
}

// Set up a static webserver that will delivery files from the filesystem
var _mFileServer = new _mStatic.Server(_mDirectory);

// Construct an HTTP server that gets files from the fileserver
var _mApp = _mHTTP.createServer(function (request, response) {
                                    request.addListener('end',
                                        function () {
                                            _mFileServer.serve(request, response);
                                        }
                                    ).resume();
                                }
                             ).listen(_mPort);

console.log('SERVER IS RUNNING...');



//////////////////////////////// WEB SOCKET SETUP ////////////////////////////////

var _mIO = require('socket.io').listen(_mApp);

_mIO.sockets.on('connection', function (_Socket) {
    function log() {
        var _Array = ['*** Server Log Message: '];
        for (var i = 0; i < arguments.length; i++) {
            _Array.push(arguments[i]);
            console.log(arguments[i]);
        }
        _Socket.emit('log', _Array);
        _Socket.broadcast.emit('log', _Array);
    }

    log('A website CONNECTED to the server.');

    _Socket.on('disconnect', function () {
        log('A website DISconnected from the server.');
    });

    //_Payload: room=room to join; username=user joining
    _Socket.on('join_room', function (_Payload) {
        log('Server Received Command', 'join_room', _Payload);

        var _Msg = '';

        if (typeof _Payload === 'undefined' || !_Payload) {
            _Msg = 'No Payload Received - Command Aborted';
            log(_Msg);
            _Socket.emit('join_room_response', { result: 'fail', message: _Msg });
            return;
        }

        var _Room = _Payload.room;
        if (typeof _Room === 'undefined' || !_Room) {
            _Msg = 'No Room Received - Command Aborted';
            log(_Msg);
            _Socket.emit('join_room_response', { result: 'fail', message: _Msg });
            return;
        }

        var _Username = _Payload.username;
        if (typeof _Username === 'undefined' || !_Username) {
            _Msg = 'No Username Received - Command Aborted';
            log(_Msg);
            _Socket.emit('join_room_response', { result: 'fail', message: _Msg });
            return;
        }

        _Socket.join(_Room);

        var _RoomObject = _mIO.sockets.adapter.rooms[_Room];
        if (typeof _RoomObject === 'undefined' || !_RoomObject) {
            _Msg = 'Could Not Create Room (Internal Error) - Command Aborted';
            log(_Msg);
            _Socket.emit('join_room_response', { result: 'fail', message: _Msg });
            return;
        }

        var _NumClients = _RoomObject.length;
        var _SuccessData = {
            result: 'success',
            room: _Room,
            username: _Username,
            membership: (_NumClients + 1)
        };
        _mIO.sockets.in(_Room).emit('join_room_response', _SuccessData);
        log('Room ' + _Room + ' was joined by ' + _Username + '.');
    });

    //_Payload: room=room to join; username=user joining
    _Socket.on('send_message', function (_Payload) {
        log('Server Received Command', 'send_message', _Payload);

        var _Msg = '';

        if (typeof _Payload === 'undefined' || !_Payload) {
            _Msg = 'No Payload Received - Command Aborted';
            log(_Msg);
            _Socket.emit('send_message_response', { result: 'fail', message: _Msg });
            return;
        }

        var _Room = _Payload.room;
        if (typeof _Room === 'undefined' || !_Room) {
            _Msg = 'No Room Received - Command Aborted';
            log(_Msg);
            _Socket.emit('send_message_response', { result: 'fail', message: _Msg });
            return;
        }

        var _Username = _Payload.username;
        if (typeof _Username === 'undefined' || !_Username) {
            _Msg = 'No Username Received - Command Aborted';
            log(_Msg);
            _Socket.emit('send_message_response', { result: 'fail', message: _Msg });
            return;
        }

        var _ChatMessage = _Payload.message;
        if (typeof _ChatMessage === 'undefined' || !_ChatMessage) {
            _Msg = 'No Chat Message Received - Command Aborted';
            log(_Msg);
            _Socket.emit('send_message_response', { result: 'fail', message: _Msg });
            return;
        }
        var _SuccessData = {
            result: 'success',
            room: _Room,
            username: _Username,
            message: _ChatMessage
        };
        _mIO.sockets.in(_Room).emit('send_message_response', _SuccessData);
        log(_Username + ' chatted in ' + _Room + '.');
    });
});