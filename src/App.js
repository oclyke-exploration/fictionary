import React, {useState, useEffect} from 'react';

import {
  BrowserRouter as Router,
  withRouter,
  Switch,
  Route,
  Link,
  Prompt,
  Redirect,
  useRouteMatch,
  useParams
} from "react-router-dom";

import socketIOClient from 'socket.io-client';

import logo from './logo.svg';
import './App.css';

var Sentencer = require('sentencer');

const port = 4567;
var socket = undefined;

const uji = (event, payload) => { // uniform JSON initiator
  socket.emit(event, JSON.stringify(payload));
}

const uje = (event, cb) => { // uniform JSON endpoint
  const handler = (data) => {
    console.log(`got response for event '${event}'`);
    const msg = JSON.parse(data);
    cb(event, msg);
  }
  socket.on(event, handler);
}

const ensureSocket = () => {
  if((typeof(socket) !== 'undefined') && (socket.connected)){
    return;
  }
  socket = socketIOClient(`http://localhost:${port}`);
  console.log('socket created!', socket);
}

const suggestId = () => {
  return Sentencer.make('{{ adjective }}-{{ noun }}');
}

const Game = withRouter(({ history }) => {

  const [playerid, setPlayerid] = useState(suggestId());
  const [done, setDone] = useState(false);
  
  let { sessionid } = useParams();
  const [session, setSession] = useState({});

  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');

  // an effect that runs on first render
  useEffect(() => {
    console.log('game page');
    ensureSocket();
  }, []);

  // an effect when the user navigates
  useEffect(() => history.listen(() => {
    socket.disconnect();  // when all sockets disconnect the game will be deleted
  }), [])

  return (
    <div>
      <Link to={`/`}>
        Fictionary
      </Link>

      <div>
        <br/>
        <div>
          game state
        </div>
        <pre>
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>


      {done && <Redirect to={`/`}/>}

    </div>
  );
});

const Games = (props) => {
  let root = useRouteMatch();
  return (
    <Switch>
      <Route path={`${root.url}/:sessionid`} component={Game}/>
    </Switch>
  );
}

const Start = (props) => {

  const [sessionid, setSessionid] = useState(suggestId());
  const [idactive, setIDActive] = useState(false);
  const [start, setStart] = useState(false);

  // an effect that runs on first render
  useEffect(() => {
    console.log('start page');
    ensureSocket();

    uje('idstatus', (event, msg) => {
      setIDActive(msg.res);
    });

  }, []);

  return (
    <div>

      <div>
        Welcome to Fictionary!
      </div>

      <button
        onClick={(e) => {
          setSessionid(suggestId());
        }}
      >
        Suggest Name
      </button>

      <input
        type='text'
        value={sessionid}
        onChange={(e) => {
          const new_sessionid = e.target.value;
          setSessionid(new_sessionid);
          uji('idstatus', new_sessionid);
        }}
      />

      <button
        onClick={(e) => {
          setStart(true);
        }}
      >
        {`${(idactive) ? 'join' : 'start'} game`}
      </button>

      {start && <Redirect to={`/play/${sessionid}`}/>}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/play/' component={Games}/>
        <Route component={Start}/>
      </Switch>
    </Router>
  );
}

export default App;
