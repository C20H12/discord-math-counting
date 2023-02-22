const math = require("mathjs");

class MathParser {
  
  #parser = math.parser();
  constructor(profile) {
    this.profile = profile;
  }
  evaluate(...args) {
    const all = this.#parser.getAll()
    Object.keys(all).forEach(k => console.log(k, math.string(all[k])))
    return this.#parser.evaluate(...args)
  }



}

module.exports = MathParser