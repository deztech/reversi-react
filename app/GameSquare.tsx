import React from 'react';

//import { GameColor } from './App';
import { IBoardLocation } from './App';

import './GameSquare.less';

interface GameSquareProps {
    onClick: (BoardLocation: IBoardLocation, CurrTurn: number) => void;
    BoardLocation: IBoardLocation;
    CurrTurn: number;
    IsMyTurn: Boolean;
}

interface GameSquareState {
}

export class GameSquare extends React.Component<GameSquareProps, GameSquareState> {

    state = {
    } as GameSquareState;

    render() {

        var SquareImg = "token";

        if(this.props.BoardLocation.OccupiedBy === -1)
            SquareImg = SquareImg + "-dark";
        else if(this.props.BoardLocation.OccupiedBy === 1)
            SquareImg = SquareImg + "-light";
        else
            SquareImg = SquareImg + "-empty";

        if(this.props.BoardLocation.AnimationState === 0)
            SquareImg = SquareImg + "-fadingin";

        const IsValidSquare = this.props.IsMyTurn &&
                              ((this.props.CurrTurn === -1 && this.props.BoardLocation.IsValidForDark) || 
                               (this.props.CurrTurn === 1 && this.props.BoardLocation.IsValidForLight));

        return (
            <div className={"GameSquareComponent valid-" + IsValidSquare}>
                <a href="javascript:void(0)" onClick={() => { this.props.onClick(this.props.BoardLocation, this.props.CurrTurn); }}><img className="img-fluid" src={"/img/" + SquareImg + ".gif"} /></a>
            </div>
        );
    }
}
