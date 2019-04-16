import React, { Component } from 'react';
import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';
import api from '../../services/api';
import { MdInsertDriveFile } from "react-icons/md";
import $ from "jquery";

import socket from "socket.io-client";

import Dropzone from "react-dropzone";

import logo from '../../assets/logo_maxtech.png';

import './styles.css';

export default class Box extends Component {

    state = { box: {} };
    async componentDidMount() {
        this.subscribeToNewFiles();

        const box = this.props.match.params.id;
        const response = await api.get(`boxes/${box}`);

        this.setState({ box: response.data });
    };

    subscribeToNewFiles = () => {
        const box = this.props.match.params.id;
        const io = socket('https://rsdevbox.herokuapp.com');

        io.emit('connectRoom', box);

        io.on('file', data => {
            this.setState({ box: { ...this.state.box, files: [data, ...this.state.box.files] } });
        })
    };

    showLoader = (v) => {
        if (v === true) {
            $('#preloader').fadeIn('slow');
            $('#preloader-overlay').fadeIn('slow');
            $('#completednumber').fadeIn('slow');
        } else {
            $('#preloader').fadeOut('slow');
            $('#completednumber').fadeOut('slow');
            $('#preloader-overlay').fadeOut('slow');
        }
    }

    setPercentNumber = (n) => {
        console.log(n);
        $("#completednumber").html(n + " %");
    }

    handleUpload = (files) => {

        files.forEach(file => {
            const data = new FormData();
            const box = this.props.match.params.id;

            data.append('file', file);
            this.showLoader(true);
            let config = {
                onUploadProgress: progressEvent => {
                    let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
                    this.setPercentNumber(percentCompleted);
                }
            }

            api.post(`boxes/${box}/files`, data, config).then((data) => { this.showLoader(false) });
        });
    }



    render() {
        return (
            <div id="box-container">
                <header>
                    <img src={logo} alt="" />
                    <h1>{this.state.box.title}</h1>
                </header>

                <div id="preloader-overlay"></div>
                <div id="preloader">
                    <div id="loader"></div>
                    <div id="completednumber"></div>
                </div>

                <Dropzone onDropAccepted={this.handleUpload}>
                    {({ getRootProps, getInputProps }) => (
                        <div className="upload" {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>Arraste arquivos ou clique aqui</p>
                        </div>
                    )}
                </Dropzone>
                <ul>
                    {this.state.box.files && this.state.box.files.map(file => (
                        <li key={file._id}>
                            <a className='fileInfo' href={file.url} target="_blank" rel="noopener noreferrer">
                                <MdInsertDriveFile size={24} color="#A5CFFF" />
                                <strong>{file.title}</strong>
                            </a>
                            <span> há {" "}{distanceInWords(file.createdAt, new Date(), { locale: pt })}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}
