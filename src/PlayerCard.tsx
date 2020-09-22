import React, {useState, useRef} from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import SettingsIcon from '@material-ui/icons/Settings';

import { SliderPicker } from 'react-color'

import {Player, Session} from './Elements';

const getScore = (session: Session, player: Player) => {
  // compute the player's score
  let score = 0;
  session.words.forEach(word => {

    let votes = 0;
    word.definitions.forEach(def => { votes += def.votes.length; });
    const voted = (votes === (word.voters.length));
    if(!voted){
      return; // do not count words that have not been fully voted
    }

    let realdefs = word.definitions.filter(def => def.author.id === word.author.id);
    if(realdefs.length !== 1){
      throw new Error('there should always be one and only one real definition!');
    }
    let realdef = realdefs[0];

    let playersdefs = word.definitions.filter(def => def.author.id === player.id);
    if(playersdefs.length > 1){
      throw new Error('each player should have at most one definition');
    }
    const playersdef = playersdefs[0];

    // if the real definition is not selected at all the word author gets as many points as there were voters
    if(word.author.id === player.id){
      if(realdef.votes.length === 0){
        score += word.voters.length;
      }
    }

    // if the voter guesses the correct definition they are awarded +2 points
    // (word authors cannot vote and so cannot earn points this way)
    if(realdef.votes.map(voter => voter.id).includes(player.id)){
      score += 2;
    }

    // players are awarded +1 point for every vote received by their phony definition
    if(word.author.id !== player.id){ // ensures that word authors do not score for votes on the correct definition
      if(typeof(playersdef) !== 'undefined'){
        playersdef.votes.forEach(voter => {
          score += 1;
        });
      }
    }
  });
  return score;
}

const PlayerCard = (props: {session: Session, player: Player, editable: boolean, onPlayerChange: (from: Player, to: Player) => void}) => {
  const player = props.player;

  const [editing, setEditing] = useState<boolean>(false);
  const [idchanged, setIdChanged] = useState<boolean>(false);
  const [newcolor, setNewColor] = useState('#ffffff');
  const [newid, setNewId] = useState('');

  const score = getScore(props.session, player);

  return <>
  <Box p={1}>
    <Paper
      style={{backgroundColor: player.color}}
      onClick={(e) => {
        setEditing(true);
      }}
    >
      <Box display='flex' flexDirection='row' alignItems='center' justifyContent='space-between'>
        {(!editing || !props.editable) && <>
        {/* score + id */}
        <Typography style={{paddingLeft: '8px', paddingTop: '4px', paddingBottom: '4px'}}>
          {`${(score > 0) ? '+' : ''}${score} : `}{player.id}
        </Typography>
        </>}

        {props.editable && editing &&
        <Box flexGrow={1} style={{marginLeft: '8px'}}>
          <InputBase
            fullWidth
            value={newid}
            // size='small'
            autoFocus={true}
            onClick={(e) => {
              e.stopPropagation();
            }}
            // onFocus={(e) => {
            //   setEditId(true);
            // }}
            onChange={(e) => {
              setNewId(e.target.value);
              setIdChanged(true);
              console.log('on change');
            }}
            onKeyDown={(e) => {
              console.log(e.key);
              if (e.key === 'Enter'){
                setEditing(false);
                let to = new Player((idchanged) ? newid : player.id);
                to.setColor(player.color);
                props.onPlayerChange(player, to);
              }
            }}
            // onBlur={(e) => {
            //   setEditId(false);
            // }}
          />
        </Box>}

        {/* edit / accept */}
        {props.editable &&
        <Box>
          <Tooltip title={(editing) ? 'accept changes' : 'edit player'}>
            <IconButton
              color='primary'
              size='small'
              style={{ color: (editing) ? undefined : '#B6B6B6'}}
              onClick={(e) => {
                e.stopPropagation();
                if(editing){
                  setEditing(false);
                  let to = new Player((idchanged) ? newid : player.id);
                  to.setColor(player.color);
                  props.onPlayerChange(player, to);
                }else{
                  setEditing(true);
                }
              }}
            >
              {(editing) ? <CheckRoundedIcon /> : <SettingsIcon /> }
            </IconButton>
          </Tooltip>
        </Box>}

      </Box>
    </Paper>
  </Box>
  {props.editable && editing && 
  <Box p={1}>
    <SliderPicker
      color={newcolor}
      onChange={(c) => {
        setNewColor(c.hex);
      }}
      onChangeComplete={(c) => {
        let to = new Player(player.id);
        to.setColor(c.hex);
        props.onPlayerChange(player, to);
        console.log(c.hex);
      }}
    />
  </Box>}
  </>
}


export default PlayerCard;
export {getScore};
