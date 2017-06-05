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



//////////////////////////////// DATA SETUP ////////////////////////////////
var _mJsonFile = require('jsonfile');

const LOBBYROOMNAME = 'Lobby';
// const PLAYERDATA = 'PLAYERDATA';
// const ROOMDATA = 'ROOMDATA';
const SAVEINTERVALMS = 1000;            //In Milliseconds
const SAVEFILENAME = "serverdata.json"
var _mIsDataDirty = false;

//Init Data...
var _mData = {};
_mData.Players = [];

//Try to read data from server data file on start-up...
_mJsonFile.readFile(SAVEFILENAME, function(err, obj) {
    if(!err) {
        //Load Data (not currently supported)...
        //_mData = obj;
        console.dir(_mData);
    }
    else {
        console.error(err);
    }
});
/*
Regarding ^^^ ...
_mData => Server-side database of all application data in the following structure...

structure...
_mData.Players => Players
  Player => SocketID (PK: string), 
            Username (string), 
            CurrRoomName (string), 
            CurrOpponent (string), 
            InvitedTo (string[]), 
            InvitedBy (string[]), 
            AddedOn (Date)
*/

//Save the server data to a JSON file every so often IFF the data is dirty...
setInterval(function(){
    if(_mIsDataDirty) {
        _mJsonFile.writeFile(SAVEFILENAME, _mData, function (err) {
            if(err) console.error(err);
            else _mIsDataDirty = false;
        });
    }
}, SAVEINTERVALMS);

//Gets a Player by SocketID...
function GetPlayerBySocketID(_SocketID) {
    var _Player = _mData.Players.find(function(_Player){
        return _Player.SocketID === _SocketID;
    });

    return _Player;
}

//Gets Players[] by RoomName...
function GetPlayersByRoomName(_RoomName) {
    var _Players = _mData.Players.filter(function(_Player){
        return _Player.CurrRoomName === _RoomName;
    });

    return _Players;
}

function AddPlayer(_SocketID, _Username, _RoomName) {
    //Create the Player object...
    var _Player = {
        SocketID:_SocketID, 
        Username:_Username, 
        CurrRoomName:_RoomName,
        CurrOpponent:'', 
        InvitesTo:[], 
        InvitedBy:[], 
        AddedOn:Date.now()
    };

    //Add the Player to our data...
    _mData.Players.push(_Player);

    //Mark data as dirty (updated)...
    _mIsDataDirty = true;
}

