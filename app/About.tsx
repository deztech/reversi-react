//import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';

import './About.less';

interface AboutProps {
    onNavigate: (toPage: PageKey) => void;
}

interface AboutState {
}

export class About extends React.Component<AboutProps, AboutState> {
    state = {
    } as AboutState;

    render() {
        return (
            <div className="AboutComponent">
                <div className="row text-center">
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Home); }}><img className="img-fluid" src="img/header_main.jpg" alt="Play Reversi Online (Othello)" /></a>
                        <h1>About</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <p>This Reversi game is part of an <em>Interactive Technology</em> class project led by <a href="http://www.djp3.net/" target="_blank">Professor Don J. Patterson <i className="fa fa-external-link" aria-hidden="true"></i></a> for UC Irvine's <a href="http://mhcid.ics.uci.edu/" target="_blank">Master in Human-Computer Interaction and Design <i className="fa fa-external-link" aria-hidden="true"></i></a> program.</p>
                        <p>The project uses a custom Node.js web server to manage application state and a web application written in React &amp; Typescript for the user interface.</p>
                        <p>The aim of the project is to acquire a solid understanding of server-side and client-side web application programming as it relates to our Human-Computer Interaction and User Experience (UX) Design goals.</p>
                        <p>My particular implementation added support for mobile device play, subtle visual highlights on all available moves to a player, allows for the standard 8x8 board as well as a simpler 6x6 board, and audible turn notications.</p>
                        <p>Sound Credit: "Your Turn" in-game notification sound from <a href="https://notificationsounds.com/message-tones/your-turn-491" target="_blank">NotificationSounds.com <i className="fa fa-external-link" aria-hidden="true"></i></a></p>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Home); }} className="btn btn-lg btn-secondary btn-minwidth">Home</a>
                    </div>
                    <div className="col">
                        <a href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Rules); }} className="btn btn-lg btn-secondary btn-minwidth">Rules</a>
                    </div>
                </div>
            </div>
        );
    }
}
