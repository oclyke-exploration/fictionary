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

import ClipboardJS from 'clipboard';

import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';

import ChatRoundedIcon from '@material-ui/icons/Chat';
import LaunchRoundedIcon from '@material-ui/icons/Launch';
import EmailRoundedIcon from '@material-ui/icons/EmailRounded';

import { GithubPicker } from 'react-color'

import SessionSelector from './SessionSelector';
import WordProposer from './WordProposer';
import WordCard from './WordCard';
import PlayerCard, {getScore} from './PlayerCard';

import {Player, Definition, Word, Session} from './Elements';

var Sentencer = require('sentencer');

const palette = ['#EB9694', '#FAD0C3', '#FEF3BD', '#C1E1C5', '#BEDADC', '#C4DEF6', '#BED3F3', '#D4C4FB'];

var clipboard = new ClipboardJS('.copybtn');
clipboard.on('success', function(e) {
    console.log(e);
});
clipboard.on('error', function(e) {
    console.log(e);
});

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

const Game = withRouter(({ history }) => {
  let { sessionid } = useParams();

  const [gohome, setGohome] = useState(false);
  
  const [player, setPlayer] = useState<Player>(new Player(suggestId()));
  const [session, setSession] = useState<Session>(new Session(sessionid).addPlayer(player));

  // const word = new Word('doggy', new Definition('a quadruped', new Player('robot')));
  // const canvote = (player.isVoter(word) && !word.hasVoteBy(player));
  // console.log(canvote);

  // const [player, setPlayer] = useState<Player>(new Player('robot'));
  // let test_session = new Session('test-session');
  // const test_words = [
  //   new Word('bar', new Definition('unit of pressure of one million dynes per square centimeter', new Player('robot'))),
  //   new Word('kit', new Definition('a small pocket violin', new Player('insect'))),
  //   new Word('quena', new Definition('vertical bamboo flute used in the Andes', new Player('robot'))),
  //   new Word('jailage', new Definition('fee paid to jailer', new Player('mammal'))).addDefinition(new Definition('wastewater handling method', new Player('insect'))),
  //   new Word('youngstock', new Definition('young domestic animals', new Player('robot'))),
  //   new Word('kermes', new Definition('brilliant red colour; a red dye derived from insects', new Player('insect'))),
  //   new Word('ixia', new Definition('South African beautiful flowering plant', new Player('mammal'))),
  //   new Word('factitious', new Definition('produced by humans or artificial forces', new Player('mammal'))),
  //   new Word('metalliferous', new Definition('bearing metal', new Player('mammal'))),
  //   new Word('cnemis', new Definition('shin bone', new Player('insect'))),
  //   new Word('bullary', new Definition('collection of papal bulls', new Player('mammal'))),
  //   new Word('nasute', new Definition('keen-scented; critically discriminating; having a big nose', new Player('robot'))),
  //   new Word('wordish', new Definition('verbose', new Player('robot'))),
  //   new Word('xylopyrography', new Definition('engraving designs on wood with hot poker', new Player('mammal'))),
  //   new Word('warrener', new Definition('keeper of a warren of rabbits', new Player('mammal'))),
  //   new Word('donné', new Definition('basic assumption or axiom; basic principle of an artwork', new Player('robot'))),
  //   new Word('limax', new Definition('slug', new Player('insect'))),
  //   new Word('dyphone', new Definition('double lute with fifty strings', new Player('robot'))),
  //   new Word('yakhdan', new Definition('box used for carrying ice on back of pack animal', new Player('insect'))),
  //   new Word('ethology', new Definition('study of natural or biological character', new Player('robot'))),
  // ]
  // test_words.forEach(word => {
  //   if(word){
  //     test_session.addWord(word);
  //   }
  // });
  // const [session, setSession] = useState<Session>(test_session.addPlayer(player));


  const [editing_username, setEditingUsername] = useState<boolean>(false);

  const shareurl = `https://games.echoictech.com/fictionary/${sessionid}`;

  let playeritemwidth: 2 | 3 | 4 | 6 = 2;
  const playeritemdivision = 12/session.players.length;
  if(playeritemdivision >= 3){
    playeritemwidth = 3;
  }
  if(playeritemdivision >= 4){
    playeritemwidth = 4;
  }
  if(playeritemdivision >= 6){
    playeritemwidth = 6;
  }

  // make an ordered players list
  const ordered_players = [...session.players.filter(p => p.id === player.id), ...session.players.filter(p => p.id !== player.id).sort((a, b) => getScore(session, b) - getScore(session, a))];

  // an effect that runs on first render
  useEffect(() => {
    console.log('game page');
    ensureSocket();

    uje('join', (event, msg: any) => {
      const idy = msg.res.num_players - 1;
      const idx = palette.length - idy - 1;
      const new_color = palette[((idx > 3) ? (2*(idx-4))+1 : 2*idx ) % palette.length];

      // set the 'to' color of this user
      let to = new Player(player.id);
      to.setColor(new_color);

      uji('modify_player', {id: sessionid, from: player, to: to});
      setPlayer(to);
    });

    uje('modify_player', (event, msg) => {

    })

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
    <>

      {/* <Grid container direction='column'> */}
      <Box display='flex' flexDirection='column' justifyContent='space-between' style={{width: '100%', height: '100%'}}>

        {/* header */}
        <Container>
          <Box>
            <Typography variant='h1' align='center' style={{fontSize: 48}}>
              <Link href='/'>
                fictionary
              </Link>

              <Tooltip title='copy game link'>
                <IconButton
                  className='copybtn'
                  style={{margin: 12}}
                  color='primary'
                  data-clipboard-text={shareurl}
                >
                  <LaunchRoundedIcon />
                </IconButton>
              </Tooltip>
            </Typography>
          </Box>
        </Container>

        {/* players */}
        <Box>
          <Box p={1}>
            <Grid item container>
              {/* players */}
              {ordered_players.map((player_mapped, idx) => {
                return (
                  <Grid item xs={playeritemwidth} key={`player.info.${player_mapped.id}`}>
                    <PlayerCard 
                      session={session}
                      player={player_mapped}
                      editable={player_mapped.id === player.id}
                      onPlayerChange={(from: Player, to: Player) => {
                        uji('modify_player', {id: sessionid, from: from, to: to});
                        setPlayer(to);
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
        
        {/* words */}
        <Box flexGrow={1} style={{overflow: 'auto'}}>

          <Grid item container>
            <Grid item xs={1} md={2} lg={3} />
            <Grid item xs={10} md={8} lg={6}>

              <Box display='flex' flexDirection='column'>
              
              {session.words.map(word => {
                return (
                  <Grid item key={`words.${word.value}`} style={{alignSelf: `flex-${(word.author.id === player.id) ? 'end' : 'start'}`}}>
                    <WordCard
                      word={word}
                      player={player}
                      onPoseDefinition={(posed: Definition) => {
                        uji('add_definition', {id: sessionid, word: word, definition: posed});
                      }}
                      onVote={(selected) => {
                        uji('add_vote', {id: sessionid, word: word, definition: selected, voter: player});
                      }}
                      />
                  </Grid>
                );
              })}

              </Box>

            </Grid>
            <Grid item xs={1} md={2} lg={3} />
          </Grid>

        </Box>

        {/* suggestions */}
        <Box>
          <Grid item container>
            <Grid item xs={1} md={2} lg={3} />
            <Grid item container xs={10} md={8} lg={6}>
              <WordProposer
                onSubmit={(word, def) => {
                  uji('add_word', {id: sessionid, word: new Word(word, new Definition(def, player))});
                }}
                />
            </Grid>
            <Grid item xs={1} md={2} lg={3} />
          </Grid>
        </Box>
      </Box>
    </>
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
