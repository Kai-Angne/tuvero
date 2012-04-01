function Player(string) {
  if (string && typeof(string) == "string") {
    this.fromString(string);
  }
}

Player.prototype = {
  name: 'noname',
  female: false,
  year: 1900,
  city: 0,
  association: 0
}

Player.cities = [''];
Player.assocs = [''];

// list of used strings as well as some handy functions
Player.consts = {
  female: 'f',
  male: '',
  separator: '\\',
  forbidden: /[\n\\]/g,
  replacement: '_',
  nonum: /(^\D*0|[\.,]\d+|\D)/g,  // I like regex: remove leading 0, all characters and fractions
  nostr: '',
  
  encode: function(string) {
    return string.replace(Player.consts.forbidden, Player.consts.replacement);
  },

  numdecode: function(string) {
    return string.replace(Player.consts.nonum, Player.consts.nostr);
  }
};

// serialize the player. see code or docs for the conversion scheme
Player.prototype.toString = function() {
  var year = [this.female ? Player.consts.female : Player.consts.male, this.year].join('');
  return [Player.consts.encode(this.name),
      year,
      Player.consts.encode(Player.cities[this.city]),
      Player.consts.encode(Player.assocs[this.association])
    ].join(Player.consts.separator);
};

// deserialize. see code or docs for conversion scheme
Player.prototype.fromString = function(string) {
  var val = string.split(Player.consts.separator);

  if (val[0]) {
    this.name = val[0];
  }

  if (Player.consts.female && val[1] && val[1][0] == Player.consts.female) {
    this.female = true;
  }

  if (val[1]) {
    this.year = Number(Player.consts.numdecode(val[1]));
  }

  if (val[2]) {
    this.setCity(val[2]);
  }

  if (val[3]) {
    this.setAssociation(val[3]);
  }

  return this;
}

Player.prototype.setCity = function(string) {
  switch (this.city = Player.cities.indexOf(string)) {
  case -1:
    this.city = Player.cities.length;
    Player.cities.push(string);
    break;
  case 0:
    delete this.city;
    break;
  }
};

Player.prototype.setAssociation = function(string) {
  switch(this.association = Player.assocs.indexOf(string)) {
  case -1:
    this.association = Player.assocs.length;
    Player.assocs.push(string);
    break;
  case 0:
    delete this.association;
    break;
  }
};
