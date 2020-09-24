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

const WordCard = (props: {word: Word, player: Player, onPoseDefinition: (posed: Definition) => void, onVote: (selected: Definition) => void, onModifyWord: (from: Word, to: Word) => void, onDeleteWord: (word: Word) => void}) => {
  const player = props.player;
  const word = props.word;

  // html stuff
  const classes = useStyles();
  const [settingsanchorref, setSettingsAnchorRef] = React.useState<any>(null);
  const showsettings = Boolean(settingsanchorref);

  // definitions (posing: the one a player writes, shuffled: an array of all definitions shuffled once, selected: the index of the selected definition within the shuffled array)
  const [posing, setPosing] = useState<Definition>(new Definition().setAuthor(player));
  const [shuffled, setShuffled] = useState<Definition[]>([]);
  const [selected, setSelected] = useState<null | Definition>(null);
  const [maxvotes, setMaxVotes] = useState<number>(0);

  const defined = word.posing_closed;
  const voted = word.voting_closed;
  useEffect(() => {
    if(defined){ // only runs when defined changes to true (when all definitions provided)
      setShuffled(shuffle(word.definitions));
    }

    if(voted){  // when the votes are cast update the shuffled deck with (we're flirting with a silly bug here - the shuffled set of definitions doesn't update with props any more)
      const ordered = word.definitions.sort((a, b) => (b.votes.length - a.votes.length));
      setShuffled(ordered);
      if(ordered.length){
        setMaxVotes(ordered[0].votes.length);
      }
    }
  }, [defined, voted]);

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
          <>
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
                    props.onDeleteWord(word);
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>

                {!word.voting_closed && <>
                <IconButton
                  ref={settingsanchorref}
                  color='primary'
                  size='small'
                  style={{color: '#B6B6B6'}}
                  onClick={(e) => {
                    let to = Word.from(word);
                    if(!to.posing_closed){
                      to.posing_closed = true;
                    }else{
                      if(!to.voting_closed){
                        to.voting_closed = true;
                      }
                    }
                    props.onModifyWord(word, to);
                  }}
                >
                  <CheckRoundedIcon />
                </IconButton> </>}
              </Box>
            </Popover> </>

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
          {shuffled.filter(def => (!word.voting_closed ? (!player.hasVoted(word) ? (!player.isAuthor(word) ? !player.isAuthor(def) : true) : true) : true)).map((def, idx) => {
            return <>
              <Box fontWeight={(!def.author.equals(word.author) || !word.voting_closed) ? 'fontWeightLight' : 'fontWeightBold'} key={`words.${word.uuid}.defs.${def.uuid}`}>
              
              {word.voting_closed && [...([...Array(maxvotes - def.votes.length)].map(_ => '#ffffff')), ...(def.votes.map(voter => voter.color))].map(color => { return <>
                <span 
                  style={{
                    display: 'inline-block',
                    backgroundColor: color,
                    height: '12px',
                    width: '12px',
                  }}
                  /> </>})}
              
              {word.posing_closed && !word.voting_closed && player.canVote(word) && 
                <Radio
                  style={{color: word.author.color}}
                  checked={(selected === null) ? false : selected.equals(def)}
                  onChange={(e) => {
                    setSelected((selected === null) ? def : (selected.equals(def)) ? null : def);
                  }}
                  inputProps={{ 'aria-label': `definition ${idx}: ${def.value}` }}
                />}
                {def.value}
              </Box>
            </>})}

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
        {word.posing_closed && !word.voting_closed && player.canVote(word) && <>
          <Button
            disabled={(selected === null)}
            variant='contained'
            color='primary'
            onClick={(e) => {
              if(selected !== null){
                console.log(`${player.name} selected: `, selected)
                props.onVote(selected);
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
