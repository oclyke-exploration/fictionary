import { count } from 'console';
import { v4 as uuidv4 } from 'uuid';

// function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
//   return obj.hasOwnProperty(prop)
// }

class Player {
  readonly uuid: string;
  name: string;
  color: string;
  constructor (uuid?: string) {
    if(typeof(uuid) !== 'undefined'){
      this.uuid = uuid;
    }else{
      this.uuid = uuidv4();
    }
    this.name = '';
    this.color = 'whitesmoke';
  }

  setName (name: string) {
    this.name = name;
    return this;
  }

  setColor (color: string) {
    this.color = color;
    return this;
  }

  equals (player: Player) {
    return (this.uuid === player.uuid);
  }

  isAuthor (obj: Word | Definition) {
    return this.equals(obj.author);
  }

  onCommittee (word: Word) {
    return (word.committee.filter(member => this.equals(member)).length !== 0);
  }

  canPose (word: Word) {
    return (this.onCommittee(word) && !this.hasPosed(word));
  }

  hasPosed (word: Word) {
    let posers: Player[] = [];
    word.definitions.forEach(def => posers.push(def.author));
    return (posers.filter(poser => this.equals(poser)).length !== 0);
  }

  canVote (word: Word) {
    return (this.onCommittee(word) && !this.hasVoted(word) && !this.isAuthor(word));
  }

  hasVoted (word: Word) {
    let voters: Player[] = [];
    word.definitions.forEach(def => voters.push(...def.votes));
    return (voters.filter(voter => this.equals(voter)).length !== 0);
  }

  static from (obj: Player) {
    let player = new Player(obj.uuid);
    player.setName(obj.name);
    player.setColor(obj.color);
    return player;
  }

  static fromAny (obj: any) {
    let player = new Player(obj.uuid);
    player.setName(obj.name);
    player.setColor(obj.color);
    return player;
  }
}

class Definition {
  readonly uuid: string;
  value: string;
  author: Player;
  votes: Player[];
  constructor (uuid?: string) {
    if(typeof(uuid) !== 'undefined'){
      this.uuid = uuid;
    }else{
      this.uuid = uuidv4();
    }
    this.value = '';
    this.author = new Player();
    this.votes = [];
  }

  setValue (value: string) {
    this.value = value;
    return this;
  }

  setAuthor (author: Player) {
    this.author = author;
    return this;
  }

  addVotes (...voters: Player[]) {
    this.votes.push(...voters);
    return this;
  }

  equals (definition: Definition) {
    return (this.uuid === definition.uuid);
  }

  static from (obj: Definition) {
    let definition = new Definition(obj.uuid);
    definition.setValue(obj.value);
    definition.setAuthor(obj.author);
    if(obj.votes.length){
      definition.addVotes(...obj.votes);
    }
    return definition;
  }

  static fromAny (obj: any) {
    let definition = new Definition(obj.uuid);
    definition.setValue(obj.value);
    definition.setAuthor(Player.fromAny(obj.author));
    if(obj.votes.length){
      definition.addVotes(...obj.votes.map((voter: any) => Player.fromAny(voter)));
    }
    return definition;
  }
}

class Word {
  readonly uuid: string;
  value: string;
  author: Player;
  committee: Player[];        // players present when the word was presented (set by the server)
  definitions: Definition[];  // all possible definitions (including the real definiton)
  posing_closed: boolean;
  voting_closed: boolean;
  constructor (uuid?: string) {
    if(typeof(uuid) !== 'undefined'){
      this.uuid = uuid;
    }else{
      this.uuid = uuidv4();
    }
    this.value = '';
    this.author = new Player();
    this.committee = [];
    this.definitions = [];
    this.posing_closed = false;
    this.voting_closed = false;
  }

  setValue (value: string) {
    this.value = value;
    return this;
  }

  setAuthor (author: Player) {
    this.author = author;
    return this;
  }

