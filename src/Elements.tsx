
// function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
//   return obj.hasOwnProperty(prop)
// }

class Player {
  id: string
  color: string
  constructor (id: string) {
    this.id = id;
    this.color = 'whitesmoke';
  }

  static fromObj (obj: Player) {
    let player = new Player(obj.id);
    if(typeof(obj.color) === 'string'){
      player.setColor(obj.color);
    }
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

  setColor (color: string) {
    this.color = color;
    return this;
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
  notvoted: Player[];
  constructor (value: string, definition: Definition) {
    this.value = value;
    this.author = definition.author;
    this.voters = [];
    this.definitions = [definition];
    this.notvoted = [];
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
    if(real_defs.length !== 1){ throw new Error('word must contain one real definition'); }
    let word = new Word(obj.value, real_defs[0]);
    obj.voters.forEach((voter) => { word.addVoter(voter); });
    fake_defs.forEach(def => { word.addDefinition(def); });
    word.notvoted = obj.notvoted;
    return word;
  }

  hasVoter (player: Player) {
    return (this.voters.filter(voter => player.equals(voter)).length !== 0);
  }

  hasPosedBy (player: Player) {
    return (this.definitions.filter(def => player.equals(def.author)).length !== 0)
  }

  close () {
    const word_voter_ids: string[] = [];
    
    // this.definitions.forEach(def => { def.votes.forEach(voter => { word_voter_ids.push(voter.id); }); }); // accumulate ids from people who have voted // actually that is wrong - we need to put in place votes for a 

    this.definitions.filter(def => def.author.id !== this.author.id).forEach(def => word_voter_ids.push(def.author.id)); // anyone who has submitted a definition should remain in the voter list
    const word_notvoter_ids: string[] = word_voter_ids;

    this.definitions.forEach(def => {
      def.votes.forEach(voter => {
        console.log(`vote found on def: ${def.value}, voter: ${voter.id}`);
        if(word_notvoter_ids.includes(voter.id)){
          const idx = word_notvoter_ids.indexOf(voter.id);
          word_notvoter_ids.splice(idx, 1);
        }
      })
    });

    console.log('word_notvoter_ids: ', word_notvoter_ids);

    this.notvoted = this.voters.filter(voter => word_notvoter_ids.includes(voter.id));
    this.voters = this.voters.filter(voter => word_voter_ids.includes(voter.id));

    console.log('closing word', this, word_voter_ids);
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
