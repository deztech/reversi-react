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
_mData.Games = [];
/*
Regarding ^^^ ...
_mData => Server-side database of all application data in the following structure...

structure...
_mData.Players => Player[]
  Player => SocketID (PK: string), 
            Username (string), 
            CurrRoomName (string), 
            NextRoomName (string), 
            InvitedTo (string[]), 
            InvitedBy (string[]), 
            AddedOn (Date)

_mData.Games => Game[]
  Game =>   RoomName (string), 
            PlayerDarkSocketID (string; Dark goes first and moves on odd CurrMoveNum values),
            PlayerLightSocketID (string; Light goes second and moves on even CurrMoveNum values),
            CurrScoreDark (number),
            CurrScoreLight (number),
            CurrMoveNum (number; starts at 1),
            BoardArray (string[][]), 
            AddedOn (Date)
*/

//Try to read data from server data file on start-up...
_mJsonFile.readFile(SAVEFILENAME, function(err, obj) {
    if(!err) {
        //Load Data (not currently supported since the changing SocketID values makes this tricky since we'd need to remap SocketIDs after any restart/reconnect anyways!)...
        //_mData = obj;
        console.dir(obj);
    }
    else {
        console.error(err);
    }
});

//Save the server data to a JSON file every so often IFF the data is dirty...
setInterval(function(){
    if(_mIsDataDirty) {
        _mJsonFile.writeFile(SAVEFILENAME, _mData, function (err) {
            if(err) console.error(err);
            else _mIsDataDirty = false;
        });
    }
}, SAVEINTERVALMS);

var _mTOKENENUM = Object.freeze({ EMPTY:                'token-empty.gif', 
                                  EMPTYtoDARK:          'token-empty-fading-into-dark.gif', 
                                  EMPTYtoLIGHT:         'token-empty-fading-into-light.gif', 
                                  DARK:                 'token-dark-static.gif', 
                                  DARKfromLIGHT:        'token-light-flipping-to-dark.gif', 
                                  LIGHT:                'token-light-static.gif', 
                                  LIGHTfromDARK:        'token-dark-flipping-to-light.gif', 
                                  ERROR:                'token-error.gif' });

//Function to create a dynamic, multi-dimensional array (from: https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938)...
function CreateArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = CreateArray.apply(this, args);
    }

    return arr;
}

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
        NextRoomName:'', 
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

    //Then update the Players array by filtering each Player item's InvitedTo + InvitedBy arrays...
    _mData.Players.forEach(function(_Player) {
        //Filter out the unwanted SocketID from the InvitesTo array...
        if(_Player.InvitesTo) {
            _Player.InvitesTo = _Player.InvitesTo.filter(function(_ItemValue){
                return _ItemValue !== _SocketID;
            });
        }
        
        //Filter out the unwanted SocketID from the InvitesBy array...
        if(_Player.InvitesBy) {
            _Player.InvitesBy = _Player.InvitesBy.filter(function(_ItemValue){
                return _ItemValue !== _SocketID;
            });
        }
    });

    //Mark data as dirty (updated)...
    _mIsDataDirty = true;
}

//Gets a Game by RoomName...
function GetGameByRoomName(_RoomName) {
    if(_RoomName === LOBBYROOMNAME) return;

    var _Game = _mData.Games.find(function(_Game){
        return _Game.RoomName === _RoomName;
    });

    return _Game;
}

