const Elements = require('./Elements');


const shuffle = (array) => {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}


const test = (name, fn) => {
  console.log(`testing '${name}': ${fn() ? 'pass' : 'fail'}`);
}

// test Player
// - copy constructor const original = new Player(); let copy = Player.from(original); copy.equals(original) && original.equals(copy);
const test_player = () => {
  console.log('\n\ntesting player element');
  test('constructor', () => {
    let player = new Elements.Player;
    return (typeof(player.name) === 'string');
  })
  test('copy constructor', () => {
    let original = new Elements.Player;
    let copy = Elements.Player.from(original);
    return ((original.equals(copy)) && (copy.equals(original)));
  })
}
test_player();


// test Definition
// - copy constructor: const original = new Definition(); let copy = Definition.from(original); copy.equals(original) && original.equals(copy);
// - adding one vote: .addVotes(new Player()).votes.length === 1
// - adding multiple votes at once: let def = new Definition().addVotes()
const test_definition = () => {
  console.log('\n\ntesting definition element');
  test('constructor', () => {
    let def = new Elements.Definition;
    return (typeof(def.value) === 'string');
  })
  test('copy constructor', () => {
    let original = new Elements.Definition;
    let copy = Elements.Definition.from(original);
    return ((original.equals(copy)) && (copy.equals(original)));
  })
  test('adding single vote', () => {
    let def = new Elements.Definition;
    let voter = new Elements.Player;
    def.addVotes(voter);
    return (def.votes.length === 1);
  })
  test('adding a few votes', () => {
    let def = new Elements.Definition;
    def.addVotes(new Elements.Player, new Elements.Player, new Elements.Player);
    return (def.votes.length === 3);
  })
  test('adding a ton of votes', () => {
    const num_voters = Math.ceil(Math.random()*100);
    let def = new Elements.Definition;
    let voters =  [...Array(num_voters)].map(_ => new Elements.Player);
    def.addVotes(...voters);
    return (def.votes.length === num_voters);
  })
}
test_definition();



const test_word = () => {
  console.log('\n\ntesting word element');
  test('get real def', () => {
    const num_false_defs = 10;
    const author = new Elements.Player;
    const word = new Elements.Word().setAuthor(author).addDefinitions(...shuffle([new Elements.Definition().setAuthor(author), ...[...Array(num_false_defs)].map(_ => new Elements.Definition().setAuthor(new Elements.Player))]))
    const real = word.getRealDef();
    if(word.definitions.length !== (num_false_defs + 1)){ return false; }
    if(typeof(real) === 'undefined'){ return false; }
    return (real.author.equals(author));
  })

  test('test adding definitions', () => {
    const num_false_defs = 10;
    const author = new Elements.Player;
    const word = new Elements.Word().setAuthor(author).addDefinitions(...shuffle([new Elements.Definition().setAuthor(author), ...[...Array(num_false_defs)].map(_ => new Elements.Definition().setAuthor(new Elements.Player))]))

    console.log('word after adding deinitions: ', word);
    console.log('is word.author an array?', word.author);

    if(word.definitions.length !== (num_false_defs + 1)){ return false; }
    if(typeof(real) === 'undefined'){ return false; }
    return (real.author.equals(author));
  })
}
test_word();
