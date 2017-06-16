import React from 'react';
import ReactAudioPlayer from 'react-audio-player';

import { PageKey, IChatMsg } from './AppInterfaces';

import './Chat.less';

interface IChatProps {
    onNavigate: (toPage: PageKey) => void;
    onMsgSubmit: (e: React.FormEvent<HTMLButtonElement>) => void;
    PlayerName: string;
    NewChatMsgVal: string;
    ChatMsgs: IChatMsg[];
}

interface IChatState {
    MsgVal: string;
}

export class Chat extends React.Component<IChatProps, IChatState> {

    state = {
        MsgVal:this.props.NewChatMsgVal
    } as IChatState;

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
    
    private onLocalKeyDown = (e: any) => {
        // if(e.keyCode === app.constants.ENTER_KEY) {
        //     this.props.onMsgSubmit(e);   <-- THIS e IS THE WRONG TYPE THO... :/
        // }
    }

    render() {
        //Use slice() to copy the array and THEN reverse() to reverse the copy (otherwise it reverses back and forth on every key stroke)...
        const ChatMsgs = this.props.ChatMsgs.slice().reverse().map((_ChatMsg:IChatMsg, _Index:number) => {
            if(_ChatMsg.Message !== '') {
                return <div key={_Index} className="ChatMsg"><strong>{_ChatMsg.Username}:</strong> <span>{_ChatMsg.Message}</span></div>;
            }
        });
        
        const AudioTag = <ReactAudioPlayer src="/misc/your-turn.mp3" autoPlay="true" key={Math.random().toString().replace('0.', '')} />;

        return (
            <div className="ChatComponent">
                <div className="newmessage row">
                    <div className="col-8">
                        <label className="col-form-label sr-only">Enter Chat Message:</label>
                        <input id="NewMessage" className="form-control" type="text" placeholder="Enter chat message..." onChange={this.onLocalMsgChange} onKeyDown={this.onLocalKeyDown} value={this.state.MsgVal} />
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
                        {AudioTag}
                    </div>
                </div>
            </div>
        );
    }
}
