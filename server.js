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

const BOARDSIZE = 8;
const LOBBYROOMNAME = 'Lobby';
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
            PlayerDark (object:Player; Dark goes first),
            PlayerLight (object:Player; Light goes second),
            CurrScoreDark (number),
            CurrScoreLight (number),
            CurrTurn (number; -1=Dark & 1=Light)
            IsCurrTurnMustPass (boolean)
            IsGameOver (boolean)
            GameMessage (string)
            NumOptionsDark (number; the number of valid move options for Dark)
            NumOptionsLight (number; the number of valid move options for Light)
            BoardArray (object[][]; object is of 'type' BoardLocation), 
            MovesArray (object => X, Y, CurrTurn),
            PlayerExitedUsername (string),
            AddedOn (Date)

  BoardLocation => OccupiedBy (number; -1=>Dark; 0=>Blank; 1=>Light),
  
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

function RemovePlayerFromGame(_SocketID) {
    //Find any relevant Game the player was in...
    var _GameIndex = _mData.Games.findIndex(function(_Game){
        return _Game.PlayerDark.SocketID === _SocketID || _Game.PlayerLight.SocketID === _SocketID;
    });

    if(_GameIndex >= 0) {
        //Game was found...
        if(_mData.Games[_GameIndex].PlayerExitedUsername === '') {
            //First player to exit, so just set the player as exited since there's still another player in the game...
            _mData.Games[_GameIndex].PlayerExitedUsername = GetPlayerBySocketID(_SocketID).Username;
        }
        else {
            //Second player to exit, so remove the Game from the GameData...
            _mData.Games.splice(_GameIndex, 1);
        }

        //Mark data as dirty (updated)...
        _mIsDataDirty = true;
    }
}

