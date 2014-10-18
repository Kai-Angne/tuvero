/**
 * Tournament is an interface for generalized management of tournaments. It
 * assumes unique player ids for every tournament, so the use of global ids is
 * encouraged.
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define([ './map', './ranking', './game', './blobber', './options' ], function (Map, Ranking, Game, Blobber, Options) {
  return {
    Interface : {
      /**
       * Add a player to the internal data structures such as maps and arrays.
       * the ids have to be unique
       * 
       * @param id
       *          unique external player id
       * @return this if valid, undefined otherwise
       */
      addPlayer : function (id) {
        this.players.insert(id);
        // add player to the map and rescale all other
        return this;
      },

      /**
       * starts the tournament. This function might block the entry of new
       * players and is able to create the first valid list of open games
       * 
       * @return true if valid, undefined otherwise
       */
      start : function () {
        return this;
      },

      /**
       * ends the tournament, thereby creating the final result and invalidating
       * most functions
       * 
       * @return this.getRanking() if valid, undefined otherwise
       */
      end : function () {
        return this.getRanking();
      },

      /**
       * apply the result of a running game. This function may manipulate the
       * list of games in any fashion, thereby generally invalidating the result
       * of the getGames() function.
       * 
       * @param game
       *          a running or applicable game
       * @param points
       *          array with points for every team (usually 2)
       * @return this
       */
      finishGame : function (game, points) {
        return this;
      },

      /**
       * return an array of open games
       * 
       * @return an array of open games
       */
      getGames : function () {
        return []; // Array of games
      },

      /**
       * return sorted ranking object including the global ids, actual place and
       * important points and (numeric) annotations in their own arrays
       * 
       * @return the ranking
       */
      getRanking : function () {
        return {
          place : [], // actual place, usually [1, 2, 3, ...]. Necessary.
          ids : [], // sorted for ranking. Necessary
          mydata : [], // optional numerical data, e.g. points
          mydata2 : [], // same indices as place[] and ids[]
          mydata3 : 0, // single numerical values are fine, too
        };
      },

      /**
       * Check for changes in the ranking
       * 
       * @return {boolean} true if the ranking changed, false otherwise
       */
      rankingChanged : function () {
        return true;
      },

      /**
       * Return the current state of the tournament
       * 
       * @return {Integer} the current state. See Tournament.STATE
       */
      getState : function () {
        return -1;
      },

      /**
       * Incorporate a correction
       */
      correct : function () {
        return true;
      },

      /**
       * return all corrections as [ game, points before, points after ]
       * 
       * The game.id can be 0, regardless of the actual game id
       * 
       * @return an array of corrections
       */
      getCorrections : function () {
        return [];
      },

      /**
       * returns a type identifier, e.g. 'swiss' or 'ko'
       * 
       * @return a static string describing the tournament type
       */
      getType : function () {
        return '';
      },
    },

    Extends : [ Blobber, Options.Interface ],

    /**
     * Possible states of a tournament.
     */
    STATE : {
      PREPARING : 0,
      RUNNING : 1,
      FINISHED : 2,
      FAILURE : -1
    }
  };
});
