/**
 * Unit tests for TeamModel
 * 
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(function () {
  return function (QUnit, getModule) {
    var TeamModel, PlayerModel;

    TeamModel = getModule('ui/teammodel');
    PlayerModel = getModule('ui/playermodel');

    // TODO test the emitted events

    QUnit.test("TeamModel tests", function () {
      var team, players, names, listener;

      listener = {
        updatecount : 0,
        /**
         * Callback listener
         */
        onupdate : function () {
          listener.updatecount += 1;
        },
        /**
         * counter reset
         */
        reset : function () {
          listener.updatecount = 0;
        },
      };

      team = new TeamModel();
      QUnit.equal(team.length, 1, 'empty initialization generates an empty team player');
      QUnit.equal(team.getPlayer(0).getName(), PlayerModel.NONAME, 'empty initialization generates an default team player name');
      QUnit.equal(team.getID(), 0, 'empty initialization sets id to 0');

      QUnit.equal(team.getPlayer(-1), undefined, 'getPlayer(-1) returns undefined');
      QUnit.equal(team.getPlayer(5), undefined, 'out of bounds getPlayer returns undefined');

      names = [ 'Erik E. Lorenz', 'Fabian Böttcher', 'Detlef Schwede' ];
      players = [ new PlayerModel(names[0]), new PlayerModel(names[1]),
          new PlayerModel(names[2]) ];
      team = new TeamModel(players, 5);

      QUnit.equal(team.length, players.length, 'proper initialization: team length');
      QUnit.equal(team.getID(), 5, 'proper initialization sets id');
      QUnit.equal(team.getPlayer(0).getName(), names[0], 'player name 1');
      QUnit.equal(team.getPlayer(1).getName(), names[1], 'player name 2');
      QUnit.equal(team.getPlayer(2).getName(), names[2], 'player name 3');

      team.registerListener(listener);

      team.setID(8);
      QUnit.equal(team.getID(), 8, 'setID sets the id');
      QUnit.equal(listener.updatecount, 1, 'setID emits update');

      listener.reset();
      players[0].setName('Generic Name');
      players[1].setName('Another Generic Name');
      players[2].setName('Third Generic Name');
      QUnit.equal(listener.updatecount, 3, 'player name updates propagate through to TeamModel');
    });
  };
});
