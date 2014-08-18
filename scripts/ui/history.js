/**
 * History of results, keyed by round and index.
 * 
 * @returns History
 */
define([ './swiss', '../backend/correction', './team', './strings', './options' ], function (Swiss, Correction, Team, Strings, Options) {
  var History, rounds, byes, Result;

  // 2d array: [round][resultid]
  rounds = [];
  byes = [];

  Result = function (t1, t2, p1, p2) {
    this.t1 = t1;
    this.t2 = t2;
    this.p1 = p1;
    this.p2 = p2;
  };

  Result.prototype.clone = function () {
    return new Result(this.t1, this.t2, this.p1, this.p2);
  };

  History = {
    /**
     * adds a game of the running (or just finished) round to the history
     * 
     * @param gamed
     *          game instance as returned by Swiss.openGames()
     * @param points
     *          an array with two integers representing the points
     * @returns a copy of the result on success, undefined otherwise
     */
    add : function (game, points) {
      var result, round;

      round = Swiss.getRanking().round - 1;

      if (round === -1) {
        return undefined;
      }

      if (rounds[round] === undefined) {
        rounds[round] = [];
      }

      result = new Result(game.teams[0][0], game.teams[1][0], points[0], points[1]);

      rounds[round].push(result);

      return result.clone();
    },

    /**
     * remember the bye of a team for the current round
     * 
     * @param team
     *          Team instance of the team receiving the bye
     */
    addBye : function (team) {
      var round;
      round = Swiss.getRanking().round - 1;

      while (round >= rounds.length) {
        rounds.push([]);
      }

      byes[round] = team.id;
    },

    /**
     * retrieve the bye of the given round
     * 
     * @param round
     *          round
     * @returns the bye (team id) if there was a bye, undefined otherwise
     */
    getBye : function (round) {
      return byes[round - 1];
    },

    /**
     * retrieves a copy of the result under the given ids
     * 
     * @param round
     *          round for which to retrieve (starting at 1)
     * @param id
     *          id of the game (add() order, starting at 0)
     * @returns a copy of the game on success, undefined otherwise
     */
    get : function (round, id) {
      return rounds[round - 1][id].clone();
    },

    /**
     * finds and returns the result of the game of the given teams, if present
     * 
     * @param team1
     *          team 1
     * @param team2
     *          team 2
     * @returns a copy of the result if successful, undefined otherwise
     */
    find : function (team1, team2) {
      var round, game, numrounds, numgames, res;

      numrounds = rounds.length;

      for (round = 0; round < numrounds; round += 1) {
        numgames = rounds[round].length;
        for (game = 0; game < numgames; game += 1) {
          res = rounds[round][game];
          if ((res.t1 === team1 && res.t2 === team2) || (res.t1 === team2 && res.t2 === team1)) {
            return res.clone();
          }
        }
      }

      return undefined;
    },

    /**
     * Replaces an existing result with a corrected one.
     * 
     * @param res
     *          the new result
     * @returns a copy of the new result (equal to res) if successful, undefined
     *          otherwise
     */
    correct : function (res) {
      var round, game, numrounds, numgames, r;

      numrounds = rounds.length;

      for (round = 0; round < numrounds; round += 1) {
        numgames = rounds[round].length;
        for (game = 0; game < numgames; game += 1) {
          r = rounds[round][game];
          if (res.t1 === r.t1 && res.t2 === r.t2) {
            r.p1 = res.p1;
            r.p2 = res.p2;
            return r.clone();
          }
        }
      }

      return undefined;
    },

    /**
     * returns the number of rounds
     * 
     * @returns the number of rounds
     */
    numRounds : function () {
      return rounds.length;
    },

    /**
     * returns the number of games in the given round
     * 
     * @param round
     *          round
     * @returns number of games in that round on success, undefined otherwise
     */
    numGames : function (round) {
      return rounds[round - 1].length;
    },

    /**
     * converts the stored content to CSV format
     */
    toCSV : function () {
      var lines, i;

      lines = [ Strings['histhead' + Options.teamsize] ];

      rounds.forEach(function (games, round) {
        games.forEach(function (game) {
          var t1, t2, line, i;
          t1 = Team.get(game.t1);
          t2 = Team.get(game.t2);

          line = [];
          line.push(round + 1);
          line.push(t1.id + 1);
          for (i = 0; i < Options.teamsize; i += 1) {
            if (t1.names[i]) {
              line.push('"' + t1.names[i].replace(/"/g, '""') + '"');
            } else {
              line.push('"%% %%"');
            }
          }
          line.push(t2.id + 1);
          for (i = 0; i < Options.teamsize; i += 1) {
            if (t2.names[i]) {
              line.push('"' + t2.names[i].replace(/"/g, '""') + '"');
            } else {
              line.push('"%% %%"');
            }
          }
          line.push(game.p1);
          line.push(game.p2);

          lines.push(line.join(','));

        });

        if (byes[round] !== undefined) {
          (function (bye) {
            var team, line;
            team = Team.get(bye);

            line = [ round + 1, team.id + 1 ];

            for (i = 0; i < Options.teamsize; i += 1) {
              if (team.names[i]) {
                line.push('"' + team.names[i].replace(/"/g, '""') + '"');
              } else {
                line.push('"%% %%"');
              }
            }

            line.push('"Freilos"');
            line.push('');
            line.push('');
            line.push('');
            line.push(13);
            line.push(7);
            lines.push(line.join(','));
          }(byes[round]));
        }
      });

      return lines.join('\r\n');
    },

    /**
     * store the current state in a blob, usually using JSON
     * 
     * @returns the blob
     */
    toBlob : function () {
      return JSON.stringify({
        rounds : rounds,
        byes : byes
      });
    },

    /**
     * restore a state from a blob written by toBlob();
     * 
     * @param blob
     *          the blob
     */
    fromBlob : function (blob) {
      var ob, copyround, copyres;

      ob = JSON.parse(blob);

      byes = ob.byes;

      copyres = function (res) {
        return new Result(res.t1, res.t2, res.p1, res.p2);
      };

      copyround = function (round) {
        return round.map(copyres);
      };

      rounds = ob.rounds.map(copyround);
    },

    /**
     * resets the history
     */
    reset : function () {
      rounds = [];
      byes = [];
    },
  };

  return History;
});