//Initializes and Returns a New Game Object...
function GetNewGame(_NewRoomForGame, _P1SocketID, _P2SocketID) {

    //Init and set the basics...
    var _Game = {};
    _Game.RoomName = _NewRoomForGame;
    _Game.CurrScoreDark = 2;
    _Game.CurrScoreLight = 2;
    _Game.CurrMoveNum = 1;
    _Game.BoardArray = CreateArray(8, 8);
    _Game.BoardArray[3][3] = _mTOKENENUM.EMPTYtoLIGHT;
    _Game.BoardArray[4][4] = _mTOKENENUM.EMPTYtoLIGHT;
    _Game.BoardArray[3][4] = _mTOKENENUM.EMPTYtoDARK;
    _Game.BoardArray[4][3] = _mTOKENENUM.EMPTYtoDARK;
    _Game.AddedOn = Date.now();

    //Randomly choose who is Dark and goes first...
    if(Math.random() < 0.5) {
        _Game.PlayerDarkSocketID = _P1SocketID;
        _Game.PlayerLightSocketID = _P2SocketID;
    }
    else {
        _Game.PlayerDarkSocketID = _P2SocketID;
        _Game.PlayerLightSocketID = _P1SocketID;
    }

    //Return the new game object...
    return _Game;
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
                var _Message;
                if(_Player.CurrRoomName === LOBBYROOMNAME) _Message = _Player.Username + ' has left the ' + LOBBYROOMNAME + '.';
                else _Message = _Player.Username + ' has left the game.';

                var _SuccessData = {
                    IsOpSuccess: true,
                    Message: _Message,
                    PlayerData: GetPlayersByRoomName(_Player.CurrRoomName),
                    GameData: GetGameByRoomName(_Player.CurrRoomName)
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

        //Look for an existing Player record...
        var _ExistingPlayer = GetPlayerBySocketID(_Socket.id);

        if(_ExistingPlayer) {
            //If we have an existing Player not in the newly requested RoomName, then leave their old room and update their CurrRoomName value...
            if(_ExistingPlayer.CurrRoomName !== _RoomName) {
                //_Socket.leave(_ExistingPlayer.CurrRoomName);  //ToDo: Disabling this LEAVE since it seems to disconnect the Socket.
                _ExistingPlayer.CurrRoomName = _RoomName;
            }

            //Always clear any NextRoomName value when joining a room...
            _ExistingPlayer.NextRoomName = '';
            _mIsDataDirty = true;
        }
        else {
            //Else, add the new Player to the data...
            AddPlayer(_Socket.id, _Username, _RoomName);
        }

        if(_RoomName === LOBBYROOMNAME) _Message = _RoomName + ' joined by ' + _Username + '.';
        else                            _Message = 'Game joined by ' + _Username + '.';

        //Always update the Lobby!...
        var _SuccessData = {
            IsOpSuccess: true,
            Message: _Message,
            PlayerData: GetPlayersByRoomName(LOBBYROOMNAME)
        }
        log('update_broadcast: ' + JSON.stringify(_SuccessData));
        _mIO.sockets.in(LOBBYROOMNAME).emit('update_broadcast', _SuccessData);

        //If the RoomName is NOT the Lobby, update that room also...
        if(_RoomName !== LOBBYROOMNAME) {
            _SuccessData = {
                IsOpSuccess: true,
                Message: _Message,
                PlayerData: GetPlayersByRoomName(_RoomName),
                GameData: GetGameByRoomName(_RoomName)
            }
            log('update_broadcast: ' + JSON.stringify(_SuccessData));
            _mIO.sockets.in(_RoomName).emit('update_broadcast', _SuccessData);
        }
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
                //Add the invite data...
                _SourcePlayer.InvitesTo.push(_TargetPlayer.SocketID);
                _TargetPlayer.InvitedBy.push(_SourcePlayer.SocketID);
                _Message = _SourcePlayer.Username + ' invites ' + _TargetPlayer.Username + ' to a game.';
                _mIsDataDirty = true;
                break;

            case 'uninvite':
                //Filter out the invite data to uninvite...
                _SourcePlayer.InvitesTo = _SourcePlayer.InvitesTo.filter(function(_SocketID) { return _SocketID !== _TargetPlayer.SocketID; });
                _TargetPlayer.InvitedBy = _TargetPlayer.InvitedBy.filter(function(_SocketID) { return _SocketID !== _SourcePlayer.SocketID; });
                _Message = _SourcePlayer.Username + ' uninvites ' + _TargetPlayer.Username + ' to a game.';
                _mIsDataDirty = true;
                break;

            case 'play':
                //Create a unique, new RoomName for the Game...
                var _NewRoomForGame = _SourcePlayer.Username + '_' + _TargetPlayer.Username + '_' + Date.now();
                _SourcePlayer.NextRoomName = _NewRoomForGame;
                _TargetPlayer.NextRoomName = _NewRoomForGame;
                _Message = _SourcePlayer.Username + ' is playing ' + _TargetPlayer.Username + '.';
                
                //Also remove any relevant 'invite' data by essentially running the 'uninvite' filters above...
                _SourcePlayer.InvitesTo = _SourcePlayer.InvitesTo.filter(function(_SocketID) { return _SocketID !== _TargetPlayer.SocketID; });
                _TargetPlayer.InvitedBy = _TargetPlayer.InvitedBy.filter(function(_SocketID) { return _SocketID !== _SourcePlayer.SocketID; });

                //Add a newly initialized Game to our server data...
                _mData.Games.push(GetNewGame(_NewRoomForGame, _SourcePlayer.SocketID, _TargetPlayer.SocketID));

                //Mark the data as dirty...
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