const fs = require("node:fs");


class SimpleDb {
  fileName;

  constructor(fileName, testing = true) {
    this.fileName = fileName;
    if (testing){
      fs.writeFile(this.fileName, "", err => {if (err) throw err;});
    }
  }

  async popValue(key) {
    const filecContent = await fs.promises.readFile(this.fileName, {encoding: "utf-8"});
    for (const line of filecContent.split("\n")) {
      const [k, v] = line.split(" <<separator>> ");
      if (k === key) {
        const replacedContent = filecContent.replace(new RegExp(`(?<=\n?)${key}.+\n`), "")
        await fs.promises.writeFile(this.fileName, replacedContent)
        return v;
      }
    }
    return null;
}

  async insertValue(key, value) {
    try {
      await fs.promises.writeFile(this.fileName, `${key} <<separator>> ${value}\n`, { flag: "a+" });
    } catch (e) {
      console.warn(e);
      return false;
    }
    return true;
  }
}

module.exports = SimpleDb;
