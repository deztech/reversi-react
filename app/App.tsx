import React from 'react';

import { Nav } from './Nav';
import { Home } from './Home';
import { About } from './About';
import { Rules } from './Rules';
import { Name } from './Name';
import { Lobby } from './Lobby';

import './lib/reset.less';
import './App.less';

export enum PageKey {
	Home,
	About,
	Rules,
	Name,
	Lobby
}

interface AppState {
    activePage: PageKey;
    playerName: string;
}

export class App extends React.Component<{}, AppState> {

	state = {
        activePage: PageKey.Home,
        playerName: ''
    } as AppState;

    //Nav Component Handler(s)...
    private handleNavAction = (pageKey: PageKey) => {
        if (this.state.activePage !== pageKey) {
            this.setState({
                activePage: pageKey
            });
        }
    }

    //Name Component Handler(s)...
    private handleNameChangeEvent = (e: any) => {
        this.setState({
            playerName: e.target.value
        });
    }

    private handleNameSubmitEvent = (e: any) => {
        if (this.state.playerName === '') {
            this.state.playerName = 'Anonymous' + Math.floor(Math.random() * 10000);
        }
        this.setState({
            activePage: PageKey.Lobby,
        });
    }

    //Lobby Component Handler(s)...
    private sendNewChatMsg = (newMsg: string) => {
        this.setState({
            //ToDo: Not sure what to do here regarding the sockets...
        });
    }

    private getPageComponent(pageKey: PageKey) {
        switch (pageKey) {
            case PageKey.About:
                return <About onNavigate={this.handleNavAction} />;

            case PageKey.Rules:
                return <Rules onNavigate={this.handleNavAction} />;

            case PageKey.Name:
                return <Name onNavigate={this.handleNavAction} onNameChange={this.handleNameChangeEvent} onFormSubmit={this.handleNameSubmitEvent} playerName={this.state.playerName} />;

            case PageKey.Lobby:
                return <Lobby onNavigate={this.handleNavAction} onNewChatMsgSubmitted={this.sendNewChatMsg} playerName={this.state.playerName} />;

            default:
                return <Home onNavigate={this.handleNavAction} />;
        }
    }

	render() {
        const { activePage } = this.state;

        return (
            <div className="App container add-row-spacing">
                <header>
                    <Nav activePage={activePage} onNavigate={this.handleNavAction} />
                </header>
                <main>
                    {this.getPageComponent(activePage)}
                </main>
                <footer>
                    <div className="row text-center">
                        <div className="col">
                            <span>
                                By <a href="http://aaronsoto.com" target="_blank">Aaron Soto <i className="fa fa-external-link" aria-hidden="true"></i></a><br />
                                For <a href="http://mhcid.ics.uci.edu/" target="_blank">UC Irvine's MHCID Program <i className="fa fa-external-link" aria-hidden="true"></i></a><br />
                                <a href="https://GitHub.com/deztech/reversi" target="_blank">GitHub.com/deztech/reversi <i className="fa fa-external-link" aria-hidden="true"></i></a>
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        );
	}
}