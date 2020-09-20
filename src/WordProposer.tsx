import React, {useState} from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';

import SendRoundedIcon from '@material-ui/icons/SendRounded';

const WordProposer = (props: {onSubmit: (word: string, definition: string) => void}) => {
  const [word, setWord] = useState('');
  const [def, setDef] = useState('');

  const propose = () => {
    props.onSubmit(word, def);
    setWord('');
    setDef('');
  }

  return (
    <Box m={1} style={{width: '100%'}}>
      <Paper style={{backgroundColor: 'whitesmoke'}}>
        <Box p={1} display='flex'>
          <Box>
            <TextField 
              value={word}
              label='new word'
              onChange={(e) => {
                setWord(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter'){
                  if((word !== '') && (def !== '')){
                    propose();
                  }
                }
              }}
              />
          </Box>
          <Divider orientation="vertical" style={{height: '100%', margin: 4}}/>
          <Box flexGrow={1}>
            <TextareaAutosize
              value={def}
              placeholder='real definition' 
              style={{width: '100%', height: '90%'}}
              onChange={(e) => {
                setDef(e.target.value);
              }}
              />
          </Box>
          <Box>
            <IconButton
              disabled={((word === '') || (def === ''))}
              color='primary'
              onClick={(e) => {
                propose();
              }}
            >
              <SendRoundedIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default WordProposer;
