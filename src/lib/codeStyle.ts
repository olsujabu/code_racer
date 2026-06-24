// Fix 3 — Code-style snippet transform (Settings A & B).
//
// New file. Produces a transformed copy of a snippet for the typing engine; it
// never mutates the source data in snippets.ts, so switching back to defaults
// re-derives the original cleanly. Two transforms are applied per line, driven
// by the per-character token types from the existing tokenizer so that string
// literals, comments, keywords and types are left untouched:
//   - Setting A (spaceBeforeParen): insert a single space before every call
//     paren `(` that immediately follows a word character (\w(  ->  \w ().
//   - Setting B (naming): convert user identifiers (token type identifier or
//     function) to the chosen convention, auto-detecting the source case.
// Indentation, newlines, keywords, types, numbers, strings and comments are
// preserved. Setting C (auto-close) is engine behaviour and lives in typing.ts.

import { tokenizeLine, type Dialect } from './tokenizer'
import type { CodeStylePrefs, Naming } from './prefs'

function isIdentPart(c: string): boolean {
  return /[A-Za-z0-9_$]/.test(c)
}

/** Break an identifier into lowercased word parts, detecting snake/kebab/camel/pascal. */
function splitIdentifier(name: string): string[] {
  if (name.includes('_')) return name.split('_').filter(Boolean).map((s) => s.toLowerCase())
  if (name.includes('-')) return name.split('-').filter(Boolean).map((s) => s.toLowerCase())
  // camelCase / PascalCase: split on the boundary between a lower/digit and an
  // upper char (e.g. binarySearch -> binary, Search).
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s.toLowerCase())
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function convertName(name: string, target: Naming): string {
  const parts = splitIdentifier(name)
  if (parts.length === 0) return name
  switch (target) {
    case 'snake':
      return parts.join('_')
    case 'kebab':
      return parts.join('-')
    case 'camel':
      return parts.map((p, i) => (i === 0 ? p : capitalize(p))).join('')
    case 'pascal':
      return parts.map(capitalize).join('')
    default:
      return name
  }
}

function transformLine(line: string, dialect: Dialect, prefs: CodeStylePrefs): string {
  const types = tokenizeLine(line, dialect)
  let out = ''
  let i = 0
  while (i < line.length) {
    const t = types[i]

    // Identifier run (user identifiers and function names only — keywords, types,
    // strings, comments and numbers carry different token types and are skipped).
    if (t === 'identifier' || t === 'function') {
      let j = i
      while (j < line.length && isIdentPart(line[j]) && (types[j] === 'identifier' || types[j] === 'function')) {
        j++
      }
      let word = line.slice(i, j)
      // Skip single-character identifiers (case is meaningless: i, j, n, v).
      if (prefs.naming !== 'original' && word.length > 1) {
        word = convertName(word, prefs.naming)
      }
      out += word
      i = j
      continue
    }

    // Setting A: a space before a call paren that follows a word character.
    if (prefs.spaceBeforeParen && line[i] === '(' && t !== 'string' && t !== 'comment') {
      if (out.length > 0 && /\w/.test(out[out.length - 1])) out += ' '
      out += '('
      i++
      continue
    }

    out += line[i]
    i++
  }
  return out
}

/**
 * Transform a snippet for the typing engine. When no settings deviate from the
 * defaults the input is returned effectively unchanged (reversible).
 */
export function transformSnippet(code: string, dialect: Dialect, prefs: CodeStylePrefs): string {
  if (prefs.naming === 'original' && !prefs.spaceBeforeParen) return code
  return code
    .split('\n')
    .map((line) => transformLine(line, dialect, prefs))
    .join('\n')
}
