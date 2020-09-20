import React, {useState, useEffect} from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';

import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
// import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import Radio, { RadioProps } from '@material-ui/core/Radio';

import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';

import SendRoundedIcon from '@material-ui/icons/SendRounded';

import {Player, Definition, Word, Session} from './Elements';

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

const WordCard = (props: {word: Word, player: Player, onPoseDefinition: (posed: Definition) => void, onVote: (selected: Definition) => void}) => {
  const player = props.player;
  const word = props.word;

  const classes = useStyles();
  const [posed, setPosed] = useState<Definition>(new Definition('', player));

  let votes = 0;
  word.definitions.forEach(def => { votes += def.votes.length; });
  const voted = (votes === (word.voters.length));
  const defined = (word.definitions.length === (word.voters.length + 1));

  const [selected, setSelected] = useState<null | number>(null);

  const [shuffled, setShuffled] = useState<Definition[]>([]);

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

  return (
    <Box m={1} >
      <Card className={classes.root}>
        <CardContent>
          <Typography variant="h6" component="h2">
            {props.word.value}
          </Typography>
        {!defined &&
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            {`definitions: ${word.definitions.length}/${word.voters.length + 1}`}
          </Typography>
        }
        {defined && !voted &&
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            {`votes: ${votes}/${word.voters.length}`}
          </Typography>
        }
          

          <Box display='flex' flexDirection='column'>
          {shuffled.filter(def => (!canvote || (def.author.id !== player.id))).map((def, idx) => { // this filter prevents players from voting on their own definitions
            const isphony = (word.author.id !== def.author.id);
            console.log(isphony);
            return (
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
                />
              }
                {/* <Typography> */}
                  {def.value}
                {/* </Typography> */}
              </Box>
            );
          })}
          </Box>
        </CardContent>

        <CardActions style={{backgroundColor: word.author.color}}>

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
          </>}

        {defined && <>
        {canvote && !voted && 
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
          </Button>
        }
        </>}
    
        </CardActions>
      </Card>
    </Box>
  );
}

export default WordCard;
