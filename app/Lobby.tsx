import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';

import './Lobby.less';

interface LobbyProps {
    playerName: string;
    onNavigate: (toPage: PageKey) => void;
    onNewChatMsgSubmitted: (newMsg: string) => void;
}

interface LobbyState {
    newMsg: string;
}

export class Lobby extends React.Component<LobbyProps, LobbyState> {
    state = {
    } as LobbyState;

    public handleMsgChange(event: any): void {
        this.setState({ newMsg: event.target.value });
    }

    render() {
        return (
            <div className="LobbyComponent">
                <div className="row">
                    <div className="col">
                        <h1 className="text-center">Lobby</h1>
                        <h2>Welcome, <span id="username">{this.props.playerName}</span>!</h2>
                        <form className="form-inline" onSubmit={() => { this.props.onNewChatMsgSubmitted(this.state.newMsg); }}>
                            <div className="col-9">
                                <label className="col-form-label sr-only">Enter Chat Message:</label>
                                <input id="NewMessage" className="form-control" type="text" placeholder="Enter chat message..." value={this.state.newMsg} onChange={this.handleMsgChange} />
                            </div>
                            <div className="col-3">
                                <button type="submit" className="btn btn-primary">Send</button>
                            </div>
                        </form>
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
