"use strict";
exports.__esModule = true;
var uuid_1 = require("uuid");
// function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
//   return obj.hasOwnProperty(prop)
// }
var Player = /** @class */ (function () {
    function Player(uuid) {
        if (typeof (uuid) !== 'undefined') {
            this.uuid = uuid;
        }
        else {
            this.uuid = uuid_1.v4();
        }
        this.name = '';
        this.color = 'whitesmoke';
    }
    Player.prototype.setName = function (name) {
        this.name = name;
        return this;
    };
    Player.prototype.setColor = function (color) {
        this.color = color;
        return this;
    };
    Player.prototype.equals = function (player) {
        return (this.uuid === player.uuid);
    };
    Player.prototype.onCommittee = function (word) {
        var _this = this;
        return (word.committee.filter(function (member) { return _this.equals(member); }).length !== 0);
    };
    Player.prototype.canPose = function (word) {
        var _this = this;
        var posers = [];
        word.definitions.forEach(function (def) { return posers.push(def.author); });
        var has_posed = (posers.filter(function (poser) { return _this.equals(poser); }).length !== 0);
        return (this.onCommittee(word) && !has_posed);
    };
    Player.prototype.canVote = function (word) {
        return (this.onCommittee(word) && !this.hasVoted(word));
    };
    Player.prototype.hasVoted = function (word) {
        var _this = this;
        var voters = [];
        word.definitions.forEach(function (def) { return voters.push.apply(voters, def.votes); });
        return (voters.filter(function (voter) { return _this.equals(voter); }).length !== 0);
    };
    Player.from = function (obj) {
        var player = new Player(obj.uuid);
        player.setName(obj.name);
        player.setColor(obj.color);
        return player;
    };
    Player.fromAny = function (obj) {
        // console.log(`Player from Any`, obj);
        var player = new Player(obj.uuid);
        player.setName(obj.name);
        player.setColor(obj.color);
        return player;
    };
    return Player;
}());
exports.Player = Player;
var Definition = /** @class */ (function () {
    function Definition(uuid) {
        if (typeof (uuid) !== 'undefined') {
            this.uuid = uuid;
        }
        else {
            this.uuid = uuid_1.v4();
        }
        this.value = '';
        this.author = new Player();
        this.votes = [];
    }
    Definition.prototype.setValue = function (value) {
        this.value = value;
        return this;
    };
    Definition.prototype.setAuthor = function (author) {
        this.author = author;
        return this;
    };
    Definition.prototype.addVotes = function () {
        var _a;
        var voters = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            voters[_i] = arguments[_i];
        }
        (_a = this.votes).push.apply(_a, voters);
        return this;
    };
    Definition.prototype.equals = function (definition) {
        return (this.uuid === definition.uuid);
    };
    Definition.from = function (obj) {
        var definition = new Definition(obj.uuid);
        definition.setValue(obj.value);
        definition.setAuthor(obj.author);
        if (obj.votes.length) {
            definition.addVotes.apply(definition, obj.votes);
        }
        return definition;
    };
    Definition.fromAny = function (obj) {
        console.log("Definition from Any", obj);
        var definition = new Definition(obj.uuid);
        definition.setValue(obj.value);
        definition.setAuthor(obj.author);
        console.log('SERIOUS!?!?!', obj[0]);
        if (obj.votes.length) {
            definition.addVotes.apply(definition, obj.votes);
        }
        return definition;
    };
    return Definition;
}());
exports.Definition = Definition;
var Word = /** @class */ (function () {
    function Word(uuid) {
        if (typeof (uuid) !== 'undefined') {
            this.uuid = uuid;
        }
        else {
            this.uuid = uuid_1.v4();
        }
        this.value = '';
        this.author = new Player();
        this.committee = [];
        this.definitions = [];
        this.posing_closed = false;
        this.voting_closed = false;
    }
    Word.prototype.setValue = function (value) {
        this.value = value;
        return this;
    };
    Word.prototype.setAuthor = function (author) {
        this.author = author;
        return this;
    };
    Word.prototype.setCommittee = function () {
        var committee = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            committee[_i] = arguments[_i];
        }
        this.committee = committee;
        return this;
    };
    Word.prototype.addDefinitions = function () {
        var _a;
        var definitions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            definitions[_i] = arguments[_i];
        }
        (_a = this.definitions).push.apply(_a, definitions);
        return this;
    };
    Word.prototype.setPosing = function (open) {
        this.posing_closed = !open;
        if (open) {
            this.setVoting(open);
        }
        return this;
    };
    Word.prototype.setVoting = function (open) {
        this.voting_closed = !open;
        return this;
    };
    Word.prototype.equals = function (word) {
        return (this.uuid === word.uuid);
    };
    Word.prototype.getRealDef = function () {
        var _this = this;
        return this.definitions.filter(function (def) { return def.author.equals(_this.author); })[0];
    };
    Word.prototype.getPlayerDefs = function (player) {
        return this.definitions.filter(function (def) { return def.author.equals(player); });
    };
    Word.prototype.getNumberVoters = function () {
        var count = 0;
        this.definitions.forEach(function (def) {
            count += def.votes.length;
        });
        return count;
    };
    Word.from = function (obj) {
        var word = new Word(obj.uuid);
        word.setValue(obj.value);
        word.setAuthor(obj.author);
        word.setCommittee.apply(word, obj.committee);
        word.addDefinitions.apply(word, obj.definitions);
        word.setVoting(!obj.voting_closed);
        word.setPosing(!obj.posing_closed);
        return word;
    };
    Word.fromAny = function (obj) {
        console.log("Word from Any ", obj);
        var word = new Word(obj.uuid);
        word.setValue(obj.value);
        word.setAuthor(Player.fromAny(obj.author));
        word.setCommittee.apply(word, [obj.committee.map(function (member) { return Player.fromAny(member); })]);
        var existing_defs = obj.definitions.map(function (def) { return Definition.fromAny(def); });
        console.log('exisitng defs: ', existing_defs);
        // word.addDefinitions(...[existing_defs]);
        word.setVoting(!obj.voting_closed);
        word.setPosing(!obj.posing_closed);
        return word;
    };
    return Word;
}());
exports.Word = Word;
var Session = /** @class */ (function () {
    function Session() {
        this.id = '';
        this.players = [];
        this.words = [];
    }
    Session.prototype.setID = function (id) {
        this.id = id;
        return this;
    };
    Session.prototype.addPlayers = function () {
        var _a;
        var players = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            players[_i] = arguments[_i];
        }
        (_a = this.players).push.apply(_a, players);
        return this;
    };
    Session.prototype.addPlayersAny = function () {
        var _a;
        var players = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            players[_i] = arguments[_i];
        }
        // console.log('adding players');
        (_a = this.players).push.apply(_a, players.map(function (p) { return Player.fromAny(p); }));
        return this;
    };
    Session.prototype.addWordsAny = function () {
        var words = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            words[_i] = arguments[_i];
        }
        console.log('adding words from line 266 yo!', words);
        console.log(words.length);
        var new_words = words.map(function (w) {
            console.log('this crazy function trying to make words: ');
            return Word.fromAny(w);
        });
        console.log('new_words to push: ', new_words);
        // this.words.push(...(
        // ));
        return this;
    };
    Session.fromAny = function (obj) {
        // console.log(`Session from Any`, obj);
        var session = new Session();
        session.setID(obj.id);
        if (obj.players.length) {
            session.addPlayersAny.apply(session, obj.players);
        }
        if (obj.words.length) {
            session.addWordsAny.apply(session, obj.words);
        }
        return session;
    };
    return Session;
}());
exports.Session = Session;
var computeScore = function (session, player) {
    // compute the player's score
    var score = 0;
    session.words.forEach(function (word) {
        if (!word.voting_closed) {
            return;
        } // only count words closed to voting
        var real = word.getRealDef();
        if (typeof (real) === 'undefined') {
            throw new Error('found word without a real defition during scoring');
        } // don't score words without a real definition
        var player_defs = word.getPlayerDefs(player);
        if (player_defs.length > 1) {
            throw new Error('each player should have at most one definition');
        }
        var player_def = player_defs[0];
        // if the real definition is not selected at all the word author gets as many points as there were voters
        if (word.author.equals(player)) {
            if (real.votes.length === 0) {
                score += word.getNumberVoters();
            }
        }
        // if the voter guesses the correct definition they are awarded +2 points
        // (word authors cannot vote and so cannot earn points this way)
        if (real.votes.filter(function (voter) { return voter.equals(player); }).length) {
            score += 2;
        }
        // players are awarded +1 point for every vote received by their phony definition
        if (typeof (player_def) !== 'undefined') {
            if (!word.author.equals(player)) { // ensures that word authors do not score for votes on the correct definition
                score += player_def.votes.length;
            }
        }
    });
    return score;
};
exports.computeScore = computeScore;
