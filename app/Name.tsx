import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';

import './Name.less';

interface NameProps {
    onNavigate: (toPage: PageKey) => void;
    onNameChange: (event: any) => any;
    onFormSubmit: (event: any) => any;
    playerName: string
}

interface NameState {
}

export class Name extends React.Component<NameProps, NameState> {

    state = {
    } as NameState;

    render() {
        return (
            <div className="NameComponent">
                <div className="row text-center">
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Home); }}><img className="img-fluid" src="img/header_main.jpg" alt="Play Reversi Online (Othello)" /></a>
                        <h1>Play Now!</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <label className="col-form-label sr-only">Enter Your Username:</label>
                        <input id="username" className="form-control" type="text" placeholder="Enter your username..." onChange={this.props.onNameChange} />
                    </div>
                    <div className="col-3">
                        <button type="submit" className="btn btn-primary" onClick={this.props.onFormSubmit}>Play</button>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Home); }} className="btn btn-lg btn-secondary btn-minwidth">Cancel</a>
                    </div>
                </div>
            </div>
        );
    }
}
