import React from 'react';
import Timer from 'react.timer';
import ReactAudioPlayer from 'react-audio-player';

import { PageKey, IPlayer, IGame, IBoardLocation } from './AppInterfaces';
import { GameSquare } from './GameSquare';

import './Game.less';

interface IGameProps {
    onNavigate: (toPage: PageKey) => void;
    onReplay: (BoardSize: number) => void;
    onQuit: (e: React.FormEvent<HTMLButtonElement>) => void;
    onGameSquareClick: (BoardLocation: IBoardLocation, CurrTurn: number) => void;
    ActivePlayer: IPlayer;
    GameData: IGame;
}

export class Game extends React.Component<IGameProps, {}> {

    render() {

        const ActivePlayerColor = this.props.ActivePlayer.Username === this.props.GameData.PlayerDark.Username ? -1 : 1;
        const OtherPlayer = this.props.ActivePlayer.Username === this.props.GameData.PlayerDark.Username ? this.props.GameData.PlayerLight : this.props.GameData.PlayerDark
        const IsMyTurn = ActivePlayerColor === this.props.GameData.CurrTurn;
        const CurrTurnUsername = IsMyTurn ? this.props.ActivePlayer.Username : OtherPlayer.Username;

        const BoardOutput = this.props.GameData.BoardArray.map((_BoardLocation:IBoardLocation[], _X:number) => {
            const Inner = _BoardLocation.map((_BoardLocation:IBoardLocation, _Y:number) => {
                return <div className="board-col"><GameSquare onClick={this.props.onGameSquareClick} BoardLocation={_BoardLocation} CurrTurn={this.props.GameData.CurrTurn} IsMyTurn={IsMyTurn} /></div>;
            });
            return <div className="row board-row">{Inner}</div>;
        });

        // const BoardOutput = this.props.GameData.BoardArray.map((_BoardLocation:IBoardLocation[], _X:number) => {
        //     const Inner = _BoardLocation.map((_BoardLocation:IBoardLocation, _Y:number) => {
        //         return <td><GameSquare onClick={this.props.onGameSquareClick} BoardLocation={_BoardLocation} CurrTurn={this.props.GameData.CurrTurn} IsMyTurn={IsMyTurn} /></td>;
        //     });
        //     return <tr>{Inner}</tr>;
        // });

        const Feedback = this.props.GameData.IsGameOver ?
                            <div>{this.props.GameData.GameMessage}</div> :
                            <div>{this.props.GameData.GameMessage}: <Timer key={(Date.now())} /></div>
        
        var SwchBtn = <span></span>;
        if(this.props.GameData.MovesArray.length === 4 && this.props.GameData.BoardArray.length === 6)
            SwchBtn = <button id="SwchButton" type="button" className="btn btn-success left-button" onClick={() => { this.props.onReplay(8); }}>Play 8x8</button>;
        else if(this.props.GameData.MovesArray.length === 4 && this.props.GameData.BoardArray.length === 8)
            SwchBtn = <button id="SwchButton" type="button" className="btn btn-success left-button" onClick={() => { this.props.onReplay(6); }}>Play 6x6</button>;
        
        const PassBtn = IsMyTurn && this.props.GameData.IsCurrTurnMustPass && this.props.GameData.IsGameOver === false?
                        <button id="PassButton" type="button" className="btn btn-warning left-button" onClick={() => { this.props.onGameSquareClick({X:-1, Y:-1, OccupiedBy:0, AnimationState:-1, IsValidForDark:false, IsValidForLight:false}, this.props.GameData.CurrTurn); }}>Pass Turn</button> :
                        "";

        const PlayBtn = this.props.GameData.IsGameOver ? 
                        <button id="PlayButton" type="button" className="btn btn-success left-button" onClick={() => { this.props.onReplay(this.props.GameData.BoardArray.length); }}>New Game</button> :
                        "";
        
        const AudioTag = <ReactAudioPlayer src="/misc/your-turn.mp3" autoPlay="true" key={Math.random().toString().replace('0.', '')} />;

        return (
            <div className="GameComponent">
                <div className="row row-withoutmargin text-center">
                    <div className="col">
                        <h1>Game</h1>
                    </div>
                </div>
                <div className="row score-row">
                    <div className="col text-center">
                        <span className={this.props.GameData.CurrTurn === -1 ? "player-name player-dark player-curr" : "player-name player-dark"}>{this.props.GameData.PlayerDark.Username}</span>
                        <span>:</span>
                        <span className="score-value score-dark">{this.props.GameData.CurrScoreDark}</span>
                        <span className="token-img token-dark"><img src="../img/token-dark-fadingin.gif" alt={this.props.GameData.PlayerDark.Username + " Score"} /></span>
                        <span className="token-img token-light"><img src="../img/token-light-fadingin.gif" alt={this.props.GameData.PlayerLight.Username + " Score"} /></span>
                        <span className="score-value score-light">{this.props.GameData.CurrScoreLight}</span>
                        <span>:</span>
                        <span className={this.props.GameData.CurrTurn === 1 ? "player-name player-light player-curr" : "player-name player-light"}>{this.props.GameData.PlayerLight.Username}</span>
                    </div>
                </div>
                <div className="row board-row">
                    <div className="col text-center">
                        {/*<table className="game-board-table">
                            {BoardOutput}
                        </table>*/}
                        <span className="game-board text-center">
                            {BoardOutput}
                        </span>
                        <div className="game-feedback">{Feedback}</div>
                    </div>
                </div>
                <div className="row actions-row">
                    <div className="col text-center">
                        {PassBtn}
                        {SwchBtn}
                        {PlayBtn}
                        <button id="QuitButton" type="button" className="btn btn-danger" onClick={this.props.onQuit}>Exit Game</button>
                        {AudioTag}
                    </div>
                </div>
            </div>
        );
    }
}
