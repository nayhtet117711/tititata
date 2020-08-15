import React, { Component } from 'react';
import socketClient from 'socket.io-client';
import api from "../network/api"
import socketJsonParser from "socket.io-json-parser"

class Pages extends Component {

    constructor(props) {
        super(props)
        this.state = {
            username: "",
            socketId: null,
            propic: null,
            messages: [
                // { username: "User2", socketId: "23232323", text: "Hello", ts: "2020-01-01 09:30:00"},
                // { username: "User1", socketId: "232324", text: "Hello", ts: "2020-01-01 09:30:00" }
            ]
        }
        
    }

    componentDidMount() {
        this.connectSocketServer()
    }

    connectSocketServer = () => {
        this.socket = socketClient(api.socketURL, {
            path: api.firstSocketPath,
            parser: socketJsonParser,
            reconnectionAttempts: 1,
            reconnectionDelay: 30000
        })
        this.socket.on("connect", () => {
            console.log(this.socket.id)
            this.setState({ socketId: this.socket.id })
        })

        // this.socket.on('disconnect', (reason) => {
        //     if (reason === 'io server disconnect') {
        //         console.log("disconnect and going to reconnect")
        //        this.connectSocketServer()
        //     }
        // });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log("disconnect and going to reconnect")
            // this.connectSocketServer()
            this.registerUsername(this.state.username)
        });

        this.onMessageReceived()
    }

    onMessageReceived = () => {
        // this.socket.emit("msg-hello", "Helloooo world", res => console.log("res: ", res))
        
        this.socket.on("enter-user", data => {
            // this.socket.emit("msg-hello", "Helloooo world")
            this.setState({ username: data.username, propic: data.propic })
        })

        this.socket.on("message-send", data => {
            // this.socket.emit("msg-hello", "Helloooo world")
            this.setState(prev => ({ messages: [...prev.messages, data]}))
        })

        this.socket.on("enter-user-reject", data => {
            alert(data.reason)
        })

    }

    onMessageSent = () => {

    }

    onEnter = e => {
        e.preventDefault()
        const username = e.target[0].value
        this.registerUsername(username)
    }

    registerUsername = username => {
        if (username) {
            this.socket.emit("enter-user", { username, propic: this.state.propic })
            // this.socket.emit("msg-hello", "Helloooo world", res => console.log("res: ", res))
        }
    }

    onMessageSend = e => {
        e.preventDefault()
        const text = e.target[0].value
        if (text) {
            this.socket.emit("message-send", { text, username: this.state.username, socketId: this.state.socketId, propic: this.state.propic })
            // this.socket.emit("msg-hello", "Helloooo world", res => console.log("res: ", res))
            e.target[0].value = ""
        }
    }

    handleImageUpload = (e, stateKey) => {
        const file = e.target.files[0]

        console.log("e: ", file)

        const formData = new FormData()
        formData.append("imageFile", file)

        fetch(`${api.socketURL}/asset/images`, {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.setState({ propic: data.payload })
                }
                else {
                    console.log("Error: ", data)
                }
            })
            .catch(error => {
                console.log("Error: ", error)
            })
    }


    render() {
        const headerView = (
            <div className="p-2 rounded text-center font-weight-bold my-1 h4 text-dark">
                <i className="fa fa-heart-o" aria-hidden="true"></i>
                <span className="px-2">Titi Tata</span>
                <i className="fa fa-heart-o" aria-hidden="true"></i>
            </div>
        )
        const requestUsernameView = (
            <div className="p-3 px-5 rounded border shadow my-1 bg-white">
                <form onSubmit={this.onEnter}>
                    <div className="mb-3">
                        {
                            !this.state.propic ? <div className="form-file form-file-lg mb-3">
                                <input type="file" className="form-file-input" id="propic" accept="image/*" onChange={e => this.handleImageUpload(e, "propic")} name="propic"></input>
                                <label className="form-file-label" htmlFor="customFileLg">
                                    <span className="form-file-text">Choose file...</span>
                                    <span className="form-file-button">Browse</span>
                                </label>
                            </div>
                            : <div className="p-1 d-flex justify-content-center">
                                <img className="img-thumbnail p-1 rounded rounded-circle"  style={{ width: 120, height: 120 }} src={`${api.socketURL}${this.state.propic}`} alt={`${this.state.username}-logo`} />
                            </div>
                        }
                        
                        <label htmlFor="usernameInputId" className="form-label px-1 text-secondary font-weight-bold">Enter your nick name:</label>
                        <input type="text" className="form-control" id="usernameInputId" placeholder="Nick name" required />
                        <div className="py-2">
                            <button className="btn btn-primary btn-block" type="submit">Enter</button>
                        </div>
                    </div>
                </form>
            </div>
        )

        const messagesView = this.state.messages.map((v,k) => {
            const logoView = (
                <div className="rounded rounded-circle mx-1">
                    { v.propic ?
                        <img className="img-thumbnail p-1 rounded rounded-circle" style={{ width: 64, height: 64 }} src={`${api.socketURL}${v.propic}`} alt={`${v.username}-logo`} />
                        : <img className="img-thumbnail p-1  rounded-circle" style={{ width: 38, height: 38 }} src={"https://www.pinclipart.com/picdir/middle/165-1653686_female-user-icon-png-download-user-colorful-icon.png"} alt={`${v.username}-logo`} />
                    }
                </div>
            )
            return (
                <React.Fragment key={k}>
                    {/* <div className={k>0 ? "border border-top-0 border-left-0 border-right-0" : ""} key={k + "-div"}></div> */}
                    <div key={k} className={`m-1 py-2 px-3 d-flex justify-content-${this.state.socketId === v.socketId ? "end" : "start"}`}>
                        {this.state.socketId !== v.socketId && logoView}
                        <div className={`px-2 d-flex flex-column border shadow ${this.state.socketId === v.socketId ? "bg-success text-light" : "bg-light text-dark"}`} style={{ minWidth: 200, borderRadius: 12 }}>
                            <div className="font-weight-bold text-dark">
                                <small>{v.username}</small>
                            </div>
                            <div className="text-dark">
                                {v.text}
                            </div>
                        </div>
                        {this.state.socketId === v.socketId && logoView }
                    </div>
                </React.Fragment>
            )
        })

        return (
            <div className="p-1 container">
                { headerView }
                <div className="p-3 d-flex justify-content-center">{!this.state.username && requestUsernameView}</div>
                { this.state.username && <div className="p-2 bg-info rounded">
                    <div className="p-2 ">
                        <div className="d-flex flex-column bg-white border rounded">
                            {messagesView}
                        </div>
                    </div>
                    <div className="p-1 ">
                        <form onSubmit={this.onMessageSend}>
                            <div className="d-flex">
                                <input type="text" className="form-control flex-grow-1" id="messageInputId" placeholder="Say what you want to " required />
                                <button className="btn btn-primary ml-2" type="submit">Enter</button>
                            </div>
                        </form>
                    </div>
                </div>}
            </div>
        )
    }

}

export default Pages;
