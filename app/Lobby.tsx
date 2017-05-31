//import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';
import { LobbyMember } from './App';
import { ChatMsg } from './App';

import './Lobby.less';

interface LobbyProps {
    onNavigate: (toPage: PageKey) => void;
    onLoad: () => any;
    onMsgChange: (e: React.FormEvent<HTMLInputElement>) => void;
    onMsgSubmit: (e: React.FormEvent<HTMLButtonElement>) => void;
    PlayerName: string;
    NewChatMsgVal: string;
    ChatMsgs: ChatMsg[];
    LobbyMembers: LobbyMember[];
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
        const LobbyMembers = this.props.LobbyMembers.map((_LobbyMember:LobbyMember) => {
            return <div key={_LobbyMember.socketid} className="LobbyMember row"><div className="col-9 no-gutters"><strong>{_LobbyMember.username}</strong></div><div className="col-3 no-gutters"><button type="submit" className="btn btn-primary pull-right">Invite</button></div></div>;
        });
        
        const ChatMsgs = this.props.ChatMsgs.map((_ChatMsg:ChatMsg) => {
            return <div key={_ChatMsg.timestamp.getMilliseconds()} className="ChatMsg"><strong>{_ChatMsg.username}:</strong> <span>{_ChatMsg.message}</span></div>;
        });

        return (
            <div className="LobbyComponent">
                <div className="welcome row">
                    <div className="col">
                        <h1 className="text-center">Lobby</h1>
                        <h2>Welcome, <span id="username">{this.props.PlayerName}</span>!</h2>
                    </div>
                </div>
                <div id="players">
                    {LobbyMembers}
                </div>
                <div className="newmessage row">
                    <div className="col-9">
                        <label className="col-form-label sr-only">Enter Chat Message:</label>
                        <input id="NewMessage" className="form-control" type="text" placeholder="Enter chat message..." onChange={this.props.onMsgChange} />
                    </div>
                    <div className="col-3">
                        <button type="submit" className="btn btn-primary" onClick={this.props.onMsgSubmit}>Send</button>
                    </div>
                </div>
                <div className="chatmessages row">
                    <div className="col">
                        <h4>Messages...</h4>
                        <div id="messages">
                            {ChatMsgs}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
