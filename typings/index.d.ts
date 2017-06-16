declare module 'react.timer';
declare module 'react-audio-player';

//Defines the Game data structure...
declare interface IGame {
    RoomName: string;
    PlayerDark: IPlayer;
    PlayerLight: IPlayer;
    CurrScoreDark: number;
    CurrScoreLight: number;
    CurrTurn: number;
    IsCurrTurnMustPass: boolean;
    IsGameOver: boolean;
    GameMessage: string;
    NumOptionsDark: number;
    NumOptionsLight: number;
    BoardArray: IBoardLocation[][];
    MovesArray: IMove[];
    PlayerExitedUsername: string;
    AddedOn: Date;
    ModifiedOn: Date;
}

// Defines the Player data structure...
declare interface IPlayer {
    SocketID: string;
    Username: string;
    CurrRoomName: string;
    NextRoomName: string;
    InvitesTo: string[];
    InvitedBy: string[];
    AddedOn: Date;
}

//Defines a single Location (square) on the Game's BoardArray...
declare interface IBoardLocation {
    X: number;
    Y: number;
    OccupiedBy: number;
    AnimationState: number;
    IsValidForDark: Boolean;
    IsValidForLight: Boolean;
}

//Interface of what a chat message is...
declare interface IChatMsg {
    Username: string;
    Message: string;
    AddedOn: Date;
}

declare interface IMove {
    X: number;
    Y: number;
    CurrTurn: number;
}

//Sent to Server when the user takes a Lobby Action...
declare interface ILobbyAction {
    ActionName: string;
    SourceSocketID: string;
    TargetSocketID: string;
}

//Sent to Server when the user joins a room...
declare interface IJoinRoom {
    RoomName: string;
    Username: string;
}

//Sent to Server when the user chats out a new message...
declare interface ISendMessage {
    RoomName: string;
    Username: string;
    Message: string;
}

//Received from Server when someone chats out a message...
declare interface ISendMessageResponse {
    IsOpSuccess: boolean;
    Message: string;
    RoomName: string;
    Username: string;
}

//Received from Server for important data response like joining/disconnecting from rooms... (not for chat responses)
declare interface IServerDataResponse {
    IsOpSuccess: boolean;
    ActionName: string;
    Message: string;
    PlayerData: IPlayer[];
    GameData: IGame;
}