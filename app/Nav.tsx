import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';

import './Nav.less';

interface NavProps {
	ActivePage: PageKey;
	onNavigate: (toPage: PageKey) => void;
}

export class Nav extends React.Component<NavProps, {}> {

	render() {
		const { ActivePage } = this.props;

		const renderNavItem = (pageKey: PageKey, label: string) => {
			return (
                <li className="nav-item">
                    <a className={Classnames('nav-link', ActivePage === pageKey && 'nav-link-active')} href="javascript:void(0)" onClick={() => { this.props.onNavigate(pageKey); }}>
						{label}
					</a>
				</li>
			);
		};

		return (
            <nav className="navbar navbar-toggleable-sm bg-faded">
                <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><i className="fa fa-bars" aria-hidden="true"></i></button>

                <a className="navbar-brand" href="javascript:void(0)" onClick={() => { this.props.onNavigate(PageKey.Home); }}>Reversi</a>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar navbar-nav mr-auto">
					    {renderNavItem(PageKey.Home, 'Home')}
					    {renderNavItem(PageKey.About, 'About')}
					    {renderNavItem(PageKey.Rules, 'Rules')}
                        {renderNavItem(PageKey.Name, 'Play!')}
                    </ul>
                </div>
            </nav>
		);
	}
}