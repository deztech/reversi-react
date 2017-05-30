//import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';

import './Rules.less';

interface RulesProps {
    onNavigate: (toPage: PageKey) => void;
}

interface RulesState {
}

export class Rules extends React.Component<RulesProps, RulesState> {
    state = {
    } as RulesState;

    render() {
        return (
            <div className="RulesComponent">
                <div className="row text-center">
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Home); }}><img className="img-fluid" src="img/header_main.jpg" alt="Play Reversi Online (Othello)" /></a>
                        <h1>Rules</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <p>Reversi is the game also known under its commercial name of <em>Othello</em> where two players take turns playing light and dark colored game pieces on an 8 by 8 game board until one player cannot make any additional valid moves at which point the player with the most game pieces of their color is the winner.</p>
                        <p>Please see the <a href="https://en.wikipedia.org/wiki/Reversi" target="_blank">Reversi page on WikiPedia <i className="fa fa-external-link" aria-hidden="true"></i></a> for full game rules if you're unfamiliar with them.</p>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Home); }} className="btn btn-lg btn-secondary btn-minwidth">Home</a>
                    </div>
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.About); }} className="btn btn-lg btn-secondary btn-minwidth">About</a>
                    </div>
                </div>
            </div>
        );
    }
}
