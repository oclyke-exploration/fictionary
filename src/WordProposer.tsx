import React, {useState} from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import SendRoundedIcon from '@material-ui/icons/SendRounded';

import {Player, Definition, Word} from './Elements';

const WordProposer = (props: {player: Player, onSubmit: (word: Word) => void}) => {
  const [word, setWord] = useState<Word>(new Word().setAuthor(props.player));
  const [def, setDef] = useState<Definition>(new Definition().setAuthor(props.player));

  const propose = () => {
    props.onSubmit(word);
    setWord(new Word().setAuthor(props.player));
    setDef(new Definition().setAuthor(props.player));
  }
  const disabled = ((word.value === '') || (def.value === ''));

  return <>
    <Box m={1} style={{width: '100%'}}>
      <Paper style={{backgroundColor: 'whitesmoke'}}>
        <Box p={1} display='flex'>
          <Box>
            <TextField 
              value={word.value}
              label='new word'
              onChange={(e) => {
                setWord(Word.from(word).setValue(e.target.value));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter'){
                  if((word.value !== '') && (def.value !== '')){
                    propose();
                  }
                }
              }}
              />
          </Box>
          <Divider orientation="vertical" style={{height: '100%', margin: 4}}/>
          <Box flexGrow={1}>
            <TextareaAutosize
              value={def.value}
              placeholder='real definition' 
              style={{width: '100%', height: '90%'}}
              onChange={(e) => {
                const new_def = Definition.from(def).setValue(e.target.value);
                setDef(new_def);
                setWord(new Word().setValue(word.value).setAuthor(props.player).addDefinitions(new_def));
              }}
              />
          </Box>
          <Box>
            <Tooltip title={`add word ${(disabled) ? '(enter word + def)' : ''}`}>
              <span>
                <IconButton
                  disabled={disabled}
                  color='primary'
                  onClick={(e) => {
                    propose();
                  }}
                >
                  <SendRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </Box>
</>}

export default WordProposer;
