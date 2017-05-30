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

interface AppState {
    activePage: PageKey;
    playerName: string;
    currChatMsg: string;
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
        this.mSocket.on('join_room_response', (e: any): void => {
            console.log('join_room_response: ' + JSON.stringify(e));
            if (e.result === 'fail') {
                alert(e.message);
                return;
            }
            this.setState({
                currChatMsg: '<em>' + e.username + ' has joined the ' + e.room + '!</em>'
            });
        });

        //Handle web socket response for send_message...
        this.mSocket.on('send_message_response', (e: any): void => {
            console.log('send_message_response: ' + JSON.stringify(e));
            if (e.result === 'fail') {
                alert(e.message);
                return;
            }
            this.setState({
                currChatMsg: '<strong>' + e.username + ':</strong> ' + e.message
            });
        });
    }

    //Set initial App state...
    state = {
        activePage: PageKey.Home,
        playerName: '',
        currChatMsg: ''
    } as AppState;
    
    //Nav Component Handler(s)...
    private handleNavAction = (pageKey: PageKey) => {
        if (this.state.activePage !== pageKey) {
            this.setState({
                activePage: pageKey
            });
        }
    }

    //Name Component Handler(s)...
    private handleNameChangeEvent = (e: any) => {
        this.setState({
            playerName: e.target.value
        });
    }

    private handleNameSubmitEvent = (e: any) => {
        if (this.state.playerName === '') {
            this.state.playerName = 'Anonymous' + Math.floor(Math.random() * 10000);
        }
        this.setState({
            activePage: PageKey.Lobby,
        });
    }

    //Lobby Component Handler(s)...
    private handleLobbyLoad = () => {
        var _JoinPayload: any = { room: LOBBYROOMNAME, username: this.state.playerName };
        console.log('JoinPayload: ' + JSON.stringify(_JoinPayload));
        this.mSocket.emit('join_room', _JoinPayload);
    }

    private handleLobbyMsgChangeEvent = (e: any) => {
        this.setState({
            currChatMsg: e.target.value
        });
    }

    private handleLobbyMsgSubmitEvent = (e: any) => {
        var _ChatPayload: any = { room: LOBBYROOMNAME, username: this.state.playerName, message: this.state.currChatMsg };
        console.log('ChatPayload: ' + JSON.stringify(_ChatPayload));
        this.mSocket.emit('send_message', _ChatPayload);
    }

    //Method to get the correct "Page" Component to return for the App's main render() method.
    private getPageComponent(pageKey: PageKey) {
        switch (pageKey) {
            case PageKey.About:
                return <About onNavigate={this.handleNavAction} />;

            case PageKey.Rules:
                return <Rules onNavigate={this.handleNavAction} />;

            case PageKey.Name:
                return <Name onNavigate={this.handleNavAction} onNameChange={this.handleNameChangeEvent} onNameSubmit={this.handleNameSubmitEvent} playerName={this.state.playerName} />;

            case PageKey.Lobby:
                return <Lobby onNavigate={this.handleNavAction} onLoad={this.handleLobbyLoad} onMsgChange={this.handleLobbyMsgChangeEvent} onMsgSubmit={this.handleLobbyMsgSubmitEvent} playerName={this.state.playerName} currChatMsg={this.state.currChatMsg} />;

            default:
                return <Home onNavigate={this.handleNavAction} />;
        }
    }

    //Main App render() method...
	render() {
        const { activePage } = this.state;

        return (
            <div className="App container add-row-spacing">
                <header>
                    <Nav activePage={activePage} onNavigate={this.handleNavAction} />
                </header>
                <main>
                    {this.getPageComponent(activePage)}
                </main>
                <footer>
                    <div className="row text-center">
                        <div className="col">
                            <span>
                                By <a href="http://aaronsoto.com" target="_blank">Aaron Soto <i className="fa fa-external-link" aria-hidden="true"></i></a><br />
                                For <a href="http://mhcid.ics.uci.edu/" target="_blank">UC Irvine's MHCID Program <i className="fa fa-external-link" aria-hidden="true"></i></a><br />
                                <a href="https://GitHub.com/deztech/reversi" target="_blank">GitHub.com/deztech/reversi <i className="fa fa-external-link" aria-hidden="true"></i></a>
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        );
	}
}