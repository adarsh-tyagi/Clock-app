import React from "react";
import "./TimerLength.css";

class TimerLength extends React.Component {
  render() {
    return (
      <div className="outer-container">
        <h2 id={this.props.titleId}>{this.props.title}</h2>
        <div className="inner-container">
          <button onClick={this.props.onClick} value="-">
            -
          </button>
          <p id={this.props.lengthId}>{this.props.length}</p>
          <button onClick={this.props.onClick} value="+">
            +
          </button>
        </div>
      </div>
    );
  }
}

export default TimerLength;
