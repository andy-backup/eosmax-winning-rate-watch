import React, { Component } from 'react';
import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs';

const network = {
    blockchain:'eos',
    protocol:'https',
    host:'nodes.get-scatter.com',
    port:443,
    chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
}

let scatter;
let bet_id = [];
let win = 0;
let lose = 0;
// let watch = ["eosio"];

const login = (callback = () => {}) => {
    ScatterJS.plugins( new ScatterEOS() );
    ScatterJS.scatter.connect('My-App').then(connected => {
        if(!connected) return false;
        scatter = ScatterJS.scatter;
        callback();
    });
}

const getLog = () => {
    const eosOptions = { expireInSeconds: 60 };
    const eos = scatter.eos(network, Eos, eosOptions);
    // {"json":true,"code":"eosmaxiodice","scope":"eosmaxiodice","table":"betresult","tableKey":"string","lower_bound":0,"limit":100}
    const getTableRows = eos.getTableRows(true, "eosmaxiodice", "eosmaxiodice", "betresult", "string", 0, -1, 100);
    getTableRows.then((res) => {
        if (res && res.rows) {
            for(let i in res.rows) {
                let row = res.rows[i];
                // 排除非关注账号
                // if (watch.findIndex((value)=>{return value === row.bettor}) === -1) {
                //     continue
                // }
                // 仅关注96概率的下注
                if (row.roll_border !== 96) {
                    continue
                }
                // 排除重复ID
                if (bet_id.findIndex((value)=>{return value === row.bet_id}) !== -1) {
                    continue
                }
                
                if (row.roll_border <= row.randnum) {
                    // lose
                    lose++
                } else {
                    // win
                    win++
                }
                bet_id.push(row.bet_id);
            }
        }
    })
}


class App extends Component {
  constructor(props) {
    super(props);
    this.state = { win: 0, lose: 0, startTime: new Date().toString() };
    this.handleAutoLog = this.handleAutoLog.bind(this);
    this.handleLog = this.handleLog.bind(this);
    this.handleLogin()
  }

  handleLogin() {
    login( () => {
        this.handleAutoLog()
    } );
  }

  handleLog() {
    getLog()
    this.setState({ win: win, lose: lose })
  }

  handleAutoLog() {
    this.interval = setInterval(this.handleLog, 1000)
  }

  render() {
    const total = this.state.win + this.state.lose;
    const percent = (this.state.win / (total) * 100) || 0;
    return (
      <div className="App">
        <p>total: {total}, win: {this.state.win}, lose: {this.state.lose}, percent: {percent} %</p>
        <p>watch start time: {this.state.startTime}</p>
      </div>
    );
  }
}

export default App;
