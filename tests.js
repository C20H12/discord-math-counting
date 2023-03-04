const SimpleDb = require("./SimpleDb");


const tests = async () =>  {
  const sb = new SimpleDb("tests.txt");
  await sb.insertValue("k1", 000)
  for (let i = 0; i <= 25; i++) {
    await sb.insertValue("k" + i, "v" + i);
  }
  console.log(await sb.popValue("k2"))
  console.log(await sb.popValue("k3"))
  console.log(await sb.popValue("k4"))
  
  console.log(await sb.popValue("k4"))

  console.log(await sb.popValue("k22"))

  console.log(await sb.popValue("k12"))
  console.log(await sb.popValue("k25"))
  console.log(await sb.popValue("k26"))

}


const CMP = require("./CustomMathParser")
const tests2 = async () => {
  const mp = await new CMP("000001")
  console.log(mp.getId())
  mp.define("x = 2 + 1")
  console.log(mp.evaluate('x + 1'))
  console.log(mp.evaluate('x + 1 + y'))
  console.log(mp.evaluate('y = x'))
  console.log(mp.getDefines())

  // mp.saveProfile()
  // mp.logDatabase()

  
  console.log(mp.remove('x'))
  console.log(mp.remove('y'))
  console.log(mp.remove('z'))
  console.log(mp.getDefines())

  console.log(mp.evaluate('123*-@1'))
  console.log(mp.define('123=1'))
  
  console.log(mp.define("f(x) = x^2"))
  console.log(mp.evaluate("f(4)"))


  console.log(mp.define('a = 0 + 1111'))
  console.log(mp.define('b = 0 + 1111'))
  console.log(mp.define('c = 0 + 1111'))


  await mp.saveProfile()

  const mp1 = await new CMP("000001")

  console.log(mp1.getDefines())
  
  console.log(mp1.evaluate("f(a)"))
}

if (module === require.main) {
  tests();
  tests2();
}

