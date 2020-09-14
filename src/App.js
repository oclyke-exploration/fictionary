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

import logo from './logo.svg';
import './App.css';

var Sentencer = require('sentencer');

const port = 4567;

const suggestId = () => {
  return Sentencer.make('{{ adjective }}-{{ noun }}');
}

const Game = withRouter(({ history }) => {


  const [playerid, setPlayerid] = useState(suggestId());
  const [playerjoined, setPlayerJoined] = useState(false);
  const [done, setDone] = useState(false);

  
  let { sessionid } = useParams();
  const [session, setSession] = useState({});

  const getSession = (sessionid) => {
    fetch(`http://localhost:${port}/play/${sessionid}`, {
      mode: 'cors',
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(session => {
      console.log(session);
      setSession(session);
    })
    .catch(e => { console.warn(`fetching 'play/${sessionid}' failed`, e); });
  }

  const putSession = (sessionid, update) => {
    // TODO: don't just get/put the whole session dummy. do it in pieces w/ endpoints for various things like players, words, definitions, etc...
    fetch(`http://localhost:${port}/play/${sessionid}`, {
      mode: 'cors',
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(update),
    })
    .then(response => response.json())
    .then(session => {
      console.log(session);
      setSession(session);
    })
    .catch(e => { console.warn(`fetching 'play/${sessionid}' failed`, e); });
  }

  const deleteSession = (sessionid) => {
    fetch(`http://localhost:${port}/play/${sessionid}`, {
      mode: 'cors',
      method: 'DELETE',
    })
    .catch(e => { console.warn(`fetching 'play/${sessionid}' failed`, e); });
  }

  // an effect when the user navigates
  useEffect(() => history.listen(() => {
      console.log('user is navigating away....');
      // use this time to update the active players
      if(true){ // if no more players are playing (todo:)
        deleteSession(sessionid);
      }
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
          disabled={playerjoined}
          onChange={(e) => {
            setPlayerid(e.target.value);
          }}
        />
        <button
          disabled={playerjoined}
          onClick={(e) => {
            setPlayerJoined(true);
          }}
        >
          accept
        </button>
      </div>

      <div>
        {/* game info here */}
        {session.id}
        {session.players && session.players.forEach(player => {
          console.log(player)
          return player;
        })}
      </div>


      <div>
        <button onClick={(e) => { getSession(sessionid); }}>
          GET
        </button>

        <button onClick={(e) => { putSession(sessionid, {players: [playerid]}); }}>
          PUT
        </button>

        <button
          onClick={(e) => {
            deleteSession(sessionid);
            setDone(true);
          }}
        >
          DELETE
        </button>
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

  const [sessionid, setsessionid] = useState(suggestId());
  const [start, setStart] = useState(false);

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

          fetch(`http://localhost:${port}/play/${sessionid}`, {
            mode: 'cors',
            method: 'POST',
            // headers: {
            //   'content-type': 'application/json',
            // },
          })
          .then((response) => {
            if(response.ok){
              setStart(true);
              return;
            }
            /* indicate failure */
          })
          .catch(e => { console.warn(`posting 'play/${sessionid}' failed`, e); });
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