//Removes a Game from the Server Data...
function RemoveGame(_RoomName) {
    //Update the Games array by filtering out the unwanted Game...
    _mData.Games = _mData.Games.filter(function(_Game){
        return _Game.RoomName !== _RoomName;
    });
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
function GetNewGame(_NewRoomForGame, _PlayerA, _PlayerB, _BoardSize) {

    //Make sure we have a valid _BoardSize value...
    if(typeof(_BoardSize) !== 'number' || _BoardSize < 6 || _BoardSize % 2 !== 0) {
        _BoardSize = 8; //Default to 8!
    }

    //Init and set the basics...
    var _Game = {};
    _Game.RoomName = _NewRoomForGame;
    _Game.CurrScoreDark = 2;
    _Game.CurrScoreLight = 2;
    _Game.CurrTurn = -1;
    _Game.NumOptionsDark = -1;
    _Game.NumOptionsLight = -1;
    _Game.IsCurrTurnMustPass = false;
    _Game.IsGameOver = false;
    _Game.GameMessage = ''

    //Init the MovesArray...
    _Game.MovesArray = [];

    //Randomly choose who is Dark and goes first...
    if(Math.random() < 0.5) {
        _Game.PlayerDark  = _PlayerA;
        _Game.PlayerLight  = _PlayerB;
    }
    else {
        _Game.PlayerDark = _PlayerB;
        _Game.PlayerLight = _PlayerA;
    }

    //Init an empty BoardArray...
    _Game.BoardArray = CreateArray(_BoardSize, _BoardSize);
    for(var x = 0; x < _BoardSize; x++) {
        for(var y = 0; y < _BoardSize; y++) {
            _Game.BoardArray[x][y] = GetBoardLocation(x, y, 0, -1);
        }
    }
    
    //Define a value for when a player exits...
    _Game.PlayerExitedUsername = '';

    //Define Date/Time values...
    _Game.AddedOn = Date.now();
    _Game.ModifiedOn = Date.now();

    //Make the first four moves...
    var _StartingPoint = (_BoardSize / 2) - 1;  //ie: 8 => (8/2)-1 = 3 OR (10/2)-1 = 4
    ExecuteGameMove(_Game, _StartingPoint+1, _StartingPoint, true);    //Dark  (4,3)
    ExecuteGameMove(_Game, _StartingPoint, _StartingPoint, true);      //Light (3,3)
    ExecuteGameMove(_Game, _StartingPoint, _StartingPoint+1, true);    //Dark  (3,4)
    ExecuteGameMove(_Game, _StartingPoint+1, _StartingPoint+1, false); //Light (4,4)

    //Return the new game object...
    return _Game;
}

function ExecuteGameMove(_Game, _X, _Y, _IsInitMove) {
    _IsInitMove = _IsInitMove || false;

    //Reset Animation and Validity Values...
    _Game.BoardArray.forEach(function(_BoardArrayInner) {
        _BoardArrayInner.forEach(function(_BoardLocation) {
            if(_BoardLocation.X !== _X || _BoardLocation.Y !== _Y) {
                _BoardLocation.AnimationState = -1;
                _BoardLocation.IsValidForDark = false;
                _BoardLocation.IsValidForLight = false;
            }
        });
    });
            
    //Perform BoardLocation Update...
    if(_Game.IsCurrTurnMustPass === false) {
        _Game.BoardArray[_X][_Y] = GetBoardLocation(_X, _Y, _Game.CurrTurn, 0);
        ExecuteTokenFlips(_Game, _X, _Y, _Game.CurrTurn);
    }

    _Game.MovesArray.push({ X:_X, Y:_Y, CurrTurn:_Game.CurrTurn})
    _Game.CurrTurn = _Game.CurrTurn * -1;
    _Game.ModifiedOn = Date.now();

    //Update NumOptions and Score Values...
    _Game.NumOptionsDark = 0;
    _Game.NumOptionsLight = 0;
    _Game.CurrScoreDark = 0;
    _Game.CurrScoreLight = 0;
    for(var x = 0; x < _Game.BoardArray.length; x++) {
        for(var y = 0; y < _Game.BoardArray.length; y++) {
            if(!_IsInitMove) {
                //Find/Calc Options...
                _Game.BoardArray[x][y].IsValidForDark = IsLegalMoveAvailable(_Game, x, y, -1);
                _Game.BoardArray[x][y].IsValidForLight = IsLegalMoveAvailable(_Game, x, y, 1);

                if(_Game.BoardArray[x][y].IsValidForDark)
                    _Game.NumOptionsDark++;

                if(_Game.BoardArray[x][y].IsValidForLight)
                    _Game.NumOptionsLight++;
            }

            //Sum the Scores...
            if(_Game.BoardArray[x][y].OccupiedBy === -1) {
                _Game.CurrScoreDark++;
            }
            else if(_Game.BoardArray[x][y].OccupiedBy === 1) {
                _Game.CurrScoreLight++;
            }
        }
    }

    //Set IsCurrTurnMustPass & IsGameOver...
    if(_IsInitMove) {
        _Game.NumOptionsDark = 4;
        _Game.NumOptionsLight = 4;
    }
    _Game.IsCurrTurnMustPass = (_Game.CurrTurn === -1 && _Game.NumOptionsDark === 0) || (_Game.CurrTurn === 1 && _Game.NumOptionsLight === 0);
    _Game.IsGameOver = _Game.NumOptionsDark === 0 && _Game.NumOptionsLight === 0;

    if(_Game.IsGameOver) {
        if(_Game.CurrScoreDark > _Game.CurrScoreLight)
            _Game.GameMessage = _Game.PlayerDark.Username + ' Wins ' + _Game.CurrScoreDark + ' - ' + _Game.CurrScoreLight + '!';
        else if(_Game.CurrScoreLight > _Game.CurrScoreDark)
            _Game.GameMessage = _Game.PlayerLight.Username + ' Wins ' + _Game.CurrScoreLight + ' - ' + _Game.CurrScoreDark + '!';
        else
            _Game.GameMessage = 'Game Tied! (' + _Game.CurrScoreLight + ' - ' + _Game.CurrScoreDark + ')';
    }
    else if(_Game.IsCurrTurnMustPass && _Game.NumOptionsDark === 0) {
        _Game.GameMessage = _Game.PlayerDark.Username + ' Must Pass';
    }
    else if(_Game.IsCurrTurnMustPass && _Game.NumOptionsLight === 0) {
        _Game.GameMessage = _Game.PlayerLight.Username + ' Must Pass';
    }
    else {
        var _GameMessage = '\'s Move (#' + (_Game.MovesArray.length - 4 + 1) + ')';
        if(_Game.CurrTurn === -1)
            _Game.GameMessage = _Game.PlayerDark.Username + _GameMessage;
        else
            _Game.GameMessage = _Game.PlayerLight.Username + _GameMessage;
    }

    //Set the Server Data as dirty...
    _mIsDataDirty = true;
}

//Performs the token flips according to the move just made at position X,Y...
function ExecuteTokenFlips(_Game, _X, _Y, _CurrColor) {
    //Call FlipTokensDownTheLine for each of the 8 possible directions...
    FlipTokensDownTheLine(_Game, _X, _Y, -1, -1, _CurrColor, 1);    //NW
    FlipTokensDownTheLine(_Game, _X, _Y, -1,  0, _CurrColor, 1);    //NN
    FlipTokensDownTheLine(_Game, _X, _Y, -1,  1, _CurrColor, 1);    //NE
    FlipTokensDownTheLine(_Game, _X, _Y,  0,  1, _CurrColor, 1);    //EE
    FlipTokensDownTheLine(_Game, _X, _Y,  1,  1, _CurrColor, 1);    //SE
    FlipTokensDownTheLine(_Game, _X, _Y,  1,  0, _CurrColor, 1);    //SS
    FlipTokensDownTheLine(_Game, _X, _Y,  1, -1, _CurrColor, 1);    //SW
    FlipTokensDownTheLine(_Game, _X, _Y,  0, -1, _CurrColor, 1);    //WW
}

//Flips any relevant OTHER tokens down a line until it reaches the CURRENT color token...
function FlipTokensDownTheLine(_Game, _X, _Y, _RowDelta, _ColDelta, _CurrColor, _CurrDepth) {
    //Init Vars...
    var _NextX = _X + _RowDelta;
    var _NextY = _Y + _ColDelta;

    //Check non-existent/invalid board position...
    if(IsSpaceExistingOnBoard(_Game, _NextX, _NextY) === false)
        return false;

    //Check for space (ie: 0)...
    if(IsSpaceTheGivenColor(_Game, _NextX, _NextY, 0))
        return false;

    //Check for desired color...
    if(IsSpaceTheGivenColor(_Game, _NextX, _NextY, _CurrColor)) {
        return true;
    }
    else {
        if(FlipTokensDownTheLine(_Game, _NextX, _NextY, _RowDelta, _ColDelta, _CurrColor, _CurrDepth + 1)) {
            _Game.BoardArray[_NextX][_NextY] = GetBoardLocation(_NextX, _NextY, _CurrColor, _CurrDepth);
            return true;
        }
        else {
            return false;
        }
    }
}

//Looks to see if at least one legal move is available for the given X,Y board position...
function IsLegalMoveAvailable(_Game, _X, _Y, _CurrColor) {
    //Step 1: Check if the space is empty...
    if(_Game.BoardArray[_X][_Y].OccupiedBy !== 0)
        return false;

    //Step 2: Check if the empty space has an adjoining space of the OTHER color and then eventually also the CURR color...
    var _RowDelta, _ColDelta;
    var _OthrColor = _CurrColor * -1;

    //Check NW...
    _RowDelta = -1;
    _ColDelta = -1;
    if(IsSpaceTheGivenColor(_Game, _X + _RowDelta, _Y + _ColDelta, _OthrColor) &&                                                          //Check for adjacent OTHER color!
       IsLineEndingInTheGivenColor(_Game, _X + _RowDelta + _RowDelta, _Y + _ColDelta + _ColDelta, _RowDelta, _ColDelta, _CurrColor))            //Check for adjacent+1 CURR color!
        return true;

    //Check NN...
    _RowDelta = -1;
    _ColDelta = 0;
    if(IsSpaceTheGivenColor(_Game, _X + _RowDelta, _Y + _ColDelta, _OthrColor) &&                                                          //Check for adjacent OTHER color!
       IsLineEndingInTheGivenColor(_Game, _X + _RowDelta + _RowDelta, _Y + _ColDelta + _ColDelta, _RowDelta, _ColDelta, _CurrColor))            //Check for adjacent+1 CURR color!
        return true;

    //Check NE...
    _RowDelta = -1;
    _ColDelta = 1;
    if(IsSpaceTheGivenColor(_Game, _X + _RowDelta, _Y + _ColDelta, _OthrColor) &&                                                          //Check for adjacent OTHER color!
       IsLineEndingInTheGivenColor(_Game, _X + _RowDelta + _RowDelta, _Y + _ColDelta + _ColDelta, _RowDelta, _ColDelta, _CurrColor))            //Check for adjacent+1 CURR color!
        return true;

    //Check WW...
    _RowDelta = 0;
    _ColDelta = 1;
    if(IsSpaceTheGivenColor(_Game, _X + _RowDelta, _Y + _ColDelta, _OthrColor) &&                                                          //Check for adjacent OTHER color!
       IsLineEndingInTheGivenColor(_Game, _X + _RowDelta + _RowDelta, _Y + _ColDelta + _ColDelta, _RowDelta, _ColDelta, _CurrColor))            //Check for adjacent+1 CURR color!
        return true;

    //Check SW...
    _RowDelta = 1;
    _ColDelta = 1;
    if(IsSpaceTheGivenColor(_Game, _X + _RowDelta, _Y + _ColDelta, _OthrColor) &&                                                          //Check for adjacent OTHER color!
       IsLineEndingInTheGivenColor(_Game, _X + _RowDelta + _RowDelta, _Y + _ColDelta + _ColDelta, _RowDelta, _ColDelta, _CurrColor))            //Check for adjacent+1 CURR color!
        return true;

    //Check SS...
    _RowDelta = 1;
    _ColDelta = 0;
    if(IsSpaceTheGivenColor(_Game, _X + _RowDelta, _Y + _ColDelta, _OthrColor) &&                                                          //Check for adjacent OTHER color!
       IsLineEndingInTheGivenColor(_Game, _X + _RowDelta + _RowDelta, _Y + _ColDelta + _ColDelta, _RowDelta, _ColDelta, _CurrColor))            //Check for adjacent+1 CURR color!
        return true;

    //Check SE...
    _RowDelta = 1;
    _ColDelta = -1;
    if(IsSpaceTheGivenColor(_Game, _X + _RowDelta, _Y + _ColDelta, _OthrColor) &&                                                          //Check for adjacent OTHER color!
       IsLineEndingInTheGivenColor(_Game, _X + _RowDelta + _RowDelta, _Y + _ColDelta + _ColDelta, _RowDelta, _ColDelta, _CurrColor))            //Check for adjacent+1 CURR color!
        return true;

    //Check EE...
    _RowDelta = 0;
    _ColDelta = -1;
    if(IsSpaceTheGivenColor(_Game, _X + _RowDelta, _Y + _ColDelta, _OthrColor) &&                                                          //Check for adjacent OTHER color!
       IsLineEndingInTheGivenColor(_Game, _X + _RowDelta + _RowDelta, _Y + _ColDelta + _ColDelta, _RowDelta, _ColDelta, _CurrColor))            //Check for adjacent+1 CURR color!
        return true;

    return false;
}

//Checks if a given X,Y is a position that exists on our BoardArray...
function IsSpaceExistingOnBoard(_Game, _X, _Y) {
    return _X >= 0 && _X < _Game.BoardArray.length &&
           _Y >= 0 && _Y < _Game.BoardArray.length;
}

//Check if we have a valid board position AND that it contains the given color...
function IsSpaceTheGivenColor(_Game, _X, _Y, _ColorToCheck) {
    return IsSpaceExistingOnBoard(_Game, _X, _Y) && 
           _Game.BoardArray[_X][_Y].OccupiedBy === _ColorToCheck;
}

//Beginning at the X,Y position and moving according to the RowDelta and ColDelta values, try to find the given color...
function IsLineEndingInTheGivenColor(_Game, _X, _Y, _RowDelta, _ColDelta, _ColorToFindAtEnd) {

    //Check if we've moved off the board (ie: => FALSE)...
    if(IsSpaceExistingOnBoard(_Game, _X, _Y) === false)
        return false;

    //Check if we've encountered a space (ie: => FALSE)...
    else if(IsSpaceTheGivenColor(_Game, _X, _Y, 0))
        return false;
        
    //Check if we've encountered the color we're searching for (ie: => TRUE)...
    else if (IsSpaceTheGivenColor(_Game, _X, _Y, _ColorToFindAtEnd))
        return true;

    //Make a recursive call to check the next position in our given direction...
    else
        return IsLineEndingInTheGivenColor(_Game, _X + _RowDelta, _Y + _ColDelta, _RowDelta, _ColDelta, _ColorToFindAtEnd);
}

//Builds a BoardLocation object based on X (row), Y (column), OccupiedBy (-1=>Dark; 0=>Blank; 1=>Light), & AnimationState (-1=>None; 0=>New; 1+=>OrderOfAnimation)
function GetBoardLocation(_X, _Y, _OccupiedBy, _AnimationState) {

    var _BoardLocation = {};

    if(_OccupiedBy !== -1 && _OccupiedBy !== 1) {
        _OccupiedBy = 0;
    }

    _BoardLocation.X = _X;
    _BoardLocation.Y = _Y;
    _BoardLocation.OccupiedBy = _OccupiedBy;
    _BoardLocation.AnimationState = _AnimationState;
    _BoardLocation.IsValidForDark = false;
    _BoardLocation.IsValidForLight = false;

    return _BoardLocation;
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
        var _PrevRoomName = '';

        if(_ExistingPlayer) {
            //If we have an existing Player not in the newly requested RoomName, then leave their old room and update their CurrRoomName value...
            if(_ExistingPlayer.CurrRoomName !== _RoomName) {
                //_Socket.leave(_ExistingPlayer.CurrRoomName);  //ToDo: Disabling this LEAVE since it seems to disconnect the Socket.
                _PrevRoomName = _ExistingPlayer.CurrRoomName;   //Save the Prev Room since BOTH need to be updated.
                _ExistingPlayer.CurrRoomName = _RoomName;       //Switch the user to their new room.

                if(_ExistingPlayer.CurrRoomName === LOBBYROOMNAME) {
                    //Player moving from Game to Lobby, so remove from any Games...
                    RemovePlayerFromGame(_ExistingPlayer.SocketID);
                }
            }

            //Always clear any NextRoomName value when joining a room...
            _ExistingPlayer.NextRoomName = '';
            _mIsDataDirty = true;
        }
        else {
            //Else, add the new Player to the data...
            AddPlayer(_Socket.id, _Username, _RoomName);
        }

        if(_RoomName === LOBBYROOMNAME && _PrevRoomName === '') _Message = _RoomName + ' joined by ' + _Username + '.';
        else if(_RoomName === LOBBYROOMNAME && _PrevRoomName !== '') _Message = _Username + ' left game and returned to ' + LOBBYROOMNAME + '.';
        else                            _Message = 'Game joined by ' + _Username + '.';

        //Always update the room being moved to!...
        var _SuccessData = {
            IsOpSuccess: true,
            Message: _Message,
            PlayerData: GetPlayersByRoomName(_RoomName),
            GameData: GetGameByRoomName(_RoomName)
        }
        log('update_broadcast: ' + JSON.stringify(_SuccessData));
        _mIO.sockets.in(_RoomName).emit('update_broadcast', _SuccessData);

        //If there was a room change, update the old room too...
        if(_PrevRoomName !== '') {
            _SuccessData = {
                IsOpSuccess: true,
                Message: _Message,
                PlayerData: GetPlayersByRoomName(_PrevRoomName),
                GameData: GetGameByRoomName(_PrevRoomName)
            }
            log('update_broadcast: ' + JSON.stringify(_SuccessData));
            _mIO.sockets.in(_PrevRoomName).emit('update_broadcast', _SuccessData);
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
                
                //Also remove any relevant 'invite' data by essentially running the 'uninvite' filters above, but in REVERSE (ie: Source was the player InvitedBy Target)...
                _SourcePlayer.InvitedBy = _SourcePlayer.InvitedBy.filter(function(_SocketID) { return _SocketID !== _TargetPlayer.SocketID; });
                _TargetPlayer.InvitesTo = _TargetPlayer.InvitesTo.filter(function(_SocketID) { return _SocketID !== _SourcePlayer.SocketID; });

                //Remove the players from any previous games...
                RemovePlayerFromGame(_SourcePlayer.SocketID);
                RemovePlayerFromGame(_TargetPlayer.SocketID);

                //Add a newly initialized Game to our server data...
                _mData.Games.push(GetNewGame(_NewRoomForGame, _SourcePlayer, _TargetPlayer, BOARDSIZE));

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

    //_Payload: X, Y, CurrTurn
    _Socket.on('try_move', function (_Payload) {
        log('Server Received Command', 'try_move', _Payload);

        var _Message = '';

        if (typeof _Payload === 'undefined' || !_Payload) {
            _Message = 'No Payload Received - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'try_move', Message: _Message });
            return;
        }

        var _Player = GetPlayerBySocketID(_Socket.id);
        if (typeof _Player === 'undefined' || !_Player) {
            _Message = 'Player Could NOT Be Found - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'try_move', Message: _Message });
            return;
        }

        var _Game = GetGameByRoomName(_Player.CurrRoomName);
        if (typeof _Game === 'undefined' || !_Game) {
            _Message = 'Game Could NOT Be Found - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'try_move', Message: _Message });
            return;
        }

        //NOTE: We allow X=Y = -1 for the PASS move...
        if (typeof _Payload.X === 'undefined' || _Payload.X < -1 || _Payload.X >= _Game.BoardArray.length || 
            typeof _Payload.Y === 'undefined' || _Payload.Y < -1 || _Payload.Y >= _Game.BoardArray.length) {
            _Message = 'Invalid X/Y Position Received - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'try_move', Message: _Message });
            return;
        }

        if (_Game.CurrTurn !== _Payload.CurrTurn || 
            (_Game.CurrTurn === -1 && _Player.Username !== _Game.PlayerDark.Username) ||
            (_Game.CurrTurn === 1 && _Player.Username !== _Game.PlayerLight.Username)) {
            _Message = 'Invalid Player/Turn for Move - Command Aborted';
            log(_Message);
            _Socket.emit('error_response', { IsOpSuccess: false, ActionName:'try_move', Message: _Message });
            return;
        }

        //Add a message when a "Pass Turn" is played to make that more obvious to the players...
        if(_Payload.X === -1 && _Payload.Y === -1)
            _Message = _Player.Username + ' had to pass.';

        //All seems good, execute the move by placing the CurrTurn value into the desired X/Y location...
        ExecuteGameMove(_Game, _Payload.X, _Payload.Y);

        //Add a message when the game is over to help make that super obvious too...
        if(_Game.IsGameOver && _Game.GameMessage)
            _Message = _Game.GameMessage;

        //Respond...
        var _SuccessData = {
            IsOpSuccess: true,
            Message: _Message,
            PlayerData: GetPlayersByRoomName(_Player.CurrRoomName),
            GameData: GetGameByRoomName(_Player.CurrRoomName)
        }
        log('update_broadcast: ' + JSON.stringify(_SuccessData));
        _mIO.sockets.in(_Player.CurrRoomName).emit('update_broadcast', _SuccessData);
    });

    //_Payload: NONE! (no payload passed as we just need to regenerate a fresh Game object)
    _Socket.on('replay', function (_Payload) {
        log('Server Received Command', 'replay');

        var _BoardSize = BOARDSIZE;

        if(_Payload && _Payload.BoardSize)
            _BoardSize = _Payload.BoardSize;

        //Make sure we have a valid _BoardSize value...
        if(typeof(_BoardSize) !== 'number' || _BoardSize < 6 || _BoardSize % 2 !== 0) {
            _BoardSize = 8; //Default to 8!
        }
        
        //Get the Player object...
        var _Player = GetPlayerBySocketID(_Socket.id);

        //Get the previous Game object...
        var _OldGame = GetGameByRoomName(_Player.CurrRoomName);

        //Use the previous Game object to pass inputs to get a NEW Game object...
        var _NewGame = GetNewGame(_OldGame.RoomName, _OldGame.PlayerDark, _OldGame.PlayerLight, _BoardSize);

        //Remove the Previous Game from the Server's Games array...
        RemoveGame(_OldGame.RoomName);

        //Add the new Game to the Server's Games array...
        _mData.Games.push(_NewGame);
        
        //Mark the data as dirty...
        _mIsDataDirty = true;

        //Respond...
        var _SuccessData = {
            IsOpSuccess: true,
            Message: 'New Game Created!',
            PlayerData: GetPlayersByRoomName(_NewGame.RoomName),
            GameData: GetGameByRoomName(_NewGame.RoomName)
        }
        log('update_broadcast: ' + JSON.stringify(_SuccessData));
        _mIO.sockets.in(_NewGame.RoomName).emit('update_broadcast', _SuccessData);
    });
});