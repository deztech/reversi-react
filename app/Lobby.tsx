//import Classnames from 'classnames';
import React from 'react';

import { PageKey, IPlayer } from './AppInterfaces';

import './Lobby.less';

interface ILobbyProps {
    onNavigate: (toPage: PageKey) => void;
    onInvite: (e: React.FormEvent<HTMLButtonElement>) => void;
    onUninvite: (e: React.FormEvent<HTMLButtonElement>) => void;
    onPlay: (e: React.FormEvent<HTMLButtonElement>) => void;
    GetActivePlayer: () => IPlayer;
    LobbyRoomName: string;
    PlayerName: string;
    PlayerData: IPlayer[];
}

interface ILobbyState {
}

export class Lobby extends React.Component<ILobbyProps, ILobbyState> {

    state = {
    } as ILobbyState;

    render() {
        const ActivePlayer = this.props.GetActivePlayer();
        const LobbyMembers = this.props.PlayerData.map((_Player:IPlayer) => {
            //Constant Filter: NOT yourself and IN the Lobby...
            if(_Player.Username !== this.props.PlayerName && _Player.CurrRoomName === this.props.LobbyRoomName) {
                if(ActivePlayer.InvitesTo.indexOf(_Player.SocketID) >= 0) {
                    //InvitedTo Case => Uninvite...
                    return <div key={_Player.SocketID} className="LobbyMember row"><div className="col-8 no-gutters"><strong>{_Player.Username}</strong></div><div className="col-4 no-gutters"><button type="button" value={_Player.SocketID} onClick={this.props.onUninvite} className="btn btn-warning pull-right uninvite-button">Uninvite</button></div></div>;
                }
                else if(ActivePlayer.InvitedBy.indexOf(_Player.SocketID) >= 0) {
                    //InvitedBy Case => Play...
                    return <div key={_Player.SocketID} className="LobbyMember row"><div className="col-8 no-gutters"><strong>{_Player.Username}</strong></div><div className="col-4 no-gutters"><button type="button" value={_Player.SocketID} onClick={this.props.onPlay} className="btn btn-success pull-right play-button">Play</button></div></div>;
                }
                else {
                    //Std Case => Invite...
                    return <div key={_Player.SocketID} className="LobbyMember row"><div className="col-8 no-gutters"><strong>{_Player.Username}</strong></div><div className="col-4 no-gutters"><button type="button" value={_Player.SocketID} onClick={this.props.onInvite} className="btn btn-primary pull-right invite-button">Invite</button></div></div>;
                }
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
