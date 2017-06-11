import React from 'react';
import io from 'socket.io-client';

//import { IKeyedCollection } from './IKeyedCollection';
//import { KeyedCollection } from './IKeyedCollection';

import { Nav } from './Nav';
import { Home } from './Home';
import { About } from './About';
import { Rules } from './Rules';
import { Name } from './Name';
import { Lobby } from './Lobby';
import { Chat } from './Chat';
import { Game } from './Game';

import './lib/reset.less';
import './App.less';

//Enum of "pages" within the app...
export enum PageKey {
	Home,
	About,
	Rules,
	Name,
	Lobby,
    Game
}

//Defines the Player data structure...
export interface IPlayer {
    SocketID: string;
    Username: string;
    CurrRoomName: string;
    NextRoomName: string;
    InvitesTo: string[];
    InvitedBy: string[];
    AddedOn: Date;
}

//Defines the Game data structure...
export interface IGame {
    RoomName: string;
    PlayerDark: IPlayer;
    PlayerLight: IPlayer;
    CurrScoreDark: number;
    CurrScoreLight: number;
    CurrTurn: number;
    IsCurrTurnMustPass: boolean;
    IsGameOver: boolean;
    GameOverMessage: string;
    NumOptionsDark: number;
    NumOptionsLight: number;
    BoardArray: IBoardLocation[][];
    MovesArray: IMove[];
    PlayerExitedUsername: string;
    AddedOn: Date;
    ModifiedOn: Date;
}

//Defines a single Location (square) on the Game's BoardArray...
export interface IBoardLocation {
    X: number;
    Y: number;
    OccupiedBy: number;
    AnimationState: number;
    IsValidForDark: Boolean;
    IsValidForLight: Boolean;
}

export interface IMove {
    X: number;
    Y: number;
    CurrTurn: number;
}

//Interface of what a chat message is...
export interface IChatMsg {
    Username: string;
    Message: string;
    AddedOn: Date;
}

//Received from Server for important data response like joining/disconnecting from rooms... (not for chat responses)
interface IServerDataResponse {
    IsOpSuccess: boolean;
    ActionName: string;
    Message: string;
    PlayerData: IPlayer[];
    GameData: IGame;
}

//Sent to Server when the user takes a Lobby Action...
interface ILobbyAction {
    ActionName: string;
    SourceSocketID: string;
    TargetSocketID: string;
}

//Sent to Server when the user joins a room...
interface IJoinRoom {
    RoomName: string;
    Username: string;
}

//Sent to Server when the user trys to make a move...
interface ITryMove {
    X: number;
    Y: number;
    CurrTurn: number;
}

//Sent to Server when the user chats out a new message...
interface ISendMessage {
    RoomName: string;
    Username: string;
    Message: string;
}

//Received from Server when someone chats out a message...
interface ISendMessageResponse {
    IsOpSuccess: boolean;
    Message: string;
    RoomName: string;
    Username: string;
}

//Overall application state structure...
interface AppState {
    ActivePage: PageKey;
    PlayerName: string;
    NewChatMsgVal: string;
    ChatMsgs: IChatMsg[];
    PlayerData: IPlayer[];
    GameData: IGame;
}

const LOBBYROOMNAME: string = 'Lobby';
const NAMEDARKCOLOR: string = 'Blue';
const NAMELIGHTCOLOR: string = 'Gold';

export class App extends React.Component<{}, AppState> {

    private mSocket: SocketIOClient.Socket;

    constructor() {
        super();

        //Init Client Socket.IO...
        this.mSocket = io();

        //Handle web socket event for log...
        this.mSocket.on('log', (e: any): void => {
            console.log.apply(console, e);
        });

        //Handle web socket event for join_room_response...
        this.mSocket.on('error_response', (e: IServerDataResponse): void => {
            //Logging and Error Handling...
            console.log('error_response: ' + JSON.stringify(e));
            if (!e.IsOpSuccess && e.ActionName && e.Message) {
                alert(e.ActionName + ': ' + e.Message);
                return;
            }
        });

        //Handle web socket event for player_disconnect...
        this.mSocket.on('update_broadcast', (e: IServerDataResponse): void => {
            //Logging and Error Handling...
            console.log('update_broadcast: ' + JSON.stringify(e));
            this.UpdateAppStateFromServerData(e);
        });

        //Handle web socket response for send_message_broadcast...
        this.mSocket.on('send_message_broadcast', (e: ISendMessageResponse): void => {
            //Logging and Error Handling...
            console.log('send_message_broadcast: ' + JSON.stringify(e));
            if (e.IsOpSuccess) {
                //Update ChatMsgs...
                let _NewChatMsgs: IChatMsg[] = this.state.ChatMsgs.slice();
                if(e.Message && e.Message !== '') {
                    _NewChatMsgs.push({ Username:e.Username, Message:e.Message, AddedOn:new Date() });
                }

                //Update State...
                if(e.Username === this.state.PlayerName) {
                    //Update NewChatMsgVal to '' if the message received is from the current/active player...
                    this.setState({
                        NewChatMsgVal: '',
                        ChatMsgs: _NewChatMsgs
                    });
                }
                else {
                    this.setState({
                        ChatMsgs: _NewChatMsgs
                    });
                }
            }
        });
    }

