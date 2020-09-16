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

    socket.on(sessionid, (data) => {
      const new_session = data;
      console.log(`got game state: `, new_session);
      setSession(JSON.parse(new_session))
    });

    console.log(`joining room '${sessionid}'`);
    const join_req = {
      id: sessionid,
    }
    socket.emit('join', JSON.stringify(join_req));

    console.log('requesting game state');
    const read_req = {
      id: sessionid,
    }
    socket.emit('read', JSON.stringify(read_req));
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
        {`Here's a game of fictionary. params: ${sessionid}`}
      </div>

      <div>
        username: 
        <input
          type='text'
          value={playerid}
          onChange={(e) => {
            setPlayerid(e.target.value);
          }}
        />
        <button
          onClick={(e) => {
            const matching_players = session.players.filter(player => player.id === playerid);
            if(matching_players.length){
              return;
            }
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
        <button
          onClick={() => {
            console.log('requesting game state');
            const read_req = {
              id: sessionid,
            }
            socket.emit('read', JSON.stringify(read_req));
          }}
        >
          refresh
        </button>
      </div>

      {/* propose a new word */}
      <div>
        <br/>
        <div>
          propose a new word
        </div>
        <input
          type='text'
          value={word}
          placeholder='word'
          onChange={(e) => {
            setWord(e.target.value);
          }}
        />
        <input
          type='text'
          value={definition}
          placeholder='definition'
          onChange={(e) => {
            setDefinition(e.target.value);
          }}
        />
        <button
          onClick={(e) => {
            const update = {
              $push:{
                'words': {
                  proposer: playerid,
                  word: word,
                  definitions: {
                    real: {
                      definition: definition,
                    },
                    fake: [],
                  },
                },
              },
            };
            const update_req = {
              id: sessionid,
              update: update,
            }
            socket.emit('update', JSON.stringify(update_req));

            setWord('');
            setDefinition('');
          }}
        >
          submit new word
        </button>
      </div>


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

    socket.on('idstatus', (data) => {
      const res = JSON.parse(data);
      console.log('received id status', res.active)
      setIDActive(res.active);
    })
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
          console.log('checking', new_sessionid);
          const idstatus_req = {
            id: new_sessionid
          }
          socket.emit('idstatus', JSON.stringify(idstatus_req));
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
