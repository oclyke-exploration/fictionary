import React from 'react';

import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';

import LoopRoundedIcon from '@material-ui/icons/LoopRounded';
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';
import ArrowForwardRoundedIcon from '@material-ui/icons/ArrowForwardRounded';

import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
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
  }),
);

const SessionSelector = (props: {id: string, join: boolean, onChange: (event: any) => void, onSuggest: (event: any) => void, onSubmit: (event: any) => void}) => {
  const classes = useStyles();

  return (
    <Paper component='form' className={classes.root}>
      <IconButton color='secondary' className={classes.iconButton}
        onClick={props.onSuggest}
      >
        <LoopRoundedIcon />
      </IconButton>
      <InputBase
        className={classes.input}
        value={props.id}
        placeholder='game id'
        onChange={props.onChange}
      />
      <Divider className={classes.divider} orientation="vertical" />
      <IconButton color='primary' className={classes.iconButton}
        onClick={props.onSubmit}
      >
        {(props.join) ? <ArrowForwardRoundedIcon /> : <AddCircleOutlineRoundedIcon /> }
      </IconButton>
    </Paper>
  );
}

export default SessionSelector;
