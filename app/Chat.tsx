//import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';
import { ChatMsg } from './App';

import './Chat.less';

interface ChatProps {
    onNavigate: (toPage: PageKey) => void;
    onMsgChange: (e: React.FormEvent<HTMLInputElement>) => void;
    onMsgSubmit: (e: React.FormEvent<HTMLButtonElement>) => void;
    PlayerName: string;
    NewChatMsgVal: string;
    ChatMsgs: ChatMsg[];
}

interface ChatState {
}

export class Chat extends React.Component<ChatProps, ChatState> {

    state = {
    } as ChatState;

    render() {
        const ChatMsgs = this.props.ChatMsgs.map((_ChatMsg:ChatMsg) => {
            return <div key={_ChatMsg.timestamp.getMilliseconds()} className="ChatMsg"><strong>{_ChatMsg.username}:</strong> <span>{_ChatMsg.message}</span></div>;
        });

        return (
            <div className="ChatComponent">
                <div className="newmessage row">
                    <div className="col-9">
                        <label className="col-form-label sr-only">Enter Chat Message:</label>
                        <input id="NewMessage" className="form-control" type="text" placeholder="Enter chat message..." onChange={this.props.onMsgChange} />
                    </div>
                    <div className="col-3">
                        <button type="submit" className="btn btn-primary pull-right" onClick={this.props.onMsgSubmit}>Send</button>
                    </div>
                </div>
                <div className="chatmessages row">
                    <div className="col">
                        <h4>Messages...</h4>
                        <div id="messages">
                            {ChatMsgs}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
