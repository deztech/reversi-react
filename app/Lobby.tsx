//import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';

import './Lobby.less';

interface LobbyProps {
    onNavigate: (toPage: PageKey) => void;
    onLoad: () => any;
    onMsgChange: (e: any) => any;
    onMsgSubmit: (e: any) => any;
    playerName: string;
    currChatMsg: string;
}

interface LobbyState {
}

export class Lobby extends React.Component<LobbyProps, LobbyState> {

    constructor(props: LobbyProps) {
        super(props)

        this.props.onLoad();
    }

    state = {
    } as LobbyState;

    render() {
        return (
            <div className="LobbyComponent">
                <div className="row">
                    <div className="col">
                        <h1 className="text-center">Lobby</h1>
                        <h2>Welcome, <span id="username">{this.props.playerName}</span>!</h2>
                        <div className="col-9">
                            <label className="col-form-label sr-only">Enter Chat Message:</label>
                            <input id="NewMessage" className="form-control" type="text" placeholder="Enter chat message..." onChange={this.props.onMsgChange} />
                        </div>
                        <div className="col-3">
                            <button type="submit" className="btn btn-primary" onClick={this.props.onMsgSubmit}>Send</button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <h4>Messages...</h4>
                        <div id="messages">
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
