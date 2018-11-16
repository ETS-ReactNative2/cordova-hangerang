import React, { Component } from 'react';
import QrReader from 'react-qr-reader';

class Scan extends Component {
  constructor(props){
    super(props)
    this.state = {
      delay: 300,
      result: 'No result',
      validURL: false
    }
    this.handleScan = this.handleScan.bind(this)
  }

  handleScan(data){
    if(data){
      this.setState({
        result: data
      })
    }
    if(data && data.includes("goo.gl")){
      this.setState({
        validURL: true
      })
    }
  }
  handleError(err){
    console.error(err)
  }
  render(){
    return(
      <div className={'scanblock'}>
        {this.state.validURL ?
        <div>
          <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MDcuMiA1MDcuMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTA3LjIgNTA3LjI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Y2lyY2xlIHN0eWxlPSJmaWxsOiMzMkJBN0M7IiBjeD0iMjUzLjYiIGN5PSIyNTMuNiIgcj0iMjUzLjYiLz4KPHBhdGggc3R5bGU9ImZpbGw6IzBBQTA2RTsiIGQ9Ik0xODguOCwzNjhsMTMwLjQsMTMwLjRjMTA4LTI4LjgsMTg4LTEyNy4yLDE4OC0yNDQuOGMwLTIuNCwwLTQuOCwwLTcuMkw0MDQuOCwxNTJMMTg4LjgsMzY4eiIvPgo8Zz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNGRkZGRkY7IiBkPSJNMjYwLDMxMC40YzExLjIsMTEuMiwxMS4yLDMwLjQsMCw0MS42bC0yMy4yLDIzLjJjLTExLjIsMTEuMi0zMC40LDExLjItNDEuNiwwTDkzLjYsMjcyLjggICBjLTExLjItMTEuMi0xMS4yLTMwLjQsMC00MS42bDIzLjItMjMuMmMxMS4yLTExLjIsMzAuNC0xMS4yLDQxLjYsMEwyNjAsMzEwLjR6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTM0OC44LDEzMy42YzExLjItMTEuMiwzMC40LTExLjIsNDEuNiwwbDIzLjIsMjMuMmMxMS4yLDExLjIsMTEuMiwzMC40LDAsNDEuNmwtMTc2LDE3NS4yICAgYy0xMS4yLDExLjItMzAuNCwxMS4yLTQxLjYsMGwtMjMuMi0yMy4yYy0xMS4yLTExLjItMTEuMi0zMC40LDAtNDEuNkwzNDguOCwxMzMuNnoiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
          <p>QR Code Valid</p>
          <a href={this.state.result} className={'btn'}>Check In</a>
        </div>
        :
        <div>
          <h3>Scan the Check In QR Code</h3>
          <QrReader
            delay={this.state.delay}
            onError={this.handleError}
            onScan={this.handleScan}
            className={'qrreader'}
            />
        </div>
         }
      </div>
    )
  }
}

export default Scan;
