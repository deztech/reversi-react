import React from 'react';

import './GameSquare.less';

interface IGameSquareProps {
    onClick: (BoardLocation: IBoardLocation, CurrTurn: number) => void;
    BoardLocation: IBoardLocation;
    CurrTurn: number;
    IsMyTurn: Boolean;
}

export class GameSquare extends React.Component<IGameSquareProps, {}> {

    render() {

        var TurnColor = "dark";
        if(this.props.CurrTurn === 1)
            TurnColor = "light";

        var SquareImg = "token";

        if(this.props.BoardLocation.OccupiedBy === -1)
            SquareImg = SquareImg + "-dark";
        else if(this.props.BoardLocation.OccupiedBy === 1)
            SquareImg = SquareImg + "-light";
        else
            SquareImg = SquareImg + "-empty";

        if(this.props.BoardLocation.AnimationState === 0)
            SquareImg = SquareImg + "-fadingin";
        else if(this.props.BoardLocation.AnimationState > 0)
            SquareImg = SquareImg + "-flipping";

        const IsValidSquare = this.props.IsMyTurn &&
                              ((this.props.CurrTurn === -1 && this.props.BoardLocation.IsValidForDark) || 
                               (this.props.CurrTurn === 1 && this.props.BoardLocation.IsValidForLight));
        
        const Output = IsValidSquare ?
                        <a href="javascript:void(0)" onClick={() => { this.props.onClick(this.props.BoardLocation, this.props.CurrTurn); }}><img src={"/img/" + SquareImg + ".gif"} /></a> :
                        <img src={"/img/" + SquareImg + ".gif"} />

        return (
            <div className={"GameSquare GameSquare-valid-" + IsValidSquare + " GameSquare-valid-" + TurnColor}>
                {Output}
            </div>
        );
    }
}
