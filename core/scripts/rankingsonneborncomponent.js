/**
 * RankingSonnebornComponent: rank by player id
 *
 * @return RankingSonnebornComponent
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(['lib/extend', './rankingcomponent'],
    function(extend, RankingComponent) {
      /**
       * Constructor
       *
       * @param ranking
       *          a RankingModel instance
       * @param nextcomponent
       *          the next component in the chain
       */
      function RankingSonnebornComponent(ranking, nextcomponent) {
        RankingSonnebornComponent.superconstructor.call(this, ranking,
            nextcomponent);
      }
      extend(RankingSonnebornComponent, RankingComponent);

      RankingSonnebornComponent.NAME = 'sonneborn';

      /**
       * @param i
       *          a player index
       * @return the number of won games
       */
      RankingSonnebornComponent.prototype.value = function(i) {
        return this.ranking.sonneborn.get(i);
      };

      return RankingSonnebornComponent;
    });
