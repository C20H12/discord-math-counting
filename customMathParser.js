const math = require("mathjs");
const SimpleDb = require("./SimpleDb");
const G_database = new SimpleDb("database.txt");

class CustomMathParser {
  #parser = math.parser();
  #profile = null;
  #MAX_DEFINE = 10;

  async #_new(userId) {
    const res = await G_database.popValue(userId);
    if (res !== null) {
      const definesArr = res.split(",");
      for (const v of definesArr) {
        this.#parser.evaluate(v);
      }
      this.#profile = { userId, defines: definesArr };
    } else {
      this.#profile = { userId, defines: [] };
    }
    return this
  }

  constructor(userId) {
    return this.#_new(userId);
  }

  define(expression) {
    if (this.#profile.defines.length > this.#MAX_DEFINE) {
      return [false, "Max numbe of variables and functions reached"];
    }
    try {
      this.#parser.evaluate(expression);
    } catch (e) {
      return [false, e.message];
    }
    this.#profile.defines.push(expression);
    return [true, ""];
  }

  evaluate(expression) {
    if (expression.includes("=")) {
      return [false, "An assignment is not an expression"];
    }
    let res = 0;
    try {
      res = this.#parser.evaluate(expression);
    } catch (e) {
      return [false, e.message];
    }
    return [true, res];
  }

  remove(varName) {
    const varIndex = this.#profile.defines.findIndex(varStr => varStr.startsWith(varName));
    if (varIndex === -1) {
      return [false, `No variable or function with name ${varName} found`];
    }
    this.#parser.remove(varName);
    this.#profile.defines.splice(varIndex, 1);
    return [true, ""];
  }

  getDefines() {
    return this.#profile.defines;
  }

  async saveProfile() {
    const saveKey = this.#profile.userId;
    const saveValue = this.#profile.defines.join(",");
    const res = await G_database.insertValue(saveKey, saveValue);
    if (!res) {
      throw Error("saving failed");
    }
  }

  getId() {
    return this.#profile.userId
  }
}

module.exports = CustomMathParser;