  setCommittee (...committee: Player[]) {
    this.committee = committee;
    return this;
  }

  addDefinitions (...definitions: Definition[]) {
    this.definitions.push(...definitions);
    return this;
  }

  setPosing (open: boolean) {
    this.posing_closed = !open;
    if(open){
      this.setVoting(open);
    }
    return this;
  }

  setVoting (open: boolean) {
    this.voting_closed = !open;
    return this;
  }

  equals (word: Word) {
    return (this.uuid === word.uuid);
  }

  getRealDef () {
    return this.definitions.filter(def => def.author.equals(this.author))[0];
  }

  getPlayerDefs (player: Player) {
    return this.definitions.filter(def => def.author.equals(player));
  }

  getNumberVoters () {    
    return this.definitions.map(def => def.votes.length).reduce((acc, num) => acc + num);;
  }

  static from (obj: Word) {
    let word = new Word(obj.uuid);
    word.setValue(obj.value);
    word.setAuthor(obj.author);
    if(obj.committee.length){
      word.setCommittee(...obj.committee);
    }
    if(obj.definitions.length){
      word.addDefinitions(...obj.definitions);
    }
    word.setVoting(!obj.voting_closed);
    word.setPosing(!obj.posing_closed);
    return word;
  }

  static fromAny (obj: any) {
    let word = new Word(obj.uuid);
    word.setValue(obj.value);
    word.setAuthor(Player.fromAny(obj.author));
    if(obj.committee.length){
      word.setCommittee(...(obj.committee.map((member: any) => Player.fromAny(member))));
    }
    if(obj.definitions.length){
      word.addDefinitions(...(obj.definitions.map((def: any) => Definition.fromAny(def))));
    }
    word.setVoting(!obj.voting_closed);
    word.setPosing(!obj.posing_closed);
    return word;
  }
}

class Session {
  id: string;
  players: Player[];
  words: Word[];
  constructor () {
    this.id = '';
    this.players = [];
    this.words = [];
  }

  setID (id: string) {
    this.id = id;
    return this;
  }

  addPlayers (...players: Player[]) {
    this.players.push(...players);
    return this;
  }

  addPlayersAny (...players: any[]) {
    this.players.push(...players.map((p: any) => Player.fromAny(p)));
    return this;
  }

  addWordsAny (...words: any[]) {
    this.words.push(...(words.map((w: any) => Word.fromAny(w))));
    return this;
  }

  static fromAny(obj: any){
    let session = new Session();
    session.setID(obj.id);
    if(obj.players.length){
      session.addPlayersAny(...obj.players);
    }
    if(obj.words.length){
      session.addWordsAny(...obj.words);
    }
    return session;
  }
}

const computeScore = (session: Session, player: Player) => {
  // compute the player's score
  let score = 0;
  session.words.forEach(word => {
    if(!word.voting_closed){ return; } // only count words closed to voting

    let real = word.getRealDef();
    if(typeof(real) === 'undefined'){
      throw new Error('found word without a real defition during scoring');
    } // don't score words without a real definition

    let player_defs = word.getPlayerDefs(player);
    if(player_defs.length > 1){
      throw new Error('each player should have at most one definition');
    }
    const player_def = player_defs[0];

    // if the real definition is not selected at all the word author gets as many points as there were voters
    if(word.author.equals(player)){
      if(real.votes.length === 0){
        score += word.getNumberVoters();
      }
    }

    // if the voter guesses the correct definition they are awarded +2 points
    // (word authors cannot vote and so cannot earn points this way)
    if(real.votes.filter(voter => voter.equals(player)).length){
      score += 2;
    }

    // players are awarded +1 point for every vote received by their phony definition
    if(typeof(player_def) !== 'undefined'){
      if(!word.author.equals(player)){ // ensures that word authors do not score for votes on the correct definition
        score += player_def.votes.length;
      }
    }
  });
  return score;
}

export {Player, Definition, Word, Session, computeScore};
