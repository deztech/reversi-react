//import Classnames from 'classnames';
import React from 'react';

import { PageKey } from './App';
import { IChatMsg } from './App';

import './Chat.less';

interface ChatProps {
    onNavigate: (toPage: PageKey) => void;
    onMsgSubmit: (e: React.FormEvent<HTMLButtonElement>) => void;
    PlayerName: string;
    NewChatMsgVal: string;
    ChatMsgs: IChatMsg[];
}

interface ChatState {
    MsgVal: string;
}

export class Chat extends React.Component<ChatProps, ChatState> {

    state = {
        MsgVal:this.props.NewChatMsgVal
    } as ChatState;

    private onLocalMsgChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            MsgVal: e.currentTarget.value
        });
    }
    private onLocalMsgSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
        this.props.onMsgSubmit(e);
        this.setState({
            MsgVal: ''
        });
    }

    render() {
        //Use slice() to copy the array and THEN reverse() to reverse the copy (otherwise it reverses back and forth on every key stroke)...
        const ChatMsgs = this.props.ChatMsgs.slice().reverse().map((_ChatMsg:IChatMsg, _Index:number) => {
            if(_ChatMsg.Message !== '') {
                return <div key={_Index} className="ChatMsg"><strong>{_ChatMsg.Username}:</strong> <span>{_ChatMsg.Message}</span></div>;
            }
        });

        return (
            <div className="ChatComponent">
                <div className="newmessage row">
                    <div className="col-8">
                        <label className="col-form-label sr-only">Enter Chat Message:</label>
                        <input id="NewMessage" className="form-control" type="text" placeholder="Enter chat message..." onChange={this.onLocalMsgChange} value={this.state.MsgVal} />
                    </div>
                    <div className="col-4">
                        <button type="submit" className="btn btn-primary pull-right" onClick={this.onLocalMsgSubmit} value={this.state.MsgVal}>Send</button>
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
