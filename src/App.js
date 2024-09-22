import React, { Component } from 'react';
import EmployeeApp from './components/EmployeeApp.jsx';
import './App.css'
import { BrowserRouter as Router } from "react-router-dom";

class App extends Component{
  render() {
    return (
      <div>
        <Router>
          <EmployeeApp/>
        </Router>
      </div>
    );
  }
}

export default App;
