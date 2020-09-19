import { O_RDONLY } from "constants";

function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop)
}

class Player {
  id: string
  constructor (id: string) {
    this.id = id;
  }

  static fromObj (obj: Player) {
    let player = new Player(obj.id);
    return player;
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

  addVote (vote: Player) {
    this.votes.push(vote);
  }

  static fromObj (obj: Definition) {
    let definition = new Definition(obj.value, obj.author);
    obj.votes.forEach((vote) => { definition.addVote(vote); });
    return definition;
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

  addVoter (voter: Player) {
    this.voters.push(voter);
  }

  addDefinition (definition: Definition) {
    this.definitions.push(definition);
  }

  static fromObj (obj: Word) {
    let real_defs = obj.definitions.filter(def => def.author.id === obj.author.id);
    let fake_defs = obj.definitions.filter(def => def.author.id !== obj.author.id);
    if(real_defs.length !== 1){ throw 'word must contain one real definition'; }
    let word = new Word(obj.value, real_defs[0], obj.author);
    obj.voters.forEach((voter) => { word.addVoter(voter); });
    fake_defs.forEach(def => { word.addDefinition(def); });
    return word;
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
