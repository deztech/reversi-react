//import Classnames from 'classnames';
import React from 'react';

import { Constants } from './AppConstants';

import { PageKey } from './AppInterfaces';

import './Name.less';

interface INameProps {
    onNavigate: (toPage: PageKey) => void;
    onNameSubmit: (Name: string) => void;
    PlayerName: string;
}

interface INameState {
    NameVal: string;
}

export class Name extends React.Component<INameProps, INameState> {
    
    state = {
        NameVal: ''
    } as INameState;

    private onLocalNameChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            NameVal: e.currentTarget.value
        });
    }
    
    private onLocalNameSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
        this.ExecuteSubmit();
    }
    
    private onLocalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.keyCode === Constants.KEYENTER) {
            this.ExecuteSubmit();
        }
    }

    private ExecuteSubmit = () => {
        this.props.onNameSubmit(this.state.NameVal);
        this.setState({
            NameVal: ''
        });
    }

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
                        <input id="username" className="form-control" type="text" placeholder="Enter your username..." onChange={this.onLocalNameChange} onKeyDown={this.onLocalKeyDown} value={this.state.NameVal} />
                    </div>
                    <div className="col-3">
                        <button type="submit" className="btn btn-primary" onClick={this.onLocalNameSubmit}>Play</button>
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
