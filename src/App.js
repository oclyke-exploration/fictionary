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

var socket = undefined;

const port = 4567;

const ensureSocket = () => {
  if(typeof(socket) === 'undefined'){
    socket = socketIOClient(`http://localhost:${port}`);
    console.log('socket created!', socket);
  }
}

const suggestId = () => {
  return Sentencer.make('{{ adjective }}-{{ noun }}');
}

const Game = withRouter(({ history }) => {

  const [playerid, setPlayerid] = useState(suggestId());
  const [playerjoined, setPlayerJoined] = useState(false);
  const [done, setDone] = useState(false);
  
  let { sessionid } = useParams();
  const [session, setSession] = useState({});

  // an effect that runs on first render
  useEffect(() => {
    console.log('game page');
    ensureSocket();

    socket.on(sessionid, (data) => {
      const new_session = data;
      console.log(`got game state: `, new_session);
      setSession(JSON.parse(new_session))
    });

    console.log(`joining room '${sessionid}'`);
    const join_req = {
      id: sessionid,
      join: true,
    }
    socket.emit('door', JSON.stringify(join_req));

    console.log('requesting game state');
    const read_req = {
      id: sessionid,
    }
    socket.emit('read', JSON.stringify(read_req));
  }, []);

  return (
    <div>
      <Link to={`/`}>
        Fictionary
      </Link>

      <div>
        {`Here's a game of fictionary. params: ${sessionid}`}
      </div>

      <div>
        username: 
        <input
          type='text'
          value={playerid}
          disabled={playerjoined}
          onChange={(e) => {
            setPlayerid(e.target.value);
          }}
        />
        <button
          disabled={playerjoined}
          onClick={(e) => {
            setPlayerJoined(true);
            const update = {
              $push: {'players': {id: playerid }}
            };
            const update_req = {
              id: sessionid,
              update: update,
            }
            socket.emit('update', JSON.stringify(update_req));
          }}
        >
          accept
        </button>
      </div>

      <div>
        {/* game info here */}
        {session.id}
      </div>


      <pre>
        {JSON.stringify(session, null, 2)}
      </pre>

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

  const [sessionid, setsessionid] = useState(suggestId());
  const [start, setStart] = useState(false);

  useEffect(() => {
    console.log('start page');
    ensureSocket();
  }, []);

  return (
    <div>

      <div>
        Welcome to Fictionary!
      </div>

      <button
        onClick={(e) => {
          setsessionid(suggestId());
        }}
      >
        Suggest Name
      </button>

      <input
        type='text'
        value={sessionid}
        onChange={(e) => {
          setsessionid(e.target.value);
        }}
      />

      <button
        onClick={(e) => {
          const create_req = {
            id: sessionid,
          }
          socket.emit('create', JSON.stringify(create_req));
          setStart(true);
        }}
      >
        Start Game
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
