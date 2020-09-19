import React, {
  useState,
  useEffect,
} from 'react';
import {
  BrowserRouter as Router,
  withRouter,
  Switch,
  Route,
  Link as RouterLink,
  Redirect,
  useRouteMatch,
  useParams,
} from "react-router-dom";
import socketIOClient from 'socket.io-client';

import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import SessionSelector from './SessionSelector';

import {Player, Definition, Word, Session} from './Elements';

var Sentencer = require('sentencer');

const port = 4567;
let socket: SocketIOClient.Socket;

const uji = (event: string, payload: object | string) => { // uniform JSON initiator
  socket.emit(event, JSON.stringify(payload));
}

type UJEmsg = {req: unknown, res: unknown}
const uje = (event: string, cb: (event: string, msg: UJEmsg) => void) => { // uniform JSON endpoint
  const handler = (data: any) => {
    const msg = JSON.parse(data);
    console.log(`response for event '${event}'`, msg);
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

const shuffle = (array: any[]) => {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}


const WordCard = (props: any) => {
  return (
    <>
      {props.word.value}
    </>
  );
}






const Game = withRouter(({ history }) => {
  let { sessionid } = useParams();

  const [gohome, setGohome] = useState(false);
  
  const [player, setPlayer] = useState<Player>(new Player(suggestId()));
  const [session, setSession] = useState<Session>(new Session(sessionid).addPlayer(player));

  const [proposedDefinition, setProposedDefinition] = useState<Definition>(new Definition('', player));
  const [proposedWord, setProposedWord] = useState<Word>(new Word('', proposedDefinition, player));

  const [fake_defs, setFakeDefs] = useState<Definition[]>([]);

  // an effect that runs on first render
  useEffect(() => {
    console.log('game page');
    ensureSocket();

    uje('join', (event, msg) => {
    });

    uje('session', (event, msg) => {
      setSession(Session.fromUnknown(msg.res));
    });

    uji('join', session);
  }, []);

  // an effect when the user navigates
  useEffect(() => history.listen(() => {
    socket.disconnect();  // when all sockets disconnect the game will be deleted
  }), [])

  return (
    <div>
      <RouterLink to={`/`}>
        Fictionary
      </RouterLink>

      <div>
        player: {player.id}
      </div>

      <div>
        <div>
          propose word
        </div>
        <div>
          <input
            value={proposedWord.value}
            placeholder='word'
            onChange={(e) => {
              setProposedWord(new Word(e.target.value, proposedDefinition, player));
            }}
            />
          <input
            value={proposedDefinition.value}
            placeholder='definition'
            onChange={(e) => {
              const new_definition = new Definition(e.target.value, player);
              setProposedDefinition(new_definition);
              setProposedWord(new Word(proposedWord.value, new_definition, player));
            }}
            />
          <button
            onClick={(e) => {
              console.log(proposedWord);
              uji('add_word', {id: sessionid, word: proposedWord});
              const new_definition = new Definition('', player);
              setProposedDefinition(new_definition);
              setProposedWord(new Word('', new_definition, player));
            }}
          >
            submit
          </button>
        </div>
      </div>

      {/* words */}
      <div>
      {(typeof(session.words) !== 'undefined') && session.words.map((word, idx) => {
        const canfake = ((word.author.id !== player.id) && (word.definitions.filter(def => def.author.id === player.id).length === 0) && (word.voters.filter(voter => voter.id === player.id).length !== 0));
        const faked = (word.definitions.length === word.voters.length + 1);
        var shuffled_definitions = shuffle(word.definitions);
        
        var already_voted = false;
        word.definitions.forEach((def) => {
          def.votes.forEach((voter) => {
            if(voter.id === player.id){
              already_voted = true;
            }
          });
        });
        
        const is_voter = (word.voters.filter(voter => voter.id === player.id).length !== 0);

        return (
          <div key={`word_entry_${idx}`}>
            <div>word: {word.value}</div>
            <div>author: {word.author.id}</div>
            {canfake && 
              <>
              <input
                value={(typeof(fake_defs[idx]) === 'undefined') ? '' : fake_defs[idx].value}
                placeholder='fake definition'
                onChange={(e) => {
                  var new_fake_defs = [...fake_defs];
                  new_fake_defs[idx] = new Definition(e.target.value, player);
                  setFakeDefs(new_fake_defs);
                }}
                />
              <button
                onClick={(e) => {
                  uji('add_definition', {id: sessionid, word: word, definition: fake_defs[idx]});
                  var new_fake_defs = [...fake_defs];
                  new_fake_defs[idx] = new Definition('', player);
                  setFakeDefs(new_fake_defs);
                }}
              >
                submit
              </button>
              </>
            }
            {faked && 
              <div>
                {shuffled_definitions.map((definition, idx) => {
                  const owndef = (definition.author.id === player.id);
                  const canvote = (is_voter && !already_voted && !owndef);
                  return (
                    <div key={`fake_def_${idx}`}>
                      {definition.value}
                    {canvote &&
                      <button
                        onClick={(e) => {
                          uji('add_vote', {id: sessionid, word: word, definition: definition, voter: player});
                        }}
                      >
                        choose
                      </button>
                      }
                    </div>
                  );
                })}
              </div>
            }
          </div>
        );
      })}
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


      {gohome && <Redirect to={`/`}/>}

    </div>
  );
});

const Games = (props: any) => {
  let root = useRouteMatch();
  return (
    <Switch>
      <Route path={`${root.url}/:sessionid`} component={Game}/>
    </Switch>
  );
}

const Start = (props: any) => {
  const [sessionid, setSessionid] = useState(suggestId());
  const [idactive, setIDActive] = useState<boolean>(false);
  const [start, setStart] = useState(false);

  const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

  // an effect that runs on first render
  useEffect(() => {
    console.log('start page');
    ensureSocket();

    uje('idstatus', (event, msg) => {
      if(typeof(msg.res) === 'boolean'){
        setIDActive(msg.res);
      }
    });

  }, []);

  return (
    <>
      <Grid container>
        <Grid item xs={1}  sm={2}  md={3}/>
        <Grid item xs={10} sm={8}  md={6}>
          <Grid item container direction='column'>
            <Grid item>
              <Typography variant='h1' align='center' style={{fontSize: 48}}>
                fictionary
              </Typography>
            </Grid>
            <Grid item>
              <SessionSelector
                id={sessionid}
                join={idactive}
                onSuggest={(e) => {
                  const newid = suggestId();
                  setSessionid(newid);
                  uji('idstatus', newid);
                }}
                onChange={(e) => {
                  const newid = e.target.value;
                  setSessionid(newid);
                  uji('idstatus', newid);
                }}
                onSubmit={(e) => {
                  setStart(true);
                }}
              />
            </Grid>
            <Grid item>
              <Typography variant='subtitle2' align='center'>
                <Link href='https://echoictech.com' target='_blank' rel='noreferrer'>
                  echoic tech llc
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={1}  sm={2}  md={3}/>
      </Grid>

      {start && <Redirect to={`/fictionary/${sessionid}`}/>}
    </>
  );
}

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path='/fictionary/' component={Games}/>
        <Route component={Start}/>
      </Switch>
    </Router>
  );
}

export default App;
