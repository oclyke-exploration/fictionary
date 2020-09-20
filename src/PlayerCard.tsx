import React, {useState, useEffect} from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import {Player, Definition, Word, Session} from './Elements';

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
      throw 'there should always be one and only one real definition!';
    }
    let realdef = realdefs[0];

    let playersdefs = word.definitions.filter(def => def.author.id === player.id);
    if(playersdefs.length > 1){
      throw 'each player should have at most one definition'
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
      playersdef.votes.forEach(voter => {
        score += 1;
      })
    }
  });
  return score;
}

const PlayerCard = (props: {session: Session, player: Player, editable: boolean, onPlayerChange: (from: Player, to: Player) => void}) => {
  const player = props.player;

  const [editname, setEditName] = useState<boolean>(false);
  const score = getScore(props.session, player);

  return (
    <Box p={1}>
      <Paper elevation={0} style={{backgroundColor: player.color}}>
        <Box p={1}>
          <Typography variant='body2'>
            {`${(score > 0) ? '+' : ''}${score} : `}
            
            {editname ?
            <TextField
              size='small'
              onBlur={(e) => {
                if(props.editable){
                  setEditName(false);

                  let to = new Player(e.target.value);
                  to.setColor(player.color);
                  props.onPlayerChange(player, to);
                }
              }}
            />
            :
            <span
              onClick={(e) => {
                if(props.editable){
                  setEditName(true);
                }
              }}  
            >
              {player.id}
            </span>
            }
          </Typography> 
        </Box>
      </Paper>
    </Box>
  );
}


export default PlayerCard;
export {getScore};
