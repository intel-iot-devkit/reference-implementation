// all paths start from src/ unless using relative paths
// libs
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from "redux-thunk";
import createHistory from "history/createBrowserHistory";
import { IndexRedirect, Route, Switch } from "react-router-dom";
import { ConnectedRouter, routerMiddleware } from "react-router-redux";

// components
import ConnectedNavigation from "components/navigation/ConnectedNavigation";

// features
import ConnectedLog from "features/log/ConnectedLog";

// reducers
import reducers from "dux/reducers";

// pages
import Monitor from "pages/monitor/Monitor";
import ConnectedDirectory from "pages/directory/ConnectedDirectory";
import ConnectedStats from "pages/stats/ConnectedStats";

// css
import "index.css";

// html
import "index.html";

// Create a history of your choosing (we"re using a browser history in this case)
const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = [
  ReduxThunk,
  routerMiddleware( history ),
];

// the store
// const store = createStore( reducers, applyMiddleware( ...middleware ) );
const store = createStore( reducers, composeWithDevTools(
  applyMiddleware( ...middleware ),
  // other store enhancers if any
) );

let logOn = false;

const togglePanel = function(){
  logOn = !logOn;  
}


// the app
render(
  <Provider store={ store }>
    <ConnectedRouter history={ history }>
      <div className="intel-demo-container">
        <Route component={ ConnectedNavigation } />
        <ConnectedLog />
        <Switch>
          <Route exact path="/" component={ Monitor } />
          <Route path="/directory" component={ ConnectedDirectory } />
          <Route path="/stats" component={ ConnectedStats } />
        </Switch>
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById( "app" ),
);
