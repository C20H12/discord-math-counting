const fs = require("node:fs");


class SimpleDb {
  fileName;
  bufferSize = 10;
  bufferKeys = [];
  bufferVals = [];

  constructor(fileName, bufferSize = 10) {
    this.fileName = fileName;
    this.bufferSize = bufferSize;
    fs.writeFile(this.fileName, "", this.#errHandler);
  }

  async popValue(key) {
    const resultIdx = this.bufferKeys.findIndex(e => e === key);
    if (resultIdx !== -1) {
      const resultValue = this.bufferVals[resultIdx]
      const newKeys = this.bufferKeys.filter(e => e !== key)
      const newVals = this.bufferVals.filter(e => e !== resultValue)
      this.bufferKeys = newKeys
      this.bufferVals = newVals
      return resultValue;
    } else {
      const filecContent = await fs.promises.readFile(this.fileName, {encoding: "utf-8"});
      for (const line of filecContent.split("\n")) {
        const [k, v] = line.split(" ");
        if (k === key) {
          const replacedContent = filecContent.replace(new RegExp(`(?<=\n?)${key}.+\n`), "")
          await fs.promises.writeFile(this.fileName, replacedContent)
          return v;
        }
      }
      return null;
    }
  }

  insertValue(key, value) {
    if (this.bufferKeys.length < this.bufferSize) {
      this.bufferKeys.push(key);
      this.bufferVals.push(value);
      return true;
    } else {
      const poppedKey = this.bufferKeys.shift() || key;
      const poppedVal = this.bufferVals.shift() || value;
      try {
        fs.writeFile(this.fileName, `${poppedKey} ${poppedVal}\n`, { flag: "a+" }, this.#errHandler);
      } catch (e) {
        console.warn(e);
        return false;
      }
      this.bufferKeys.push(key);
      this.bufferVals.push(value);
      return true;
    }
  }

  #errHandler(err) {
    if (err) throw err;
  }
}

module.exports = SimpleDb;
