import React from 'react';
import io from 'socket.io-client';

import { Nav } from './Nav';
import { Home } from './Home';
import { About } from './About';
import { Rules } from './Rules';
import { Name } from './Name';
import { Lobby } from './Lobby';

import './lib/reset.less';
import './App.less';

export enum PageKey {
	Home,
	About,
	Rules,
	Name,
	Lobby
}

export interface LobbyMember {
    timestamp: Date;
    socketid: string;
    username: string;
}

export interface ChatMsg {
    timestamp: Date;
    username: string;
    message: string;
}

export interface IJoinRoom {
    room: string;
    username: string;
}

export interface IJoinRoomResponse {
    result: string;
    message: string;
    room: string;
    socketid: string;
    username: string;
    membership: number;
    members: LobbyMember[];
}

export interface IDisconnectResponse {
    socketid: string;
    username: string;
    membership: number;
    members: LobbyMember[];
}

export interface ISendMessage {
    room: string;
    username: string;
    message: string;
}

export interface ISendMessageResponse {
    result: string;
    message: string;
    room: string;
    username: string;
}

interface AppState {
    ActivePage: PageKey;
    PlayerName: string;
    NewChatMsgVal: string;
    LobbyMembers: LobbyMember[];
    ChatMsgs: ChatMsg[];
    Socket: any;
}

const LOBBYROOMNAME: string = 'Lobby';

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
        this.mSocket.on('join_room_response', (e: IJoinRoomResponse): void => {
            //Logging and Error Handling...
            console.log('join_room_response: ' + JSON.stringify(e));
            if (e.result === 'fail') {
                alert(e.message);
                return;
            }

            // //Update LobbyMembers...
            // let _NewLobbyMembers: LobbyMember[] = this.state.LobbyMembers.slice();
            // _NewLobbyMembers.push({ timestamp:Date.now(), socketid:e.socketid, username:e.username });

            //Update ChatMsgs...
            let _NewChatMsgs: ChatMsg[] = this.state.ChatMsgs.slice();
            _NewChatMsgs.push({ timestamp:new Date(), username:e.username, message:'Has joined the ' + LOBBYROOMNAME + '!' });
            
            //Update State...
            this.setState({
                LobbyMembers: e.members,
                ChatMsgs: _NewChatMsgs
            });
        });

        //Handle web socket event for join_room_response...
        this.mSocket.on('disconnect_response', (e: IDisconnectResponse): void => {
            //Logging and Error Handling...
            console.log('disconnect_response: ' + JSON.stringify(e));

            //Update ChatMsgs...
            let _NewChatMsgs: ChatMsg[] = this.state.ChatMsgs.slice();
            _NewChatMsgs.push({ timestamp:new Date(), username:e.username, message:'Has left the ' + LOBBYROOMNAME + '!' });
            
            //Update State...
            this.setState({
                LobbyMembers: e.members,
                ChatMsgs: _NewChatMsgs
            });
        });

        //Handle web socket response for send_message...
        this.mSocket.on('send_message_response', (e: ISendMessageResponse): void => {
            //Logging and Error Handling...
            console.log('send_message_response: ' + JSON.stringify(e));
            if (e.result === 'fail') {
                alert(e.message);
                return;
            }

            //Update NewChatMsgVal to '' if the message received is from the current/active player...
            let _NewChatMsgVal = this.state.NewChatMsgVal;
            if(e.username === this.state.PlayerName) {
                _NewChatMsgVal = '';
            }

            //Update ChatMsgs...
            let _NewChatMsgs: ChatMsg[] = this.state.ChatMsgs.slice();
            _NewChatMsgs.push({ timestamp:new Date(), username:e.username, message:e.message });
            
            //Update State...
            this.setState({
                NewChatMsgVal: _NewChatMsgVal,
                ChatMsgs: _NewChatMsgs
            });
        });
    }

    //Set initial App state...
    state = {
        ActivePage: PageKey.Home,
        PlayerName: '',
        NewChatMsgVal: '',
        LobbyMembers: [],
        ChatMsgs: []
    } as AppState;
    
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
            this.state.PlayerName = 'Anonymous' + Math.floor(Math.random() * 10000);
        }
        this.setState({
            ActivePage: PageKey.Lobby,
        });
    }

    //Lobby Component Handler(s)...
    private handleLobbyLoad = () => {
        let _JoinPayload: IJoinRoom = { room: LOBBYROOMNAME, username: this.state.PlayerName };
        console.log('JoinPayload: ' + JSON.stringify(_JoinPayload));
        this.mSocket.emit('join_room', _JoinPayload);
    }

    private handleLobbyMsgChangeEvent = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            NewChatMsgVal: e.currentTarget.value
        });
    }

    private handleLobbyMsgSubmitEvent = (e: React.FormEvent<HTMLButtonElement>) => {
        let _ChatPayload: ISendMessage = { room: LOBBYROOMNAME, username: this.state.PlayerName, message: this.state.NewChatMsgVal };
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
                    return <Lobby onNavigate={this.handleNavAction} 
                                onLoad={this.handleLobbyLoad} 
                                onMsgChange={this.handleLobbyMsgChangeEvent} 
                                onMsgSubmit={this.handleLobbyMsgSubmitEvent} 
                                PlayerName={this.state.PlayerName} 
                                NewChatMsgVal={this.state.NewChatMsgVal} 
                                ChatMsgs={this.state.ChatMsgs}
                                LobbyMembers={this.state.LobbyMembers} />;

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
                                <a href="https://github.com/deztech/reversi-react" target="_blank">GitHub.com/deztech/reversi-react <i className="fa fa-external-link" aria-hidden="true"></i></a>
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        );
	}
}