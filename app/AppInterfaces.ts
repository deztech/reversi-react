//Enum of "pages" within the app...
export enum PageKey {
	Home,
	About,
	Rules,
	Name,
	Lobby,
    Game
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

//Defines a single Location (square) on the Game's BoardArray...
export interface IBoardLocation {
    X: number;
    Y: number;
    OccupiedBy: number;
    AnimationState: number;
    IsValidForDark: Boolean;
    IsValidForLight: Boolean;
}

//Interface of what a chat message is...
export interface IChatMsg {
    Username: string;
    Message: string;
    AddedOn: Date;
}

export interface IMove {
    X: number;
    Y: number;
    CurrTurn: number;
}

//Sent to Server when the user takes a Lobby Action...
export interface ILobbyAction {
    ActionName: string;
    SourceSocketID: string;
    TargetSocketID: string;
}

//Sent to Server when the user joins a room...
export interface IJoinRoom {
    RoomName: string;
    Username: string;
}

//Sent to Server when the user chats out a new message...
export interface ISendMessage {
    RoomName: string;
    Username: string;
    Message: string;
}

//Received from Server when someone chats out a message...
export interface ISendMessageResponse {
    IsOpSuccess: boolean;
    Message: string;
    RoomName: string;
    Username: string;
}

//Received from Server for important data response like joining/disconnecting from rooms... (not for chat responses)
export interface IServerDataResponse {
    IsOpSuccess: boolean;
    ActionName: string;
    Message: string;
    PlayerData: IPlayer[];
    GameData: IGame;
}