    //Set initial App state...
    state = {
        ActivePage: PageKey.Home,
        PlayerName: '',
        NewChatMsgVal: '',
        ChatMsgs: [],
        PlayerData: []
    } as AppState;

    //Get the active Player using the PlayerName from the AppState...
    public GetActivePlayer = () => {
        return this.GetActivePlayerFromPlayerArray(this.state.PlayerData);
    }

    //Get the active Player using the PlayerName from the AppState...
    public GetActivePlayerFromPlayerArray = (_PlayerData:IPlayer[]) => {
        return _PlayerData.find(_Player => _Player.Username === this.state.PlayerName);
    }

    //Get Player by SocketID...
    public GetPlayerBySocketID = (_SocketID:string) => {
        return this.state.PlayerData.find(_Player => _Player.SocketID === _SocketID);
    }

    private EmitLobbyAction = (_LobbyAction:ILobbyAction) => {
        console.log(_LobbyAction.ActionName + ' ' + _LobbyAction.SourceSocketID + '->' + _LobbyAction.TargetSocketID);
        this.mSocket.emit('lobby_action', _LobbyAction);
    }

    //Updates application state based on new data from the server...
    private UpdateAppStateFromServerData = (e: IServerDataResponse) => {
        if (!e.IsOpSuccess) {
            alert(e.Message);
            return;
        }

        //Update ChatMsgs...
        let _NewChatMsgs: IChatMsg[] = this.state.ChatMsgs.slice();
        if(e.Message && e.Message !== '') {
            _NewChatMsgs.push({ Username:'SYSTEM', Message:e.Message, AddedOn:new Date() });
        }

        //Get the Active Player and Current Active PageKey...
        let _ActivePlayer = this.GetActivePlayerFromPlayerArray(e.PlayerData);
        let _CurrPageKey = this.state.ActivePage;

        //If the ActivePlayer isn't in the Lobby, then go to the Game "page"...
        if(_ActivePlayer.CurrRoomName && _ActivePlayer.CurrRoomName !== LOBBYROOMNAME) {
            _CurrPageKey = PageKey.Game;
        }
        
        //Update State...
        this.setState({
            ActivePage: _CurrPageKey,
            ChatMsgs: _NewChatMsgs,
            PlayerData: e.PlayerData,
            GameData: e.GameData
        });

        if(_ActivePlayer.NextRoomName !== '') {
            let _JoinPayload: IJoinRoom = { RoomName: _ActivePlayer.NextRoomName, Username: this.state.PlayerName };
            console.log('JoinPayload: ' + JSON.stringify(_JoinPayload));
            this.mSocket.emit('join_room', _JoinPayload);
        }
    }
    
    //Nav Component Handler(s)...
    private handleNavAction = (pageKey: PageKey) => {
        if (this.state.ActivePage !== pageKey) {
            this.setState({
                ActivePage: pageKey
            });
        }
    }

