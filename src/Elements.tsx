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

  equals (player: Player) {
    return (this.id === player.id);
  }

  isVoter (word: Word) {
    return (word.voters.filter(voter => this.equals(voter)).length !== 0);
  }

  // hasVoted (word: Word) { // currently commented out because of an error?
  //   console.log('has_voted: ', word, this);
  //   word.definitions.filter(def => console.log(def))
  //   return (word.definitions.filter(def => def.hasVote(this)).length !== 0);
  // }

  hasPosed (word: Word) {
    return (word.definitions.filter(def => this.equals(def.author)).length !== 0)
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

  hasVote (player: Player) {
    return (this.votes.filter(voter => player.equals(voter)).length !== 0);
  }
}

class Word {
  value: string;
  author: Player;
  voters: Player[];
  definitions: Definition[];
  constructor (value: string, definition: Definition) {
    this.value = value;
    this.author = definition.author;
    this.voters = [];
    this.definitions = [definition];
  }

  addVoter (voter: Player) {
    this.voters.push(voter);
    return this;
  }

  addDefinition (definition: Definition) {
    this.definitions.push(definition);
    return this;
  }

  static fromObj (obj: Word) {
    let real_defs = obj.definitions.filter(def => def.author.id === obj.author.id);
    let fake_defs = obj.definitions.filter(def => def.author.id !== obj.author.id);
    if(real_defs.length !== 1){ throw 'word must contain one real definition'; }
    let word = new Word(obj.value, real_defs[0]);
    obj.voters.forEach((voter) => { word.addVoter(voter); });
    fake_defs.forEach(def => { word.addDefinition(def); });
    return word;
  }

  hasVoter (player: Player) {
    return (this.voters.filter(voter => player.equals(voter)).length !== 0);
  }

  hasPosedBy (player: Player) {
    return (this.definitions.filter(def => player.equals(def.author)).length !== 0)
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

  addWord (word: Word) {
    this.words.push(word);
    return this;
  }
}

export {Player, Definition, Word, Session};
