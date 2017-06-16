import React from 'react';
import ReactAudioPlayer from 'react-audio-player';

import { Constants } from './AppConstants';

import { PageKey, IChatMsg } from './AppInterfaces';

import './Chat.less';

interface IChatProps {
    onNavigate: (toPage: PageKey) => void;
    onMsgSubmit: (Message: string) => void;
    PlayerName: string;
    NewChatMsgVal: string;
    ChatMsgs: IChatMsg[];
}

interface IChatState {
    MsgVal: string;
}

export class Chat extends React.Component<IChatProps, IChatState> {

    private mAllowAudio: boolean = true;

    state = {
        MsgVal: this.props.NewChatMsgVal
    } as IChatState;

    private onLocalMsgChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            MsgVal: e.currentTarget.value
        });
    }
    
    private onLocalMsgSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
        this.ExecuteSubmit();
    }
    
    private onLocalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        this.mAllowAudio = false;
        if(e.keyCode === Constants.KEYENTER) {
            this.ExecuteSubmit();
        }
    }

    private ExecuteSubmit = () => {
        this.mAllowAudio = true;
        this.props.onMsgSubmit(this.state.MsgVal);
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
        
        const AudioTag = this.mAllowAudio ?
                         <ReactAudioPlayer src="/misc/your-turn.mp3" autoPlay="true" key={Math.random().toString().replace('0.', '')} /> :
                         "";

        return (
            <div className="ChatComponent">
                <div className="newmessage row">
                    <div className="col-8">
                        <label className="col-form-label sr-only">Enter Chat Message:</label>
                        <input id="NewMessage" className="form-control" type="text" placeholder="Enter chat message..." onChange={this.onLocalMsgChange} onKeyDown={this.onLocalKeyDown} value={this.state.MsgVal} />
                    </div>
                    <div className="col-4">
                        <button type="submit" className="btn btn-primary pull-right" onClick={this.onLocalMsgSubmit}>Send</button>
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