function RemovePlayer(_SocketID) {
    //Update the Players array by filtering out the unwanted Player...
    _mData.Players = _mData.Players.filter(function(_Player){
        return _Player.SocketID !== _SocketID;
    });

    //Mark data as dirty (updated)...
    _mIsDataDirty = true;
}

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

    log('A client CONNECTED to the server.');

    _Socket.on('disconnect', function () {
        log('A client DISconnected from the server.');
        if('undefined' != typeof _Socket.id) {
            var _Player = GetPlayerBySocketID(_Socket.id);
            if(_Player) {
                RemovePlayer(_Player.SocketID);
            
                //Respond...
                var _SuccessData = {
                    IsOpSuccess: true,
                    Message: _Player.Username + ' has left the ' + _Player.CurrRoomName + '.',
                    PlayerData: GetPlayersByRoomName(_Player.CurrRoomName)
                }
                log('update_broadcast: ' + JSON.stringify(_SuccessData));
                _mIO.in(_Player.CurrRoomName).emit('update_broadcast', _SuccessData);
            }
        }
    });

    //_Payload: RoomName=room to join; Username=user joining
    _Socket.on('join_room', function (_Payload) {
        log('Server Received Command', 'join_room', _Payload);

        var _Message = '';

        if (typeof _Payload === 'undefined' || !_Payload) {
            _Message = 'No Payload Received - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'join_room', Message: _Message });
            return;
        }

        var _RoomName = _Payload.RoomName;
        if (typeof _RoomName === 'undefined' || !_RoomName) {
            _Message = 'No Room Received - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'join_room', Message: _Message });
            return;
        }

        var _Username = _Payload.Username;
        if (typeof _Username === 'undefined' || !_Username) {
            _Message = 'No Username Received - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'join_room', Message: _Message });
            return;
        }
        
        //Join the Socket room...
        _Socket.join(_RoomName);

        var _RoomObject = _mIO.sockets.adapter.rooms[_RoomName];
        if (typeof _RoomObject === 'undefined' || !_RoomObject) {
            _Message = 'Could Not Create Room (Internal Error) - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'join_room', Message: _Message });
            return;
        }

        //Remove any matching Player from the data...
        RemovePlayer(_Socket.id);

        //Then add the Player to the data...
        AddPlayer(_Socket.id, _Username, _RoomName);
        _Message = _RoomName + ' was joined by ' + _Username + '.';

        var _SuccessData = {
            IsOpSuccess: true,
            Message: _Message,
            PlayerData: GetPlayersByRoomName(_RoomName)
        }
        log('update_broadcast: ' + JSON.stringify(_SuccessData));
        _mIO.sockets.in(_RoomName).emit('update_broadcast', _SuccessData);
    });

    //_Payload: ActionName, SourceSocketID, TargetSocketID
    _Socket.on('lobby_action', function (_Payload) {
        log('Server Received Command', 'lobby_action', _Payload);

        var _Message = '';

        if (typeof _Payload === 'undefined' || !_Payload || !_Payload.SourceSocketID || !_Payload.TargetSocketID) {
            _Message = 'No Valid Payload Received - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:_Payload.ActionName, Message: _Message });
            return;
        }

        var _SourcePlayer = GetPlayerBySocketID(_Payload.SourceSocketID);
        var _TargetPlayer = GetPlayerBySocketID(_Payload.TargetSocketID);

        if (!_SourcePlayer || !_TargetPlayer) {
            _Message = 'Source or Target Player Not Found - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:_Payload.ActionName, Message: _Message });
            return;
        }

        switch(_Payload.ActionName) {
            case 'invite':
                _SourcePlayer.InvitesTo.push(_TargetPlayer.SocketID);
                _TargetPlayer.InvitedBy.push(_SourcePlayer.SocketID);
                _Message = _SourcePlayer.Username + ' invites ' + _TargetPlayer.Username + ' to a game.';
                _mIsDataDirty = true;
                break;
            case 'uninvite':
                _SourcePlayer.InvitesTo = _SourcePlayer.InvitesTo.filter(function(_SocketID) { return _SocketID !== _TargetPlayer.SocketID; });
                _TargetPlayer.InvitedBy = _TargetPlayer.InvitedBy.filter(function(_SocketID) { return _SocketID !== _SourcePlayer.SocketID; });
                _Message = _SourcePlayer.Username + ' uninvites ' + _TargetPlayer.Username + ' to a game.';
                _mIsDataDirty = true;
                break;
            case 'play':
                //ToDo: ???
                _Message = _SourcePlayer.Username + ' will play ' + _TargetPlayer.Username + '.';
                _mIsDataDirty = true;
                break;
        }

        var _SuccessData = {
            IsOpSuccess: true,
            Message: _Message,
            PlayerData: GetPlayersByRoomName(LOBBYROOMNAME)
        }
        log('update_broadcast: ' + JSON.stringify(_SuccessData));
        _mIO.sockets.in(LOBBYROOMNAME).emit('update_broadcast', _SuccessData);
    });

    //_Payload: RoomName=room of chat; Username=user chatting; Message=new chat message.
    _Socket.on('send_message', function (_Payload) {
        log('Server Received Command', 'send_message', _Payload);

        var _Message = '';

        if (typeof _Payload === 'undefined' || !_Payload) {
            _Message = 'No Payload Received - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'send_message', Message: _Message });
            return;
        }

        var _RoomName = _Payload.RoomName;
        if (typeof _RoomName === 'undefined' || !_RoomName) {
            _Message = 'No Room Received - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'send_message', Message: _Message });
            return;
        }

        var _Username = _Payload.Username;
        if (typeof _Username === 'undefined' || !_Username) {
            _Message = 'No Username Received - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'send_message', Message: _Message });
            return;
        }

        var _ChatMessage = _Payload.Message;
        if (typeof _ChatMessage === 'undefined' || !_ChatMessage) {
            _Message = 'No Chat Message Received - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'send_message', Message: _Message });
            return;
        }

        var _SuccessData = {
            IsOpSuccess: true,
            Message: _ChatMessage,
            RoomName: _RoomName,
            Username: _Username
        };
        _mIO.sockets.in(_RoomName).emit('send_message_broadcast', _SuccessData);
        log(_Username + ' chatted in ' + _RoomName + '.');
    });
});