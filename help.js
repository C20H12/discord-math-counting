const helpString = (prefix) => (
`
Commands:
\`${prefix} def <var | func> = <expression>\` - defines a variable or function
\`${prefix} remove <var | func>\` - remove a defined value
\`${prefix} listvars\` - lists your variables
\`${prefix} setup\` - sets the active channel here
Syntax references:
<https://mathjs.org/docs/expressions/syntax.html#operators>
Available functions:
<https://mathjs.org/docs/reference/functions.html>
`)

module.exports = helpString;