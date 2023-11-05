const math = require("mathjs");
const SimpleDb = require("./SimpleDb");
const G_database = new SimpleDb("./dataFiles/parserDatabase.txt", false);

class CustomMathParser {
  #parser = math.parser();
  #profile = null;
  #MAX_DEFINE = 10;

  async #_new(userId) {
    const res = await G_database.popValue(userId);
    if (res !== null && res !== '') {
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
      return [false, 0, "An assignment is not an expression"];
    }
    try {
      const res = this.#parser.evaluate(expression);
      const numberRes = parseInt(res, 10);
      if (isNaN(numberRes)) {
        return [false, 0, "Expression not supported"]
      }
      return [true, res, ''];
    } catch (e) {
      return [false, 0, e.message];
    }
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
    const definesArr = this.#profile.defines;
    const saveValue = definesArr.length !== 0 ? definesArr.join(",") : '';
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
