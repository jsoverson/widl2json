# widl2json

CLI tool that converts [WIDL schemas](https://github.com/wapc/widl-spec) to JSON, see also [waPC](https://wapc.io/) and the [WIDL](https://jsoverson.github.io/widl-validator/)

## Installation

```sh
$ npm install -g widl2json
```

## Usage

```sh
$ widl2json schema.widl --pretty
```

Will output:

```json
{
  "kind": "Document",
  "definitions": [
    {
      "kind": "NamespaceDefinition",
      "name": {
        "kind": "Name",
        "value": "greeting"
      },
      "annotations": []
    },
    {
      "kind": "InterfaceDefinition",
      "operations": [
        {
          "kind": "OperationDefinition",
          "name": {
            "kind": "Name",
            "value": "sayHello"
          },
          "parameters": [
            {
              "kind": "ParameterDefinition",
              "name": {
                "kind": "Name",
                "value": "name"
              },
              "type": {
                "kind": "Named",
                "name": {
                  "kind": "Name",
                  "value": "string"
                }
              },
              "annotations": []
            }
          ],
          "type": {
            "kind": "Named",
            "name": {
              "kind": "Name",
              "value": "string"
            }
          },
          "annotations": [],
          "unary": false
        }
      ],
      "annotations": []
    }
  ]
}
```

## Usage with `jq`

Print all interfaces in a schema:

```sh
$ widl2json schema.widl | jq '.definitions | map(select(.kind== "InterfaceDefinition")) | length'
```

Output a markdown-formatted list of Namespaces, their interfaces, and the interface signatures.

```sh
$ widl2json schema.widl | jq -r '.definitions[] | (select(.kind=="NamespaceDefinition")| "# Namespace `\(.name.value)`"), (select(.kind== "InterfaceDefinition") | .operations[] | "- \(.name.value)(\(.parameters[]| "\(.name.value):\(.type.name.value)")) => \(.type.name.value)") '
```

```md
# Namespace `greeting`

- sayHello(name:string) => string
```

## Options

```sh
$ widl2json --help

widl2json <file> [options]

Convert WIDL schemas to JSON

Positionals:
  file  Path to schema file                                             [string]

Options:
      --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
  -t, --terse    Omit empty arrays from the JSON      [boolean] [default: false]
  -p, --pretty   Pretty print the JSON output         [boolean] [default: false]

Examples:
  widl2json schema.widl --pretty  Outputs pretty-printed JSON
```
