import React, {useState, useEffect} from 'react';

import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';

import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
// import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Popover from '@material-ui/core/Popover';

import Radio from '@material-ui/core/Radio';

import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';

import SendRoundedIcon from '@material-ui/icons/SendRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import SettingsIcon from '@material-ui/icons/Settings';

import {Player, Definition, Word} from './Elements';

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

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
})
);

const WordCard = (props: {word: Word, player: Player, onPoseDefinition: (posed: Definition) => void, onVote: (selected: Definition) => void, onModifyWord: (from: Word, to: Word) => void, onRemoveWord: (word: Word) => void}) => {
  const player = props.player;
  const word = props.word;

  const classes = useStyles();
  const [posed, setPosed] = useState<Definition>(new Definition('', player));

  let votes = 0;
  word.definitions.forEach(def => { votes += def.votes.length; });
  const voted = (votes === (word.voters.length - word.notvoted.length));
  const defined = (word.definitions.length === (word.voters.length + 1));

  const [selected, setSelected] = useState<null | number>(null);

  const [shuffled, setShuffled] = useState<Definition[]>([]);

  const [settingsanchorref, setSettingsAnchorRef] = React.useState<any>(null);
  const showsettings = Boolean(settingsanchorref);

  useEffect(() => {
    if(defined){
      setShuffled(shuffle(word.definitions)); // only runs when defined changes to true (when all definitions provided)
    }
  }, [defined]);


  const canpose = (player.isVoter(word) && !player.hasPosed(word));
  // const canvote = (player.isVoter(word) && !player.hasVoted(word));
  let hasvoted = false;
  word.definitions.forEach(def => {
    def.votes.forEach(voter => {
      if(player.equals(voter)){
        hasvoted = true;
      }
    });
  });
  const canvote = (player.isVoter(word) && !hasvoted);

  const pose = () => {
    props.onPoseDefinition(posed);
    setPosed(new Definition('', player));
  }

  return <>
    <Box m={1} >
      <Card className={classes.root}>
        <CardContent>

          {/* word info */}
          <Box display='flex' flexDirection='row' alignItems='center' justifyContent='space-between'>
            <Typography variant="h6" component="h2">
              {props.word.value}
            </Typography>

          {/* word settings show/hide */}
          {(!defined || !voted) && <>
            <Tooltip title='settings'>
              <IconButton
                ref={settingsanchorref}
                color='primary'
                size='small'
                style={{color: '#B6B6B6'}}
                onClick={(e) => {
                  setSettingsAnchorRef(e.currentTarget);
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>


            <Popover
              // id={id}
              open={showsettings}
              anchorEl={settingsanchorref}
              onClose={(e) => {
                setSettingsAnchorRef(null);
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Box p={1} display='flex' flexDirection='column'>
                <IconButton
                  ref={settingsanchorref}
                  color='primary'
                  size='small'
                  style={{color: '#B6B6B6'}}
                  onClick={(e) => {
                    console.log('user requests to remove this word');
                    props.onRemoveWord(word);
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>

                <IconButton
                  ref={settingsanchorref}
                  color='primary'
                  size='small'
                  style={{color: '#B6B6B6'}}
                  onClick={(e) => {
                    let to = Word.fromObj(word); // copy the existing word
                    to.close();

                    props.onModifyWord(word, to);
                  }}
                >
                  <CheckRoundedIcon />
                </IconButton>
              </Box>
            </Popover> </>}

          </Box>
          {!defined &&
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              {`definitions: ${word.definitions.length}/${word.voters.length + 1}`}
            </Typography>}
          {defined && !voted &&
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              {`votes: ${votes}/${word.voters.length}`}
            </Typography>}
            
          
          {/* voting buttons */}
          <Box display='flex' flexDirection='column'>
        {shuffled.filter(def => (!canvote || (def.author.id !== player.id))).map((def, idx) => { // this filter prevents players from voting on their own definitions
          const isphony = (word.author.id !== def.author.id);
          console.log(isphony);
          return <>
            <Box key={`words.${word.value}.defs.${idx}`} fontWeight={(isphony || !voted) ? 'fontWeightLight' : 'fontWeightBold'}>
            {canvote && !voted && 
              <Radio
                style={{color: word.author.color}}
                checked={selected === idx}
                onChange={(e) => {
                  if(selected === idx){
                    setSelected(null);
                  }else{
                    setSelected(idx);
                  }
                }}
                inputProps={{ 'aria-label': `definition ${idx}: ${def.value}` }}
              />}
              {def.value}
            </Box> </>})}
          </Box>
        </CardContent>

        <CardActions style={{backgroundColor: word.author.color}}>

        {/* phony definition suggestion */}
        {canpose && <>
          <InputBase
            className={classes.input}
            value={posed.value}
            placeholder='phony definition'
            onChange={(e) => {
              setPosed(new Definition(e.target.value, player));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if(posed.value !== ''){
                  pose();
                }
              }
            }}
          />
          <Divider className={classes.divider} orientation="vertical" />
          <Tooltip title='submit phony definition'>
            <IconButton
              disabled={posed.value === ''}
              color='primary'
              className={classes.iconButton}
              onClick={(e) => {
                pose();
              }}
            >
              <SendRoundedIcon />
            </IconButton>
          </Tooltip> </>}

        {/* vote confirmation */}
        {defined && canvote && !voted && <>
          <Button
            disabled={(selected === null)}
            variant='contained'
            color='primary'
            onClick={(e) => {
              if(selected !== null){
                props.onVote(shuffled[selected]);
              }else{
                console.warn('you cant submit a vote without a selection!');
              }
            }}
          >
            vote
          </Button> </>}

    
        </CardActions>
      </Card>
    </Box>
</>}

export default WordCard;
