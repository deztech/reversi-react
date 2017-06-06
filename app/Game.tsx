//import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';

import './Game.less';

interface GameProps {
    onNavigate: (toPage: PageKey) => void;
    PlayerName: string;
}

interface GameState {
}

export class Game extends React.Component<GameProps, GameState> {
    
    state = {
    } as GameState;

    render() {
        return (
            <div className="GameComponent">
                <div className="row text-center">
                    <div className="col">
                        <h1>Game</h1>
                    </div>
                </div>
            </div>
        );
    }
}
