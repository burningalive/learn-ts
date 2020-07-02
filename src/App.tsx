import React from 'react';
import Cart from './cart'
import List from './list';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import 'antd/dist/antd.css';

function App() {
  return (
    <div className="App">
    <Router>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/cart">
            <Cart />
          </Route>
          <Route path="/list">
            <List />
          </Route>
          <Route path="/" exact>
            <>
                <li><Link to="/cart">React demo</Link></li>
                <li><Link to="/list">List demo</Link></li>
                <li><Link to="/users">Users</Link></li>
              </>  
          </Route>
        </Switch>
    </Router>
    </div>
  );
}

export default App;
