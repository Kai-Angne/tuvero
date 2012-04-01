$(function ($) {

  // toggle active and inactive
  $('.player').live('click', function (evt) {
    var $this = $(evt.target);

    if ($this.parent().hasClass('player') && $this.hasClass('switch')) {
      $this = $this.parent();
    }

    if (!$this.hasClass('player')) {
      return;
    }

    $this.toggleClass('inactive');

    // save to storage
    if (!$this.hasClass('new')) {
      // write to player list
      Player.list[$this.attr('id').replace('pid', '')].inactive = $this.hasClass('inactive');
      // save all players
      savePlayers();
    }
  });
  

  // toggle gender
  $('.player.new .gender').click( function (evt) {
    var $this = $(this);
    $this.toggleClass('f');
  });
  

  // toggle tireur
  $('.player .technique .s').live('click', function (evt) {
    var $this = $(this.parentNode);
    $this.toggleClass('s');

    if (!$this.parent().hasClass('new')) {
      // write to player list
      Player.list[$this.parent().attr('id').replace('pid', '')].S = $this.hasClass('s');
      // save all players
      savePlayers();
    }
  });


  // toggle pointeur
  $('.player .technique .l').live('click', function (evt) {
    var $this = $(this.parentNode);
    $this.toggleClass('l');

    if (!$this.parent().hasClass('new')) {
      // write to player list
      Player.list[$this.parent().attr('id').replace('pid', '')].L = $this.hasClass('l');
      // save all players
      savePlayers();
    }
  });


  // toggle pool
  $('.player .pool').live('click', function (evt) {
    var $this = $(this);
    $this.toggleClass('b');

    if (!$this.parent().hasClass('new')) {
      // write to player list
      Player.list[$this.parent().attr('id').replace('pid', '')].B = $this.hasClass('b');
      // save all players
      savePlayers();
    }
  });


  // autotrigger button click on new player form submit
  $('.player.new form').submit(function (evt) {
    $('.player.new .create').trigger('click');
    return false;
  });


  // add new player to player list and DOM
  $('.player.new .create').click(function (evt) {
    // set up references
    var $input = $('.player.new');
    var $name = $('.player.new .name');

    if (!$name.val()) {
      return;
    }

    // create the instance of the new player
    var p = new Player(Player.list.length, $name.val());
    Player.list.push(p);

    // set player properties
    if ($input.find('.gender').hasClass('f')) {
      p.female = true;
    }

    if ($input.hasClass('inactive')) {
      p.inactive = true;
    }

    if ($input.find('.technique').hasClass('s')) {
      p.S = true;
    }
    if ($input.find('.technique').hasClass('l')) {
      p.L = true;
    }

    if ($input.find('.pool').hasClass('b')) {
      p.B = true;
    }

    // reset the input form
    // no complete reset necessary
    $name.val('');
    $input.removeClass('inactive');

    // add the new player to the DOM
    addPlayer(p);
  });

  // addPlayer()
  //   p - the Player instance to be added to the DOM
  // 
  // This function takes a player instance, removes a probably existing entry
  // from the DOM and adds a new one, which is just a brief clone of the player
  // template filled with the player data
  function addPlayer(p) {
    // remove existing element
    $('#pid' + p.id).remove();

    // clone the player template
    $new = $('.player.tpl').clone().removeClass('tpl');

    // fill with data
    $new.find('.name').text(p.name);
    $new.attr('id', 'pid' + p.id);

    if (p.inactive) {
      $new.addClass('inactive');
    }

    if (p.female) {
      $new.find('.gender').addClass('f');
    } else {
      $new.find('.gender').addClass('m');
    }

    if (p.S) {
      $new.find('.technique').addClass('s');
    }
    
    if (p.L) {
      $new.find('.technique').addClass('l');
    }

    if (p.B) {
      $new.find('.pool').addClass('b');
    } else {
      $new.find('.pool').addClass('a');
    }
    
    // release it into the DOM
    $('.player.new').before($new);

    // save to storage
    savePlayers();
  }


  // save players...
  function savePlayers() {
  // TODO: think of a system to avoid writing large chunks every few seconds
    Player.save();
  }


  // restore players...
  function restorePlayers() {
    $('.player:not(.tpl):not(.new)').remove();

    Player.load();

    for (var f in Player.list) {
      addPlayer(Player.list[f]);
    }
  }
  

  // load and restore players since it's the first time this page has been
  // opened
  restorePlayers();
});
