// import {MongodbCredentials} from './secrets.mjs';
// const username = MongodbCredentials.username;
// const password = MongodbCredentials.password;

const secrets = require('./secrets.js');
const username = secrets.MongodbCredentials.username;
const password = secrets.MongodbCredentials.password;


const defaultdb = 'fictionary'

const MongoClient = require('mongodb').MongoClient;
// import mongopkg from 'mongodb';
// const {MongoClient} = mongopkg;
const uri = `mongodb+srv://${username}:${password}@oclyke-sandboc.k8ns8.gcp.mongodb.net/${defaultdb}?retryWrites=true&w=majority`;
const mongoclient = new MongoClient(uri, { useNewUrlParser: true });



// const port = 46931;

const Express = require('express');
// import Express from 'express';
var cors = require('cors');
// import cors from 'cors';
var app = Express();
const socketIo = require('socket.io');
// import socketIo from 'socket.io';

const Elements = require('./Elements');
// import Elements from './Elements.js';


var session_clients = {};

app.use(cors());
app.use(Express.json());

var server = app.listen(secrets.SocketPort, async () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at http://%s:%s', host, port);

  try {
    await mongoclient.connect();
  } catch (e) {
    console.error(e);
  }

  const io = socketIo(server);
  io.on('connection', (socket) => {

    const ujm = (event, cb) => { // uniform JSON messenger
      const handler = async (data) => {
        console.log(`responding to event '${event}'`);
        const req = JSON.parse(data);
        var msg = {
          req: req,
          res: await cb(event, req),
        }
        socket.emit(event, JSON.stringify(msg));
      }
      socket.on(event, handler);
    }

    const requestCreateSession = (id) => {
      return new Promise((resolve, reject) => {
        requestReadSession(id)
        .then((session) => {
          reject('session already exists');
        })
        .catch((e) => { // a failed request to read a session indicates that the session does not exist, thus can be created
          mongoclient.db('fictionary').collection('sessions').insertOne(new Elements.Session(id))
          .then((command_result) => {
            if(command_result.result.ok){
              resolve();
            }else{
              reject('could not insert new session');
            }
          })
          .catch((e) => { reject(e); });
        });
      });
    };

    const requestReadSession = (id) => {
      return new Promise((resolve, reject) => {
        mongoclient.db('fictionary').collection('sessions').findOne({ id: id })
        .then((session) => {
          if(session){
            resolve(session);
          }else{
            reject('no session');
          }  
        })
        .catch((e) => { reject(e); });
      });
    };

    const requestUpdateSession = (id, update) => {
      return new Promise((resolve, reject) => {
        mongoclient.db('fictionary').collection('sessions').updateOne({ id: id }, update)
        .then((command_result) => {
          if(command_result.result.ok){
            resolve();
          }else{
            reject(`could not update ${id}`);
          }
        })
        .catch((e) => { reject(e); });
      });
    };

    const requestDeleteSession = (id) => {
      return new Promise((resolve, reject) => {
        mongoclient.db('fictionary').collection('sessions').deleteOne({ id: id })
        .then((command_result) => {
          if(command_result.result.ok === 1){
            console.log(`deleted session ${id}`);
            resolve();
          }else{
            reject(`could not delete ${id}`);
          }
        })
        .catch((e) => { reject(e); });
      });
    };

    const push = (id) => {
      requestReadSession(id).then((session) => {
        io.to(id).emit('session', JSON.stringify({res: session}));
      })
      .catch(e => console.warn(e));
    }

    ujm('idstatus', async (event, req) => {
      const id = req;
      var res = false;
      await requestReadSession(id)
      .then((session) => {
        res = true;
      })
      .catch((e) => console.warn(e));      
      return res;
    });

    ujm('join', async (event, session) => {
      const id = session.id;
      const player = Elements.Player.fromObj(session.players[0]);
      var res = {status: false, num_players: 0};
      try {
        if(typeof(session_clients[id]) === 'undefined'){
          session_clients[id] = [];
          await requestCreateSession(id);
        }
        session_clients[id].push({socket: socket, playerid: player.id});
        socket.join(id);
      } catch (e) {
        console.warn(e);
        return res;
      }
      try {
        const update = {
          $push: {
            'players': player,
          },
        };
        await requestUpdateSession(id, update);
      } catch (e) {
        console.warn(e);
      }
      await requestReadSession(id).then(session =>{
        res.num_players = session.players.length;
        res.status = true;
      })
      .catch(e => console.warn(e));
      push(id);
      return res;
    });

    ujm('session', async (event, req) => {
      const id = req;
      var res = 'no session info!';
      console.log('requesting session info for ', id);
      await requestReadSession(id).then((session) => {
        res = session;
      })
      .catch(e => console.warn(e));
      return res;
    });

    ujm('modify_player', async (event, req) => {
      const id = req.id;
      let from = Elements.Player.fromObj(req.from);
      let to = Elements.Player.fromObj(req.to);
      var res = false;
      await requestReadSession(id).then( async (session) => {
        const pull_update = {
          $pull: {
            players: {
              id: from.id,
            },
          },
        }
        const push_update = {
          $push: {
            players: to,
          }
        }
        await requestUpdateSession(id, pull_update).then( async () => {
          await requestUpdateSession(id, push_update).then( async () => {
            res = true;
            push(id);
          })
          .catch(e => console.warn(e));
        })
        .catch(e => console.warn(e));
      })
      .catch(e => console.warn(e));
      return res;
    });

    ujm('add_word', async (event, req) => {
      const id = req.id;
      let word = Elements.Word.fromObj(req.word);
      var res = false;
      await requestReadSession(id).then( async (session) => {
        word.voters = session.players.filter(player => player.id !== word.author.id);
        const update = {
          $push: {
            'words': word,
          }
        }
        await requestUpdateSession(id, update).then(() => {
          res = true;
          push(id);
        })
        .catch(e => console.warn(e));
      })
      .catch(e => console.warn(e));
      return res;
    });

    ujm('add_definition', async (event, req) => {
      const id = req.id;
      const word = Elements.Word.fromObj(req.word);
      const definition = Elements.Definition.fromObj(req.definition);

      var res = false;
      await requestReadSession(id).then( async (session) => {
        const idx = session.words.map((word) => { return word.value; }).indexOf(word.value);  
        const idx_key = `words.${idx}.definitions`;
        const sub_update = {};
        sub_update[idx_key] = definition;
        const update = {
          $push: sub_update,
        }
        await requestUpdateSession(id, update).then(() => {
          res = true;
          push(id);
        })
        .catch(e => console.warn(e));
      })
      .catch(e => console.warn(e));
      return res;
    });

    ujm('add_vote', async (event, req) => {
      const id = req.id;
      const voter = Elements.Player.fromObj(req.voter);
      const word = Elements.Word.fromObj(req.word);
      const definition = Elements.Definition.fromObj(req.definition);

      var res = false;
      await requestReadSession(id).then( async (session) => {
        const word_index = session.words.map((word) => { return word.value; }).indexOf(word.value);
        const def_index = session.words[word_index].definitions.map(def => def.value).indexOf(definition.value); 
        const idx_key = `words.${word_index}.definitions.${def_index}.votes`;
        const sub_update = {};
        sub_update[idx_key] = voter;
        const update = {
          $push: sub_update,
        }
        await requestUpdateSession(id, update).then(() => {
          res = true;
          push(id);
        })
        .catch(e => console.warn(e));
      })
      .catch(e => console.warn(e));
      return res;
    });

    socket.on('disconnect', async () => {
      for(const id in session_clients){
        const clients = session_clients[id];
        const sockets = session_clients[id].map(entry => entry.socket);
        if(sockets.includes(socket)){
          const idx = sockets.indexOf(socket);
          const update = {
            $pull: {
              players: {
                id: session_clients[id][idx].playerid,
              },
            },
          }
          await requestUpdateSession(id, update).then(() => {
            push(id);
          })
          .catch(e => console.warn(e));

          session_clients[id].splice(idx, 1);
          if(session_clients[id].length === 0){
            requestDeleteSession(id)
            .catch(e => console.warn(e));
          }


        }
      }
    });
  });
});
