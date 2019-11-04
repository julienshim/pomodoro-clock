import React from "react";

const Label = (props) => {
  const { name, type, isRunning, isActive } = props;
  const string = name === "timer" ? type : name;
  return (
    <div className={`label ${isRunning && isActive ? 'active' : ''}`} id={`${name}-label`}>{`${string}`.charAt(0).toUpperCase() + `${string}`.slice(1)}</div>
  )
}

const Button = (props) => {
  const { className, type, isIncrementing, handleSetLength} = props;
  return (
    <div className={className} id={`${type}-${isIncrementing ? "increment" : "decrement"}`} onClick={handleSetLength}></div>

    // <div className={className} id={`${type}-${isIncrementing ? "increment" : "decrement"}`} onClick={handleSetLength}>{isIncrementing ? '+' : '-'}</div>
  )
}

export default class PomodoroClock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: "session",
      break: 5,
      session: 25,
      timer: 1500,
      isRunning: false
    };
  }

  beep = React.createRef();

  componentDidMount() {
    document.body.style.background = 'rgb(255,181, 17)';
  }

  componentDidUpdate() {
    this.handleAudio(this.state.timer);
    this.handleColor();
    if (this.state.timer < 0) {
      this.state.isRunning && this.handleStartStop();
      this.setState(
        {
          timer: this.state.type === "session"
                    ? this.state.break * 60
                    : this.state.session * 60,
          type: this.state.type === "session" ? "break" : "session"
        }, this.handleStartStop
      );
    }
  }

  handleColor() {
    document.body.style.background = this.state.type === "session" ? 'rgb(18, 149, 216)' : 'rgb(255,181, 17)';
  }

  handleAudio(time) {
    time === 0 && this.beep.current.play().then(response => {
        // console.log('response', response);
      }).catch(error => {
        console.log(error);
      })
  }

  handleStartStop = () => {
    this.setState(prevState => {
      if (prevState.isRunning) {
        clearInterval(this.clock);
      } else {
        this.clock = setInterval(this.handleDecrement, 1000
          );
      }
      return { isRunning: !prevState.isRunning };
    });
  };

  handleDecrement = () => {
    this.setState(prevState => ({
      timer: prevState.timer - 1
    }));
  };

  handleReset = () => {
    clearInterval(this.clock);
    this.setState({
      type: "session",
      break: 5,
      session: 25,
      timer: 1500,
      isRunning: false
    });
    this.beep.current.pause();
    this.beep.current.currentTime = 0
  };

  handleSetLength(isIncrementing, type) {
    if (this.state.isRunning) return;
    // If decrementing set length and length of either type is 1 return
    if (!isIncrementing && this.state[type] === 1) return;
    // If incremeanting set length and length of either type is 60 return
    if (isIncrementing && this.state[type] === 60) return;

    this.setState(prevState => {
      const newStateLinked = { [type]: prevState[type] + (isIncrementing ? 1 : -1),
                                timer: prevState[type] * 60 + (isIncrementing ? 60 : -60) };
      const newStateUnLinked = { [type]: prevState[type] + (isIncrementing ? 1 : -1) };
     
      return this.state.type === type ? newStateLinked : newStateUnLinked;
    });
  }

  handleTimeFormat() {
    const minutes = String(Math.floor(this.state.timer / 60)).padStart(2, "0");
    const seconds = String(this.state.timer % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  render() {
    const totalTime = this.state[this.state.type] * 60;
    const dynamic =  this.state.timer / totalTime;

    const sessionStyle = {
        height: 100 * dynamic + 'vh',
        backgroundColor: 'rgb(255,181, 17)',
        bottom: 0
    };

    const breakStyle = {
      height: 100 * dynamic + 'vh',
      backgroundColor: 'rgb(18, 149, 216)',
      top: 0
    };

    return (
      <div>
        <div id="progress-bar" style={this.state.type === "session" ? sessionStyle : breakStyle } ></div>
        <div id="main">
        <div id="break-block" className="parent-block">
          <div className="flip-block">
          <Button className={"buttons add"} type={"break"} isIncrementing={true} handleSetLength={() => this.handleSetLength(true, "break")} /> 
          <div className={"value"} id="break-length">{this.state.break}</div>
          <Button className={"buttons subtract"} type={"break"} isIncrementing={false} handleSetLength={() => this.handleSetLength(false, "break")} /> 
          </div>
          <Label name={"break"} isRunning={this.state.isRunning} isActive={ this.state.type === "break" } type={this.state.type} />
        </div>
        <div id="session-block" className="parent-block">
          <div className="flip-block">
          <Button className={"buttons add"} type={"session"} isIncrementing={true} handleSetLength={() => this.handleSetLength(true, "session")} /> 
          <div className={"value"} id="session-length">{this.state.session}</div>
          <Button className={"buttons subtract"} type={"session"} isIncrementing={false} handleSetLength={() => this.handleSetLength(false, "session")} /> 

          </div>
          <Label name={"session"} isRunning={this.state.isRunning} isActive={ this.state.type === "session" } type={this.state.type}/>
        </div>
          <div className={""} id="time-left">
            {this.handleTimeFormat()}
          </div>
          <Label name={"timer"} isRunning={this.state.isRunning} isActive={false} type={this.state.type} />
          <div id="controls">
            <div className={this.state.isRunning ? "stop" : "start"} id="start_stop" onClick={this.handleStartStop}>
            {this.state.isRunning ? "stop" : "start"}
            </div>
            <div id="reset" onClick={this.handleReset}>
            <svg id="restart-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13.5 2c-5.629 0-10.212 4.436-10.475 10h-3.025l4.537 5.917 4.463-5.917h-2.975c.26-3.902 3.508-7 7.475-7 4.136 0 7.5 3.364 7.5 7.5s-3.364 7.5-7.5 7.5c-2.381 0-4.502-1.119-5.876-2.854l-1.847 2.449c1.919 2.088 4.664 3.405 7.723 3.405 5.798 0 10.5-4.702 10.5-10.5s-4.702-10.5-10.5-10.5z"/></svg>
            </div>
          </div>
          <audio 
            id='beep'
            src='/audio/ebeep.mp3' 
            ref={this.beep}>
          </audio>
        </div>
      </div>
    );
  }
}