    //Name Component Handler(s)...
    private handleNameChangeEvent = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            PlayerName: e.currentTarget.value
        });
    }

    private handleNameSubmitEvent = (e: React.FormEvent<HTMLButtonElement>) => {
        if (this.state.PlayerName === '') {
            this.setState({
                PlayerName: 'Anonymous' + Math.floor(Math.random() * 10000),
            });
        }

        let _JoinPayload: IJoinRoom = { RoomName: LOBBYROOMNAME, Username: this.state.PlayerName };
        console.log('JoinPayload: ' + JSON.stringify(_JoinPayload));
        this.mSocket.emit('join_room', _JoinPayload);
        
        this.setState({
            ActivePage: PageKey.Lobby,
        });
    }

    //Lobby Component Handler(s)...
    private handleLobbyInvite = (e: React.FormEvent<HTMLButtonElement>) => {
        let _Payload: ILobbyAction = { ActionName:'invite', SourceSocketID:this.GetActivePlayer().SocketID, TargetSocketID:e.currentTarget.value };
        this.EmitLobbyAction(_Payload);
    }

    private handleLobbyUninvite = (e: React.FormEvent<HTMLButtonElement>) => {
        let _Payload: ILobbyAction = { ActionName:'uninvite', SourceSocketID:this.GetActivePlayer().SocketID, TargetSocketID:e.currentTarget.value };
        this.EmitLobbyAction(_Payload);
    }

    private handleLobbyPlay = (e: React.FormEvent<HTMLButtonElement>) => {
        let _Payload: ILobbyAction = { ActionName:'play', SourceSocketID:this.GetActivePlayer().SocketID, TargetSocketID:e.currentTarget.value };
        this.EmitLobbyAction(_Payload);
    }

    //Game Component Handler(s)...
    private handleGamePlay = (BoardSize: number) => {
        this.mSocket.emit('replay', { BoardSize: BoardSize });
    }

    private handleGameQuit = (e: React.FormEvent<HTMLButtonElement>) => {

        var _GameData = this.state.GameData;

        let _Payload: IJoinRoom = { RoomName: LOBBYROOMNAME, Username: this.state.PlayerName };
        console.log('JoinRoom: ' + JSON.stringify(_Payload));
        this.mSocket.emit('join_room', _Payload);

        this.setState({
            ActivePage: PageKey.Lobby,
            GameData: _GameData
        });
    }

    //GameSquare Component Handler(s)...
    private handleGameSquareClick = (BoardLocation: IBoardLocation, CurrTurn: number) => {
        let _Payload: ITryMove = { X: BoardLocation.X, Y: BoardLocation.Y, CurrTurn: CurrTurn };
        console.log('TryMove: ' + JSON.stringify(_Payload));
        this.mSocket.emit('try_move', _Payload);
    }

    private handleChatMsgSubmitEvent = (e: React.FormEvent<HTMLButtonElement>) => {
        let _ChatPayload: ISendMessage = { RoomName: LOBBYROOMNAME, Username: this.state.PlayerName, Message: e.currentTarget.value };
        console.log('ChatPayload: ' + JSON.stringify(_ChatPayload));
        this.mSocket.emit('send_message', _ChatPayload);
    }

    //Main App render() method...
	render() {
        const { ActivePage } = this.state;

        //Get the correct "Page" Component to return for the App's main render() method.
        const renderPageComponent = (pageKey: PageKey) => {
            switch (pageKey) {
                case PageKey.About:
                    return <About onNavigate={this.handleNavAction} />;

                case PageKey.Rules:
                    return <Rules onNavigate={this.handleNavAction} />;

                case PageKey.Name:
                    return <Name onNavigate={this.handleNavAction} 
                                 onNameChange={this.handleNameChangeEvent} 
                                 onNameSubmit={this.handleNameSubmitEvent} 
                                 PlayerName={this.state.PlayerName} />;

                case PageKey.Lobby:
                    return <div id="LobbyChat">
                            <Lobby onNavigate={this.handleNavAction} 
                                   onInvite={this.handleLobbyInvite} 
                                   onUninvite={this.handleLobbyUninvite}
                                   onPlay={this.handleLobbyPlay}
                                   GetActivePlayer={this.GetActivePlayer}
                                   LobbyRoomName={LOBBYROOMNAME}
                                   PlayerName={this.state.PlayerName} 
                                   PlayerData={this.state.PlayerData} />
                            <Chat  onNavigate={this.handleNavAction} 
                                   onMsgSubmit={this.handleChatMsgSubmitEvent} 
                                   PlayerName={this.state.PlayerName} 
                                   NewChatMsgVal={this.state.NewChatMsgVal} 
                                   ChatMsgs={this.state.ChatMsgs} />
                           </div>;

                case PageKey.Game:
                    return <div id="GameChat">
                            <Game  onNavigate={this.handleNavAction} 
                                   onReplay={this.handleGamePlay}
                                   onQuit={this.handleGameQuit}
                                   onGameSquareClick={this.handleGameSquareClick}
                                   ActivePlayer={this.GetActivePlayer()} 
                                   GameData={this.state.GameData} />
                            <Chat  onNavigate={this.handleNavAction} 
                                   onMsgSubmit={this.handleChatMsgSubmitEvent} 
                                   PlayerName={this.state.PlayerName} 
                                   NewChatMsgVal={this.state.NewChatMsgVal} 
                                   ChatMsgs={this.state.ChatMsgs} />
                           </div>;

                default:
                    return <Home onNavigate={this.handleNavAction} />;
            }
        };

        return (
            <div className="App container add-row-spacing">
                <header>
                    <Nav ActivePage={ActivePage} onNavigate={this.handleNavAction} />
                </header>
                <main>
                    {renderPageComponent(ActivePage)}
                </main>
                <footer>
                    <div className="row text-center">
                        <div className="col">
                            <span>
                                By <a href="http://aaronsoto.com" target="_blank">Aaron Soto <i className="fa fa-external-link" aria-hidden="true"></i></a><br />
                                For <a href="http://mhcid.ics.uci.edu/" target="_blank">UC Irvine's MHCID Program <i className="fa fa-external-link" aria-hidden="true"></i></a><br />
                                <a href="https://github.com/deztech/reversi-react" target="_blank">GitHub.com/deztech/reversi-react <i className="fa fa-external-link" aria-hidden="true"></i></a><br />
                                <a href="/serverdata.json" target="_blank">View Server Data (JSON) <i className="fa fa-external-link" aria-hidden="true"></i></a>
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        );
	}
}