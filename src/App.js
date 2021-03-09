import React from "react";
import TimerLength from "./TimerLength";
import "./App.css";

const accurateInterval = function (fn, time) {
  var cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel,
  };
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      brkLength: 5,
      seshLength: 25,
      timerState: "stopped",
      timerType: "Session",
      timer: 1500,
      intervalId: "",
      alarmColor: { color: "black" },
    };

    this.setBrkLength = this.setBrkLength.bind(this);
    this.setSeshLength = this.setSeshLength.bind(this);
    this.lengthControl = this.lengthControl.bind(this);
    this.timerControl = this.timerControl.bind(this);
    this.beginCountDown = this.beginCountDown.bind(this);
    this.decrementTimer = this.decrementTimer.bind(this);
    this.phaseControl = this.phaseControl.bind(this);
    this.warning = this.warning.bind(this);
    this.buzzer = this.buzzer.bind(this);
    this.switchTimer = this.switchTimer.bind(this);
    this.clockify = this.clockify.bind(this);
    this.reset = this.reset.bind(this);
  }

  setBrkLength(e) {
    this.lengthControl(
      "brkLength",
      e.currentTarget.value,
      this.state.brkLength,
      "Session"
    );
  }

  setSeshLength(e) {
    this.lengthControl(
      "seshLength",
      e.currentTarget.value,
      this.state.seshLength,
      "Break"
    );
  }

  lengthControl(stateToChange, sign, currentLength, timerType) {
    if (this.state.timerState === "running") {
      return;
    }
    if (this.state.timerType === timerType) {
      if (sign === "-" && currentLength !== 1) {
        this.setState({ [stateToChange]: currentLength - 1 });
      } else if (sign === "+" && currentLength !== 60) {
        this.setState({ [stateToChange]: currentLength + 1 });
      }
    } else if (sign === "-" && currentLength !== 1) {
      this.setState({
        [stateToChange]: currentLength - 1,
        timer: currentLength * 60 - 60,
      });
    } else if (sign === "+" && currentLength !== 60) {
      this.setState({
        [stateToChange]: currentLength + 1,
        timer: currentLength * 60 + 60,
      });
    }
  }

  timerControl() {
    if (this.state.timerState === "stopped") {
      this.beginCountDown();
      this.setState({ timerState: "running" });
    } else {
      this.setState({ timerState: "stopped" });
      if (this.state.intervalId) {
        this.state.intervalId.cancel();
      }
    }
  }

  beginCountDown() {
    this.setState({
      intervalId: accurateInterval(() => {
        this.decrementTimer();
        this.phaseControl();
      }, 1000),
    });
  }

  decrementTimer() {
    this.setState({ timer: this.state.timer - 1 });
  }

  phaseControl() {
    let timer = this.state.timer;
    this.warning(timer);
    this.buzzer(timer);
    if (timer < 0) {
      if (this.state.intervalId) {
        this.state.intervalId.cancel();
      }
      if (this.state.timerType === "Session") {
        this.beginCountDown();
        this.switchTimer(this.state.brkLength * 60, "Break");
      } else {
        this.beginCountDown();
        this.switchTimer(this.state.seshLength * 60, "Session");
      }
    }
  }

  warning(_timer) {
    if (_timer < 61) {
      this.setState({ alarmColor: { color: "red" } });
    } else {
      this.setState({ alarmColor: { color: "black" } });
    }
  }

  buzzer(_timer) {
    if (_timer === 0) {
      this.audioBeep.play();
    }
  }

  switchTimer(num, str) {
    this.setState({
      timer: num,
      timerType: str,
      alarmColor: { color: "black" },
    });
  }

  clockify() {
    let minutes = Math.floor(this.state.timer / 60);
    let seconds = this.state.timer - minutes * 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return minutes + " : " + seconds;
  }

  reset() {
    this.setState({
      brkLength: 5,
      seshLength: 25,
      timerState: "stopped",
      timerType: "Session",
      timer: 1500,
      intervalId: "",
      alarmColor: { color: "black" },
    });
    if (this.state.intervalId) {
      this.state.intervalId.cancel();
    }
    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  }

  render() {
    return (
      <div className="container">
        <div className="clock">
          <div className="heading">25 + 5 Clock</div>
          <div className="timer-length">
            <TimerLength
              addId="break-increment"
              length={this.state.brkLength}
              lengthId="break-length"
              minId="break-decrement"
              onClick={this.setBrkLength}
              title="Break Length"
              titleId="break-label"
            />
            <TimerLength
              addId="session-increment"
              length={this.state.seshLength}
              lengthId="session-length"
              minId="session-decrement"
              onClick={this.setSeshLength}
              title="Session Length"
              titleId="session-label"
            />
          </div>

          <div className="timer" style={this.state.alarmColor}>
            <div style={this.state.alarmColor}>{this.state.timerType}</div>
            <div style={this.state.alarmColor}>{this.clockify()}</div>
          </div>

          <div className="timer-control">
            <button className="play" onClick={this.timerControl}>
              Play/Pause
            </button>
            <button className="reset" onClick={this.reset}>
              Reset
            </button>
          </div>

          <audio
            id="beep"
            preload="auto"
            ref={(audio) => {
              this.audioBeep = audio;
            }}
            src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
          />
        </div>
      </div>
    );
  }
}

export default App;
