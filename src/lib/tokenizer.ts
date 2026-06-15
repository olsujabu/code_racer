// A small, dependency-free syntax tokenizer.
//
// It does not aim to be a full parser — just enough to color keywords, types,
// strings, numbers, comments, function calls and punctuation across Python,
// JavaScript, Java and C++. Snippets are concise single functions with no
// multi-line strings or block comments, so line-by-line scanning is sufficient.

export type TokenType =
  | 'keyword'
  | 'type'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'operator'
  | 'punctuation'
  | 'identifier'
  | 'plain'

export type Dialect = 'python' | 'javascript' | 'java' | 'cpp'

const KEYWORDS: Record<Dialect, Set<string>> = {
  python: new Set([
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and',
    'or', 'is', 'None', 'True', 'False', 'import', 'from', 'as', 'class', 'pass',
    'break', 'continue', 'with', 'yield', 'lambda', 'global', 'nonlocal',
    'assert', 'raise', 'try', 'except', 'finally', 'del', 'async', 'await',
  ]),
  javascript: new Set([
    'var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while',
    'do', 'in', 'of', 'new', 'this', 'class', 'extends', 'super', 'typeof',
    'instanceof', 'break', 'continue', 'switch', 'case', 'default', 'try',
    'catch', 'finally', 'throw', 'delete', 'void', 'yield', 'async', 'await',
    'null', 'undefined', 'true', 'false',
  ]),
  java: new Set([
    'public', 'private', 'protected', 'static', 'final', 'abstract', 'void',
    'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for',
    'while', 'do', 'new', 'this', 'super', 'import', 'package', 'try', 'catch',
    'finally', 'throw', 'throws', 'instanceof', 'switch', 'case', 'default',
    'break', 'continue', 'synchronized', 'volatile', 'enum', 'null', 'true',
    'false',
  ]),
  cpp: new Set([
    'return', 'if', 'else', 'for', 'while', 'do', 'new', 'delete', 'class',
    'struct', 'public', 'private', 'protected', 'template', 'typename',
    'namespace', 'using', 'const', 'static', 'auto', 'switch', 'case',
    'default', 'break', 'continue', 'sizeof', 'this', 'true', 'false',
    'nullptr', 'virtual', 'override', 'operator', 'constexpr', 'inline',
  ]),
}

const TYPES: Record<Dialect, Set<string>> = {
  python: new Set(['int', 'float', 'str', 'bool', 'list', 'dict', 'set', 'tuple', 'complex', 'bytes', 'object']),
  javascript: new Set(['Math', 'Number', 'String', 'Array', 'Object', 'Boolean', 'Map', 'Set', 'Infinity', 'NaN', 'Symbol', 'Promise', 'JSON']),
  java: new Set([
    'int', 'double', 'float', 'long', 'short', 'char', 'boolean', 'byte',
    'String', 'Integer', 'Double', 'List', 'ArrayList', 'Map', 'HashMap', 'Set',
    'HashSet', 'Queue', 'LinkedList', 'Deque', 'ArrayDeque', 'PriorityQueue',
  ]),
  cpp: new Set([
    'int', 'double', 'float', 'long', 'short', 'char', 'bool', 'void', 'size_t',
    'vector', 'string', 'pair', 'map', 'set', 'queue', 'stack', 'priority_queue',
    'greater', 'unordered_map', 'unordered_set',
  ]),
}

const OPERATORS = new Set(['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?'])
const PUNCTUATION = new Set(['(', ')', '[', ']', '{', '}', ';', ',', '.', ':', '@'])

function isIdentStart(c: string): boolean {
  return /[A-Za-z_$]/.test(c)
}
function isIdentPart(c: string): boolean {
  return /[A-Za-z0-9_$]/.test(c)
}
function isDigit(c: string): boolean {
  return c >= '0' && c <= '9'
}

function lineCommentMarker(dialect: Dialect): string {
  return dialect === 'python' ? '#' : '//'
}

/** A per-character syntax type for one line of source (no trailing newline). */
export function tokenizeLine(line: string, dialect: Dialect): TokenType[] {
  const out: TokenType[] = new Array(line.length).fill('plain')
  const keywords = KEYWORDS[dialect]
  const types = TYPES[dialect]
  const comment = lineCommentMarker(dialect)
  let i = 0

  const paint = (start: number, end: number, type: TokenType) => {
    for (let k = start; k < end; k++) out[k] = type
  }

  while (i < line.length) {
    const c = line[i]

    // Whitespace stays 'plain'.
    if (c === ' ' || c === '\t') {
      i++
      continue
    }

    // Line comment: the rest of the line.
    if (line.startsWith(comment, i)) {
      paint(i, line.length, 'comment')
      break
    }

    // String literal (single or double quoted, with escape handling).
    if (c === '"' || c === "'") {
      const start = i
      i++
      while (i < line.length) {
        if (line[i] === '\\') {
          i += 2
          continue
        }
        if (line[i] === c) {
          i++
          break
        }
        i++
      }
      paint(start, i, 'string')
      continue
    }

    // Number.
    if (isDigit(c)) {
      const start = i
      while (i < line.length && (isDigit(line[i]) || line[i] === '.')) i++
      paint(start, i, 'number')
      continue
    }

    // Identifier / keyword / type / function name.
    if (isIdentStart(c)) {
      const start = i
      while (i < line.length && isIdentPart(line[i])) i++
      const word = line.slice(start, i)
      let type: TokenType
      if (keywords.has(word)) {
        type = 'keyword'
      } else if (types.has(word)) {
        type = 'type'
      } else {
        // Look ahead, skipping spaces, for a "(" to mark a function call.
        let k = i
        while (k < line.length && line[k] === ' ') k++
        if (line[k] === '(') {
          type = 'function'
        } else if (/^[A-Z]/.test(word)) {
          type = 'type'
        } else {
          type = 'identifier'
        }
      }
      paint(start, i, type)
      continue
    }

    // Operators and punctuation.
    if (OPERATORS.has(c)) {
      out[i] = 'operator'
      i++
      continue
    }
    if (PUNCTUATION.has(c)) {
      out[i] = 'punctuation'
      i++
      continue
    }

    // Anything else.
    out[i] = 'plain'
    i++
  }

  return out
}
