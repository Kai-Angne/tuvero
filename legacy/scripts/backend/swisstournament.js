/**
 * Implementation of the swiss tournament system where there's only one player.
 * If you need teams, first consider to enter a team as a single player before
 * rewriting for multi-player teams, which are only useful for random teams.
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(['./tournament', './map', './finebuchholzranking', './game',
    './result', './random', './correction', './options', './rleblobber'], function(Tournament, Map, Finebuchholzranking, Game, Result, Random, Correction, Options, RLEBlobber) {
  var Swisstournament;

  /**
   * constructor
   *
   * @return {Swisstournament}
   */
  Swisstournament = function() {
    this.players = new Map();
    this.ranking = new Finebuchholzranking();
    this.state = Tournament.STATE.PREPARING;
    this.games = [];
    this.upvote = []; // number of upvotes. undefined or 0 if none
    this.downvote = []; // number of downvotes. undefined or 0 if none
    this.byevote = []; // number of byes. undefined or 0 if none
    this.rng = new Random();
    this.round = 0; // 0 if not started yet, 1 is first valid round, ...
    this.roundvotes = {
      upvotes: [],
      downvotes: [],
      byevote: undefined
    };
    this.rnkbuffer;

    this.rkch = true;

    this.options = {
      mode: 'wins',
      permissions: {
        // false: combination not allowed
        // true: combination allowed
        // outer key: previous vote
        // inner key: next vote (i.e. the one to be validated)
        up: {
          up: false,
          down: true,
          bye: true
        },
        down: {
          up: true,
          down: false,
          bye: true
        },
        bye: {
          up: true,
          down: true,
          bye: false
        }
      }
    };
  };

  /**
   * (implemented tournament function)
   *
   * @param id
   * @return
   */
  Swisstournament.prototype.addPlayer = function(id) {
    if (this.state !== Tournament.STATE.PREPARING) {
      return undefined;
    }

    this.players.insert(id);
    this.ranking.resize(this.players.size());
    this.rkch = true;

    return this;
  };

  /**
   * (implemented tournament function)
   *
   * @return this on success, undefined otherwise
   */
  Swisstournament.prototype.start = function() {
    var valid;

    if (this.state === Tournament.STATE.RUNNING) {
      return undefined;
    }

    if (this.players.size() < 2) {
      return undefined;
    }

    valid = false;

    switch (this.options.mode) {
    case 'wins':
      valid = (newRoundByWins.call(this) === this);
      break;
    case 'random':
      valid = (newRoundByRandom.call(this) === this);
      break;
    case 'halves':
      valid = (newRoundByHalves.call(this) === this);
      break;
    default:
      console.error('swiss: undefined round mode: ' + this.options.mode);
      return undefined;
    }

    if (valid) {
      this.state = Tournament.STATE.RUNNING;
      this.round += 1;
      this.rkch = true;
    } else {
      return undefined;
    }

    return true;
  };

  /**
   * (implemented tournament function)
   *
   * @return
   */
  Swisstournament.prototype.end = function() {
    if (this.state !== Tournament.STATE.RUNNING) {
      return undefined;
    }

    // check for running games
    if (this.games.length !== 0) {
      return undefined;
    }

    this.state = Tournament.STATE.FINISHED;
    return this.getRanking();
  };

  /**
   * (implemented tournament function)
   *
   * @param game
   * @param points
   * @return
   */
  Swisstournament.prototype.finishGame = function(game, points) {
    var i, invalid;
    if (this.state !== Tournament.STATE.RUNNING) {
      return undefined;
    }

    // abort if game has too many players
    if (game.teams[0].length !== 1 || game.teams[1].length !== 1) {
      return undefined;
    }

    // convert to internal pid
    game = new Game(this.players.find(game.teams[0][0]), this.players.find(game.teams[1][0]), game.id);

    // verify that the game is in the games list
    invalid = true;
    for (i = 0; i < this.games.length; i += 1) {
      if (game.equals(this.games[i])) {
        invalid = false;
        break;
      }
    }

    if (invalid === true) {
      return undefined;
    }

    // remove the game from the list
    this.games.splice(i, 1);

    // last game, finished for now
    if (this.games.length === 0) {
      this.state = Tournament.STATE.FINISHED;
    }

    // apply ranking
    this.ranking.add(new Result(game.teams[0], game.teams[1], points[0], points[1]));
    this.rkch = true;

    return this;
  };

  /**
   * (implemented tournament function)
   *
   * @return {Array}
   */
  Swisstournament.prototype.getGames = function() {
    // convert internal to external ids
    var games = [];
    this.games.forEach(function(game, i) {
      games[i] = new Game(this.players.at(game.teams[0][0]), this.players.at(game.teams[1][0]), game.id);
    }, this);

    return games;
  };

  /**
   * return the up/down/byevotes of the current round
   *
   * @return an object containing the three votes
   */
  function getRoundVotes() {
    // convert internal to external ids
    var votes = {
      up: [],
      down: [],
      bye: undefined
    };

    this.roundvotes.upvotes.forEach(function(up) {
      votes.up.push(this.players.at(up));
    }, this);

    this.roundvotes.downvotes.forEach(function(down) {
      votes.down.push(this.players.at(down));
    }, this);

    if (this.roundvotes.byevote !== undefined) {
      votes.bye = this.players.at(this.roundvotes.byevote);
    }

    return votes;
  }

  /**
   * (implemented tournament function)
   *
   * @return
   */
  Swisstournament.prototype.getRanking = function() {
    var result, ret, roundvotes, allvotes;

    if (this.rankingChanged()) {
      ret = {
        place: [],
        ids: [],
        games: [],
        wins: [],
        buchholz: [],
        finebuchholz: [],
        netto: [],
        roundupvote: [],
        rounddownvote: [],
        roundbyevote: [],
        upvote: [],
        downvote: [],
        byevote: [],
        round: this.round
      };

      result = this.ranking.get();
      this.rkch = false;
      roundvotes = getRoundVotes.call(this);

      // rearrange the arrays from internal id indexing to ranked indexing
      result.ranking.forEach(function(i, rank) {
        var pid;

        // external player id
        pid = this.players.at(i);

        ret.place[rank] = rank;
        ret.ids[rank] = pid;
        ret.buchholz[rank] = result.buchholz[i];
        ret.finebuchholz[rank] = result.finebuchholz[i];
        ret.netto[rank] = result.netto[i];
        ret.games[rank] = result.games[i];
        ret.wins[rank] = result.wins[i];
        ret.roundupvote[rank] = (roundvotes.up.indexOf(pid) !== -1) ? 1 : 0;
        ret.rounddownvote[rank] = (roundvotes.down.indexOf(pid) !== -1) ? 1 : 0;
        ret.roundbyevote[rank] = (roundvotes.bye === pid) ? 1 : 0;
        ret.upvote[rank] = (this.upvote[this.players.find(pid)] || 0);
        ret.downvote[rank] = (this.downvote[this.players.find(pid)] || 0);
        ret.byevote[rank] = (this.byevote[this.players.find(pid)] || 0);
      }, this);

      this.rnkbuffer = ret;
    }

    return this.rnkbuffer;
  };

  /**
   * Start a new round. This function creates a randomized set of new games,
   * disregarding the players' ids and previous games
   *
   * @return this on success, undefined otherwise
   */
  function newRoundByRandom() {
    // TODO test
    var playersleft, byes, bye, id, numplayers, p1, p2, newgames, triesleft, globaltries;

    // abort if the tournament isn't running
    if (this.state === Tournament.STATE.RUNNING) {
      return undefined;
    }
    // abort if there are unfinished games from a previous round
    if (this.games.length !== 0) {
      return undefined;
    }

    numplayers = this.players.size();

    bye = undefined;

    if (numplayers % 2 === 1) {
      // we need a bye;

      byes = [];

      for (id = 0; id < numplayers; id += 1) {
        if (canByeVote.call(this, id)) {
          byes.push(id);
        }
      }

      if (byes.length == 0) {
        console.error('All players got byes');
        return undefined;
      }

      bye = this.rng.pick(byes);
    }

    // just randomize it

    globaltries = 50;
    newgames = [];

    while (globaltries > 0) {
      triesleft = numplayers * 20;
      globaltries -= 1;

      playersleft = [];
      for (id = 0; id < numplayers; id += 1) {
        if (id !== bye) {
          playersleft.push(id);
        }
      }

      // TODO add backtracking
      while (playersleft.length > 0) {
        p1 = this.rng.pickAndRemove(playersleft);
        p2 = this.rng.pickAndRemove(playersleft);

        if (canPlay.call(this, p1, p2)) {
          newgames.push(new Game(p1, p2, newgames.length));
        } else {
          playersleft.push(p1);
          playersleft.push(p2);
        }

        triesleft -= 1;
        if (triesleft <= 0) {
          newgames = [];
          break;
        }
      }

      if (newgames.length) {
        break;
      }
    }

    if (newgames.length === 0) {
      console.warn('Failed to find non-repeating games');
      return undefined;
    }

    clearRoundvotes.call(this);

    this.games = newgames;
    if (bye !== undefined) {
      byeVote.call(this, bye);
      this.roundvotes.byevote = bye;
    }

    return this;
  }

  /**
   * Start a new round. This function creates a randomized set of new games,
   * maintaining up/down/byevotes.
   *
   * @return this on success, undefined otherwise
   */
  function newRoundByHalves() {
    // TODO test
    var upper, lower, byes, bye, id, numplayers, p1, p2, newgames, triesleft, ids;

    // abort if the tournament isn't running
    if (this.state === Tournament.STATE.RUNNING) {
      return undefined;
    }
    // abort if there are unfinished games from a previous round
    if (this.games.length !== 0) {
      return undefined;
    }

    lower = [];
    upper = [];
    numplayers = this.players.size();

    ids = this.getRanking().ids;
    if (!ids || numplayers !== ids.length) {
      console.error('swisstournament halves: lengths of sorted ids and players differ');
      return undefined;
    }

    bye = undefined;

    // construct the halves
    // The lower half is allowed to have one more player than the upper half
    id = 0;
    while (numplayers - upper.length - lower.length > 1) {
      upper.push(ids[id]);
      lower.push(ids[numplayers - id - 1]);
      id += 1;
    }

    switch (numplayers - upper.length - lower.length) {
    case 0:
      // all players got assigned
      break;
    case 1:
      lower.push(id);
      break;
    default:
      console.error('swisstournament halves: too many players left. Aborting');
      return undefined;
    }

    if (upper.length != lower.length && upper.length != lower.length - 1) {
      console.error("Swisstournament: Halves aren't of a valid size. Aborting");
      return undefined;
    }

    if (numplayers % 2 === 1) {
      // we need a bye;

      byes = [];

      for (id in lower) {
        id = lower[id];
        if (canByeVote.call(this, id)) {
          byes.push(id);
        }
      }

      if (byes.length == 0) {
        console.error('All players got byes');
        return undefined;
      }

      bye = this.rng.pick(byes);
      lower.splice(lower.indexOf(bye), 1);
    }

    // just randomize it

    triesleft = numplayers * 25;
    newgames = [];

    while (lower.length > 0) {
      p1 = this.rng.pickAndRemove(lower);
      p2 = this.rng.pickAndRemove(upper);

      if (canPlay.call(this, p1, p2)) {
        newgames.push(new Game(p1, p2, newgames.length));
      } else {
        lower.push(p1);
        upper.push(p2);
      }

      triesleft -= 1;
      if (triesleft <= 0) {
        console.warn('Failed to find non-repeating games');
        return undefined;
      }
    }

    // apply
    clearRoundvotes.call(this);
    this.games = newgames;
    if (bye !== undefined) {
      byeVote.call(this, bye);
      this.roundvotes.byevote = bye;
    }

    return this;
  }

  /**
   * Start a new round. This function creates a randomized set of new games,
   * maintaining up/down/byevotes.
   *
   * @return this on success, undefined otherwise
   */
  function newRoundByWins() {
    var wingroups, votes, newgames, timeout, lowestWinGroup;
    // TODO add backtracking

    // abort if the tournament isn't running
    if (this.state === Tournament.STATE.RUNNING) {
      return undefined;
    }
    // abort if there are unfinished games from a previous round
    if (this.games.length !== 0) {
      console.error('there are still games running');
      return undefined;
    }

    timeout = this.players.size() * 25;
    wingroups = winGroups.call(this);

    // abort if there are no consistent wingroups, which is a sign for too
    // many rounds
    if (wingroups === undefined) {
      console.error('cannot form consistent wingroups');
      return undefined;
    }

    votes = preliminaryDownVotes.call(this, wingroups);

    if (votes === undefined) {
      // abort. there's no way to downvote properly
      console.warn('wingroups: missing downvotes');
      return undefined;
    }

    // Algorithm (copy of the comments below)
    // for each wingroup:
    // / exclude the downvote from this group, if any
    // / if player has been downvoted into this group:
    // / / create game with a random upvote candidate
    // / while there are players in this group:
    // / / pick any two random players
    // / / if they haven't already played against another
    // / / / create game

    newgames = [];

    for (lowestWinGroup = 0; lowestWinGroup < wingroups.length; lowestWinGroup += 1) {
      if (wingroups[lowestWinGroup] !== undefined && wingroups[lowestWinGroup].length !== 0) {
        break;
      }
    }

    if (lowestWinGroup === wingroups.length) {
      console.warn('no lowest win group detected, meaning that there are no players');
      return undefined;
    }

    // for each wingroup:
    wingroups.forEach(function(wingroup, wins) {
      var candidates, p1, p2;
      // exclude the downvote or byevote from this group, if any

      if (timeout <= 0) {
        return;
      }

      p1 = votes.downvotes[wins];
      if (wins === lowestWinGroup) {
        p1 = votes.byevote;
      }
      if (p1 !== undefined) {
        wingroup.splice(wingroup.indexOf(p1), 1);
      }

      // if player has been downvoted into this group:
      p1 = votes.downvotes[wins + 1];
      if (p1 !== undefined && p1 != votes.downvotes[wins]) {
        candidates = [];

        // create game with a random upvote candidate
        wingroup.forEach(function(pid2) {
          // canPlay: performance vs security?
          if (canUpVote.call(this, pid2) && canPlay.call(this, p1, pid2)) {
            candidates.push(pid2);
          }
        }, this);

        p2 = this.rng.pick(candidates);

        newgames.push(new Game(p1, p2, newgames.length));
        wingroup.splice(wingroup.indexOf(p2), 1);
        votes.upvotes[wins] = p2;
      }

      // while there are players in this group:
      while (wingroup.length > 1) {
        // pick any two random players
        p1 = this.rng.pick(wingroup);
        p2 = this.rng.pick(wingroup);
        if (p1 !== p2) {
          // if they haven't already played against another
          if (canPlay.call(this, p1, p2)) {
            // create game
            newgames.push(new Game(p1, p2, newgames.length));
            wingroup.splice(wingroup.indexOf(p1), 1);
            wingroup.splice(wingroup.indexOf(p2), 1);
          } else {
            // TODO keep track of previous matchings and avoid them
          }

          timeout -= 1;
          if (timeout <= 0) {
            console.warn('newRoundByWins: timeout reached. Key players have already been matched');
            return;
          }
        }
      }
    }, this);

    if (timeout <= 0) {
      return undefined;
    }

    // apply the votes
    if (applyVotes.call(this, votes) === undefined) {
      // abort if something's wrong with the votes
      this.games = [];
      return undefined;
    }
    // apply the games
    this.games = newgames;

    return this;
  }

  /**
   * @param votes
   *          processed votes structure as returned by preliminaryDownVotes()
   *          and processed by newRoundByWins()
   * @return {Swisstournament} this
   */
  function applyVotes(votes) {
    var downcount, upcount, downvalid, upvalid;

    downcount = 0;
    downvalid = true;
    votes.downvotes.forEach(function(down) {
      if (down !== undefined) {
        downcount += 1;
      }
      if (!canDownVote.call(this, down)) {
        downvalid = false;
      }
    }, this);

    upcount = 0;
    upvalid = true;
    votes.upvotes.forEach(function(up) {
      if (up !== undefined) {
        upcount += 1;
      }
      if (!canUpVote.call(this, up)) {
        upvalid = false;
      }
    }, this);

    // abort if upvotes and downvotes differ or some vote was invalid
    if (downcount !== upcount || !downvalid || !upvalid) {
      return undefined;
    }

    if (votes.byevote !== undefined && !canByeVote.call(this, votes.byevote)) {
      return undefined;
    }

    // apply byevote
    byeVote.call(this, votes.byevote);

    // apply downvotes
    votes.downvotes.forEach(function(down) {
      downVote.call(this, down);
    }, this);

    votes.upvotes.forEach(function(up) {
      upVote.call(this, up);
    }, this);

    this.roundvotes = votes;

    return this;
  }

  /**
   * Build a 2d array of wingroups. Outer key is the number of wins (0+), values
   * in inner array are internal player ids
   *
   * @return 2d array of wingroups
   */
  function winGroups() {
    var wingroups, res, pid, numplayers, wins, highest;

    wingroups = [];

    highest = -1;
    lowest = -1;

    res = this.ranking.get();

    numplayers = this.players.size();

    for (pid = 0; pid < numplayers; pid += 1) {
      wins = res.wins[pid] || 0;

      if (wins > highest) {
        highest = wins;
      }

      if (wingroups[wins] === undefined) {
        wingroups[wins] = [];
      }
      wingroups[wins].push(pid);
    }

    // verify that there's at least one player in every win group
    for (wins = 0; wins <= highest; wins += 1) {
      if (!wingroups[wins]) {
        // there's a wingroup missing. The tournament lasts too long
        // return undefined;
        console.warn('wingroup #' + wins + ' is empty');
        wingroups[wins] = [];
      }
    }

    return wingroups;
  }

  // TODO don't reset the roundvotes, but only apply them from a temp. object
  function clearRoundvotes() {
    this.roundvotes = {
      upvotes: [],
      downvotes: [],
      byevote: undefined
    };
  }

  /**
   * create a list of players to downvote/byevote using the given wingroups
   *
   * @param wingroups
   *          wingroups as returned by winGroups()
   * @return An object containing byevote, downvotes and an empty array of
   *          upvotes. The key of the downvote array is the number of wins this
   *          player has been voted from.
   */
  function preliminaryDownVotes(wingroups) {
    // Due to the symmetric properties of a swiss tournament, we don't
    // verify possible upvotes. If the tournament has too many rounds, this
    // may fail someday.
    var byevote, downvotes, w, candidates, downvoted, fillCandidates, lowestWinGroup;

    byevote = undefined;
    downvoted = false; // whether a player has been downvoted into the
    // current wingroup
    downvotes = [];
    candidates = [];

    for (lowestWinGroup = 0; lowestWinGroup < wingroups.length; lowestWinGroup += 1) {
      if (wingroups[lowestWinGroup] !== undefined && wingroups[lowestWinGroup].length !== 0) {
        break;
      }
    }

    if (lowestWinGroup === wingroups.length) {
      console.error('no lowest win group detected, meaning that there are not players');
      return undefined;
    }

    // forEach-function to fill the candidates array. DownVote version.
    fillCandidates = function(pid) {
      if (canDownVote.call(this, pid)) {
        candidates.push(pid);
      }
    };

    // iterate over all wingroups, starting with the highest one, thereby
    // ensuring that all groups except the lowest one are even in player
    // count.
    for (w = wingroups.length - 1; w > lowestWinGroup; w -= 1) {
      // only downvote a player if the current group has an odd number of
      // players
      if ((wingroups[w].length + (downvoted ? 1 : 0)) & 0x1) {
        // create a dense list of candidates
        candidates = [];
        wingroups[w].forEach(fillCandidates, this);
        if (wingroups[w].length === 0 && downvoted) {
          candidates.push(downvotes[w + 1]);
        }

        // abort if no player can be downvoted
        if (candidates.length === 0) {
          console.warn('no player in wingroup ' + w + ' can be downvoted');
          return undefined;
        }

        // select a random player from the candidates array
        downvotes[w] = this.rng.pick(candidates);
        downvoted = true;
      } else {
        downvoted = false;
      }
    }

    // byevote from the lowest group, if necessary. Same procedure as with
    // the downvotes
    if ((wingroups[lowestWinGroup].length + (downvoted ? 1 : 0)) & 0x1) {
      candidates = [];
      // forEach-function to fill the candidates array. ByeVote version.
      fillCandidates = function(pid) {
        if (canByeVote.call(this, pid)) {
          candidates.push(pid);
        }
      };

      wingroups[lowestWinGroup].forEach(fillCandidates, this);

      if (candidates.length === 0) {
        console.warn('no candidate wingroup ' + w + ' can be byevoted');
        return undefined;
      }

      byevote = this.rng.pick(candidates);
    }

    // finally, return
    return {
      byevote: byevote,
      downvotes: downvotes,
      upvotes: []
    };
  }

  /**
   * @param id
   *          internal player id
   * @param permissions
   *          reference to this.options.permissions.something
   * @return {Boolean} whether vote action complies with the permissions
   */
  function canVote(id, permissions) {

    if (typeof (id) !== 'number') {
      return false;
    }

    if (id >= this.players.size()) {
      return false;
    }

    if (!permissions.up && this.upvote[id]) {
      return false;
    }
    if (!permissions.down && this.downvote[id]) {
      return false;
    }
    if (!permissions.bye && this.byevote[id]) {
      return false;
    }

    return true;
  }

  /**
   * @param id
   *          internal player id
   * @return true of the player can be downvoted, false otherwise
   */
  function canDownVote(id) {
    return canVote.call(this, id, this.options.permissions.down);
  }

  /**
   * @param id
   *          internal player id
   * @return true of the player can be upvoted, false otherwise
   */
  function canUpVote(id) {
    return canVote.call(this, id, this.options.permissions.up);
  }

  /**
   * @param id
   *          internal player id
   * @return true of the player can be byevoted, false otherwise
   */
  function canByeVote(id) {
    return canVote.call(this, id, this.options.permissions.bye);
  }

  /**
   * @param id
   *          internal player id to downvote
   * @return {Swisstournament} this
   */
  function downVote(id) {
    if (canDownVote.call(this, id)) {
      if (isNaN(this.downvote[id])) {
        this.downvote[id] = 1;
      } else {
        this.downvote[id] += 1;
      }
    }

    return this;
  }

  /**
   * @param id
   *          internal player id to be upvoted
   * @return {Swisstournament} this
   */
  function upVote(id) {
    if (canUpVote.call(this, id)) {
      if (isNaN(this.upvote[id])) {
        this.upvote[id] = 1;
      } else {
        this.upvote[id] += 1;
      }
    }

    return this;
  }

  /**
   * @param id
   *          internal player id to be byevoted
   * @return {Swisstournament} this
   */
  function byeVote(id) {
    if (canByeVote.call(this, id)) {
      if (isNaN(this.byevote[id])) {
        this.byevote[id] = 1;
      } else {
        this.byevote[id] += 1;
      }
      this.ranking.grantBye(id);
    }

    return this;
  }

  /**
   * Verify whether two players can play against another
   *
   * @param pid1
   *          internal id of first player
   * @param pid2
   *          iternal id of second player
   * @return {Boolean} true if they would form a valid game, false otherwise
   */
  function canPlay(pid1, pid2) {
    // DEBUG START
    // if (!pid1 < this.players.size())
    // console.error('pid1 too big');
    // if (!pid2 < this.players.size())
    // console.error('pid2 too big');
    // if (!pid1 !== pid2)
    // console.error('pid1 == pid2')
    // if (this.ranking.added(new Game(pid1, pid2)))
    // console.error('game was already played')
    // DEBUG END
    // FIXME dont allocate a new Game EVERY TIME!
    return pid1 < this.players.size() && pid2 < this.players.size() && pid1 !== pid2 && this.ranking.added(new Game(pid1, pid2)) === false;
  }

  /**
   * correct the result of a game. Since the games are determined by the
   * tournament itself, there's no need to correct the team
   *
   * @param game
   *          the game
   * @param oldpoints
   *          array of faulty points
   * @param newpoints
   *          array of corrected points
   * @return {Swisstournament} undefined on failure, this otherwise
   */
  // TODO test
  Swisstournament.prototype.correct = function(game, oldpoints, newpoints) {
    var res1, res2;

    // map to internal ids
    game = new Game(this.players.find(game.teams[0][0]), this.players.find(game.teams[1][0]), game.id);

    // create results
    res1 = new Result(game.teams[0], game.teams[1], oldpoints[0], oldpoints[1]);
    res2 = new Result(game.teams[0], game.teams[1], newpoints[0], newpoints[1]);

    // apply correction
    if (!this.ranking.correct(new Correction(res1, res2))) {
      return undefined;
    }

    this.rkch = true;

    return this;
  };

  /**
   * build a list of corrections which are consistent in format with the
   * correct() function
   *
   * @return a list of correction objects
   */
  // TODO test
  Swisstournament.prototype.getCorrections = function() {
    return this.ranking.getCorrections().map(function(corr) {
      var g;
      g = corr.pre.getGame();
      if (corr.post.getGame().equals(g)) {
        g = new Game(this.players.at(g.teams[0][0]), this.players.at(g.teams[1][0]));
      } else {
        g = undefined;
      }

      return {
        game: g,
        oldpoints: [corr.pre.points1, corr.pre.points2],
        newpoints: [corr.post.points1, corr.post.points2]
      };
    }, this);
  };

  /**
   * stores the current state in a blob, mostly using JSON (
   *
   * @return the blob
   */
  Swisstournament.prototype.toBlob = function() {
    var ob;

    ob = {
      byevote: RLEBlobber.toBlob(this.byevote),
      downvote: RLEBlobber.toBlob(this.downvote),
      games: this.games,
      players: this.players.toBlob(),
      ranking: this.ranking.toBlob(),
      round: this.round,
      roundvotes: this.roundvotes,
      state: this.state,
      upvote: RLEBlobber.toBlob(this.upvote)
    };

    return JSON.stringify(ob);
  };

  /**
   * restores a state from the blob
   *
   * @param blob
   *          the blob
   */
  Swisstournament.prototype.fromBlob = function(blob) {
    var ob = JSON.parse(blob);

    function copyGame(game) {
      return Game.copy(game);
    }

    this.byevote = RLEBlobber.fromBlob(ob.byevote);
    this.downvote = RLEBlobber.fromBlob(ob.downvote);
    this.round = ob.round;
    this.roundvotes = ob.roundvotes;
    this.state = ob.state;
    this.upvote = RLEBlobber.fromBlob(ob.upvote);

    this.games = ob.games.map(copyGame);

    this.players.fromBlob(ob.players);
    this.ranking.fromBlob(ob.ranking);

    this.rkch = true;

    return this;
  };

  Swisstournament.prototype.getState = function() {
    return this.state;
  };

  Swisstournament.prototype.rankingChanged = function() {
    return this.rkch;
  };

  function toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }

  function copyStaticObject(obj) {
    var key, ret;

    switch (toType(obj)) {
    case 'object':
      ret = {};
      break;
    case 'array':
      ret = [];
      break;
    default:
      // this is no reference
      return obj;
    }

    for (key in obj) {
      ret[key] = copyStaticObject(obj[key]);
    }

    return ret;
  }

  Swisstournament.prototype.getOptions = Options.prototype.getOptions;
  Swisstournament.prototype.setOptions = Options.prototype.setOptions;
  Swisstournament.prototype.getType = function() {
    return 'swiss';
  };

  // TODO add 'interlaced' swiss mode
  Swisstournament.MODES = ['wins', 'halves', 'random'];

  return Swisstournament;
});