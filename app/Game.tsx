//import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';
//import { GameColor } from './App';
import { IPlayer } from './App';
import { IGame } from './App';
import { IBoardLocation } from './App';
import { GameSquare } from './GameSquare';

import './Game.less';

interface GameProps {
    onNavigate: (toPage: PageKey) => void;
    onQuit: (e: React.FormEvent<HTMLButtonElement>) => void;
    onGameSquareClick: (BoardLocation: IBoardLocation, CurrTurn: number) => void;
    ActivePlayer: IPlayer;
    GameData: IGame;
    NameDarkColor: string;
    NameLightColor: string;
}

interface GameState {
    ActivePlayerColor: number;
    OtherPlayer: IPlayer;
}

export class Game extends React.Component<GameProps, GameState> {
    
    state = {
        ActivePlayerColor: this.props.ActivePlayer.Username === this.props.GameData.PlayerDark.Username ? -1 : 1,
        OtherPlayer: this.props.ActivePlayer.Username === this.props.GameData.PlayerDark.Username ? this.props.GameData.PlayerLight : this.props.GameData.PlayerDark
    } as GameState;

    render() {
        const IsMyTurn = this.state.ActivePlayerColor === this.props.GameData.CurrTurn;
        const BoardOutput = this.props.GameData.BoardArray.map((_BoardLocation:IBoardLocation[], _X:number) => {
            const Inner = _BoardLocation.map((_BoardLocation:IBoardLocation, _Y:number) => {
                return <div className="board-col"><GameSquare onClick={this.props.onGameSquareClick} BoardLocation={_BoardLocation} CurrTurn={this.props.GameData.CurrTurn} IsMyTurn={IsMyTurn} /></div>;
            });
            return <div className="row board-row">{Inner}</div>;
        });

        return (
            <div className="GameComponent">
                <div className="row text-center">
                    <div className="offset-2 col-8">
                        <h1>Game</h1>
                    </div>
                    <div className="col-2">
                        <button id="QuitButton" type="button" className="btn btn-danger pull-right" onClick={this.props.onQuit}>Quit</button>
                    </div>
                </div>
                <div className="row score-row">
                    <div className="col text-center">
                        <span className={this.props.GameData.CurrTurn === -1 ? "player-name player-dark player-curr" : "player-name player-dark"}>{this.state.ActivePlayerColor === -1 ? "YOU" : this.state.OtherPlayer.Username}</span>
                        <span>:</span>
                        <span className="score-value score-dark">{this.props.GameData.CurrScoreDark}</span>
                        <span className="token-img token-dark"><img src="../img/token-dark-fadingin.gif" alt={this.props.NameDarkColor + " Score"} /></span>
                        <span className="token-img token-light"><img src="../img/token-light-fadingin.gif" alt={this.props.NameLightColor + " Score"} /></span>
                        <span className="score-value score-light">{this.props.GameData.CurrScoreLight}</span>
                        <span>:</span>
                        <span className={this.props.GameData.CurrTurn === 1 ? "player-name player-light player-curr" : "player-name player-light"}>{this.state.ActivePlayerColor === 1 ? "YOU" : this.state.OtherPlayer.Username}</span>
                    </div>
                </div>
                <div className="row">
                    <div className="col text-center">
                        <span className="game-board text-center">
                            {BoardOutput}
                        </span>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        GAME OVER UI<br />
                    </div>
                </div>
            </div>
        );
    }
}
