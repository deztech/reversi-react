//import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';

import './Home.less';

interface HomeProps {
    onNavigate: (toPage: PageKey) => void;
}

interface HomeState {
}

export class Home extends React.Component<HomeProps, HomeState> {
    state = {
    } as HomeState;

    render() {
        return (
            <div className="HomeComponent">
                <div className="row text-center">
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Home); }}><img className="img-fluid" src="img/header_main.jpg" alt="Play Reversi Online (Othello)" /></a>
                        <h1>Play Reversi</h1>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Name); }} className="btn btn-lg btn-primary">Play Now!</a>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col">
                        <img className="img-fluid" src="img/header_home2.png" alt="Play Reversi Online (Othello)" />
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.About); }} className="btn btn-lg btn-secondary btn-minwidth">About</a>
                    </div>
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Rules); }} className="btn btn-lg btn-secondary btn-minwidth">Rules</a>
                    </div>
                </div>
            </div>
        );
    }
}
