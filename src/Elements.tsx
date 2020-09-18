
function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}

class Player {
  id: string
  constructor (id: string) {
    this.id = id;
  }
}

class Definition {
  value: string;
  author: Player;
  votes: Player[];
  constructor (value: string, author: Player) {
    this.value = value;
    this.author = author;
    this.votes = [];
  }
}

class Word {
  value: string;
  author: Player;
  voters: Player[];
  definitions: Definition[];
  constructor (value: string, definition: Definition, author: Player) {
    this.value = value;
    this.author = author;
    this.voters = [];
    this.definitions = [definition];
  }
}

class Session {
  id: string;
  players: Player[];
  words: Word[];
  constructor (id: string) {
    this.id = id;
    this.players = [];
    this.words = [];
  }

  static fromUnknown(obj: any){
    let session = new Session(((typeof(obj) === 'object') && (typeof(obj.id) === 'string')) ? obj.id : 'invalid session!');
    if(typeof(obj) === 'object'){
      session.players = obj.players;
      session.words = obj.words;
    }
    return session;
  }

  addPlayer (player: Player) {
    this.players.push(player);
    return this;
  }
}

export {Player, Definition, Word, Session};
