# widl2json

CLI tool that converts [WIDL schemas](https://github.com/wapc/widl-spec) to JSON, see also [waPC](https://wapc.io/) and the [WIDL Validator](https://jsoverson.github.io/widl-validator/)

## Installation

```sh
$ npm install -g widl2json
```

## Usage

```sh
$ widl2json schema.widl --pretty --condensed
```

Will output:

```json
{
  "namespaces": [
    {
      "namespace": "greeting",
      "interfaces": [
        {
          "operations": {
            "sayHello": {
              "name": "sayHello",
              "parameters": {
                "msg": {
                  "name": "msg",
                  "type": "string"
                }
              },
              "type": "Response",
              "unary": false
            }
          }
        }
      ],
      "types": [
        {
          "name": "Response",
          "fields": {
            "outgoing": {
              "name": "outgoing",
              "type": "string"
            }
          }
        }
      ]
    }
  ]
}
```

For the schema:

```idl
namespace "greeting"

interface {
  sayHello(msg: string): Response
}

type Response {
  outgoing: string
}
```

## Usage with `jq`

The [WIDL Validator](https://jsoverson.github.io/widl-validator/) is very helpful for visualizing the structure of the WIDL tree.

### Print all the types defined in a schema:

````sh
$ widl2json schema-complex.widl --condensed | jq '.namespaces[].types[].name'
"Tests"
"Required"
"Optional"
"Maps"
"Lists"
"Thing"
```

### Output a markdown-formatted list of Namespaces and their interfaces:

```sh
$ widl2json schema-complex.widl --condensed | jq -r '.namespaces[] | "# Namespace `\(.namespace)`", (.interfaces[].operations[] | "- \(.name)(\(.parameters| map("\(.name):\(.type)")|join(", "))) => \(.type)") '
````

```md
# Namespace `tests`

- testFunction(required:Required, optional:Optional, maps:Maps, lists:Lists) => Tests
- testUnary(tests:Tests) => Tests
- testDecode(tests:Tests) => string
```

## Options

```sh
widl2json <file> [options]

Convert WIDL schemas to JSON

Positionals:
  file                                                                  [string]

Options:
      --version    Show version number                                 [boolean]
  -h, --help       Show help                                           [boolean]
  -t, --terse                                         [boolean] [default: false]
  -c, --condensed                                     [boolean] [default: false]
  -p, --pretty                                        [boolean] [default: false]
```
