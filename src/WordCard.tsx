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

  // html stuff
  const classes = useStyles();
  const [settingsanchorref, setSettingsAnchorRef] = React.useState<any>(null);
  const showsettings = Boolean(settingsanchorref);

  // definitions (posing: the one a player writes, shuffled: an array of all definitions shuffled once, selected: the index of the selected definition within the shuffled array)
  const [posing, setPosing] = useState<Definition>(new Definition().setAuthor(player));
  const [shuffled, setShuffled] = useState<Definition[]>([]);
  const [selected, setSelected] = useState<null | number>(null);

  const defined = word.posing_closed;
  useEffect(() => {
    if(defined){
      setShuffled(shuffle(word.definitions)); // only runs when defined changes to true (when all definitions provided)
    }
  }, [defined]);

  const pose = () => {
    props.onPoseDefinition(posing);
    setPosing(new Definition().setAuthor(player));
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
          {!word.voting_closed && <>
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
                    console.warn('need to implement word removal!');
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
                    console.warn('need to implement the checkmark for moving on to the next step (either voting or closing the word)')
                  }}
                >
                  <CheckRoundedIcon />
                </IconButton>
              </Box>
            </Popover> </>}

          </Box>
          {!word.posing_closed &&
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              {`definitions: ${word.definitions.length}/${word.committee.length + 1}`}
            </Typography>}
          {word.posing_closed &&
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              {`votes: ${word.getNumberVoters()}/${word.committee.length}`}
            </Typography>}
            
          
          {/* voting buttons */}
          {/* <Box display='flex' flexDirection='column'>
        {shuffled.filter(def => !player.isAuthor(def) || word.voting_closed).map((def, idx) => { // this filter prevents players from voting on their own definitions
          const isphony = (!word.author.equals(def.author));
          return <>
            <Box key={`words.${word.uuid}.defs.${def.uuid}`} fontWeight={(isphony || !word.voting_closed) ? 'fontWeightLight' : 'fontWeightBold'}>
            {player.canVote(word) && 
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
              {(word.voting_closed || player.canVote(word) || player.isAuthor(word)) && def.value}
            </Box> </>})} */}

          {shuffled.filter(def => (!word.voting_closed ? (!player.hasVoted(word) ? (!player.isAuthor(word) ? !player.isAuthor(def) : true) : true) : true)).map((def, idx) => {
            return <>
              <Box fontWeight={(!def.author.equals(word.author) || !word.voting_closed) ? 'fontWeightLight' : 'fontWeightBold'} key={`words.${word.uuid}.defs.${def.uuid}`}>
              {word.posing_closed && player.canVote(word) && 
                <Radio
                  style={{color: word.author.color}}
                  checked={selected === idx}
                  onChange={(e) => {
                    setSelected((selected === idx) ? null : idx);
                  }}
                  inputProps={{ 'aria-label': `definition ${idx}: ${def.value}` }}
                />}
                
                {def.value}
              </Box>
            </>})}



            
          {/* </Box> */}
        </CardContent>

        <CardActions style={{backgroundColor: word.author.color}}>

        {/* phony definition suggestion */}
        {player.canPose(word) && <>
          <InputBase
            className={classes.input}
            value={posing.value}
            placeholder='phony definition'
            onChange={(e) => {
              setPosing(new Definition().setValue(e.target.value).setAuthor(player));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if(posing.value !== ''){
                  pose();
                }
              }
            }}
          />
          <Divider className={classes.divider} orientation="vertical" />
          <Tooltip title={`${(posing.value === '') ? 'phony definition required' : 'pose phony definition'}`}>
            <span>
              <IconButton
                disabled={posing.value === ''}
                color='primary'
                className={classes.iconButton}
                onClick={(e) => {
                  pose();
                }}
              >
                <SendRoundedIcon />
              </IconButton>
            </span>
          </Tooltip> </>}

        {/* vote confirmation */}
        {word.posing_closed && player.canVote(word) && <>
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
