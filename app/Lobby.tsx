//import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';
import { LobbyMember } from './App';

import './Lobby.less';

interface LobbyProps {
    onNavigate: (toPage: PageKey) => void;
    onLoad: () => any;
    PlayerName: string;
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
            if(_LobbyMember.username !== this.props.PlayerName) {
                return <div key={_LobbyMember.socketid} className="LobbyMember row"><div className="col-9 no-gutters"><strong>{_LobbyMember.username}</strong></div><div className="col-3 no-gutters"><button type="submit" className="btn btn-primary pull-right">Invite</button></div></div>;
            }
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
            </div>
        );
    }
}
