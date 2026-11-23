"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/ignore/index.js
var require_ignore = __commonJS({
  "node_modules/ignore/index.js"(exports, module2) {
    function makeArray(subject) {
      return Array.isArray(subject) ? subject : [subject];
    }
    var UNDEFINED = void 0;
    var EMPTY = "";
    var SPACE = " ";
    var ESCAPE = "\\";
    var REGEX_LITERAL_SPECIAL = /[.*+?()[\]{}^$|\\/]/;
    var BOM = "\uFEFF";
    var REGEX_INVALID_TRAILING_BACKSLASH = /(?:[^\\]|^)\\$/;
    var REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION = /^\\!/;
    var REGEX_REPLACE_LEADING_EXCAPED_HASH = /^\\#/;
    var REGEX_SPLITALL_CRLF = /\r?\n/g;
    var DOUBLE_SLASH = "//";
    var SLASH_CODE = 47;
    var DOT_CODE = 46;
    var SLASH = "/";
    var TMP_KEY_IGNORE = "node-ignore";
    if (typeof Symbol !== "undefined") {
      TMP_KEY_IGNORE = /* @__PURE__ */ Symbol.for("node-ignore");
    }
    var KEY_IGNORE = TMP_KEY_IGNORE;
    var define = (object, key, value) => {
      Object.defineProperty(object, key, { value });
      return value;
    };
    var RETURN_FALSE = () => false;
    var cleanRangeBackSlash = (slashes) => {
      const { length } = slashes;
      return slashes.slice(0, length - length % 2);
    };
    var POSIX_CLASSES = {
      alnum: "0-9A-Za-z",
      alpha: "A-Za-z",
      blank: " \\t",
      cntrl: "\\x00-\\x1f\\x7f",
      digit: "0-9",
      graph: "!-.0-~",
      lower: "a-z",
      print: " -.0-~",
      punct: "!-.:-@\\[-`{-~",
      // git's `sane-ctype.h` classifies \v and \f as control, not space,
      //   unlike C's `isspace`
      space: " \\t\\n\\r",
      upper: "A-Z",
      xdigit: "0-9A-Fa-f"
    };
    var CLASS_MEMBERS_TO_ESCAPE = "\\]^-[";
    var escapeMember = (char) => CLASS_MEMBERS_TO_ESCAPE.indexOf(char) < 0 ? char : ESCAPE + char;
    var NON_SLASH = "(?!\\/)";
    var classSource = (negated, body) => {
      if (negated) {
        return `[^\\/${body}]`;
      }
      const source = `[${body}]`;
      return new RegExp(source).test("/") ? NON_SLASH + source : source;
    };
    var scanBracket = (pattern, start) => {
      const { length } = pattern;
      let index = start + 1;
      let negated = EMPTY;
      const lead = pattern[index];
      if (lead === "!" || lead === "^") {
        negated = "^";
        index++;
      }
      let body = EMPTY;
      let prev = EMPTY;
      for (; ; ) {
        const char = pattern[index];
        if (char === UNDEFINED) {
          return null;
        }
        if (char === ESCAPE) {
          const escaped = pattern[index + 1];
          if (escaped === UNDEFINED) {
            return null;
          }
          body += escapeMember(escaped);
          prev = escaped;
          index++;
        } else if (char === "-" && prev && index + 1 < length && pattern[index + 1] !== "]") {
          index++;
          let to = pattern[index];
          if (to === ESCAPE) {
            to = pattern[index += 1];
          }
          if (prev <= to) {
            body += `-${escapeMember(to)}`;
          }
          prev = EMPTY;
        } else if (char === "[" && pattern[index + 1] === ":") {
          const nameStart = index + 2;
          let end = nameStart;
          while (end < length && pattern[end] !== "]") {
            end++;
          }
          if (end === length) {
            return null;
          }
          if (end > nameStart && pattern[end - 1] === ":") {
            const expanded = POSIX_CLASSES[pattern.slice(nameStart, end - 1)];
            if (expanded === UNDEFINED) {
              return null;
            }
            body += expanded;
            prev = EMPTY;
            index = end;
          } else {
            body += escapeMember("[");
            prev = "[";
            index = nameStart - 2;
          }
        } else {
          body += escapeMember(char);
          prev = char;
        }
        index++;
        if (pattern[index] === "]") {
          return {
            end: index,
            source: classSource(negated, body)
          };
        }
      }
    };
    var NEVER_MATCH = "[]";
    var PLACEHOLDER = "\0";
    var REGEX_RESTORE_PLACEHOLDER = new RegExp(
      `${PLACEHOLDER}(\\d+)${PLACEHOLDER}`,
      "g"
    );
    var TRAILING_WILDCARD = "\uE000";
    var TRAILING_DOUBLESTAR = "\uE001";
    var extractBrackets = (pattern) => {
      const sources = [];
      const hold = (source) => `${PLACEHOLDER}${sources.push(source) - 1}${PLACEHOLDER}`;
      const { length } = pattern;
      let out = EMPTY;
      let index = 0;
      while (index < length) {
        const char = pattern[index];
        if (char === ESCAPE) {
          const escaped = pattern[index + 1];
          if (escaped === UNDEFINED || escaped === SLASH && index + 2 === length) {
            out += hold(NEVER_MATCH);
          } else if (escaped === "*" || escaped === "[" || escaped === SPACE || escaped === ESCAPE) {
            out += pattern.slice(index, index + 2);
          } else {
            out += hold(
              REGEX_LITERAL_SPECIAL.test(escaped) ? ESCAPE + escaped : escaped
            );
          }
          index += 2;
        } else if (char === PLACEHOLDER) {
          out += hold(`[${PLACEHOLDER}]`);
          index++;
        } else if (char === "[") {
          const scanned = scanBracket(pattern, index);
          if (scanned === null) {
            out += hold(NEVER_MATCH);
            index = length;
          } else {
            out += hold(scanned.source);
            index = scanned.end + 1;
          }
        } else {
          out += char;
          index++;
        }
      }
      return {
        source: out,
        sources
      };
    };
    var DIRECT = null;
    var REGEX_INNER_SLASH = /\/(?!$)/;
    var REPLACERS = [
      // Replace (\ ) with ' '
      // Only a space: an escaped tab or other whitespace is already a literal by
      //   the time it reaches here, and a bare tab must be left as one, not turned
      //   into a space.
      // (\ ) -> ' '
      // (\\ ) -> '\\ '
      // (\\\ ) -> '\\ '
      [
        // A run of backslashes is taken whole, from its first one, so no match
        //   ever starts again inside it -- `(\\+?) ` did, which made a long run
        //   quadratic.
        /(\\+)( ?)/g,
        (_, run, space) => space ? run.slice(0, run.length - run.length % 2) + SPACE : run,
        ESCAPE + SPACE
      ],
      // Escape metacharacters
      // which is written down by users but means special for regular expressions.
      // > There are 12 characters with special meanings:
      // > - the backslash \,
      // > - the caret ^,
      // > - the dollar sign $,
      // > - the period or dot .,
      // > - the vertical bar or pipe symbol |,
      // > - the question mark ?,
      // > - the asterisk or star *,
      // > - the plus sign +,
      // > - the opening parenthesis (,
      // > - the closing parenthesis ),
      // > - and the opening square bracket [,
      // > - the opening curly brace {,
      // > These special characters are often called "metacharacters".
      [
        /[\\$.|*+(){^]/g,
        (match) => `\\${match}`
      ],
      [
        // > a question mark (?) matches a single character
        /(?!\\)\?/g,
        () => "[^/]",
        "?"
      ],
      // leading slash
      [
        // > A leading slash matches the beginning of the pathname.
        // > For example, "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
        // A leading slash matches the beginning of the pathname
        /^\//,
        () => "^",
        SLASH
      ],
      // replace special metacharacter slash after the leading slash
      [
        /\//g,
        () => "\\/",
        SLASH
      ],
      [
        // > A leading "**" followed by a slash means match in all directories.
        // > For example, "**/foo" matches file or directory "foo" anywhere,
        // > the same as pattern "foo".
        // > "**/foo/bar" matches file or directory "bar" anywhere that is directly
        // >   under directory "foo".
        // Notice that the '*'s have been replaced as '\\*'
        /^\^*(?:\\\*\\\*\\\/)+/,
        // '**/foo' <-> 'foo'
        () => "^(?:.*\\/)?",
        "*"
      ],
      // starting
      [
        // there will be no leading '/'
        //   (which has been replaced by section "leading slash")
        // If starts with '**', adding a '^' to the regular expression also works
        DIRECT,
        (source, pattern) => {
          if (!source || source[0] === "^") {
            return source;
          }
          const anchor = !REGEX_INNER_SLASH.test(pattern) ? "(?:^|\\/)" : "^";
          return anchor + source;
        }
      ],
      // two globstars
      [
        // Use lookahead assertions so that we could match more than one `'/**'`
        /\\\/\\\*\\\*(?=\\\/|$)/g,
        // Zero, one or several directories
        // should not use '*', or it will be replaced by the next replacer
        // Check if it is not the last `'/**'`
        (_, index, str) => index + 6 < str.length ? str.slice(index + 6) === "\\/" ? "(?:\\/[^\\/]+)+" : "(?:\\/[^\\/]+)*" : `\\/${TRAILING_DOUBLESTAR}`,
        "*"
      ],
      // normal intermediate wildcards
      [
        // Never replace escaped '*'
        // ignore rule '\*' will match the path '*'
        // 'abc.*/' -> go
        // 'abc.*'  -> skip this rule,
        //    coz trailing single wildcard will be handed by [trailing wildcard]
        /(^|[^\\]+)(\\\*)+(?=.+)/g,
        // '*.js' matches '.js'
        // '*.js' doesn't match 'abc'
        (_, p1, p2) => {
          const unescaped = p2.replace(/\\\*/g, "[^\\/]*");
          return p1 + unescaped;
        },
        "*"
      ],
      // trailing wildcard, held apart from a literal star
      [
        // The step above leaves a trailing `*` alone, so a single `\*` is all that
        //   can be left at the end here. Whether it is a wildcard or a literal
        //   turns on the backslashes the user put in front of it: the escaper has
        //   since doubled every one, so what stands here is those `2N` doubled
        //   backslashes and then the star's own escape. An even number of the
        //   original `N` leaves the star unescaped -- a wildcard -- and an odd
        //   number escapes it -- a literal. This runs while the two are still
        //   distinct, before the unescape steps below collapse the literal onto
        //   the very `\*` a wildcard leaves behind.
        /(^|[^\\])((?:\\\\)*)\\\*$/,
        (match, p1, p2) => (
          // `p2` holds the doubled user backslashes; half of them is `N`.
          p2.length / 2 % 2 === 0 ? p1 + p2 + TRAILING_WILDCARD : match
        ),
        "*"
      ],
      [
        // unescape, revert step 3 except for back slash
        // For example, if a user escape a '\\*',
        // after step 3, the result will be '\\\\\\*'
        /\\\\\\(?=[$.|*+(){^])/g,
        () => ESCAPE,
        ESCAPE + ESCAPE
      ],
      [
        // '\\\\' -> '\\'
        /\\\\/g,
        () => ESCAPE,
        ESCAPE + ESCAPE
      ],
      [
        // Every real bracket expression -- POSIX classes included -- has already
        //   been held aside by `extractBrackets`, so the only `[` left in the
        //   pattern is an escaped, literal one.
        // `\` is escaped by step 3
        /\\\[([^\]/]*?)(\\*)($|\])/g,
        // '\\[bar]' -> '\\\\[bar\\]'
        (match, range, endEscape, close) => `\\[${range}${cleanRangeBackSlash(endEscape)}${close}`,
        "["
      ],
      // ending
      [
        // 'js' will not match 'js.'
        // 'ab' will not match 'abc'
        DIRECT,
        // WTF!
        // https://git-scm.com/docs/gitignore
        // changes in [2.22.1](https://git-scm.com/docs/gitignore/2.22.1)
        // which re-fixes #24, #38
        // > If there is a separator at the end of the pattern then the pattern
        // > will only match directories, otherwise the pattern can match both
        // > files and directories.
        // 'js*' will not match 'a.js'
        // 'js/' will not match 'a.js'
        // 'js' will match 'a.js' and 'a.js/'
        (source) => {
          const last = source[source.length - 1];
          if (!last || last === TRAILING_WILDCARD || last === TRAILING_DOUBLESTAR) {
            return source;
          }
          return last === SLASH ? `${source}$` : `${source}(?=$|\\/$)`;
        }
      ]
    ];
    var REGEX_REPLACE_TRAILING_WILDCARD = /(^|\\\/)?\uE000$/;
    var MODE_IGNORE = "regex";
    var MODE_CHECK_IGNORE = "checkRegex";
    var UNDERSCORE = "_";
    var replaceTrailingWildcard = (_, p1) => {
      const prefix = p1 ? `${p1}[^/]+` : "[^/]*";
      return `${prefix}(?=$|\\/$)`;
    };
    var REGEX_REPLACE_TRAILING_DOUBLESTAR = /\uE001$/;
    var replaceTrailingDoublestar = () => ".+(?=$|\\/$)";
    var WILDCARD = "[^\\/]*";
    var separatorAfter = (run, at) => {
      let separator = EMPTY;
      for (let index = at + 1; index < run.length && !run[index].wildcard; index++) {
        separator += run[index].single;
      }
      return separator;
    };
    var pinWildcards = (source) => {
      if (source.indexOf(WILDCARD) < 0) {
        return source;
      }
      const tokens = [];
      const { length } = source;
      let index = 0;
      while (index < length) {
        const char = source[index];
        if (source.startsWith(WILDCARD, index)) {
          tokens.push({ wildcard: true });
          index += WILDCARD.length;
        } else if (char === "[") {
          let end = index + 1;
          if (source[end] === "^") {
            end++;
          }
          if (source[end] === "]") {
            end++;
          }
          while (end < length && source[end] !== "]") {
            end += source[end] === ESCAPE ? 2 : 1;
          }
          end++;
          tokens.push({ single: source.slice(index, end) });
          index = end;
        } else if (char === ESCAPE) {
          tokens.push({ single: source.slice(index, index + 2) });
          index += 2;
        } else if (char === "(") {
          let depth = 0;
          let end = index;
          do {
            if (source[end] === ESCAPE) {
              end++;
            } else if (source[end] === "(") {
              depth++;
            } else if (source[end] === ")") {
              depth--;
            }
            end++;
          } while (end < length && depth > 0);
          if ("*+?".indexOf(source[end]) >= 0) {
            end++;
          }
          tokens.push({ boundary: source.slice(index, end) });
          index = end;
        } else if (char === "^" || char === "$") {
          tokens.push({ boundary: char });
          index++;
        } else {
          tokens.push({ single: char });
          index++;
        }
      }
      let out = EMPTY;
      let run = [];
      const flush = () => {
        let lastWildcard;
        run.forEach((token, at) => {
          if (token.wildcard) {
            lastWildcard = at;
          }
        });
        run.forEach((token, at) => {
          if (!token.wildcard) {
            out += token.single;
            return;
          }
          out += at === lastWildcard ? WILDCARD : `(?:(?!${separatorAfter(run, at)})[^\\/])*`;
        });
        run = [];
      };
      tokens.forEach((token) => {
        if (token.boundary === void 0) {
          run.push(token);
          return;
        }
        flush();
        out += token.boundary;
      });
      flush();
      return out;
    };
    var makeRegexPrefix = (pattern) => {
      const { source, sources } = extractBrackets(pattern);
      const replaced = REPLACERS.reduce(
        // A pass whose matcher finds nothing hands back the very string it was
        //   given, so asking first costs a search and saves a rewrite. Ten of the
        //   fifteen passes never fire for a typical .gitignore line, and between
        //   them they were 45% of this chain.
        (prev, [matcher, replacer, required]) => {
          if (matcher === DIRECT) {
            return replacer(prev, pattern);
          }
          if (required !== UNDEFINED && prev.indexOf(required) < 0) {
            return prev;
          }
          return matcher.test(prev) ? prev.replace(matcher, replacer.bind(pattern)) : prev;
        },
        source
      );
      return sources.length ? replaced.replace(
        REGEX_RESTORE_PLACEHOLDER,
        (match, index) => sources[index]
      ) : replaced;
    };
    var checkSourceOf = (body, prefix) => {
      if (body[body.length - 1] === SLASH) {
        prefix = makeRegexPrefix(body.slice(0, -1));
      }
      const head = prefix.slice(0, -1);
      const last = prefix[prefix.length - 1];
      return last === TRAILING_WILDCARD ? `${head}$` : last === TRAILING_DOUBLESTAR ? `${head}.*$` : NEVER_MATCH;
    };
    var matchesBasename = (body) => {
      const index = body.indexOf(SLASH);
      return index < 0 || index === body.length - 1;
    };
    var basenameOf = (path) => {
      const end = path.length - 1;
      const index = path.lastIndexOf(
        SLASH,
        path[end] === SLASH ? end - 1 : end
      );
      return index < 0 ? path : path.slice(index + 1);
    };
    var parentOf2 = (path) => {
      if (path.charCodeAt(0) === SLASH_CODE || path.indexOf(DOUBLE_SLASH) >= 0) {
        const slices = path.split(SLASH).filter(Boolean);
        slices.pop();
        return slices.length ? slices.join(SLASH) + SLASH : EMPTY;
      }
      const end = path.length - 1;
      const cut = path.lastIndexOf(
        SLASH,
        path.charCodeAt(end) === SLASH_CODE ? end - 1 : end
      );
      return cut < 0 ? EMPTY : path.slice(0, cut + 1);
    };
    var isString = (subject) => typeof subject === "string";
    var checkPattern = (pattern) => pattern && isString(pattern) && !REGEX_INVALID_TRAILING_BACKSLASH.test(pattern);
    var splitPattern = (pattern) => pattern.split(REGEX_SPLITALL_CRLF).filter(Boolean);
    var IgnoreRule = class {
      constructor(pattern, mark, body, ignoreCase, negative, prefix) {
        this.pattern = pattern;
        this.mark = mark;
        this.negative = negative;
        define(this, "body", body);
        define(this, "ignoreCase", ignoreCase);
        define(this, "regexPrefix", prefix);
      }
      // Worked out on first use and kept behind an own property, the way `regex`
      //   caches itself in `_regex`. Deciding it in the constructor instead would
      //   add a fourth `defineProperty` to every rule ever built, which cost 4% of
      //   every compile -- including the compiles of rules that are never matched
      //   against anything.
      get _basenameOnly() {
        return define(this, "_basenameOnly", matchesBasename(this.body));
      }
      get regex() {
        const key = UNDERSCORE + MODE_IGNORE;
        if (this[key]) {
          return this[key];
        }
        return this._make(MODE_IGNORE, key);
      }
      get checkRegex() {
        const key = UNDERSCORE + MODE_CHECK_IGNORE;
        if (this[key]) {
          return this[key];
        }
        return this._make(MODE_CHECK_IGNORE, key);
      }
      _make(mode, key) {
        const str = pinWildcards(
          mode === MODE_IGNORE ? this.regexPrefix.replace(REGEX_REPLACE_TRAILING_WILDCARD, replaceTrailingWildcard).replace(REGEX_REPLACE_TRAILING_DOUBLESTAR, replaceTrailingDoublestar) : checkSourceOf(this.body, this.regexPrefix)
        );
        const regex = this.ignoreCase ? new RegExp(str, "i") : new RegExp(str);
        return define(this, key, regex);
      }
    };
    var isLineEnd = (char) => char === "\r" || char === "\n";
    var trimEnd = (body) => {
      let end = body.length;
      while (end && isLineEnd(body[end - 1])) {
        end--;
      }
      const lineEnd = end;
      while (end && body[end - 1] === SPACE) {
        end--;
      }
      if (end === lineEnd) {
        return body.slice(0, end);
      }
      let backslashes = 0;
      while (backslashes < end && body[end - backslashes - 1] === ESCAPE) {
        backslashes++;
      }
      return backslashes % 2 ? body.slice(0, end - 1) + SPACE : body.slice(0, end);
    };
    var createRule = ({
      pattern,
      mark
    }, ignoreCase) => {
      let body = pattern[0] === BOM ? pattern.slice(1) : pattern;
      if (body[0] === "#") {
        return;
      }
      let negative = false;
      if (body[0] === "!") {
        negative = true;
        body = body.slice(1);
      }
      const last = body[body.length - 1];
      if (last === SPACE || last === "\r" || last === "\n") {
        body = trimEnd(body);
      }
      if (!body) {
        return;
      }
      body = body.replace(REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION, "!").replace(REGEX_REPLACE_LEADING_EXCAPED_HASH, "#");
      const regexPrefix = makeRegexPrefix(body);
      return new IgnoreRule(
        pattern,
        mark,
        body,
        ignoreCase,
        negative,
        regexPrefix
      );
    };
    var RuleManager = class {
      constructor(ignoreCase) {
        this._ignoreCase = ignoreCase;
        this._rules = [];
        this._basenameCount = 0;
      }
      _add(pattern) {
        if (pattern && pattern[KEY_IGNORE]) {
          this._rules = this._rules.concat(pattern._rules._rules);
          this._basenameCount += pattern._rules._basenameCount;
          this._added = true;
          return;
        }
        if (isString(pattern)) {
          pattern = {
            pattern
          };
        }
        const rule = checkPattern(pattern.pattern) && createRule(pattern, this._ignoreCase);
        if (rule) {
          this._added = true;
          this._rules.push(rule);
          if (matchesBasename(rule.body)) {
            this._basenameCount++;
          }
        }
      }
      // @param {Array<string> | string | Ignore} pattern
      add(pattern) {
        this._added = false;
        makeArray(
          isString(pattern) ? splitPattern(pattern) : pattern
        ).forEach(this._add, this);
        if (this._added) {
          this._literalRules = UNDEFINED;
        }
        return this._added;
      }
      // Match the literal 'abc/' for `checkIgnore`, last rule wins. Only a rule
      //   ending in a wildcard can match it (see `checkSourceOf`), so the rest
      //   are left out once, rather than tested or compiled for every path.
      testLiteral(path) {
        const rules = this._literalRules || (this._literalRules = this._rules.filter(
          ({ body }) => body[body.length - (body[body.length - 1] === SLASH ? 2 : 1)] === "*"
        ));
        let ignored = false;
        let unignored = false;
        let matchedRule;
        for (let index = rules.length - 1; index >= 0; index--) {
          const rule = rules[index];
          if (rule.checkRegex.test(path)) {
            ignored = !rule.negative;
            unignored = rule.negative;
            matchedRule = rule.negative ? UNDEFINED : rule;
            break;
          }
        }
        const ret = {
          ignored,
          unignored
        };
        if (matchedRule) {
          ret.rule = matchedRule;
        }
        return ret;
      }
      // Test one single path without recursively checking parent directories
      //
      // - checkUnignored `boolean` whether should check if the path is unignored,
      //   setting `checkUnignored` to `false` could reduce additional
      //   path matching.
      // - check `string` either `MODE_IGNORE` or `MODE_CHECK_IGNORE`
      // @returns {TestResult} true if a file is ignored
      test(path, checkUnignored, mode) {
        let ignored = false;
        let unignored = false;
        let matchedRule;
        const rules = this._rules;
        const { length } = rules;
        const shortcut = this._basenameCount * 2 >= length;
        const basename = shortcut ? basenameOf(path) : path;
        for (let index = 0; index < length; index++) {
          const rule = rules[index];
          const { negative } = rule;
          const skip = unignored === negative && ignored !== unignored || negative && !ignored && !unignored && !checkUnignored;
          if (!skip && rule[mode].test(
            shortcut && rule._basenameOnly ? basename : path
          )) {
            ignored = !negative;
            unignored = negative;
            matchedRule = negative ? UNDEFINED : rule;
          }
        }
        const ret = {
          ignored,
          unignored
        };
        if (matchedRule) {
          ret.rule = matchedRule;
        }
        return ret;
      }
    };
    var throwError = (message, Ctor) => {
      throw new Ctor(message);
    };
    var checkPath = (path, originalPath, doThrow) => {
      if (!isString(path)) {
        return doThrow(
          `path must be a string, but got \`${originalPath}\``,
          TypeError
        );
      }
      if (!path) {
        return doThrow(`path must not be empty`, TypeError);
      }
      if (checkPath.isNotRelative(path)) {
        const r = "`path.relative()`d";
        return doThrow(
          `path should be a ${r} string, but got "${originalPath}"`,
          RangeError
        );
      }
      return true;
    };
    var isNotRelative = (path) => {
      const first = path.charCodeAt(0);
      if (first === SLASH_CODE) {
        return true;
      }
      if (first !== DOT_CODE) {
        return false;
      }
      if (path.length === 1) {
        return true;
      }
      const second = path.charCodeAt(1);
      if (second === SLASH_CODE) {
        return true;
      }
      if (second !== DOT_CODE) {
        return false;
      }
      return path.length === 2 || path.charCodeAt(2) === SLASH_CODE;
    };
    checkPath.isNotRelative = isNotRelative;
    checkPath.convert = (p) => p;
    var Ignore = class {
      constructor({
        ignorecase = true,
        ignoreCase = ignorecase,
        allowRelativePaths = false
      } = {}) {
        define(this, KEY_IGNORE, true);
        this._rules = new RuleManager(ignoreCase);
        this._strictPathCheck = !allowRelativePaths;
        this._initCache();
      }
      _initCache() {
        this._ignoreCache = /* @__PURE__ */ Object.create(null);
        this._testCache = /* @__PURE__ */ Object.create(null);
      }
      add(pattern) {
        if (this._rules.add(pattern)) {
          this._initCache();
        }
        return this;
      }
      // legacy
      addPattern(pattern) {
        return this.add(pattern);
      }
      // @returns {TestResult}
      _test(originalPath, cache, checkUnignored) {
        const path = originalPath && checkPath.convert(originalPath);
        checkPath(
          path,
          originalPath,
          this._strictPathCheck ? throwError : RETURN_FALSE
        );
        return this._t(path, cache, checkUnignored);
      }
      checkIgnore(path) {
        if (path.charCodeAt(path.length - 1) !== SLASH_CODE) {
          return this.test(path);
        }
        const dir = this._t(path, this._testCache, true);
        if (dir.ignored) {
          return dir;
        }
        const literal = this._rules.testLiteral(path);
        return literal.ignored || literal.unignored ? literal : dir;
      }
      _t(path, cache, checkUnignored) {
        if (path in cache) {
          return cache[path];
        }
        const parentPath = parentOf2(path);
        const parent = parentPath ? this._t(parentPath, cache, checkUnignored) : UNDEFINED;
        return cache[path] = parent && parent.ignored ? parent : this._rules.test(path, checkUnignored, MODE_IGNORE);
      }
      ignores(path) {
        return this._test(path, this._ignoreCache, false).ignored;
      }
      createFilter() {
        return (path) => !this.ignores(path);
      }
      filter(paths) {
        return makeArray(paths).filter(this.createFilter());
      }
      // @returns {TestResult}
      test(path) {
        return this._test(path, this._testCache, true);
      }
    };
    var factory = (options) => new Ignore(options);
    var isPathValid = (path) => checkPath(path && checkPath.convert(path), path, RETURN_FALSE);
    var setupWindows = () => {
      const makePosix = (str) => /^\\\\\?\\/.test(str) || /["<>|\u0000-\u001F]+/u.test(str) ? str : str.replace(/\\/g, "/");
      checkPath.convert = makePosix;
      const REGEX_TEST_WINDOWS_PATH_ABSOLUTE = /^[a-z]:\//i;
      checkPath.isNotRelative = (path) => REGEX_TEST_WINDOWS_PATH_ABSOLUTE.test(path) || isNotRelative(path);
    };
    if (
      // Detect `process` so that it can run in browsers.
      typeof process !== "undefined" && process.platform === "win32"
    ) {
      setupWindows();
    }
    module2.exports = factory;
    factory.default = factory;
    module2.exports.isPathValid = isPathValid;
    define(module2.exports, /* @__PURE__ */ Symbol.for("setupWindows"), setupWindows);
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => EasyGitSync
});
module.exports = __toCommonJS(main_exports);
var import_obsidian5 = require("obsidian");

// src/editor.ts
var import_state = require("@codemirror/state");
var import_view = require("@codemirror/view");

// src/merge/frontmatter.ts
function splitFrontmatter(lines) {
  var _a, _b;
  if (((_a = lines[0]) == null ? void 0 : _a.trimEnd()) !== "---") return { frontmatter: null, body: lines };
  for (let i = 1; i < lines.length; i++) {
    if (((_b = lines[i]) == null ? void 0 : _b.trimEnd()) === "---") {
      return { frontmatter: lines.slice(1, i), body: lines.slice(i + 1) };
    }
  }
  return { frontmatter: null, body: lines };
}
var KEY_LINE = /^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s#'"-][^:]*?|-\S[^:]*?)\s*:(?:\s|$)/;
function parseKeyBlocks(frontmatter) {
  const blocks = [];
  for (const line of frontmatter) {
    const match = KEY_LINE.exec(line);
    if ((match == null ? void 0 : match[1]) !== void 0) {
      blocks.push({ key: match[1], lines: [line] });
      continue;
    }
    const last = blocks[blocks.length - 1];
    if (last) last.lines.push(line);
    else blocks.push({ key: null, lines: [line] });
  }
  return blocks;
}
function displayKey(key) {
  if (key.startsWith('"') && key.endsWith('"')) return key.slice(1, -1).replace(/\\(.)/g, "$1");
  if (key.startsWith("'") && key.endsWith("'")) return key.slice(1, -1).replace(/''/g, "'");
  return key;
}
function mergeFrontmatter(base, local, remote, prefer) {
  const baseMap = toMap(base ? parseKeyBlocks(base) : []);
  const localBlocks = parseKeyBlocks(local);
  const remoteBlocks = parseKeyBlocks(remote);
  const localMap = toMap(localBlocks);
  const remoteMap = toMap(remoteBlocks);
  const conflicts = [];
  const out = [];
  for (const block of localBlocks) {
    if (block.key === null) {
      out.push(block);
      continue;
    }
    const merged = mergeKey(
      block.key,
      baseMap.get(block.key),
      block.lines,
      remoteMap.get(block.key),
      prefer
    );
    if (merged.conflict) conflicts.push(merged.conflict);
    if (merged.lines) out.push({ key: block.key, lines: merged.lines });
  }
  let after = null;
  for (const block of remoteBlocks) {
    if (block.key === null) continue;
    if (localMap.has(block.key)) {
      after = block.key;
      continue;
    }
    const merged = mergeKey(block.key, baseMap.get(block.key), void 0, block.lines, prefer);
    if (merged.lines) {
      const at = after === null ? -1 : out.findIndex((b) => b.key === after);
      const insertAt = at === -1 ? after === null ? firstKeyIndex(out) : out.length : at + 1;
      out.splice(insertAt, 0, { key: block.key, lines: merged.lines });
      after = block.key;
    }
  }
  return { lines: out.flatMap((block) => block.lines), conflicts };
}
function firstKeyIndex(blocks) {
  var _a;
  return ((_a = blocks[0]) == null ? void 0 : _a.key) === null ? 1 : 0;
}
function mergeKey(key, base, local, remote, prefer) {
  const b = base == null ? void 0 : base.join("\n");
  const l = local == null ? void 0 : local.join("\n");
  const r = remote == null ? void 0 : remote.join("\n");
  if (l === r) return { lines: local };
  if (l === b) return { lines: remote };
  if (r === b) return { lines: local };
  if (local === void 0) return { lines: remote };
  if (remote === void 0) return { lines: local };
  const list = mergeList(base, local, remote);
  if (list) return { lines: list };
  return { lines: prefer === "remote" ? remote : local, conflict: { key, local, remote } };
}
function mergeList(base, local, remote) {
  var _a, _b;
  const l = listItems(local);
  const r = listItems(remote);
  if (!l || !r) return null;
  const b = base ? (_a = listItems(base)) != null ? _a : [] : [];
  const header = (_b = local[0]) != null ? _b : "";
  const keep = (item, other) => other.includes(item) || !b.includes(item);
  const merged = l.filter((item) => keep(item, r));
  for (const item of r) {
    if (!l.includes(item) && !b.includes(item)) merged.push(item);
  }
  return [header, ...merged];
}
function listItems(lines) {
  const [header, ...rest] = lines;
  if (header === void 0 || !/:\s*$/.test(header)) return null;
  const items = rest.filter((line) => line.trim() !== "");
  if (items.length === 0 || !items.every((line) => /^\s*- /.test(line))) return null;
  return items;
}
function toMap(blocks) {
  const map = /* @__PURE__ */ new Map();
  for (const block of blocks) if (block.key !== null) map.set(block.key, block.lines);
  return map;
}
function replaceProperty(frontmatter, key, lines) {
  const blocks = parseKeyBlocks(frontmatter);
  const at = blocks.findIndex((block) => block.key === key);
  if (at === -1) {
    if (lines.length > 0) blocks.push({ key, lines });
  } else if (lines.length === 0) {
    blocks.splice(at, 1);
  } else {
    blocks[at] = { key, lines };
  }
  return blocks.flatMap((block) => block.lines);
}

// src/merge/lines.ts
function splitLines(text) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const finalNewline2 = text.endsWith("\n");
  let body = text;
  if (finalNewline2) body = text.slice(0, text.endsWith("\r\n") ? -2 : -1);
  const lines = body === "" && !finalNewline2 ? [] : body.split(/\r?\n/);
  return { lines, eol, finalNewline: finalNewline2 };
}
function joinLines(split) {
  if (split.lines.length === 0) return "";
  return split.lines.join(split.eol) + (split.finalNewline ? split.eol : "");
}

// src/merge/conflict.ts
var SYNC_TAG = "sync conflict";
var OPEN = /^<{7}(?: (.*))?$/;
var BASE = /^\|{7}(?: .*)?$/;
var SEPARATOR = /^={7}$/;
var CLOSE = /^>{7}(?: (.*))?$/;
var PROPERTY = / \(sync conflict in property "((?:[^"\\]|\\.)*)"\)$/;
var LABEL_DATE = /, (\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;
function cleanLabel(label) {
  return label.replace(/[\r\n]+/g, " ").trim();
}
function renderConflict(sides, property) {
  const [top, bottom] = sides;
  const tag = property === void 0 ? SYNC_TAG : `${SYNC_TAG} in property "${displayKey(property).replace(/["\\]/g, "\\$&")}"`;
  const padded = (lines) => lines.length === 0 ? [""] : ["", ...lines, ""];
  return [
    `<<<<<<< ${cleanLabel(top.label)} (${tag})`,
    ...padded(top.lines),
    "=======",
    ...padded(bottom.lines),
    `>>>>>>> ${cleanLabel(bottom.label)}`
  ];
}
function findConflicts(lines) {
  var _a, _b, _c, _d, _e;
  const found = [];
  let open = null;
  for (let i = 0; i < lines.length; i++) {
    const line = (_a = lines[i]) != null ? _a : "";
    const opening = OPEN.exec(line);
    if (opening) {
      open = {
        start: i,
        label: (_b = opening[1]) != null ? _b : "",
        top: [],
        inBase: false,
        separator: null,
        bottom: []
      };
      continue;
    }
    if (!open) continue;
    if (open.separator === null) {
      if (SEPARATOR.test(line)) {
        open.separator = i;
        open.inBase = false;
      } else if (BASE.test(line)) {
        open.inBase = true;
      } else if (!open.inBase) {
        open.top.push(line);
      }
      continue;
    }
    const closing = CLOSE.exec(line);
    if (!closing) {
      open.bottom.push(line);
      continue;
    }
    const raw = open.label;
    const sync2 = raw.endsWith(` (${SYNC_TAG})`) || PROPERTY.test(raw);
    const propertyMatch = PROPERTY.exec(raw);
    const property = (_d = (_c = propertyMatch == null ? void 0 : propertyMatch[1]) == null ? void 0 : _c.replace(/\\(.)/g, "$1")) != null ? _d : null;
    const topLabel = sync2 ? raw.replace(PROPERTY, "").replace(` (${SYNC_TAG})`, "") : raw;
    const tidy2 = sync2 ? unpad : (lines2) => lines2;
    found.push({
      sync: sync2,
      property,
      start: open.start,
      end: i,
      sides: [
        { label: topLabel, marker: open.start, lines: tidy2(open.top) },
        { label: (_e = closing[1]) != null ? _e : "", marker: open.separator, lines: tidy2(open.bottom) }
      ]
    });
    open = null;
  }
  return found;
}
function unpad(lines) {
  var _a, _b;
  let from = 0;
  let to = lines.length;
  if (((_a = lines[0]) == null ? void 0 : _a.trim()) === "") from = 1;
  if (to > from && ((_b = lines[to - 1]) == null ? void 0 : _b.trim()) === "") to--;
  return lines.slice(from, to);
}
function hasConflictMarker(text) {
  return /^<{7}(?: |$)/m.test(text) && /^>{7}(?: |$)/m.test(text);
}
function sideName(conflict, index) {
  const label = conflict.sides[index].label;
  const name = conflict.sync ? label.replace(LABEL_DATE, "") : label;
  return name.trim() || (index === 0 ? "top" : "bottom");
}
function sideTime(conflict, index) {
  if (!conflict.sync) return null;
  const match = LABEL_DATE.exec(conflict.sides[index].label);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  return new Date(y != null ? y : 0, (mo != null ? mo : 1) - 1, d != null ? d : 1, h != null ? h : 0, mi != null ? mi : 0);
}
function newerSide(conflict) {
  const top = sideTime(conflict, 0);
  const bottom = sideTime(conflict, 1);
  if (!top || !bottom || top.getTime() === bottom.getTime()) return null;
  return top > bottom ? 0 : 1;
}
function resolveAllNewer(text) {
  let out = text;
  let resolved = 0;
  let skipped = 0;
  for (let i = findConflicts(splitLines(text).lines).length - 1; i >= 0; i--) {
    const conflict = findConflicts(splitLines(out).lines)[i];
    if (!conflict) continue;
    const newer = newerSide(conflict);
    const next = newer === null ? null : resolveConflict(out, conflict.start, { keep: newer });
    if (next === null) {
      skipped++;
      continue;
    }
    out = next;
    resolved++;
  }
  return { text: out, resolved, skipped };
}
function resolveConflict(text, start, choice) {
  var _a, _b;
  const split = splitLines(text);
  const conflict = findConflicts(split.lines).find((c) => c.start === start);
  if (!conflict) return null;
  const kept = choice === "both" ? null : conflict.sides[choice.keep];
  let replacement = [];
  if (conflict.property === null) {
    replacement = kept ? kept.lines : conflict.sides.flatMap((side) => side.lines);
  }
  const lines = [
    ...split.lines.slice(0, conflict.start),
    ...replacement,
    ...split.lines.slice(conflict.end + 1)
  ];
  if (conflict.property !== null && kept) {
    const { frontmatter, body } = splitFrontmatter(lines);
    if (frontmatter) {
      const key = (_b = (_a = parseKeyBlocks(frontmatter).find(
        (b) => b.key !== null && displayKey(b.key) === conflict.property
      )) == null ? void 0 : _a.key) != null ? _b : conflict.property;
      const updated = replaceProperty(frontmatter, key, kept.lines);
      return joinLines({ ...split, lines: ["---", ...updated, "---", ...body] });
    }
  }
  return joinLines({ ...split, lines });
}

// src/editor.ts
var PREFIX = "easy-git-sync";
function conflictEditorExtension() {
  return import_view.ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = build(view);
      }
      update(update) {
        if (!update.docChanged) return;
        if (this.decorations.size === 0 && !touchesMarker(update)) return;
        this.decorations = build(update.view);
      }
    },
    { decorations: (plugin) => plugin.decorations }
  );
}
function conflictParts(lines) {
  var _a;
  const parts = /* @__PURE__ */ new Map();
  for (const conflict of findConflicts(lines)) {
    const separator = conflict.sides[1].marker;
    let inBase = false;
    for (let n = conflict.start; n <= conflict.end; n++) {
      let part;
      if (n === conflict.start) part = "current-header";
      else if (n === conflict.end) part = "incoming-header";
      else if (n === separator) part = "separator";
      else if (n < separator && /^\|{7}(?: |$)/.test((_a = lines[n]) != null ? _a : "")) {
        inBase = true;
        part = "common-header";
      } else if (n < separator) part = inBase ? "common" : "current";
      else part = "incoming";
      parts.set(n, { part, conflict });
    }
  }
  return parts;
}
var MARKER_START = /^(?:<{7}|={7}|>{7}|\|{7})/;
function touchesMarker(update) {
  const doc = update.state.doc;
  let found = false;
  update.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
    if (found) return;
    for (let n = doc.lineAt(fromB).number; n <= doc.lineAt(toB).number; n++) {
      if (MARKER_START.test(doc.line(n).text)) {
        found = true;
        return;
      }
    }
  });
  return found;
}
function build(view) {
  const builder = new import_state.RangeSetBuilder();
  const doc = view.state.doc;
  const text = doc.toString();
  if (!hasConflictMarker(text)) return builder.finish();
  const parts = conflictParts(text.split("\n"));
  for (const n of [...parts.keys()].sort((a, b) => a - b)) {
    const entry = parts.get(n);
    if (!entry) continue;
    const line = doc.line(n + 1);
    const marker = entry.part.endsWith("header") || entry.part === "separator";
    const classes = `${PREFIX}-${entry.part}${marker ? ` ${PREFIX}-marker-line` : ""}`;
    builder.add(line.from, line.from, import_view.Decoration.line({ class: classes }));
    if (entry.part === "current-header") {
      builder.add(
        line.to,
        line.to,
        import_view.Decoration.widget({ widget: new ButtonsWidget(entry.conflict), side: 1 })
      );
    }
  }
  return builder.finish();
}
function resolveAt(view, at, choice) {
  const doc = view.state.doc;
  const text = doc.toString();
  const next = resolveConflict(text, doc.lineAt(at).number - 1, choice);
  if (next === null || next === text) return;
  let from = 0;
  const max = Math.min(text.length, next.length);
  while (from < max && text[from] === next[from]) from++;
  let tail = 0;
  while (tail < max - from && text[text.length - 1 - tail] === next[next.length - 1 - tail]) tail++;
  view.dispatch({
    changes: { from, to: text.length - tail, insert: next.slice(from, next.length - tail) }
  });
}
var ButtonsWidget = class extends import_view.WidgetType {
  constructor(conflict) {
    super();
    this.conflict = conflict;
  }
  eq(other) {
    return other.conflict.property === this.conflict.property && other.conflict.sides[0].label === this.conflict.sides[0].label && other.conflict.sides[1].label === this.conflict.sides[1].label;
  }
  toDOM(view) {
    const el = createSpan();
    appendButtons(el, this.conflict, (choice) => resolveAt(view, view.posAtDOM(el), choice));
    return el;
  }
  ignoreEvent() {
    return true;
  }
};
function appendButtons(parent, conflict, resolve) {
  const row = parent.createSpan({ cls: `${PREFIX}-buttons` });
  const newer = newerSide(conflict);
  const add = (text, choice) => {
    const label = choice !== "both" && choice.keep === newer ? `${text} (newer)` : text;
    const button = row.createEl("button", { text: label, cls: `${PREFIX}-button` });
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", (event) => {
      event.preventDefault();
      resolve(choice);
    });
  };
  add(`Keep ${sideName(conflict, 0)}`, { keep: 0 });
  add(`Keep ${sideName(conflict, 1)}`, { keep: 1 });
  if (conflict.property === null) add("Keep both", "both");
}

// src/lib/bytes.ts
var encoder = new TextEncoder();
var strictDecoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
function encodeUtf8(text) {
  return encoder.encode(text);
}
var BINARY_PROBE = 8e3;
function decodeText(bytes) {
  if (bytes.subarray(0, BINARY_PROBE).includes(0)) return null;
  try {
    return strictDecoder.decode(bytes);
  } catch (e) {
    return null;
  }
}
function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
function concatBytes(parts) {
  let length = 0;
  for (const part of parts) length += part.length;
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}
function toBase64(bytes) {
  const CHUNK = 32768;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}
function toArrayBuffer(bytes) {
  if (bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength && bytes.buffer instanceof ArrayBuffer) {
    return bytes.buffer;
  }
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

// src/lib/format.ts
var pad = (n) => String(n).padStart(2, "0");
function formatDate(date, pattern = "YYYY-MM-DD HH:mm:ss") {
  const tokens = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds())
  };
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => {
    var _a;
    return (_a = tokens[token]) != null ? _a : token;
  });
}
var SUMMARY_LENGTH = 72;
var BODY_FILES = 200;
var DEVICE_TRAILER = "Synced-From";
var SUPERSEDED_TRAILER = "Superseded-By";
function commitMessage(values) {
  var _a;
  const deleted = (_a = values.deleted) != null ? _a : /* @__PURE__ */ new Set();
  const device = oneLine(values.device);
  const summary = summarize(values.files, deleted);
  const parts = [`${device}: ${summary}`];
  let trailer = `${DEVICE_TRAILER}: ${device}`;
  if (values.superseded) {
    parts.push(
      "This device's version, before a newer one from another device replaced the places where the two clashed. Kept here so it stays in the history."
    );
    trailer += `
${SUPERSEDED_TRAILER}: newer version`;
  }
  if (values.files.length > 0 && summary !== listed(values.files, deleted)) {
    parts.push(fileList(values.files, deleted));
  }
  parts.push(trailer);
  return parts.join("\n\n");
}
function isSuperseded(message) {
  return new RegExp(`^${SUPERSEDED_TRAILER}: `, "m").test(message);
}
function fileList(files, deleted) {
  const lines = files.slice(0, BODY_FILES).map((p) => deleted.has(p) ? `- deleted ${p}` : `- ${p}`);
  if (files.length > BODY_FILES) lines.push(`- and ${files.length - BODY_FILES} more`);
  return lines.join("\n");
}
function listed(files, deleted) {
  return files.map((p) => deleted.has(p) ? `deleted ${p}` : p).join(", ");
}
function summarize(files, deleted) {
  if (files.length === 0) return "no changes";
  if (files.length === 1) return listed(files, deleted);
  if (files.length <= 3) {
    const list = listed(files, deleted);
    if (list.length <= SUMMARY_LENGTH) return list;
  }
  const folders = [
    ...new Set(
      files.map((p) => p.includes("/") ? `${p.slice(0, p.indexOf("/"))}/` : "top level")
    )
  ];
  const shown = folders.slice(0, 3).join(", ") + (folders.length > 3 ? `, ${folders.length - 3} more` : "");
  const verb = files.every((p) => deleted.has(p)) ? "deleted " : "";
  return `${verb}${files.length} files (${shown})`;
}
function deviceFromMessage(message) {
  var _a;
  const match = new RegExp(`^${DEVICE_TRAILER}: (.+)$`, "m").exec(message);
  return ((_a = match == null ? void 0 : match[1]) == null ? void 0 : _a.trim()) || null;
}
function oneLine(text) {
  return text.replace(/[\r\n]+/g, " ").trim() || "unknown device";
}
function sideLabel(device, date) {
  return date ? `${device}, ${formatDate(date, "YYYY-MM-DD HH:mm")}` : device;
}
function conflictCopyPath(path, device, date, exists) {
  const slash = path.lastIndexOf("/");
  const dir = path.slice(0, slash + 1);
  const name = path.slice(slash + 1);
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  const who = device.replace(/[\\/:*?"<>|#^[\]]/g, "").trim() || "other device";
  const tag = `conflict ${who} ${formatDate(date, "YYYY-MM-DD HHmm")}`;
  let candidate = `${dir}${stem} (${tag})${ext}`;
  for (let n = 2; exists(candidate); n++) candidate = `${dir}${stem} (${tag} ${n})${ext}`;
  return candidate;
}
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// src/local-fs.ts
var import_state2 = require("@codemirror/state");
var import_obsidian = require("obsidian");

// src/lib/githash.ts
async function gitBlobSha(bytes) {
  const header = encodeUtf8(`blob ${bytes.length}\0`);
  const digest = await crypto.subtle.digest("SHA-1", toArrayBuffer(concatBytes([header, bytes])));
  return toHex(new Uint8Array(digest));
}
function toHex(bytes) {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

// src/local-fs.ts
var ObsidianFs = class {
  constructor(app) {
    this.app = app;
    this.ownWrites = /* @__PURE__ */ new Map();
  }
  get adapter() {
    return this.app.vault.adapter;
  }
  async listDir(dir) {
    const listed2 = await this.adapter.list(dir === "" ? "/" : dir);
    const clean = (path) => path.replace(/^\/+/, "");
    const stats = await Promise.all(
      listed2.files.map(async (raw) => {
        const path = clean(raw);
        const indexed = this.app.vault.getFileByPath(path);
        if (indexed) return { path, mtime: indexed.stat.mtime, size: indexed.stat.size };
        const stat = await this.adapter.stat(path);
        return (stat == null ? void 0 : stat.type) === "file" ? { path, mtime: stat.mtime, size: stat.size } : null;
      })
    );
    const files = stats.filter((file) => file !== null);
    return { files, folders: listed2.folders.map(clean) };
  }
  async read(path) {
    return new Uint8Array(await this.adapter.readBinary(path));
  }
  async isOwnEcho(path, within) {
    const own = this.ownWrites.get(path);
    if (!own) return false;
    this.ownWrites.delete(path);
    if (Date.now() - own.at > within) return false;
    if (!await this.adapter.exists(path)) return own.sha === null;
    return own.sha !== null && await gitBlobSha(await this.read(path)) === own.sha;
  }
  remember(path, sha) {
    const now = Date.now();
    for (const [p, own] of this.ownWrites) if (now - own.at > 6e4) this.ownWrites.delete(p);
    this.ownWrites.set(path, { sha, at: now });
  }
  async write(path, data, expectedSha) {
    const view = openView(this.app, path);
    if (view) return this.writeIntoEditor(view, path, data, expectedSha);
    const current = await this.adapter.exists(path) ? await this.read(path) : null;
    if (!await matches(current, expectedSha)) return false;
    if (current && bytesEqual(current, data)) return true;
    this.remember(path, await gitBlobSha(data));
    const file = this.app.vault.getFileByPath(path);
    if (file) {
      await this.app.vault.modifyBinary(file, toArrayBuffer(data));
    } else if (isDotPath(path)) {
      await this.ensureFolder(parentOf(path), true);
      await this.adapter.writeBinary(path, toArrayBuffer(data));
    } else {
      await this.ensureFolder(parentOf(path), false);
      await this.app.vault.createBinary(path, toArrayBuffer(data));
    }
    return true;
  }
  async writeIntoEditor(view, path, data, expectedSha) {
    let text = decodeText(data);
    if (text === null) return false;
    const current = view.editor.getValue();
    if (!await matches(encodeUtf8(current), expectedSha)) {
      const disk = view.file ? await this.read(view.file.path) : null;
      const diskText = disk ? decodeText(disk) : null;
      const unedited = disk !== null && diskText !== null && diskText.replace(/\r\n/g, "\n") === current && await matches(disk, expectedSha);
      if (!unedited) return false;
      text = text.replace(/\r\n/g, "\n");
    }
    if (view.editor.getValue() !== current) return false;
    this.remember(path, await gitBlobSha(encodeUtf8(text)));
    if (view.editor.getValue() !== current) return false;
    if (current !== text) {
      const cm = view.editor.cm;
      if (cm) {
        cm.dispatch({
          changes: minimalChange(current, text),
          annotations: import_state2.Transaction.addToHistory.of(false)
        });
      } else {
        view.editor.setValue(text);
      }
    }
    await view.save();
    return true;
  }
  async remove(path, expectedSha) {
    if (!await this.adapter.exists(path)) return true;
    if (!await matches(await this.read(path), expectedSha)) return false;
    const view = openView(this.app, path);
    if (view) {
      const text = view.editor.getValue();
      const disk = decodeText(await this.read(path));
      if (disk === null || disk.replace(/\r\n/g, "\n") !== text) return false;
    }
    this.remember(path, null);
    const file = this.app.vault.getFileByPath(path);
    if (file) {
      await this.app.fileManager.trashFile(file);
    } else if (!await this.adapter.trashSystem(path)) {
      await this.adapter.trashLocal(path);
    }
    await this.removeEmptyParents(parentOf(path));
    return true;
  }
  // a copy, not a move: the file is replaced in place right after, so its tab stays open
  async backup(path) {
    if (!await this.adapter.exists(path)) return;
    const slash = path.lastIndexOf("/");
    const dot = path.lastIndexOf(".");
    const stem = dot > slash + 1 ? path.slice(0, dot) : path;
    const ext = dot > slash + 1 ? path.slice(dot) : "";
    let target = `.trash/${path}`;
    for (let n = 2; await this.adapter.exists(target); n++) target = `.trash/${stem} ${n}${ext}`;
    await this.ensureFolder(parentOf(target), true);
    await this.adapter.writeBinary(target, toArrayBuffer(await this.read(path)));
  }
  async removeEmptyParents(dir) {
    for (let current = dir; current !== ""; current = parentOf(current)) {
      const listed2 = await this.adapter.list(current);
      if (listed2.files.length > 0 || listed2.folders.length > 0) return;
      try {
        const folder = this.app.vault.getAbstractFileByPath(current);
        if (folder instanceof import_obsidian.TFolder) await this.app.vault.delete(folder, false);
        else await this.adapter.rmdir(current, false);
      } catch (e) {
        return;
      }
    }
  }
  async ensureFolder(dir, dot) {
    if (dir === "" || await this.adapter.exists(dir)) return;
    await this.ensureFolder(parentOf(dir), dot);
    if (dot) await this.adapter.mkdir(dir);
    else await this.app.vault.createFolder(dir);
  }
};
async function matches(current, expectedSha) {
  if (current === null) return expectedSha === null;
  return expectedSha !== null && await gitBlobSha(current) === expectedSha;
}
function openView(app, path) {
  for (const leaf of app.workspace.getLeavesOfType("markdown")) {
    const view = leaf.view;
    if (view instanceof import_obsidian.MarkdownView && view.file instanceof import_obsidian.TFile && view.file.path === path)
      return view;
  }
  return null;
}
function minimalChange(from, to) {
  let start = 0;
  const max = Math.min(from.length, to.length);
  while (start < max && from[start] === to[start]) start++;
  let end = 0;
  while (end < max - start && from[from.length - 1 - end] === to[to.length - 1 - end]) end++;
  return { from: start, to: from.length - end, insert: to.slice(start, to.length - end) };
}
function parentOf(path) {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "" : path.slice(0, slash);
}
function isDotPath(path) {
  return path.split("/").some((part) => part.startsWith("."));
}

// src/remote/http.ts
var RemoteError = class extends Error {
  constructor(status, message, kind) {
    super(message);
    this.status = status;
    this.kind = kind;
  }
};
var OfflineError = class extends Error {
  constructor(cause, where = "GitHub") {
    super(`Could not reach ${where}: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
};
function lowerCaseHeaders(headers) {
  const out = {};
  for (const [key, value] of Object.entries(headers)) out[key.toLowerCase()] = value;
  return out;
}
function basicAuth(username, password) {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `Basic ${btoa(binary)}`;
}

// src/lockstep.ts
function nodeModules() {
  const nodeRequire = window.require;
  if (!nodeRequire) return null;
  try {
    const cp = nodeRequire("child_process");
    const fs = nodeRequire("fs");
    const path = nodeRequire("path");
    return {
      execFile: cp.execFile,
      existsSync: fs.existsSync,
      readFileSync: fs.readFileSync,
      appendFileSync: fs.appendFileSync,
      mkdirSync: fs.mkdirSync,
      join: path.join,
      dirname: path.dirname,
      delimiter: path.delimiter
    };
  } catch (e) {
    return null;
  }
}
var GitLockstep = class _GitLockstep {
  constructor(node, cwd, url, branch, login) {
    this.node = node;
    this.cwd = cwd;
    this.url = url;
    this.branch = branch;
    this.login = login;
  }
  // another branch checked out is not a reason for null: blocker() has to pause syncing then
  static async detect(basePath, url, branch, login, stateFile) {
    const node = nodeModules();
    if (!(node == null ? void 0 : node.existsSync(node.join(basePath, ".git")))) return null;
    const lockstep = new _GitLockstep(node, basePath, url, branch, login);
    try {
      const origin = (await lockstep.git(["config", "--get", "remote.origin.url"]).catch(() => "")).trim();
      if (origin && !sameRepo(origin, url)) return null;
      await lockstep.excludeLocally(stateFile).catch(() => void 0);
      return lockstep;
    } catch (e) {
      return null;
    }
  }
  // the HEAD afterSync may move on from; null leaves HEAD alone
  async beforeSync(synced) {
    if (!await this.safe()) return null;
    const head = await this.head();
    if (head === synced) return head;
    await this.fetch();
    const fetched = (await this.git(["rev-parse", "FETCH_HEAD"])).trim();
    const ahead = Number((await this.git(["rev-list", "--count", `${fetched}..${head}`])).trim());
    if (!(ahead > 0)) return head;
    const ancestor = await this.git(["merge-base", "--is-ancestor", fetched, head]).then(
      () => true,
      () => false
    );
    const tip = ancestor ? head : await this.replay(fetched, head);
    if (tip !== fetched) await this.git(["push", this.url, `${tip}:refs/heads/${this.branch}`]);
    return head;
  }
  // merge-tree and commit-tree rather than a rebase, which would rewrite the working tree
  async replay(onto, head) {
    var _a, _b;
    const commits = (await this.git(["rev-list", "--reverse", "--topo-order", `${onto}..${head}`])).split("\n").filter(Boolean);
    let tip = onto;
    for (const commit of commits) {
      const [, parent, ...more] = (await this.git(["rev-list", "--parents", "-n", "1", commit])).trim().split(" ");
      if (parent === void 0 || more.length > 0) return onto;
      const merged = await this.git([
        "merge-tree",
        "--write-tree",
        "--no-messages",
        `--merge-base=${parent}`,
        tip,
        commit
      ]).catch(() => null);
      if (merged === null) return onto;
      const tree = (_b = (_a = merged.split("\n")[0]) == null ? void 0 : _a.trim()) != null ? _b : "";
      if (tree === (await this.git(["rev-parse", `${tip}^{tree}`])).trim()) continue;
      const [name, email, date, ...message] = (await this.git(["log", "-1", "--format=%an%n%ae%n%ad%n%B", "--date=raw", commit])).split("\n");
      tip = (await this.git(["commit-tree", tree, "-p", tip, "-m", message.join("\n").trim()], {
        GIT_AUTHOR_NAME: name,
        GIT_AUTHOR_EMAIL: email,
        GIT_AUTHOR_DATE: date
      })).trim();
    }
    return tip;
  }
  async afterSync(commit, before) {
    if (!await this.safe()) return;
    const head = await this.head();
    if (head === commit || head !== before) return;
    await this.fetch();
    const fetched = (await this.git(["rev-parse", "FETCH_HEAD"])).trim();
    if (fetched !== commit) return;
    await this.git(["reset", "--mixed", "-q", "FETCH_HEAD"]);
    await this.git(["update-ref", `refs/remotes/origin/${this.branch}`, "FETCH_HEAD"]).catch(
      () => ""
    );
  }
  async head() {
    return (await this.git(["rev-parse", "HEAD"])).trim();
  }
  fetch() {
    return this.git(["fetch", "--quiet", "--no-tags", this.url, `refs/heads/${this.branch}`]);
  }
  async blocker() {
    const branch = await this.git(["symbolic-ref", "--short", "-q", "HEAD"]).then(
      (out) => out.trim(),
      () => null
    );
    if (branch === null) return "the vault's git checkout is not on a branch.";
    if (branch !== this.branch) {
      return `the vault's git checkout is on branch "${branch}", and this vault syncs "${this.branch}".`;
    }
    const operations = [
      ["MERGE_HEAD", "a git merge"],
      ["rebase-merge", "a git rebase"],
      ["rebase-apply", "a git rebase"],
      ["CHERRY_PICK_HEAD", "a git cherry-pick"],
      ["REVERT_HEAD", "a git revert"]
    ];
    for (const [marker, what] of operations) {
      if (await this.gitPathExists(marker)) return `${what} is in progress in this vault.`;
    }
    return null;
  }
  async gitPathExists(name) {
    const relative = (await this.git(["rev-parse", "--git-path", name])).trim();
    return this.node.existsSync(
      relative.startsWith("/") ? relative : this.node.join(this.cwd, relative)
    );
  }
  async safe() {
    try {
      if (await this.blocker() !== null) return false;
      return !await this.gitPathExists("index.lock");
    } catch (e) {
      return false;
    }
  }
  async excludeLocally(stateFile) {
    const relative = (await this.git(["rev-parse", "--git-path", "info/exclude"])).trim();
    const exclude = relative.startsWith("/") ? relative : this.node.join(this.cwd, relative);
    this.node.mkdirSync(this.node.dirname(exclude), { recursive: true });
    const current = this.node.existsSync(exclude) ? this.node.readFileSync(exclude, "utf8") : "";
    const pattern = `${stateFile}*`;
    if (current.split("\n").includes(pattern)) return;
    this.node.appendFileSync(
      exclude,
      `${current === "" || current.endsWith("\n") ? "" : "\n"}${pattern}
`
    );
  }
  git(args, extraEnv = {}) {
    const login = this.login();
    const env = {
      ...process.env,
      ...extraEnv,
      // macOS apps launched from the Dock do not get the shell's PATH
      PATH: [
        process.env.PATH,
        ...process.platform === "darwin" ? ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin"] : []
      ].filter(Boolean).join(this.node.delimiter),
      GIT_TERMINAL_PROMPT: "0"
    };
    if (login) {
      env.GIT_CONFIG_COUNT = "1";
      env.GIT_CONFIG_KEY_0 = `http.${this.url}.extraheader`;
      env.GIT_CONFIG_VALUE_0 = `AUTHORIZATION: ${basicAuth(login.username, login.password)}`;
    }
    return new Promise((resolve, reject) => {
      this.node.execFile(
        "git",
        args,
        { cwd: this.cwd, env, timeout: 6e4, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) reject(new Error(stderr.trim() || error.message));
          else resolve(stdout);
        }
      );
    });
  }
};
function sameRepo(origin, url) {
  const key = (u) => u.trim().toLowerCase().replace(/^ssh:\/\/(?:[^@/]+@)?([^/:]+)(?::\d+)?\//, "$1/").replace(/^[^@/:]+@([^/:]+):/, "$1/").replace(/^https?:\/\/(?:[^@/]+@)?/, "").replace(/\/+$/, "").replace(/\.git$/, "");
  return key(origin) === key(url);
}

// src/modals.ts
var import_obsidian2 = require("obsidian");
var RepoPickerModal = class extends import_obsidian2.SuggestModal {
  // a list fetched earlier shows at once; the fresh one replaces it when it arrives
  constructor(app, cached, fresh, onPick) {
    super(app);
    this.cached = cached;
    this.fresh = fresh;
    this.onPick = onPick;
    this.repos = [];
    this.loaded = false;
    this.setPlaceholder("Repository, or owner/name");
    this.emptyStateText = "Loading repositories...";
  }
  onOpen() {
    void super.onOpen();
    if (this.cached) this.show(this.cached);
    void this.fresh.then(
      (repos) => this.show(repos),
      (error) => {
        if (this.loaded) return;
        this.emptyStateText = error instanceof Error ? error.message : String(error);
        this.inputEl.dispatchEvent(new Event("input"));
      }
    );
  }
  show(repos) {
    this.repos = repos.filter((repo) => repo.canPush);
    this.loaded = true;
    this.emptyStateText = "No repository matches. Type owner/name to use one anyway.";
    this.inputEl.dispatchEvent(new Event("input"));
  }
  getSuggestions(query) {
    const q = query.trim().toLowerCase();
    const matches2 = this.repos.filter((repo) => repo.fullName.toLowerCase().includes(q));
    const typed = /^[\w.-]+(\/[\w.-]+)+$/.test(query.trim()) ? query.trim() : null;
    if (typed && !matches2.some((repo) => repo.fullName.toLowerCase() === typed.toLowerCase())) {
      return [...matches2, typed];
    }
    return this.loaded || matches2.length > 0 ? matches2 : [];
  }
  renderSuggestion(item, el) {
    if (typeof item === "string") {
      el.createDiv({ text: item });
      el.createEl("small", { text: "Use this repository", cls: "easy-git-sync-muted" });
      return;
    }
    el.createDiv({ text: item.fullName });
    const details = [item.private ? "private" : "public", item.empty ? "empty" : null].filter(
      Boolean
    );
    el.createEl("small", { text: details.join(", "), cls: "easy-git-sync-muted" });
  }
  onChooseSuggestion(item) {
    void this.onPick(typeof item === "string" ? item : item.fullName);
  }
};
function pickBranch(app, repo, branches, defaultBranch) {
  return new Promise((resolve) => {
    const modal = new class extends import_obsidian2.SuggestModal {
      getSuggestions(query) {
        const q = query.trim().toLowerCase();
        return branches.filter((branch) => branch.toLowerCase().includes(q));
      }
      renderSuggestion(branch, el) {
        el.createDiv({ text: branch });
        if (branch === defaultBranch) {
          el.createEl("small", { text: "Default branch", cls: "easy-git-sync-muted" });
        }
      }
      onChooseSuggestion(branch) {
        resolve(branch);
      }
      onClose() {
        window.setTimeout(() => resolve(null), 0);
      }
    }(app);
    modal.setPlaceholder(`Branch of ${repo} to sync with`);
    modal.open();
  });
}
function confirm(app, title, body, action, destructive = false) {
  return new Promise((resolve) => {
    const modal = new class extends import_obsidian2.ConfirmationModal {
      onClose() {
        super.onClose();
        resolve(false);
      }
    }(app);
    modal.setTitle(title);
    for (const paragraph of body) modal.contentEl.createEl("p", { text: paragraph });
    modal.addButton((button) => {
      button.setButtonText(action).onClick(() => resolve(true));
      if (destructive) button.setDestructive();
      else button.setCta();
    });
    modal.addCancelButton();
    modal.open();
  });
}
function chooseFirstSync(app, s) {
  const files = (n) => `${n} ${n === 1 ? "file" : "files"}`;
  return new Promise((resolve) => {
    const modal = new class extends import_obsidian2.Modal {
      constructor() {
        super(...arguments);
        this.answered = false;
      }
      onOpen() {
        this.setTitle(`Start syncing with ${s.repo}`);
        this.modalEl.addClass("easy-git-sync-modal");
        this.contentEl.createEl("p", {
          text: `Both have files. ${files(s.same)} ${s.same === 1 ? "is" : "are"} the same on both sides, ${files(s.upload)} only in this vault, ${files(s.download)} only on ${s.remote}, and ${files(s.merge)} ${s.merge === 1 ? "differs" : "differ"}.`
        });
        if (s.leaving) this.contentEl.createEl("p", { text: s.leaving });
        const choice = (name, desc, action, value) => {
          const setting = new import_obsidian2.Setting(this.contentEl).setName(name).setDesc(desc);
          setting.settingEl.addClass("easy-git-sync-choice");
          setting.addButton((button) => {
            button.setButtonText(action).onClick(() => {
              this.answered = true;
              resolve(value);
              this.close();
            });
            if (value === "merge") button.setCta();
            else button.setDestructive();
          });
        };
        const changes = (replaced, deleted, where) => [
          replaced > 0 && `${files(replaced)} replaced`,
          deleted > 0 && `${files(deleted)} deleted ${where}`
        ].filter(Boolean).join(" and ");
        const differ = s.merge > 0 ? ` The ${files(s.merge)} that differ otherwise merge, and where both changed the same place ${s.newest ? "the newer version is kept" : "both versions are kept, marked"}.` : "";
        choice(
          "Merge",
          `Keep everything from both: files only on one side are copied to the other. A file here that is an older version from ${s.remote}'s history just updates.${differ}`,
          "Merge",
          "merge"
        );
        const here = changes(s.merge, s.upload, "here");
        choice(
          `Use ${s.remote}'s version`,
          here ? `Make this vault a copy of ${s.remote}'s: ${here}. ${s.merge > 0 && s.upload > 0 ? "Both go" : s.merge + s.upload === 1 ? "It goes" : "They go"} to the trash.` : `Make this vault a copy of ${s.remote}'s.`,
          `Use ${s.remote}'s`,
          "use-remote"
        );
        const there = changes(s.merge, s.download, "there");
        choice(
          "Use this vault",
          `Make ${s.remote}'s a copy of this vault${there ? `: ${there},` : ","} in one commit. ${capitalize(s.remote)}'s history keeps the old versions.`,
          "Use this vault",
          "use-local"
        );
      }
      onClose() {
        if (!this.answered) resolve(null);
        this.contentEl.empty();
      }
    }(app);
    modal.open();
  });
}
var ConflictsModal = class extends import_obsidian2.SuggestModal {
  constructor(app, paths, onPick) {
    super(app);
    this.paths = paths;
    this.onPick = onPick;
    this.setPlaceholder("Notes with sync conflicts");
    this.emptyStateText = "No sync conflicts.";
  }
  getSuggestions(query) {
    const q = query.toLowerCase();
    return this.paths.filter((path) => path.toLowerCase().includes(q));
  }
  renderSuggestion(path, el) {
    el.setText(path);
  }
  onChooseSuggestion(path) {
    this.onPick(path);
  }
};

// src/reading.ts
var import_obsidian3 = require("obsidian");
var PREFIX2 = "easy-git-sync";
function conflictPostProcessor(app) {
  let last = null;
  return (el, ctx) => {
    var _a, _b, _c, _d;
    const info = ctx.getSectionInfo(el);
    if (!info) return;
    if ((last == null ? void 0 : last.text) !== info.text) {
      const lines2 = hasConflictMarker(info.text) ? info.text.split("\n") : [];
      last = { text: info.text, lines: lines2, parts: conflictParts(lines2) };
    }
    const { lines, parts } = last;
    if (parts.size === 0) return;
    const own = [];
    for (let n = info.lineStart; n <= info.lineEnd; n++) {
      if (((_a = lines[n]) != null ? _a : "").trim() !== "") own.push(n);
    }
    const mine = own.map((n) => parts.get(n));
    if (mine.every((entry) => entry === void 0)) return;
    const isMarker = (n) => {
      var _a2;
      const part = (_a2 = parts.get(n)) == null ? void 0 : _a2.part;
      return part !== void 0 && (part.endsWith("header") || part === "separator");
    };
    const opening = own.find((n) => {
      var _a2;
      return ((_a2 = parts.get(n)) == null ? void 0 : _a2.part) === "current-header";
    });
    const openingConflict = opening === void 0 ? void 0 : (_b = parts.get(opening)) == null ? void 0 : _b.conflict;
    if (own.every(isMarker)) {
      el.empty();
      const first = (_d = parts.get((_c = own[0]) != null ? _c : -1)) == null ? void 0 : _d.part;
      el.addClass(`${PREFIX2}-${first}`);
      const p = el.createEl("p", { cls: `${PREFIX2}-reading-marker` });
      own.forEach((n, i) => {
        var _a2;
        if (i > 0) p.createEl("br");
        p.appendText((_a2 = lines[n]) != null ? _a2 : "");
        const entry = parts.get(n);
        if ((entry == null ? void 0 : entry.part) === "current-header") {
          appendButtons(p, entry.conflict, resolver(app, ctx, el, entry.conflict));
        }
      });
      return;
    }
    const content = own.map((n) => {
      var _a2;
      return (_a2 = parts.get(n)) == null ? void 0 : _a2.part;
    }).find((part) => part && !part.endsWith("header"));
    if (content && content !== "separator") el.addClass(`${PREFIX2}-${content}`);
    if (openingConflict)
      appendButtons(el, openingConflict, resolver(app, ctx, el, openingConflict));
  };
}
function resolver(app, ctx, el, conflict) {
  return (choice) => {
    var _a, _b;
    const file = app.vault.getAbstractFileByPath(ctx.sourcePath);
    if (!(file instanceof import_obsidian3.TFile)) return;
    const at = (_b = (_a = ctx.getSectionInfo(el)) == null ? void 0 : _a.lineStart) != null ? _b : conflict.start;
    void app.vault.process(file, (text) => {
      var _a2;
      const nearest = findConflicts(text.split("\n")).sort(
        (a, b) => Math.abs(a.start - at) - Math.abs(b.start - at)
      )[0];
      return nearest ? (_a2 = resolveConflict(text, nearest.start, choice)) != null ? _a2 : text : text;
    });
  };
}

// src/lib/inflate.ts
var LENGTH_BASE = [
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258
];
var LENGTH_EXTRA = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0
];
var DISTANCE_BASE = [
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577
];
var DISTANCE_EXTRA = [
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13
];
var CODE_LENGTH_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
function huffman(lengths) {
  var _a, _b, _c, _d, _e;
  let bits = 1;
  for (let i = 0; i < lengths.length; i++) bits = Math.max(bits, (_a = lengths[i]) != null ? _a : 0);
  const counts = new Uint16Array(16);
  for (let i = 0; i < lengths.length; i++) counts[(_b = lengths[i]) != null ? _b : 0]++;
  counts[0] = 0;
  const next = new Uint16Array(16);
  let code = 0;
  for (let len = 1; len <= 15; len++) {
    code = code + ((_c = counts[len - 1]) != null ? _c : 0) << 1;
    next[len] = code;
  }
  const table = new Uint16Array(1 << bits);
  for (let symbol = 0; symbol < lengths.length; symbol++) {
    const len = (_d = lengths[symbol]) != null ? _d : 0;
    if (len === 0) continue;
    const assigned = (_e = next[len]) != null ? _e : 0;
    next[len] = assigned + 1;
    let reversed = 0;
    for (let i = 0; i < len; i++) reversed |= (assigned >> i & 1) << len - 1 - i;
    for (let i = reversed; i < table.length; i += 1 << len) table[i] = symbol << 4 | len;
  }
  return { table, bits };
}
var fixedLiterals = null;
var fixedDistances = null;
function fixedTables() {
  if (!fixedLiterals || !fixedDistances) {
    const lengths = new Uint8Array(288);
    lengths.fill(8, 0, 144);
    lengths.fill(9, 144, 256);
    lengths.fill(7, 256, 280);
    lengths.fill(8, 280, 288);
    fixedLiterals = huffman(lengths);
    fixedDistances = huffman(new Uint8Array(30).fill(5));
  }
  return [fixedLiterals, fixedDistances];
}
var InflateError = class extends Error {
};
function inflate(input, start = 0, size) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  let pos = start;
  let bitBuffer = 0;
  let bitCount = 0;
  const cmf = (_a = input[pos++]) != null ? _a : 0;
  const flg = (_b = input[pos++]) != null ? _b : 0;
  if ((cmf & 15) !== 8 || (cmf << 8 | flg) % 31 !== 0 || flg & 32)
    throw new InflateError("not a zlib stream");
  const need = (n) => {
    var _a2;
    while (bitCount < n) {
      if (pos >= input.length + 4) throw new InflateError("truncated stream");
      bitBuffer |= ((_a2 = input[pos++]) != null ? _a2 : 0) << bitCount;
      bitCount += 8;
    }
  };
  const take = (n) => {
    need(n);
    const value = bitBuffer & (1 << n) - 1;
    bitBuffer >>>= n;
    bitCount -= n;
    return value;
  };
  const decode = (h) => {
    var _a2;
    need(h.bits);
    const entry = (_a2 = h.table[bitBuffer & (1 << h.bits) - 1]) != null ? _a2 : 0;
    const len = entry & 15;
    if (len === 0) throw new InflateError("invalid code");
    bitBuffer >>>= len;
    bitCount -= len;
    return entry >> 4;
  };
  let out = new Uint8Array(size != null ? size : Math.max(1024, (input.length - start) * 4));
  let length = 0;
  const room = (n) => {
    if (length + n <= out.length) return;
    const grown = new Uint8Array(Math.max(out.length * 2, length + n));
    grown.set(out.subarray(0, length));
    out = grown;
  };
  let last = 0;
  while (!last) {
    last = take(1);
    const type = take(2);
    if (type === 0) {
      pos -= bitCount >> 3;
      bitBuffer = 0;
      bitCount = 0;
      const len = ((_c = input[pos]) != null ? _c : 0) | ((_d = input[pos + 1]) != null ? _d : 0) << 8;
      const nlen = ((_e = input[pos + 2]) != null ? _e : 0) | ((_f = input[pos + 3]) != null ? _f : 0) << 8;
      if ((len ^ 65535) !== nlen) throw new InflateError("invalid stored block");
      pos += 4;
      if (pos + len > input.length) throw new InflateError("truncated stream");
      room(len);
      out.set(input.subarray(pos, pos + len), length);
      length += len;
      pos += len;
      continue;
    }
    let literals;
    let distances;
    if (type === 1) {
      [literals, distances] = fixedTables();
    } else if (type === 2) {
      const hlit = take(5) + 257;
      const hdist = take(5) + 1;
      const hclen = take(4) + 4;
      const codeLengths = new Uint8Array(19);
      for (let i = 0; i < hclen; i++) codeLengths[(_g = CODE_LENGTH_ORDER[i]) != null ? _g : 0] = take(3);
      const lengthCode = huffman(codeLengths);
      const lengths = new Uint8Array(hlit + hdist);
      for (let i = 0; i < lengths.length; ) {
        const symbol = decode(lengthCode);
        if (symbol < 16) {
          lengths[i++] = symbol;
          continue;
        }
        let repeat;
        let value = 0;
        if (symbol === 16) {
          if (i === 0) throw new InflateError("repeat with nothing before it");
          value = (_h = lengths[i - 1]) != null ? _h : 0;
          repeat = 3 + take(2);
        } else if (symbol === 17) {
          repeat = 3 + take(3);
        } else {
          repeat = 11 + take(7);
        }
        if (i + repeat > lengths.length) throw new InflateError("too many code lengths");
        lengths.fill(value, i, i + repeat);
        i += repeat;
      }
      literals = huffman(lengths.subarray(0, hlit));
      distances = huffman(lengths.subarray(hlit));
    } else {
      throw new InflateError("invalid block type");
    }
    for (; ; ) {
      const symbol = decode(literals);
      if (symbol < 256) {
        room(1);
        out[length++] = symbol;
        continue;
      }
      if (symbol === 256) break;
      const index = symbol - 257;
      if (index >= 29) throw new InflateError("invalid length");
      const len = ((_i = LENGTH_BASE[index]) != null ? _i : 0) + take((_j = LENGTH_EXTRA[index]) != null ? _j : 0);
      const code = decode(distances);
      if (code >= 30) throw new InflateError("invalid distance");
      const distance = ((_k = DISTANCE_BASE[code]) != null ? _k : 0) + take((_l = DISTANCE_EXTRA[code]) != null ? _l : 0);
      if (distance > length) throw new InflateError("distance too far back");
      room(len);
      for (let i = 0; i < len; i++) {
        out[length] = (_m = out[length - distance]) != null ? _m : 0;
        length++;
      }
    }
  }
  pos -= bitCount >> 3;
  const end = pos + 4;
  if (end > input.length) throw new InflateError("truncated stream");
  if (size !== void 0 && length !== size) throw new InflateError("unexpected size");
  return { data: length === out.length ? out : out.subarray(0, length), end };
}
async function deflate(data) {
  const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// src/remote/git/objects.ts
var ZERO_SHA = "0".repeat(40);
var TREE_MODE = "40000";
var decoder = new TextDecoder();
async function sha1(bytes) {
  return toHex2(new Uint8Array(await crypto.subtle.digest("SHA-1", toArrayBuffer(bytes))));
}
async function hashObject(object) {
  return sha1(concatBytes([encodeUtf8(`${object.type} ${object.data.length}\0`), object.data]));
}
function toHex2(bytes) {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}
function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function parseTree(data) {
  const entries = [];
  let pos = 0;
  while (pos < data.length) {
    const space = data.indexOf(32, pos);
    const nul = data.indexOf(0, space);
    if (space < 0 || nul < 0 || nul + 21 > data.length) throw new Error("corrupt tree object");
    entries.push({
      mode: decoder.decode(data.subarray(pos, space)),
      name: decoder.decode(data.subarray(space + 1, nul)),
      sha: toHex2(data.subarray(nul + 1, nul + 21))
    });
    pos = nul + 21;
  }
  return entries;
}
function sortKey(entry) {
  return encodeUtf8(entry.mode === TREE_MODE ? `${entry.name}/` : entry.name);
}
function compareBytes(a, b) {
  var _a, _b;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const d = ((_a = a[i]) != null ? _a : 0) - ((_b = b[i]) != null ? _b : 0);
    if (d !== 0) return d;
  }
  return a.length - b.length;
}
function writeTree(entries) {
  const sorted = entries.map((entry) => ({ entry, key: sortKey(entry) })).sort((a, b) => compareBytes(a.key, b.key));
  return concatBytes(
    sorted.flatMap(({ entry }) => [
      encodeUtf8(`${entry.mode} ${entry.name}\0`),
      fromHex(entry.sha)
    ])
  );
}
function signature(name, email, date) {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const offset = `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}${String(abs % 60).padStart(2, "0")}`;
  const clean = (s) => s.replace(/[<>\n]/g, "").trim();
  return {
    name: clean(name),
    email: clean(email),
    time: Math.floor(date.getTime() / 1e3),
    offset
  };
}
function signatureDate(sig) {
  return new Date(sig.time * 1e3);
}
function parseSignature(text) {
  var _a, _b, _c;
  const match = /^(.*) <(.*)> (\d+) ([+-]\d{4})$/.exec(text);
  if (!match) return { name: text, email: "", time: 0, offset: "+0000" };
  return {
    name: (_a = match[1]) != null ? _a : "",
    email: (_b = match[2]) != null ? _b : "",
    time: Number(match[3]),
    offset: (_c = match[4]) != null ? _c : "+0000"
  };
}
function formatSignature(sig) {
  return `${sig.name} <${sig.email}> ${sig.time} ${sig.offset}`;
}
function parseCommit(data) {
  const text = decoder.decode(data);
  const split = text.indexOf("\n\n");
  const head = split < 0 ? text : text.slice(0, split);
  const message = split < 0 ? "" : text.slice(split + 2);
  const commit = {
    tree: "",
    parents: [],
    author: parseSignature(""),
    committer: parseSignature(""),
    message
  };
  for (const line of head.split("\n")) {
    if (line.startsWith(" ")) continue;
    const space = line.indexOf(" ");
    const key = line.slice(0, space);
    const value = line.slice(space + 1);
    if (key === "tree") commit.tree = value;
    else if (key === "parent") commit.parents.push(value);
    else if (key === "author") commit.author = parseSignature(value);
    else if (key === "committer") commit.committer = parseSignature(value);
  }
  return commit;
}
function writeCommit(commit) {
  const lines = [
    `tree ${commit.tree}`,
    ...commit.parents.map((parent) => `parent ${parent}`),
    `author ${formatSignature(commit.author)}`,
    `committer ${formatSignature(commit.committer)}`
  ];
  const message = commit.message.endsWith("\n") ? commit.message : `${commit.message}
`;
  return encodeUtf8(`${lines.join("\n")}

${message}`);
}

// src/remote/git/pack.ts
var TYPES = { 1: "commit", 2: "tree", 3: "blob", 4: "tag" };
var NUMBERS = { commit: 1, tree: 2, blob: 3, tag: 4 };
var OFS_DELTA = 6;
var REF_DELTA = 7;
var PackError = class extends Error {
};
async function readPack(pack, known = () => void 0) {
  var _a, _b, _c, _d, _e, _f, _g;
  if (pack.length < 12 || new TextDecoder().decode(pack.subarray(0, 4)) !== "PACK")
    throw new PackError("not a pack");
  const view = new DataView(pack.buffer, pack.byteOffset, pack.byteLength);
  const version = view.getUint32(4);
  if (version !== 2 && version !== 3) throw new PackError(`pack version ${version}`);
  const count = view.getUint32(8);
  const entries = [];
  let pos = 12;
  for (let i = 0; i < count; i++) {
    const offset = pos;
    let byte = (_a = pack[pos++]) != null ? _a : 0;
    const type = byte >> 4 & 7;
    let size = byte & 15;
    let shift = 4;
    while (byte & 128) {
      byte = (_b = pack[pos++]) != null ? _b : 0;
      size += (byte & 127) * 2 ** shift;
      shift += 7;
    }
    const entry = { offset, type, data: new Uint8Array(0) };
    if (type === OFS_DELTA) {
      byte = (_c = pack[pos++]) != null ? _c : 0;
      let distance = byte & 127;
      while (byte & 128) {
        byte = (_d = pack[pos++]) != null ? _d : 0;
        distance = (distance + 1) * 128 + (byte & 127);
      }
      entry.baseOffset = offset - distance;
    } else if (type === REF_DELTA) {
      entry.baseSha = toHex2(pack.subarray(pos, pos + 20));
      pos += 20;
    } else if (!TYPES[type]) {
      throw new PackError(`unknown object type ${type}`);
    }
    const inflated = inflate(pack, pos, size);
    entry.data = inflated.data;
    pos = inflated.end;
    entries.push(entry);
  }
  const objects = /* @__PURE__ */ new Map();
  const byOffset = /* @__PURE__ */ new Map();
  let pending = [];
  for (const entry of entries) {
    const type = TYPES[entry.type];
    if (!type) {
      pending.push(entry);
      continue;
    }
    const object = { type, data: entry.data };
    objects.set(await hashObject(object), object);
    byOffset.set(entry.offset, object);
  }
  while (pending.length > 0) {
    const waiting = [];
    for (const entry of pending) {
      const base = entry.baseOffset !== void 0 ? byOffset.get(entry.baseOffset) : (_g = objects.get((_e = entry.baseSha) != null ? _e : "")) != null ? _g : known((_f = entry.baseSha) != null ? _f : "");
      if (!base) {
        waiting.push(entry);
        continue;
      }
      const object = { type: base.type, data: applyDelta(base.data, entry.data) };
      objects.set(await hashObject(object), object);
      byOffset.set(entry.offset, object);
    }
    if (waiting.length === pending.length) throw new PackError("a delta's base is missing");
    pending = waiting;
  }
  return objects;
}
function applyDelta(base, delta) {
  var _a, _b, _c;
  let pos = 0;
  const varint = () => {
    var _a2;
    let value = 0;
    let shift = 0;
    let byte;
    do {
      byte = (_a2 = delta[pos++]) != null ? _a2 : 0;
      value += (byte & 127) * 2 ** shift;
      shift += 7;
    } while (byte & 128);
    return value;
  };
  if (varint() !== base.length) throw new PackError("delta does not fit its base");
  const out = new Uint8Array(varint());
  let length = 0;
  while (pos < delta.length) {
    const op = (_a = delta[pos++]) != null ? _a : 0;
    if (op & 128) {
      let offset = 0;
      let size = 0;
      for (let i = 0; i < 4; i++) if (op & 1 << i) offset += ((_b = delta[pos++]) != null ? _b : 0) * 2 ** (8 * i);
      for (let i = 0; i < 3; i++) if (op & 16 << i) size += ((_c = delta[pos++]) != null ? _c : 0) * 2 ** (8 * i);
      if (size === 0) size = 65536;
      if (offset + size > base.length || length + size > out.length)
        throw new PackError("delta copies out of range");
      out.set(base.subarray(offset, offset + size), length);
      length += size;
    } else if (op > 0) {
      if (length + op > out.length || pos + op > delta.length)
        throw new PackError("delta inserts out of range");
      out.set(delta.subarray(pos, pos + op), length);
      length += op;
      pos += op;
    } else {
      throw new PackError("delta opcode 0");
    }
  }
  if (length !== out.length) throw new PackError("delta is short");
  return out;
}
async function writePack(objects) {
  const header = new Uint8Array(12);
  header.set(encodeUtf8("PACK"));
  const view = new DataView(header.buffer);
  view.setUint32(4, 2);
  view.setUint32(8, objects.length);
  const parts = [header];
  for (const object of objects) {
    let size = object.data.length;
    const bytes = [];
    let byte = NUMBERS[object.type] << 4 | size & 15;
    size = Math.floor(size / 16);
    while (size > 0) {
      bytes.push(byte | 128);
      byte = size & 127;
      size = Math.floor(size / 128);
    }
    bytes.push(byte);
    parts.push(new Uint8Array(bytes), await deflate(object.data));
  }
  const body = concatBytes(parts);
  return concatBytes([body, fromHex(await sha1(body))]);
}

// src/remote/git/pkt.ts
var FLUSH = encodeUtf8("0000");
var DELIM = encodeUtf8("0001");
var decoder2 = new TextDecoder();
function pkt(line) {
  const data = typeof line === "string" ? encodeUtf8(line) : line;
  return concatBytes([encodeUtf8((data.length + 4).toString(16).padStart(4, "0")), data]);
}
function pktLines(lines) {
  return concatBytes(lines.map((line) => pkt(`${line}
`)));
}
var PktReader = class {
  constructor(bytes, pos = 0) {
    this.bytes = bytes;
    this.pos = pos;
  }
  done() {
    return this.pos >= this.bytes.length;
  }
  next() {
    if (this.pos + 4 > this.bytes.length) return null;
    const length = Number.parseInt(decoder2.decode(this.bytes.subarray(this.pos, this.pos + 4)), 16);
    if (Number.isNaN(length)) throw new Error("malformed response from the git server");
    this.pos += 4;
    if (length === 0) return { kind: "flush" };
    if (length === 1) return { kind: "delim" };
    if (length === 2) return { kind: "end-response" };
    if (length < 4 || this.pos + length - 4 > this.bytes.length)
      throw new Error("truncated response from the git server");
    const data = this.bytes.subarray(this.pos, this.pos + length - 4);
    this.pos += length - 4;
    return { kind: "data", data };
  }
  // a text line without its newline, or null at a flush or delimiter
  line() {
    const packet = this.next();
    if ((packet == null ? void 0 : packet.kind) !== "data") return null;
    const text = decoder2.decode(packet.data);
    return text.endsWith("\n") ? text.slice(0, -1) : text;
  }
  lines() {
    const out = [];
    for (let line = this.line(); line !== null; line = this.line()) out.push(line);
    return out;
  }
  // band 1 is the payload, 2 progress, 3 a fatal error; read up to the flush
  sideBand() {
    const parts = [];
    for (; ; ) {
      const packet = this.next();
      if ((packet == null ? void 0 : packet.kind) !== "data") break;
      const band = packet.data[0];
      const payload = packet.data.subarray(1);
      if (band === 1) parts.push(payload);
      else if (band === 3)
        throw new Error(`the git server reported: ${decoder2.decode(payload).trim()}`);
    }
    return concatBytes(parts);
  }
};

// src/remote/git/smart.ts
var AGENT = "agent=easy-git-sync";
var decoder3 = new TextDecoder();
var GitHttp = class {
  constructor(http, url, auth, name, sleep) {
    this.http = http;
    this.url = url;
    this.auth = auth;
    this.name = name;
    this.sleep = sleep;
    this.protocol = null;
    this.caps = /* @__PURE__ */ new Set();
  }
  // a server needs filter support to send folders without their files
  get blobless() {
    return this.caps.has("filter");
  }
  // protocol v2 takes any object as a want; v0 only when the server allows it
  get anyWant() {
    return this.protocol === 2 || this.caps.has("allow-reachable-sha1-in-want") || this.caps.has("allow-any-sha1-in-want");
  }
  get shallow() {
    return this.caps.has("shallow");
  }
  async request(method, path, body, service, v2 = true) {
    const auth = this.auth();
    const headers = {
      Accept: service ? `application/x-${service}-result` : "*/*",
      "Cache-Control": "no-cache",
      "User-Agent": "git/2.47.0 (easy-git-sync)",
      ...v2 ? { "Git-Protocol": "version=2" } : {},
      ...auth ? { Authorization: basicAuth(auth.username, auth.password) } : {},
      ...service && body ? { "Content-Type": `application/x-${service}-request` } : {}
    };
    for (let attempt = 0; ; attempt++) {
      let response;
      try {
        response = await this.http({
          url: `${this.url}/${path}`,
          method,
          headers,
          ...body ? { body: toArrayBuffer(body) } : {}
        });
      } catch (error) {
        throw new OfflineError(error, this.name);
      }
      response = { ...response, headers: lowerCaseHeaders(response.headers) };
      const { status } = response;
      if (status < 400) return response;
      const wait = retryDelay(response, attempt);
      if (wait !== null && attempt < 3) {
        await this.sleep(wait);
        continue;
      }
      throw this.error(response);
    }
  }
  error(response) {
    var _a, _b;
    const { status } = response;
    const said = (_b = (_a = decoder3.decode(response.body).trim().split("\n")[0]) == null ? void 0 : _a.slice(0, 200)) != null ? _b : "";
    if (status === 401)
      return new RemoteError(status, `${capitalize(this.name)} did not accept the login.`, "auth");
    if (status === 403)
      return new RemoteError(
        status,
        said || `${capitalize(this.name)} refused access to the repository.`,
        "forbidden"
      );
    if (status === 404)
      return new RemoteError(status, `The repository was not found on ${this.name}.`, "not-found");
    if (status === 429)
      return new RemoteError(
        status,
        `${capitalize(this.name)}'s rate limit was reached.`,
        "rate-limit"
      );
    return new RemoteError(status, said || `${capitalize(this.name)} answered ${status}.`, "other");
  }
  async advertise(service) {
    var _a, _b, _c;
    const response = await this.request(
      "GET",
      `info/refs?service=${service}`,
      void 0,
      void 0,
      service === "git-upload-pack"
    );
    const type = (_a = response.headers["content-type"]) != null ? _a : "";
    if (!type.includes(`application/x-${service}-advertisement`))
      throw new RemoteError(
        response.status,
        `${this.url} is not a git repository served over HTTPS.`,
        "not-found"
      );
    const reader = new PktReader(new Uint8Array(response.body));
    let first = reader.line();
    if (first == null ? void 0 : first.startsWith("# service=")) {
      reader.next();
      first = reader.line();
    }
    if (first === "version 2") {
      const caps2 = /* @__PURE__ */ new Set();
      for (const line of reader.lines()) {
        const [key, value] = line.split("=", 2);
        if (key === "fetch") for (const feature of (_b = value == null ? void 0 : value.split(" ")) != null ? _b : []) caps2.add(feature);
        else caps2.add(key);
      }
      return { version: 2, caps: caps2, refs: /* @__PURE__ */ new Map(), symrefHead: null };
    }
    const refs = /* @__PURE__ */ new Map();
    const caps = /* @__PURE__ */ new Set();
    let symrefHead = null;
    for (let line = first; line !== null; line = reader.line()) {
      const nul = line.indexOf("\0");
      if (nul >= 0) {
        for (const cap of line.slice(nul + 1).split(" ")) {
          if (cap.startsWith("symref=HEAD:")) symrefHead = cap.slice("symref=HEAD:".length);
          caps.add((_c = cap.split("=")[0]) != null ? _c : cap);
        }
        line = line.slice(0, nul);
      }
      const [sha, name] = line.split(" ");
      if (sha && name && !name.endsWith("^{}") && name !== "capabilities^{}") refs.set(name, sha);
    }
    return { version: 0, caps, refs, symrefHead };
  }
  async discover() {
    const ad = await this.advertise("git-upload-pack");
    this.protocol = ad.version;
    this.caps = ad.caps;
    return ad;
  }
  async refs() {
    let ad = null;
    if (this.protocol !== 2) ad = await this.discover();
    if (this.protocol === 0 && ad) return toRefs(ad.refs, ad.symrefHead);
    const body = concatBytes([
      pkt("command=ls-refs\n"),
      pkt(`${AGENT}
`),
      DELIM,
      pktLines(["symrefs", "ref-prefix HEAD", "ref-prefix refs/heads/"]),
      FLUSH
    ]);
    const response = await this.request("POST", "git-upload-pack", body, "git-upload-pack");
    const refs = /* @__PURE__ */ new Map();
    let symrefHead = null;
    for (const line of new PktReader(new Uint8Array(response.body)).lines()) {
      const [sha, name, ...attributes] = line.split(" ");
      if (!sha || !name) continue;
      refs.set(name, sha);
      for (const attribute of attributes) {
        if (name === "HEAD" && attribute.startsWith("symref-target:"))
          symrefHead = attribute.slice("symref-target:".length);
      }
    }
    return toRefs(refs, symrefHead);
  }
  async fetch(request, known) {
    var _a;
    if (this.protocol === null) await this.discover();
    const depth = request.depth !== void 0 && this.shallow ? request.depth : void 0;
    const blobless = request.blobless === true && this.blobless;
    const haves = (_a = request.haves) != null ? _a : [];
    let pack;
    if (this.protocol === 2) {
      const args = [
        "no-progress",
        "ofs-delta",
        ...request.wants.map((sha) => `want ${sha}`),
        ...depth !== void 0 ? [`deepen ${depth}`] : [],
        ...blobless ? ["filter blob:none"] : [],
        ...haves.map((sha) => `have ${sha}`),
        "done"
      ];
      const body = concatBytes([
        pkt("command=fetch\n"),
        pkt(`${AGENT}
`),
        DELIM,
        pktLines(args),
        FLUSH
      ]);
      const response = await this.request("POST", "git-upload-pack", body, "git-upload-pack");
      const reader = new PktReader(new Uint8Array(response.body));
      pack = new Uint8Array(0);
      for (let section = reader.line(); section !== null; section = reader.line()) {
        if (section === "packfile") {
          pack = reader.sideBand();
          break;
        }
        reader.lines();
      }
    } else {
      const caps = ["side-band-64k", "ofs-delta", "no-progress", "shallow", "filter"].filter((cap) => this.caps.has(cap)).filter(
        (cap) => cap === "shallow" ? depth !== void 0 : cap === "filter" ? blobless : true
      );
      const [first, ...rest] = request.wants;
      const lines = [
        `want ${first} ${[...caps, AGENT].join(" ")}`,
        ...rest.map((sha) => `want ${sha}`),
        ...depth !== void 0 ? [`deepen ${depth}`] : [],
        ...blobless ? ["filter blob:none"] : []
      ];
      const body = concatBytes([
        pktLines(lines),
        FLUSH,
        pktLines([...haves.map((sha) => `have ${sha}`), "done"])
      ]);
      const response = await this.request(
        "POST",
        "git-upload-pack",
        body,
        "git-upload-pack",
        false
      );
      const reader = new PktReader(new Uint8Array(response.body));
      if (depth !== void 0) reader.lines();
      for (let line = reader.line(); line !== null; line = reader.line()) {
        if (line === "NAK" || line.startsWith("ACK ") && !/ (continue|common|ready)$/.test(line))
          break;
      }
      pack = this.caps.has("side-band-64k") ? reader.sideBand() : new Uint8Array(response.body).subarray(reader.pos);
    }
    if (pack.length === 0) return /* @__PURE__ */ new Map();
    return readPack(pack, known);
  }
  // write access shows in the receive-pack advertisement: a read-only login is refused there
  async canPush() {
    try {
      await this.advertise("git-receive-pack");
      return true;
    } catch (error) {
      if (error instanceof RemoteError && (error.kind === "forbidden" || error.kind === "auth"))
        return false;
      throw error;
    }
  }
  async push(ref, from, to, pack) {
    const ad = await this.advertise("git-receive-pack");
    const caps = ["report-status", "side-band-64k"].filter((cap) => ad.caps.has(cap));
    const body = concatBytes([
      pkt(`${from} ${to} ${ref}\0${[...caps, AGENT].join(" ")}`),
      FLUSH,
      pack
    ]);
    const response = await this.request(
      "POST",
      "git-receive-pack",
      body,
      "git-receive-pack",
      false
    );
    let reader = new PktReader(new Uint8Array(response.body));
    if (ad.caps.has("side-band-64k")) reader = new PktReader(reader.sideBand());
    if (!ad.caps.has("report-status")) return { ok: true };
    let reason = null;
    let updated = false;
    for (const line of reader.lines()) {
      if (line.startsWith("unpack ") && line !== "unpack ok") reason = line.slice(7);
      if (line.startsWith(`ng ${ref} `)) reason = line.slice(ref.length + 4);
      if (line === `ok ${ref}`) updated = true;
    }
    if (reason === null && !updated) reason = "it did not confirm the update";
    return reason === null ? { ok: true } : { ok: false, reason };
  }
};
function toRefs(all, symrefHead) {
  const heads = /* @__PURE__ */ new Map();
  for (const [name, sha] of all) {
    if (name.startsWith("refs/heads/")) heads.set(name.slice("refs/heads/".length), sha);
  }
  const head = (symrefHead == null ? void 0 : symrefHead.startsWith("refs/heads/")) ? symrefHead.slice("refs/heads/".length) : null;
  return { heads, head };
}
function retryDelay(response, attempt) {
  const { status, headers } = response;
  if (status >= 500) return 1e3 * 2 ** attempt;
  if (status !== 429) return null;
  const retryAfter = Number(headers["retry-after"]);
  if (Number.isFinite(retryAfter) && retryAfter > 0 && retryAfter <= 60) return retryAfter * 1e3;
  return null;
}

// src/remote/git-remote.ts
var HISTORY_DEPTH = 100;
var SINCE_DEPTH = 50;
var WANT_BATCH = 100;
var CONCURRENCY = 6;
var GitRemote = class {
  constructor(git, branch, identity, stash = null) {
    this.git = git;
    this.branch = branch;
    this.identity = identity;
    this.stash = stash;
    this.trees = /* @__PURE__ */ new Map();
    this.commits = /* @__PURE__ */ new Map();
    this.roots = /* @__PURE__ */ new Map();
    this.blobs = /* @__PURE__ */ new Map();
    this.keptBlobs = /* @__PURE__ */ new Map();
    this.whole = /* @__PURE__ */ new Set();
    this.recent = [];
    this.deepened = null;
  }
  get ref() {
    return `refs/heads/${this.branch}`;
  }
  async head() {
    const refs = await this.git.refs();
    const sha = refs.heads.get(this.branch);
    if (sha) return sha;
    if (refs.heads.size === 0) return null;
    throw new RemoteError(
      404,
      `The branch "${this.branch}" does not exist on ${this.git.name}.`,
      "not-found"
    );
  }
  async seed(commit, tree, files) {
    if (!this.isWhole(tree)) {
      const built = /* @__PURE__ */ new Map();
      const root = await buildTree(
        [...files].map(([path, file]) => ({
          parts: path.split("/"),
          entry: { sha: file.sha, mode: file.mode }
        })),
        built
      );
      if (root !== tree) return;
      for (const [sha, entries] of built) this.trees.set(sha, entries);
    }
    this.roots.set(commit, tree);
    this.remember(commit);
  }
  async readTree(commit) {
    const tree = await this.ensure(commit);
    const files = /* @__PURE__ */ new Map();
    this.flatten(tree, "", files);
    return { tree, files };
  }
  // fetches a commit with all its folders, sending what this device already has
  async ensure(commit) {
    const known = this.roots.get(commit);
    if (known !== void 0 && this.isWhole(known)) return known;
    const haves = this.recent.filter((sha) => sha !== commit);
    await this.load({
      wants: [commit],
      haves,
      depth: haves.length > 0 ? SINCE_DEPTH : 1,
      blobless: true
    });
    let root = this.roots.get(commit);
    if (root === void 0 || !this.isWhole(root)) {
      await this.load({ wants: [commit], depth: 1, blobless: true });
      root = this.roots.get(commit);
    }
    if (root === void 0 || !this.isWhole(root))
      throw new RemoteError(0, `${this.git.name} did not send commit ${commit}.`, "other");
    this.remember(commit);
    return root;
  }
  async load(request) {
    const objects = await this.git.fetch(request, (sha) => this.object(sha));
    for (const [sha, object] of objects) this.absorb(sha, object);
  }
  object(sha) {
    const entries = this.trees.get(sha);
    if (entries) return { type: "tree", data: writeTree(entries) };
    const blob = this.blobs.get(sha);
    return blob ? { type: "blob", data: blob } : void 0;
  }
  absorb(sha, object) {
    if (object.type === "commit") {
      const commit = parseCommit(object.data);
      this.commits.set(sha, commit);
      this.roots.set(sha, commit.tree);
    } else if (object.type === "tree") {
      this.trees.set(sha, parseTree(object.data));
    } else if (object.type === "blob") {
      this.blobs.set(sha, object.data);
    }
  }
  remember(commit) {
    this.recent = [commit, ...this.recent.filter((sha) => sha !== commit)].slice(0, 8);
  }
  isWhole(tree) {
    if (this.whole.has(tree)) return true;
    const entries = this.trees.get(tree);
    if (!entries) return false;
    for (const entry of entries) {
      if (entry.mode === TREE_MODE && !this.isWhole(entry.sha)) return false;
    }
    this.whole.add(tree);
    return true;
  }
  // symlinks (120000) and submodules (160000) have no place in a vault
  flatten(tree, prefix, files) {
    var _a;
    for (const entry of (_a = this.trees.get(tree)) != null ? _a : []) {
      if (entry.mode === TREE_MODE) this.flatten(entry.sha, `${prefix}${entry.name}/`, files);
      else if (entry.mode === "100644" || entry.mode === "100755")
        files.set(prefix + entry.name, { sha: entry.sha, mode: entry.mode });
    }
  }
  async readBlobs(wanted, commit, progress, each) {
    const out = /* @__PURE__ */ new Map();
    const shas = [...new Set(wanted.map((w) => w.sha))];
    let done = 0;
    const deliver = async (sha) => {
      var _a;
      const bytes = (_a = this.blobs.get(sha)) != null ? _a : this.keptBlobs.get(sha);
      if (!bytes) return false;
      this.blobs.delete(sha);
      if (each) await each(sha, bytes);
      else out.set(sha, bytes);
      progress == null ? void 0 : progress(++done, shas.length);
      return true;
    };
    let missing = [];
    for (const sha of shas) if (!await deliver(sha)) missing.push(sha);
    if (missing.length > 0 && this.git.anyWant) {
      const still = [];
      for (let i = 0; i < missing.length; i += WANT_BATCH) {
        const batch = missing.slice(i, i + WANT_BATCH);
        await this.load({ wants: batch });
        for (const sha of batch) if (!await deliver(sha)) still.push(sha);
      }
      missing = still;
    }
    for (const depth of [1, SINCE_DEPTH]) {
      if (missing.length === 0) break;
      await this.load({ wants: [commit], depth });
      const still = [];
      for (const sha of missing) if (!await deliver(sha)) still.push(sha);
      missing = still;
    }
    return out;
  }
  async commit(input) {
    var _a, _b;
    const base = this.isWhole(input.baseTree) ? input.baseTree : await this.ensure(input.parent);
    const objects = /* @__PURE__ */ new Map();
    const edits = [];
    await pool(input.changes, CONCURRENCY, async (change) => {
      const parts = change.path.split("/");
      if (change.read === null) {
        edits.push({ parts, entry: null });
        return;
      }
      const data = await change.read();
      const blob = { type: "blob", data };
      const sha2 = await hashObject(blob);
      objects.set(sha2, blob);
      edits.push({ parts, entry: { sha: sha2, mode: change.mode } });
    });
    const tree = await this.rewrite(base, edits, objects);
    const parents = [input.parent];
    let keptShas = [];
    if (input.kept && input.kept.files.length > 0) {
      const kept = await this.keptCommit(input.kept, objects);
      if (kept) {
        parents.push(kept.sha);
        keptShas = kept.blobs;
      }
    }
    const now = /* @__PURE__ */ new Date();
    const { name, email } = await this.identity();
    const commit = {
      type: "commit",
      data: writeCommit({
        tree,
        parents,
        author: signature(name, email, (_a = input.authored) != null ? _a : now),
        committer: signature(name, email, now),
        message: input.message
      })
    };
    const sha = await hashObject(commit);
    objects.set(sha, commit);
    const result = await this.git.push(
      this.ref,
      input.parent,
      sha,
      await writePack([...objects.values()])
    );
    if (!result.ok) {
      const head = await this.head().catch(() => null);
      if (head !== sha) {
        if (head !== input.parent) return "moved";
        throw new RemoteError(
          0,
          `${this.git.name} refused the upload: ${result.reason}.`,
          "forbidden"
        );
      }
    }
    for (const [objectSha, object] of objects)
      if (object.type !== "blob") this.absorb(objectSha, object);
    this.remember(sha);
    for (const blob of keptShas) {
      this.keptBlobs.delete(blob);
      await ((_b = this.stash) == null ? void 0 : _b.delete(blob));
    }
    return { commit: sha, tree };
  }
  // this device's losing versions on top of the commit it was in sync with
  async keptCommit(kept, objects) {
    var _a, _b, _c, _d;
    let parent = kept.parent;
    let base = null;
    if (parent !== null) {
      base = await this.ensure(parent).catch(() => null);
      if (base === null) parent = null;
    }
    const edits = [];
    const blobs = [];
    for (const file of kept.files) {
      const data = (_c = (_b = this.keptBlobs.get(file.sha)) != null ? _b : await ((_a = this.stash) == null ? void 0 : _a.get(file.sha))) != null ? _c : null;
      if (!data) continue;
      objects.set(file.sha, { type: "blob", data });
      edits.push({ parts: file.path.split("/"), entry: { sha: file.sha, mode: file.mode } });
      blobs.push(file.sha);
    }
    if (edits.length === 0) return null;
    const tree = await this.rewrite(base, edits, objects);
    const { name, email } = await this.identity();
    const when = (_d = kept.authored) != null ? _d : /* @__PURE__ */ new Date();
    const commit = {
      type: "commit",
      data: writeCommit({
        tree,
        parents: parent === null ? [] : [parent],
        author: signature(name, email, when),
        committer: signature(name, email, /* @__PURE__ */ new Date()),
        message: kept.message
      })
    };
    const sha = await hashObject(commit);
    objects.set(sha, commit);
    return { sha, blobs };
  }
  // the folders along each edited path get new trees; the rest are reused as they are
  async rewrite(tree, edits, objects) {
    var _a;
    const built = /* @__PURE__ */ new Map();
    const root = await buildTree(
      edits,
      built,
      tree === null ? [] : (_a = this.trees.get(tree)) != null ? _a : [],
      this.trees
    );
    for (const [sha, entries] of built) {
      if (!this.trees.has(sha)) objects.set(sha, { type: "tree", data: writeTree(entries) });
      this.trees.set(sha, entries);
    }
    return root;
  }
  async storeBlob(content) {
    var _a;
    const sha = await hashObject({ type: "blob", data: content });
    this.keptBlobs.set(sha, content);
    await ((_a = this.stash) == null ? void 0 : _a.put(sha, content));
    return sha;
  }
  async initialize(path, content, message) {
    const objects = /* @__PURE__ */ new Map();
    const blob = { type: "blob", data: content };
    const blobSha = await hashObject(blob);
    objects.set(blobSha, blob);
    const tree = await this.rewrite(
      null,
      [{ parts: path.split("/"), entry: { sha: blobSha, mode: "100644" } }],
      objects
    );
    const now = /* @__PURE__ */ new Date();
    const { name, email } = await this.identity();
    const commit = {
      type: "commit",
      data: writeCommit({
        tree,
        parents: [],
        author: signature(name, email, now),
        committer: signature(name, email, now),
        message
      })
    };
    const sha = await hashObject(commit);
    objects.set(sha, commit);
    const result = await this.git.push(
      this.ref,
      ZERO_SHA,
      sha,
      await writePack([...objects.values()])
    );
    if (!result.ok && await this.head() === null)
      throw new RemoteError(
        0,
        `${this.git.name} refused the first commit: ${result.reason}.`,
        "forbidden"
      );
  }
  async commitsSince(base, head) {
    var _a;
    if (!this.commits.has(head)) await this.ensure(head);
    const top = this.commits.get(head);
    if (!top) return [];
    if (base === null || base === head) return [toRemoteCommit(head, top)];
    const out = [];
    const seen = /* @__PURE__ */ new Set([base]);
    const queue = [head];
    while (queue.length > 0) {
      const sha = (_a = queue.shift()) != null ? _a : "";
      if (seen.has(sha)) continue;
      seen.add(sha);
      const commit = this.commits.get(sha);
      if (!commit) continue;
      out.push(toRemoteCommit(sha, commit));
      queue.push(...commit.parents);
    }
    return out.sort((a, b) => {
      var _a2, _b, _c, _d;
      return ((_b = (_a2 = b.date) == null ? void 0 : _a2.getTime()) != null ? _b : 0) - ((_d = (_c = a.date) == null ? void 0 : _c.getTime()) != null ? _d : 0);
    });
  }
  async lastChange(path, head) {
    if (!this.commits.has(head)) await this.ensure(head);
    for (let attempt = 0; attempt < 2; attempt++) {
      const found = this.walk(path, head);
      if (found !== void 0) return found;
      if (!await this.deepen(head)) break;
    }
    return null;
  }
  // undefined when the history needed to tell is not here
  walk(path, head) {
    let current = head;
    while (current !== void 0) {
      const commit = this.commits.get(current);
      if (!commit) return void 0;
      const here = this.pathSha(commit.tree, path);
      const parent = commit.parents[0];
      const parentTree = parent === void 0 ? null : this.roots.get(parent);
      if (parentTree === void 0) return void 0;
      const before = parentTree === null ? null : this.pathSha(parentTree, path);
      if (here === void 0 || before === void 0) return void 0;
      if (here !== before && !isSuperseded(commit.message)) return toRemoteCommit(current, commit);
      current = parent;
    }
    return null;
  }
  pathSha(tree, path) {
    let entries = this.trees.get(tree);
    const parts = path.split("/");
    for (const [i, part] of parts.entries()) {
      if (!entries) return void 0;
      const entry = entries.find((e) => e.name === part);
      if (!entry) return null;
      if (i === parts.length - 1) return entry.mode === TREE_MODE ? null : entry.sha;
      if (entry.mode !== TREE_MODE) return null;
      entries = this.trees.get(entry.sha);
    }
    return null;
  }
  // older history comes only from a server that sends folders without their files
  async deepen(head) {
    if (!this.git.blobless || this.deepened === head) return false;
    this.deepened = head;
    await this.load({ wants: [head], depth: HISTORY_DEPTH, blobless: true });
    return true;
  }
  async fileHistory(path, head, max) {
    if (!await this.deepen(head) && this.deepened !== head) return [];
    const shas = [];
    for (let current = head; current !== void 0 && shas.length < max; ) {
      const commit = this.commits.get(current);
      if (!commit) break;
      const sha = this.pathSha(commit.tree, path);
      if (sha && !shas.includes(sha)) shas.push(sha);
      current = commit.parents[0];
    }
    return shas;
  }
};
function toRemoteCommit(sha, commit) {
  var _a;
  return {
    sha,
    message: commit.message,
    date: commit.committer.time ? signatureDate(commit.committer) : null,
    authored: commit.author.time ? signatureDate(commit.author) : null,
    parent: (_a = commit.parents[0]) != null ? _a : null
  };
}
async function buildTree(edits, built, base = [], trees = /* @__PURE__ */ new Map()) {
  var _a, _b, _c;
  const entries = new Map(base.map((entry) => [entry.name, entry]));
  const folders = /* @__PURE__ */ new Map();
  for (const edit of edits) {
    const [name, ...rest] = edit.parts;
    if (name === void 0) continue;
    if (rest.length === 0) {
      if (edit.entry) entries.set(name, { name, ...edit.entry });
      else entries.delete(name);
    } else {
      folders.set(name, [...(_a = folders.get(name)) != null ? _a : [], { parts: rest, entry: edit.entry }]);
    }
  }
  for (const [name, inner] of folders) {
    const existing = entries.get(name);
    const below = (existing == null ? void 0 : existing.mode) === TREE_MODE ? (_c = (_b = trees.get(existing.sha)) != null ? _b : built.get(existing.sha)) != null ? _c : [] : [];
    const sha2 = await buildTree(inner, built, below, trees);
    if (sha2 !== EMPTY_TREE) entries.set(name, { name, mode: TREE_MODE, sha: sha2 });
    else if ((existing == null ? void 0 : existing.mode) === TREE_MODE) entries.delete(name);
  }
  const list = [...entries.values()];
  const sha = await hashObject({ type: "tree", data: writeTree(list) });
  built.set(sha, list);
  return sha;
}
var EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
async function pool(items, size, run) {
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      await run(items[next++]);
    }
  });
  await Promise.all(workers);
}

// src/remote/tar.ts
var BLOCK = 512;
var decoder4 = new TextDecoder();
async function gunzip(bytes) {
  if (bytes[0] !== 31 || bytes[1] !== 139) return bytes;
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
function untar(bytes, stripFirst = true, keep = () => true) {
  var _a, _b;
  const files = /* @__PURE__ */ new Map();
  let offset = 0;
  let longName = null;
  while (offset + BLOCK <= bytes.length) {
    const header = bytes.subarray(offset, offset + BLOCK);
    if (header.every((b) => b === 0)) break;
    const size = parseOctal(header.subarray(124, 136));
    const type = String.fromCharCode((_a = header[156]) != null ? _a : 0);
    const dataStart = offset + BLOCK;
    const data = bytes.subarray(dataStart, dataStart + size);
    offset = dataStart + Math.ceil(size / BLOCK) * BLOCK;
    if (type === "x") {
      longName = (_b = paxPath(data)) != null ? _b : longName;
      continue;
    }
    if (type === "L") {
      longName = cString(data);
      continue;
    }
    if (type === "g") continue;
    let name = longName != null ? longName : fullName(header);
    longName = null;
    if (type !== "0" && type !== "\0") continue;
    if (stripFirst) {
      const slash = name.indexOf("/");
      if (slash === -1) continue;
      name = name.slice(slash + 1);
    }
    if (name !== "" && keep(name)) files.set(name, data);
  }
  return files;
}
function fullName(header) {
  const name = cString(header.subarray(0, 100));
  const magic = cString(header.subarray(257, 263));
  const prefix = magic.startsWith("ustar") ? cString(header.subarray(345, 500)) : "";
  return prefix ? `${prefix}/${name}` : name;
}
function cString(bytes) {
  const end = bytes.indexOf(0);
  return decoder4.decode(end === -1 ? bytes : bytes.subarray(0, end));
}
function parseOctal(bytes) {
  const text = cString(bytes).trim();
  return text === "" ? 0 : Number.parseInt(text, 8);
}
function paxPath(data) {
  let path = null;
  let at = 0;
  while (at < data.length) {
    const space = data.indexOf(32, at);
    if (space === -1) break;
    const length = Number.parseInt(decoder4.decode(data.subarray(at, space)), 10);
    if (!Number.isFinite(length) || length <= 0) break;
    const record = decoder4.decode(data.subarray(space + 1, at + length - 1));
    if (record.startsWith("path=")) path = record.slice(5);
    at += length;
  }
  return path;
}

// src/remote/github.ts
var API = "https://api.github.com";
var GitHubError = class extends RemoteError {
};
var GitHubClient = class {
  constructor(http, token, sleep) {
    this.http = http;
    this.token = token;
    this.sleep = sleep;
    this.expiry = null;
    this.account = null;
  }
  async request(method, path, options = {}) {
    var _a, _b;
    const token = this.token();
    if (!token) throw new GitHubError(401, "No GitHub token set.", "auth");
    const headers = {
      Accept: (_a = options.accept) != null ? _a : "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      // GET responses are cacheable for 60 s, and a cached branch head means a stale parent
      "Cache-Control": "no-cache"
    };
    let body;
    if (options.body !== void 0) {
      body = JSON.stringify(options.body);
      headers["Content-Type"] = "application/json";
    }
    const url = path.startsWith("https://") ? path : `${API}${path}`;
    for (let attempt = 0; ; attempt++) {
      let response;
      try {
        response = await this.http({
          url,
          method,
          headers,
          ...body === void 0 ? {} : { body }
        });
      } catch (error) {
        throw new OfflineError(error);
      }
      response = { ...response, headers: lowerCaseHeaders(response.headers) };
      const { status } = response;
      if (status < 400) {
        const expires = response.headers["github-authentication-token-expiration"];
        this.expiry = {
          token,
          date: expires ? new Date(expires.replace(" UTC", "Z").replace(" ", "T")) : null
        };
      }
      if (status < 400 || ((_b = options.allow) == null ? void 0 : _b.includes(status))) return response;
      const wait = retryDelay2(response, attempt);
      if (wait !== null && attempt < 3) {
        await this.sleep(wait);
        continue;
      }
      throw toError(response);
    }
  }
  async json(method, path, body) {
    const response = await this.request(method, path, body === void 0 ? {} : { body });
    return parseJson(response);
  }
  async user() {
    const user = await this.json(
      "GET",
      "/user"
    );
    return { id: user.id, login: user.login, name: user.name };
  }
  cachedUser() {
    var _a;
    const token = this.token();
    if (((_a = this.account) == null ? void 0 : _a.token) === token) return this.account.user;
    const user = this.user();
    this.account = { token, user };
    user.catch(() => {
      var _a2;
      if (((_a2 = this.account) == null ? void 0 : _a2.user) === user) this.account = null;
    });
    return user;
  }
  async tokenExpiry() {
    var _a, _b;
    const token = this.token();
    if (((_a = this.expiry) == null ? void 0 : _a.token) !== token) await this.user();
    return ((_b = this.expiry) == null ? void 0 : _b.token) === token ? this.expiry.date : null;
  }
  async repos() {
    const out = [];
    for (let page = 1; page <= 5; page++) {
      const batch = await this.json(
        "GET",
        `/user/repos?per_page=100&sort=pushed&page=${page}`
      );
      out.push(...batch.map(toRepo));
      if (batch.length < 100) break;
    }
    await pool2(out, CONCURRENCY2, async (repo) => {
      repo.canPush = await this.tokenCanPush(repo);
    });
    return out;
  }
  async repo(fullName2) {
    const repo = toRepo(await this.json("GET", `/repos/${fullName2}`));
    repo.canPush = await this.tokenCanPush(repo);
    return repo;
  }
  async tokenCanPush(repo) {
    var _a;
    if (!repo.canPush || !((_a = this.token()) == null ? void 0 : _a.startsWith("github_pat_"))) return repo.canPush;
    const response = await this.request("POST", `/repos/${repo.fullName}/git/refs`, {
      body: { ref: "refs/heads/easy-git-sync-write-check", sha: "0".repeat(40) },
      allow: [403, 404, 409, 422, 451]
    });
    if (response.status === 403 && toError(response).kind === "rate-limit") throw toError(response);
    return response.status === 409 || response.status === 422;
  }
  async branches(fullName2, defaultBranch) {
    const names = [];
    for (let page = 1; page <= 3; page++) {
      const batch = await this.json(
        "GET",
        `/repos/${fullName2}/branches?per_page=100&page=${page}`
      );
      names.push(...batch.map((branch) => branch.name));
      if (batch.length < 100) break;
    }
    return [defaultBranch, ...names.filter((name) => name !== defaultBranch).sort()];
  }
};
function toRepo(raw) {
  var _a, _b;
  return {
    owner: raw.owner.login,
    name: raw.name,
    fullName: raw.full_name,
    private: raw.private,
    defaultBranch: raw.default_branch || "main",
    canPush: !raw.disabled && ((_b = (_a = raw.permissions) == null ? void 0 : _a.push) != null ? _b : false),
    empty: raw.size === 0 && raw.pushed_at === null
  };
}
function parseJson(response) {
  return JSON.parse(new TextDecoder().decode(response.body));
}
function retryDelay2(response, attempt) {
  const { status, headers } = response;
  if (status >= 500) return 1e3 * 2 ** attempt;
  if (status !== 403 && status !== 429) return null;
  const retryAfter = Number(headers["retry-after"]);
  if (Number.isFinite(retryAfter) && retryAfter > 0)
    return retryAfter <= 60 ? retryAfter * 1e3 : null;
  if (headers["x-ratelimit-remaining"] === "0") {
    const reset = Number(headers["x-ratelimit-reset"]) * 1e3 - Date.now();
    return reset > 0 && reset <= 6e4 ? reset + 1e3 : null;
  }
  if (/secondary rate limit/i.test(messageOf(response))) return 6e4;
  return null;
}
function messageOf(response) {
  var _a;
  try {
    return (_a = parseJson(response).message) != null ? _a : "";
  } catch (e) {
    return "";
  }
}
function toError(response) {
  const { status, headers } = response;
  const message = messageOf(response) || `GitHub answered ${status}.`;
  if (status === 401) return new GitHubError(status, "GitHub did not accept the token.", "auth");
  if ((status === 403 || status === 429) && (headers["x-ratelimit-remaining"] === "0" || /rate limit/i.test(message))) {
    return new GitHubError(
      status,
      "GitHub's rate limit was reached. Syncing resumes when it resets.",
      "rate-limit"
    );
  }
  if (status === 403) return new GitHubError(status, message, "forbidden");
  if (status === 404) return new GitHubError(status, message, "not-found");
  return new GitHubError(status, message, "other");
}
var ARCHIVE_THRESHOLD = 40;
var ARCHIVE_MAX_BYTES = 100 * 1024 * 1024;
var CONCURRENCY2 = 6;
var TREE_BATCH = 200;
var GitHubRemote = class {
  constructor(client, fullName2, branch) {
    this.client = client;
    this.fullName = fullName2;
    this.branch = branch;
    this.treeSizes = /* @__PURE__ */ new Map();
  }
  get repoPath() {
    return `/repos/${this.fullName}`;
  }
  async author(authored = null) {
    if (authored === null) return {};
    const user = await this.client.cachedUser();
    const name = user.name || user.login;
    const email = `${user.id}+${user.login}@users.noreply.github.com`;
    return {
      author: { name, email, date: isoDate(authored) },
      committer: { name, email, date: isoDate(/* @__PURE__ */ new Date()) }
    };
  }
  async head() {
    const response = await this.client.request(
      "GET",
      `${this.repoPath}/git/ref/heads/${encodePath(this.branch)}`,
      { allow: [404, 409] }
    );
    if (response.status === 200) return parseJson(response).object.sha;
    if (response.status === 409) return null;
    const branches = await this.client.json(
      "GET",
      `${this.repoPath}/branches?per_page=1`
    );
    if (branches.length === 0) return null;
    throw new GitHubError(
      404,
      `The branch "${this.branch}" does not exist on GitHub.`,
      "not-found"
    );
  }
  async readTree(commit) {
    const root = await this.client.json(
      "GET",
      `${this.repoPath}/git/trees/${commit}?recursive=1`
    );
    const files = /* @__PURE__ */ new Map();
    if (!root.truncated) {
      addBlobs(files, root.tree, "");
      this.treeSizes.set(commit, measure(files));
      return { tree: root.sha, files };
    }
    const queue = [{ sha: root.sha, prefix: "" }];
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) break;
      const tree = await this.client.json("GET", `${this.repoPath}/git/trees/${next.sha}`);
      addBlobs(files, tree.tree, next.prefix);
      for (const entry of tree.tree) {
        if (entry.type === "tree")
          queue.push({ sha: entry.sha, prefix: `${next.prefix}${entry.path}/` });
      }
    }
    this.treeSizes.set(commit, measure(files));
    return { tree: root.sha, files };
  }
  async readBlobs(wanted, commit, progress, each) {
    const out = /* @__PURE__ */ new Map();
    const deliver = async (sha, bytes) => {
      if (each) await each(sha, bytes);
      else out.set(sha, bytes);
    };
    const shas = /* @__PURE__ */ new Map();
    for (const { sha, path } of wanted) if (!shas.has(sha)) shas.set(sha, path);
    const delivered = /* @__PURE__ */ new Set();
    const size = this.treeSizes.get(commit);
    if (shas.size > ARCHIVE_THRESHOLD && (size === void 0 || shas.size * 2 >= size.files && size.bytes <= ARCHIVE_MAX_BYTES)) {
      let archive = null;
      try {
        const paths = new Set(shas.values());
        archive = await this.archive(commit, (path) => paths.has(path));
      } catch (error) {
        if (error instanceof GitHubError && error.kind === "auth") throw error;
      }
      for (const [sha, path] of archive ? shas : []) {
        const data = archive == null ? void 0 : archive.get(path);
        if (!data || await gitBlobSha(data) !== sha) continue;
        await deliver(sha, data);
        delivered.add(sha);
        progress == null ? void 0 : progress(delivered.size, shas.size);
      }
    }
    const missing = [...shas.keys()].filter((sha) => !delivered.has(sha));
    let done = shas.size - missing.length;
    progress == null ? void 0 : progress(done, shas.size);
    await pool2(missing, CONCURRENCY2, async (sha) => {
      const response = await this.client.request("GET", `${this.repoPath}/git/blobs/${sha}`, {
        accept: "application/vnd.github.raw+json",
        allow: [404]
      });
      if (response.status === 200) await deliver(sha, new Uint8Array(response.body));
      progress == null ? void 0 : progress(++done, shas.size);
    });
    return out;
  }
  async archive(commit, keep) {
    let response = await this.client.request("GET", `${this.repoPath}/tarball/${commit}`, {
      accept: "application/vnd.github+json",
      allow: [302]
    });
    const location = response.headers.location;
    if (response.status === 302 && location) {
      response = await this.client.request("GET", location, { accept: "*/*" });
    }
    return untar(await gunzip(new Uint8Array(response.body)), true, keep);
  }
  async commit(input) {
    var _a;
    const entries = [];
    await pool2(input.changes, CONCURRENCY2, async (change) => {
      entries.push(await this.treeEntry(change));
    });
    entries.sort((a, b) => a.path < b.path ? -1 : 1);
    const tree = entries.length > 0 ? await this.buildTree(input.baseTree, entries) : await this.treeOf(input.parent);
    const parents = [input.parent];
    if (input.kept && input.kept.files.length > 0) parents.push(await this.keptCommit(input.kept));
    const commit = await this.client.json("POST", `${this.repoPath}/git/commits`, {
      message: input.message,
      tree,
      parents,
      ...await this.author((_a = input.authored) != null ? _a : null)
    });
    const updated = await this.client.request(
      "PATCH",
      `${this.repoPath}/git/refs/heads/${encodePath(this.branch)}`,
      { body: { sha: commit.sha, force: false }, allow: [409, 422] }
    );
    if (updated.status !== 200) return "moved";
    return { commit: commit.sha, tree };
  }
  async buildTree(baseTree, entries) {
    let tree = baseTree;
    for (let i = 0; i < entries.length || tree === null; i += TREE_BATCH) {
      const created = await this.client.json(
        "POST",
        `${this.repoPath}/git/trees`,
        {
          ...tree === null ? {} : { base_tree: tree },
          tree: entries.slice(i, i + TREE_BATCH)
        }
      );
      tree = created.sha;
    }
    return tree;
  }
  async keptCommit(kept) {
    const entries = kept.files.map(({ path, mode, sha }) => ({
      path,
      mode,
      type: "blob",
      sha
    }));
    let parent = kept.parent;
    const baseTree = parent === null ? null : await this.treeOf(parent, true);
    if (baseTree === null) parent = null;
    const tree = await this.buildTree(baseTree, entries);
    const commit = await this.client.json("POST", `${this.repoPath}/git/commits`, {
      message: kept.message,
      tree,
      parents: parent === null ? [] : [parent],
      ...await this.author(kept.authored)
    });
    return commit.sha;
  }
  async treeOf(commit, missingOk = false) {
    const response = await this.client.request("GET", `${this.repoPath}/git/commits/${commit}`, {
      allow: missingOk ? [404, 422] : []
    });
    if (response.status !== 200) return null;
    return parseJson(response).tree.sha;
  }
  async storeBlob(content) {
    const blob = await this.client.json("POST", `${this.repoPath}/git/blobs`, {
      content: toBase64(content),
      encoding: "base64"
    });
    return blob.sha;
  }
  async treeEntry(change) {
    const base = { path: change.path, mode: change.mode, type: "blob" };
    if (change.read === null) return { ...base, sha: null };
    const content = await change.read();
    const text = decodeText(content);
    if (text !== null) return { ...base, content: text };
    const blob = await this.client.json("POST", `${this.repoPath}/git/blobs`, {
      content: toBase64(content),
      encoding: "base64"
    });
    return { ...base, sha: blob.sha };
  }
  async initialize(path, content, message) {
    await this.client.json("PUT", `${this.repoPath}/contents/${encodePath(path)}`, {
      message,
      content: toBase64(content),
      branch: this.branch,
      ...await this.author()
    });
  }
  async commitsSince(base, head) {
    if (base === null || base === head) {
      const list = await this.client.json(
        "GET",
        `${this.repoPath}/commits?sha=${head}&per_page=1`
      );
      return list.map(toCommit);
    }
    const compare = await this.client.json(
      "GET",
      `${this.repoPath}/compare/${base}...${head}`
    );
    return compare.commits.map(toCommit).reverse();
  }
  async lastChange(path, head) {
    var _a;
    const list = await this.client.json(
      "GET",
      `${this.repoPath}/commits?sha=${head}&path=${encodeURIComponent(path)}&per_page=5`
    );
    return (_a = list.map(toCommit).find((commit) => !isSuperseded(commit.message))) != null ? _a : null;
  }
  async fileHistory(path, head, max) {
    const commits = await this.client.json(
      "GET",
      `${this.repoPath}/commits?sha=${head}&path=${encodeURIComponent(path)}&per_page=${max}`
    );
    const shas = [];
    for (const commit of commits) {
      const response = await this.client.request(
        "GET",
        `${this.repoPath}/contents/${encodePath(path)}?ref=${commit.sha}`,
        { allow: [404] }
      );
      if (response.status !== 200) continue;
      const file = parseJson(response);
      if (file.type === "file" && file.sha && !shas.includes(file.sha)) shas.push(file.sha);
    }
    return shas;
  }
};
function isoDate(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}
function toCommit(raw) {
  var _a, _b, _c, _d, _e, _f, _g;
  const date = (_c = (_a = raw.commit.committer) == null ? void 0 : _a.date) != null ? _c : (_b = raw.commit.author) == null ? void 0 : _b.date;
  const authored = (_d = raw.commit.author) == null ? void 0 : _d.date;
  return {
    sha: raw.sha,
    message: raw.commit.message,
    date: date ? new Date(date) : null,
    authored: authored ? new Date(authored) : null,
    parent: (_g = (_f = (_e = raw.parents) == null ? void 0 : _e[0]) == null ? void 0 : _f.sha) != null ? _g : null
  };
}
function addBlobs(files, entries, prefix) {
  for (const entry of entries) {
    if (entry.type === "blob" && (entry.mode === "100644" || entry.mode === "100755")) {
      files.set(prefix + entry.path, {
        sha: entry.sha,
        mode: entry.mode,
        ...entry.size === void 0 ? {} : { size: entry.size }
      });
    }
  }
}
function measure(files) {
  var _a;
  let bytes = 0;
  for (const file of files.values()) bytes += (_a = file.size) != null ? _a : 0;
  return { files: files.size, bytes };
}
function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}
async function pool2(items, size, run) {
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      await run(items[next++]);
    }
  });
  await Promise.all(workers);
}

// src/remote/hosts.ts
var PROVIDERS = {
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  forgejo: "Forgejo / Gitea",
  other: "Other git server"
};
var DEFAULT_SERVERS = {
  gitlab: "https://gitlab.com",
  forgejo: "https://codeberg.org"
};
var TOKEN_NAME = "Obsidian Easy Git Sync";
var TOKEN_DESCRIPTION = "Lets Obsidian sync this vault with its repository.";
function normalizeServer(server) {
  const trimmed = server.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
function hostOf(url) {
  try {
    return new URL(url).host;
  } catch (e) {
    return url;
  }
}
function hostnameOf(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
}
function encodePath2(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}
function createHost(connection, deps) {
  switch (connection.provider) {
    case "github":
      return new GitHubHost(deps);
    case "gitlab":
      return new GitLabHost(connection, deps);
    case "forgejo":
      return new ForgejoHost(connection, deps);
    case "bitbucket":
      return new BitbucketHost(deps);
    case "other":
      return new OtherHost(connection, deps);
  }
}
var GitHost = class {
  constructor(deps) {
    this.deps = deps;
    this.cached = null;
  }
  // an address only this account owns, so commits show on it; null where the host has none
  linkedEmail(_account) {
    return null;
  }
  async tokenExpiry() {
    return null;
  }
  account() {
    var _a;
    const token = this.deps.token();
    if (((_a = this.cached) == null ? void 0 : _a.token) === token) return this.cached.account;
    const account = this.fetchAccount();
    this.cached = { token, account };
    account.catch(() => {
      var _a2;
      if (((_a2 = this.cached) == null ? void 0 : _a2.account) === account) this.cached = null;
    });
    return account;
  }
  git(fullName2) {
    return new GitHttp(
      this.deps.http,
      this.cloneUrl(fullName2),
      () => this.gitLogin(),
      this.name,
      this.deps.sleep
    );
  }
  async branches(fullName2, defaultBranch) {
    var _a;
    const refs = await this.git(fullName2).refs();
    const names = [...refs.heads.keys()];
    const first = (_a = refs.head) != null ? _a : defaultBranch;
    return [first, ...names.filter((name) => name !== first).sort()];
  }
  async check(fullName2) {
    const git = this.git(fullName2);
    const refs = await git.refs();
    return {
      canPush: await git.canPush(),
      defaultBranch: refs.head,
      empty: refs.heads.size === 0
    };
  }
  remote(fullName2, branch, stash) {
    const identity = async () => {
      const account = await this.account();
      const linked = this.linkedEmail(account);
      return {
        name: account.name || account.login,
        email: linked != null ? linked : `${account.login.toLowerCase()}@easy-git-sync.invalid`
      };
    };
    return new GitRemote(this.git(fullName2), branch, identity, stash);
  }
  async api(url, headers, allow = []) {
    for (let attempt = 0; ; attempt++) {
      let response;
      try {
        response = await this.deps.http({
          url,
          method: "GET",
          headers: { Accept: "application/json", "Cache-Control": "no-cache", ...headers }
        });
      } catch (error) {
        throw new OfflineError(error, this.name);
      }
      response = { ...response, headers: lowerCaseHeaders(response.headers) };
      const { status } = response;
      if (status < 400 || allow.includes(status)) {
        const text = new TextDecoder().decode(response.body);
        return {
          status,
          body: status < 400 && text ? JSON.parse(text) : null,
          headers: response.headers
        };
      }
      if (status >= 500 && attempt < 3) {
        await this.deps.sleep(1e3 * 2 ** attempt);
        continue;
      }
      if (status === 401)
        throw new RemoteError(status, `${capitalize(this.name)} did not accept the token.`, "auth");
      if (status === 403)
        throw new RemoteError(
          status,
          `${capitalize(this.name)} refused: the token lacks a permission.`,
          "forbidden"
        );
      if (status === 404) throw new RemoteError(status, `Not found on ${this.name}.`, "not-found");
      if (status === 429)
        throw new RemoteError(
          status,
          `${capitalize(this.name)}'s rate limit was reached.`,
          "rate-limit"
        );
      throw new RemoteError(status, `${capitalize(this.name)} answered ${status}.`, "other");
    }
  }
};
var GitHubHost = class {
  constructor(deps) {
    this.deps = deps;
    this.id = "github";
    this.name = "GitHub";
    this.client = new GitHubClient(deps.http, deps.token, deps.sleep);
  }
  async account() {
    var _a;
    const user = await this.client.cachedUser();
    return { login: user.login, name: (_a = user.name) != null ? _a : user.login };
  }
  repos() {
    return this.client.repos();
  }
  repo(fullName2) {
    return this.client.repo(fullName2);
  }
  branches(fullName2, defaultBranch) {
    return this.client.branches(fullName2, defaultBranch);
  }
  tokenExpiry() {
    return this.client.tokenExpiry();
  }
  async tokenUrl() {
    return `https://github.com/settings/personal-access-tokens/new?${new URLSearchParams({
      name: TOKEN_NAME,
      description: TOKEN_DESCRIPTION,
      contents: "write",
      expires_in: "none"
    }).toString()}`;
  }
  remote(fullName2, branch) {
    return new GitHubRemote(this.client, fullName2, branch);
  }
  cloneUrl(fullName2) {
    return `https://github.com/${fullName2}.git`;
  }
  gitLogin() {
    const token = this.deps.token();
    return token ? { username: "x-access-token", password: token } : null;
  }
  fileUrl(fullName2, branch, path) {
    return `https://github.com/${fullName2}/blob/${encodeURIComponent(branch)}/${encodePath2(path)}`;
  }
};
var GitLabHost = class extends GitHost {
  constructor(connection, deps) {
    super(deps);
    this.id = "gitlab";
    this.name = "GitLab";
    this.userId = 0;
    this.server = normalizeServer(connection.server || DEFAULT_SERVERS.gitlab || "");
  }
  get headers() {
    const token = this.deps.token();
    if (!token) throw new RemoteError(401, "No GitLab token set.", "auth");
    return { "PRIVATE-TOKEN": token };
  }
  async get(path) {
    const { body } = await this.api(`${this.server}/api/v4${path}`, this.headers);
    return body;
  }
  async fetchAccount() {
    const user = await this.get("/user");
    this.userId = user.id;
    return { login: user.username, name: user.name };
  }
  // the private commit address GitLab gives every account, linked to it alone
  linkedEmail(account) {
    return `${this.userId}-${account.login}@users.noreply.gitlab.com`;
  }
  async scopes() {
    var _a;
    try {
      return (_a = (await this.get("/personal_access_tokens/self")).scopes) != null ? _a : null;
    } catch (e) {
      return null;
    }
  }
  toRepo(project, canPush) {
    var _a, _b;
    return {
      fullName: project.path_with_namespace,
      private: project.visibility !== "public",
      defaultBranch: (_a = project.default_branch) != null ? _a : "main",
      canPush,
      // an empty project already names its default branch
      empty: (_b = project.empty_repo) != null ? _b : project.default_branch === null
    };
  }
  async repos() {
    const scopes = await this.scopes();
    const writes = scopes === null || scopes.includes("write_repository") || scopes.includes("api");
    const out = [];
    for (let page = 1; page <= 5; page++) {
      const batch = await this.get(
        `/projects?membership=true&min_access_level=30&order_by=last_activity_at&per_page=100&page=${page}`
      );
      out.push(...batch.map((project) => this.toRepo(project, writes)));
      if (batch.length < 100) break;
    }
    return out;
  }
  async repo(fullName2) {
    const project = await this.get(`/projects/${encodeURIComponent(fullName2)}`);
    const { canPush } = await this.check(fullName2);
    return this.toRepo(project, canPush);
  }
  async tokenExpiry() {
    const self = await this.get("/personal_access_tokens/self");
    return self.expires_at ? /* @__PURE__ */ new Date(`${self.expires_at}T00:00:00Z`) : null;
  }
  // only the classic form takes values from the address; read_api lists the projects
  async tokenUrl() {
    return `${this.server}/-/user_settings/personal_access_tokens?${new URLSearchParams({
      name: TOKEN_NAME,
      description: TOKEN_DESCRIPTION,
      scopes: "read_api,write_repository"
    }).toString()}`;
  }
  cloneUrl(fullName2) {
    return `${this.server}/${fullName2}.git`;
  }
  gitLogin() {
    const token = this.deps.token();
    return token ? { username: "oauth2", password: token } : null;
  }
  fileUrl(fullName2, branch, path) {
    return `${this.server}/${fullName2}/-/blob/${encodeURIComponent(branch)}/${encodePath2(path)}`;
  }
};
var ForgejoHost = class extends GitHost {
  constructor(connection, deps) {
    super(deps);
    this.id = "forgejo";
    this.login = null;
    this.server = normalizeServer(connection.server || DEFAULT_SERVERS.forgejo || "");
    this.name = hostOf(this.server) === "codeberg.org" ? "Codeberg" : "the server";
  }
  get headers() {
    const token = this.deps.token();
    if (!token) throw new RemoteError(401, `No token set for ${this.name}.`, "auth");
    return { Authorization: `token ${token}` };
  }
  async get(path) {
    const { body } = await this.api(`${this.server}/api/v1${path}`, this.headers);
    return body;
  }
  async fetchAccount() {
    const user = await this.get("/user");
    this.login = user.login;
    return { login: user.login, name: user.full_name || user.login };
  }
  // the placeholder address Forgejo and Gitea give an account that hides its own
  linkedEmail(account) {
    return `${account.login.toLowerCase()}@noreply.${hostnameOf(this.server)}`;
  }
  toRepo(repo) {
    var _a, _b;
    return {
      fullName: repo.full_name,
      private: repo.private,
      defaultBranch: repo.default_branch || "main",
      canPush: (_b = (_a = repo.permissions) == null ? void 0 : _a.push) != null ? _b : false,
      empty: repo.empty
    };
  }
  async repos() {
    const out = [];
    for (let page = 1; page <= 10; page++) {
      const batch = await this.get(`/user/repos?limit=50&page=${page}`);
      out.push(...batch.map((repo) => this.toRepo(repo)));
      if (batch.length < 50) break;
    }
    return out;
  }
  async repo(fullName2) {
    const repo = this.toRepo(await this.get(`/repos/${fullName2}`));
    return { ...repo, canPush: repo.canPush && (await this.check(fullName2)).canPush };
  }
  // Forgejo from 15 on fills its token form from the address; Gitea and older Forgejo do not
  async tokenUrl() {
    var _a;
    const plain = `${this.server}/user/settings/applications`;
    try {
      const { body } = await this.api(`${this.server}/api/v1/version`, {});
      const version = (_a = body == null ? void 0 : body.version) != null ? _a : "";
      const major = Number.parseInt(version, 10);
      if (!version.includes("+gitea-") || !(major >= 15)) return plain;
    } catch (e) {
      return plain;
    }
    const params = new URLSearchParams({ name: TOKEN_NAME, resource: "all" });
    params.append("scope", "write:repository");
    params.append("scope", "read:user");
    return `${this.server}/user/settings/applications/tokens/new?${params.toString()}`;
  }
  cloneUrl(fullName2) {
    return `${this.server}/${fullName2}.git`;
  }
  gitLogin() {
    var _a;
    const token = this.deps.token();
    return token ? { username: (_a = this.login) != null ? _a : "oauth2", password: token } : null;
  }
  fileUrl(fullName2, branch, path) {
    return `${this.server}/${fullName2}/src/branch/${encodeURIComponent(branch)}/${encodePath2(path)}`;
  }
};
var BitbucketHost = class extends GitHost {
  constructor() {
    super(...arguments);
    this.id = "bitbucket";
    this.name = "Bitbucket";
  }
  get headers() {
    const token = this.deps.token();
    if (!token) throw new RemoteError(401, "No Bitbucket token set.", "auth");
    return { Authorization: `Bearer ${token}` };
  }
  get(path) {
    return this.api(`https://api.bitbucket.org/2.0${path}`, this.headers);
  }
  async fetchAccount() {
    var _a, _b;
    const { body } = await this.get("/user");
    return { login: (_a = body == null ? void 0 : body.username) != null ? _a : "", name: (_b = body == null ? void 0 : body.display_name) != null ? _b : "" };
  }
  // listed per workspace: Bitbucket dropped the lists across all of them
  async repos() {
    var _a, _b, _c, _d, _e, _f, _g;
    const { body: spaces, headers } = await this.get("/user/workspaces?pagelen=100");
    const writes = ((_a = headers["x-oauth-scopes"]) != null ? _a : "write:repository").includes("write:repository");
    const out = [];
    for (const { workspace } of (_b = spaces == null ? void 0 : spaces.values) != null ? _b : []) {
      const slug = encodeURIComponent(workspace.slug);
      const { body: repos } = await this.get(`/repositories/${slug}?role=member&pagelen=100&sort=-updated_on`);
      const { body: roles } = await this.get(`/user/workspaces/${slug}/permissions/repositories?pagelen=100`);
      const role = new Map((_c = roles == null ? void 0 : roles.values.map((v) => [v.repository.full_name, v.permission])) != null ? _c : []);
      for (const repo of (_d = repos == null ? void 0 : repos.values) != null ? _d : []) {
        const permission = (_e = role.get(repo.full_name)) != null ? _e : "read";
        out.push({
          fullName: repo.full_name,
          private: repo.is_private,
          defaultBranch: (_g = (_f = repo.mainbranch) == null ? void 0 : _f.name) != null ? _g : "main",
          canPush: writes && permission !== "read",
          empty: false
        });
      }
    }
    return out;
  }
  async repo(fullName2) {
    var _a, _b, _c, _d, _e;
    const { body } = await this.get(`/repositories/${fullName2}`);
    const checked = await this.check(fullName2);
    return {
      fullName: (_a = body == null ? void 0 : body.full_name) != null ? _a : fullName2,
      private: (_b = body == null ? void 0 : body.is_private) != null ? _b : true,
      defaultBranch: (_e = (_d = checked.defaultBranch) != null ? _d : (_c = body == null ? void 0 : body.mainbranch) == null ? void 0 : _c.name) != null ? _e : "main",
      canPush: checked.canPush,
      empty: checked.empty
    };
  }
  // the API token page cannot be filled in from the address
  async tokenUrl() {
    return "https://id.atlassian.com/manage-profile/security/api-tokens";
  }
  cloneUrl(fullName2) {
    return `https://bitbucket.org/${fullName2}.git`;
  }
  gitLogin() {
    const token = this.deps.token();
    return token ? { username: "x-bitbucket-api-token-auth", password: token } : null;
  }
  fileUrl(fullName2, branch, path) {
    return `https://bitbucket.org/${fullName2}/src/${encodeURIComponent(branch)}/${encodePath2(path)}`;
  }
};
var OtherHost = class extends GitHost {
  constructor(connection, deps) {
    super(deps);
    this.connection = connection;
    this.id = "other";
    this.name = "the server";
  }
  async fetchAccount() {
    const login = this.connection.username || "vault";
    return { login, name: login };
  }
  async repos() {
    return [];
  }
  async repo(url) {
    var _a;
    const checked = await this.check(url);
    return {
      fullName: url,
      private: true,
      defaultBranch: (_a = checked.defaultBranch) != null ? _a : "main",
      canPush: checked.canPush,
      empty: checked.empty
    };
  }
  async tokenUrl() {
    return null;
  }
  cloneUrl(url) {
    return url.replace(/\/+$/, "");
  }
  gitLogin() {
    const password = this.deps.token();
    return password !== null || this.connection.username ? { username: this.connection.username, password: password != null ? password : "" } : null;
  }
  fileUrl() {
    return null;
  }
};

// src/settings.ts
var import_obsidian4 = require("obsidian");
function parseSettings(saved) {
  const { syncAfterEdit, checkInterval, conflicts } = Object.assign({}, DEFAULT_SETTINGS, saved);
  return {
    syncAfterEdit,
    checkInterval,
    conflicts: conflicts === "newest" ? "newest" : "keep-both"
  };
}
var DEFAULT_SETTINGS = {
  syncAfterEdit: 30,
  checkInterval: 60,
  conflicts: "keep-both"
};
function defaultDeviceName() {
  if (import_obsidian4.Platform.isIosApp) return import_obsidian4.Platform.isTablet ? "iPad" : "iPhone";
  if (import_obsidian4.Platform.isAndroidApp) return import_obsidian4.Platform.isTablet ? "Android tablet" : "Android phone";
  if (import_obsidian4.Platform.isMacOS) return "Mac";
  return import_obsidian4.Platform.isWin ? "Windows PC" : "Linux PC";
}
var SYNC_AFTER_EDIT = {
  "10s": "10 seconds",
  "30s": "30 seconds",
  "60s": "1 minute",
  "300s": "5 minutes",
  "0s": "Only when I ask"
};
var CHECK_INTERVAL = {
  "30s": "30 seconds",
  "60s": "1 minute",
  "300s": "5 minutes",
  "900s": "15 minutes",
  "0s": "Only when I ask"
};
var CONFLICTS = {
  "keep-both": "Keep both, marked",
  newest: "Keep the newer version"
};
var TOKEN_HELP = {
  github: [
    "A fine-grained token with the ",
    "Read and write",
    " permission on ",
    "Contents",
    ", under ",
    "Repositories",
    ". The button opens GitHub's form with this already filled in."
  ],
  gitlab: [
    "A personal access token with the scopes ",
    "read_api",
    " and ",
    "write_repository",
    ". The button opens GitLab's form with these already filled in."
  ],
  bitbucket: [
    "An API token with scopes, for the Bitbucket app: ",
    "read:user:bitbucket",
    ", ",
    "read:workspace:bitbucket",
    ", ",
    "read:repository:bitbucket",
    " and ",
    "write:repository:bitbucket",
    ". The button opens Atlassian's token page: choose ",
    "Create API token with scopes",
    "."
  ],
  forgejo: [
    "An access token with ",
    "Read and write",
    " on ",
    "repository",
    " and ",
    "Read",
    " on ",
    "user",
    ". The button opens the server's token form, filled in where the server allows it."
  ]
};
var TOKEN_PLACEHOLDER = {
  github: "github_pat_...",
  gitlab: "glpat-...",
  bitbucket: "ATATT...",
  forgejo: "",
  other: ""
};
function whereOf(device) {
  const hostOf2 = (url) => {
    try {
      return new URL(url).host;
    } catch (e) {
      return url;
    }
  };
  switch (device.provider) {
    case "github":
      return "GitHub";
    case "bitbucket":
      return "Bitbucket";
    case "gitlab":
      return device.server ? `GitLab at ${hostOf2(device.server)}` : "GitLab";
    case "forgejo":
      return device.server && hostOf2(device.server) !== "codeberg.org" ? hostOf2(device.server) : "Codeberg";
    case "other":
      return device.repo ? hostOf2(device.repo) : "another git server";
  }
}
var EasyGitSyncSettingTab = class extends import_obsidian4.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.connectionSetting = null;
    // the draft's fields are shown; leaving the settings folds them away, keeping what was typed
    this.draftOpen = false;
    // a token's access can grow without the token changing, so showing the fields asks again
    this.revalidate = true;
    this.tokenSetting = null;
    this.accountLine = null;
    this.chooseButton = null;
    this.repoSetting = null;
    this.commitButton = null;
    this.hintEl = null;
    // a slow failing check must not overwrite a newer result
    this.checkId = 0;
  }
  getSettingDefinitions() {
    const plugin = this.plugin;
    const host = plugin.host;
    if (!plugin.device.started) plugin.beginDraft();
    return [
      {
        type: "group",
        heading: "Connection",
        items: [
          {
            name: "Connection",
            aliases: ["Sync now", "Change connection", "Repository", "Account"],
            render: (setting) => this.renderConnection(setting)
          },
          ...this.draftItems()
        ]
      },
      {
        type: "group",
        heading: "Syncing",
        items: [
          {
            name: "Sync after editing",
            desc: "How long after you stop typing to upload changes.",
            control: { type: "dropdown", key: "syncAfterEdit", options: SYNC_AFTER_EDIT }
          },
          {
            name: "Check for changes",
            desc: "How often to look for changes from other devices. It also looks on startup and when you return to Obsidian.",
            control: { type: "dropdown", key: "checkInterval", options: CHECK_INTERVAL }
          },
          {
            name: "Merge conflicts",
            desc: `When a note changed in the same place on two devices. Changes in different places always merge, and the version not kept stays in ${host.name}'s history.`,
            control: { type: "dropdown", key: "conflicts", options: CONFLICTS }
          },
          {
            name: "Resolve all conflicts",
            visible: () => plugin.conflictCount() > 0,
            render: (setting) => this.renderResolve(setting)
          }
        ]
      },
      {
        type: "group",
        heading: "This device",
        items: [
          {
            name: "This device's name",
            desc: "Used in commits and conflict blocks.",
            control: { type: "text", key: "deviceName" }
          },
          {
            name: "Disconnect this device",
            visible: () => plugin.device.started || plugin.hasToken(),
            render: (setting) => this.renderDisconnect(setting)
          }
        ]
      }
    ];
  }
  // the dropdowns hold "30s" for 30, and the device name lives in device settings
  getControlValue(key) {
    const { settings, device } = this.plugin;
    switch (key) {
      case "syncAfterEdit":
      case "checkInterval":
        return `${settings[key]}s`;
      case "deviceName":
        return device.deviceName;
      default:
        return settings[key];
    }
  }
  async setControlValue(key, value) {
    const plugin = this.plugin;
    switch (key) {
      case "syncAfterEdit":
      case "checkInterval":
        plugin.settings[key] = Number.parseInt(String(value), 10) || 0;
        break;
      case "conflicts":
        plugin.settings.conflicts = value === "newest" ? "newest" : "keep-both";
        break;
      case "deviceName":
        plugin.device.deviceName = String(value).trim() || defaultDeviceName();
        plugin.saveDevice();
        return;
      default:
        return;
    }
    await plugin.saveSettings();
    if (key === "checkInterval") plugin.reschedule();
  }
  hide() {
    const folding = this.draftOpen;
    this.draftOpen = false;
    this.revalidate = true;
    super.hide();
    if (folding) this.update();
  }
  renderConnection(setting) {
    const plugin = this.plugin;
    this.connectionSetting = setting;
    if (plugin.device.started) {
      setting.addButton(
        (button) => button.setButtonText(this.draftOpen && plugin.draft ? "Cancel change" : "Change connection").onClick(() => {
          if (this.draftOpen && plugin.draft) {
            plugin.cancelDraft();
            this.draftOpen = false;
          } else {
            plugin.beginDraft();
            this.draftOpen = true;
            this.revalidate = true;
          }
          this.update();
        })
      ).addButton(
        (button) => button.setButtonText("Sync now").onClick(() => void plugin.syncNow("manual"))
      );
    }
    this.refreshConnection();
    void plugin.refreshAccount();
  }
  // what this device syncs with right now; redrawn on every status change while it is shown
  refreshConnection() {
    const row = this.connectionSetting;
    if (!(row == null ? void 0 : row.settingEl.isConnected)) return;
    const plugin = this.plugin;
    const device = plugin.device;
    row.nameEl.empty();
    row.nameEl.createSpan({ cls: `easy-git-sync-dot is-${plugin.health()}` });
    row.nameEl.appendText(device.started ? `Connected to ${plugin.repoLabel}` : "Not connected");
    row.descEl.empty();
    if (!device.started) {
      row.descEl.setText(
        plugin.otherGitPluginEnabled() ? "Turn off the Git plugin on this device first: two plugins syncing one vault would fight." : "Fill in the connection below to start syncing."
      );
      return;
    }
    const login = device.provider === "other" ? device.username : device.account ? `@${device.account}` : "";
    row.descEl.createDiv({
      text: `On ${whereOf(device)}${login ? ` as ${login}` : ""}, branch ${device.branch}.`
    });
    row.descEl.createDiv({ text: plugin.statusDescription() });
  }
  renderResolve(setting) {
    const plugin = this.plugin;
    const conflicts = plugin.conflictCount();
    setting.setDesc(
      conflicts === 1 ? "1 note still has a conflict. Keep the newer version in it." : `${conflicts} notes still have a conflict. Keep the newer version in every one of them.`
    ).addButton(
      (button) => button.setButtonText("Keep newer").onClick(async () => {
        await plugin.resolveAllNewer();
        this.update();
      })
    );
  }
  renderDisconnect(setting) {
    const plugin = this.plugin;
    const login = plugin.device.provider === "other" ? "password" : "token";
    setting.setDesc(
      `Forgets the ${login} and repository here. Your notes are not touched, and reconnecting to the same repository picks up where it left off.`
    ).addButton(
      (button) => button.setButtonText("Disconnect").setDestructive().onClick(async () => {
        const ok = await confirm(
          this.app,
          "Disconnect this device?",
          [
            plugin.device.started ? `This device stops syncing with ${plugin.repoLabel} and forgets its ${login}. Your notes are not touched, and reconnecting to it later picks up where it left off.` : `This device forgets its ${login}. Your notes are not touched.`
          ],
          "Disconnect",
          true
        );
        if (!ok) return;
        await plugin.disconnect();
        new import_obsidian4.Notice("Easy Git Sync: this device is disconnected.");
        this.update();
      })
    );
  }
  // built from the draft as it is now; a change to its shape (provider, server) calls update()
  draftItems() {
    const plugin = this.plugin;
    const draft = plugin.draft;
    if (!draft || !(this.draftOpen || !plugin.device.started)) return [];
    const items = [
      {
        name: "Provider",
        desc: "Where the repository is.",
        render: (setting) => this.renderProvider(setting, draft)
      }
    ];
    if (draft.provider === "gitlab" || draft.provider === "forgejo") {
      items.push({
        name: "Server",
        desc: draft.provider === "gitlab" ? "Empty for gitlab.com, or the address of your own GitLab." : "Empty for codeberg.org, or the address of your Forgejo or Gitea server.",
        render: (setting) => this.renderServer(setting, draft)
      });
    }
    if (draft.provider === "other") {
      items.push(
        {
          name: "Username",
          desc: "The login for the repository.",
          render: (setting) => this.renderUsername(setting, draft)
        },
        {
          name: "Password",
          render: (setting) => this.renderPassword(setting, draft)
        },
        {
          name: "Repository",
          render: (setting) => this.renderAddress(setting, draft)
        }
      );
    } else {
      items.push(
        {
          name: "Access token",
          render: (setting) => this.renderToken(setting, draft)
        },
        {
          name: "Repository",
          render: (setting) => this.renderRepository(setting, draft)
        }
      );
    }
    items.push({
      name: "",
      searchable: false,
      render: (setting) => this.renderCommit(setting)
    });
    return items;
  }
  renderProvider(setting, draft) {
    const plugin = this.plugin;
    setting.addDropdown(
      (dropdown) => dropdown.addOptions(PROVIDERS).setValue(draft.provider).onChange((value) => {
        plugin.setDraftConnection({ provider: value, server: "", username: "" });
        this.update();
      })
    );
  }
  renderServer(setting, draft) {
    var _a;
    const plugin = this.plugin;
    const fallback = (_a = DEFAULT_SERVERS[draft.provider]) != null ? _a : "";
    setting.addText((text) => {
      text.setPlaceholder(fallback.replace(/^https:\/\//, "")).setValue(draft.server);
      text.inputEl.addEventListener("change", () => {
        const value = text.getValue().trim();
        const server = value && normalizeServer(value) !== fallback ? normalizeServer(value) : "";
        plugin.setDraftConnection({ server });
        this.update();
      });
    });
  }
  renderToken(setting, draft) {
    const plugin = this.plugin;
    const host = plugin.draftHost();
    if (!host) return;
    const help = TOKEN_HELP[host.id];
    setting.setDesc(
      createFragment((desc) => {
        help.forEach((part, i) => {
          if (i % 2 === 1) desc.createEl("code", { text: part });
          else desc.appendText(part);
        });
      })
    ).addText((text) => {
      text.inputEl.type = "password";
      text.inputEl.autocomplete = "off";
      if (draft.token) text.setValue(draft.token);
      text.setPlaceholder(TOKEN_PLACEHOLDER[host.id]).onChange((value) => this.onLoginTyped(value, true));
    }).addButton(
      (button) => button.setButtonText(
        host.id === "bitbucket" ? "Create token on Atlassian" : `Create token on ${host.name}`
      ).onClick(async () => {
        const url = await host.tokenUrl();
        if (url) window.open(url);
      })
    );
    setting.settingEl.addClass("easy-git-sync-token-setting");
    this.tokenSetting = setting;
    this.accountLine = setting.descEl.createDiv();
    void this.checkAccount();
  }
  renderRepository(setting, draft) {
    const plugin = this.plugin;
    this.repoSetting = setting;
    setting.setDesc(
      draft.repo ? `${draft.repo}, branch ${draft.branch}.` : "The repository this vault syncs with. It can be empty or already hold the vault."
    ).addButton((button) => {
      this.chooseButton = button;
      button.setButtonText(draft.repo ? "Change" : "Choose").onClick(() => {
        var _a, _b, _c;
        const fresh = (_a = plugin.draftLookup(6e4)) == null ? void 0 : _a.then((found) => found.repos);
        if (!fresh) return;
        const cached = (_c = (_b = plugin.peekDraftLookup()) == null ? void 0 : _b.repos) != null ? _c : null;
        new RepoPickerModal(this.app, cached, fresh, async (fullName2) => {
          if (await plugin.pickDraftRepo(fullName2)) this.update();
        }).open();
      });
    });
  }
  // another git server: its address and a login, and no account to list repositories from
  renderUsername(setting, draft) {
    const plugin = this.plugin;
    setting.addText((text) => {
      text.setValue(draft.username);
      text.inputEl.autocomplete = "off";
      text.inputEl.addEventListener("change", () => {
        plugin.setDraftConnection({ username: text.getValue().trim() });
        this.update();
      });
    });
  }
  renderPassword(setting, draft) {
    setting.setDesc(
      "Its password, or an access token if the server issues them. Kept in this device's keychain, never synced."
    ).addText((text) => {
      text.inputEl.type = "password";
      text.inputEl.autocomplete = "off";
      if (draft.token) text.setValue(draft.token);
      text.onChange((value) => this.onLoginTyped(value, false));
    });
    this.accountLine = setting.descEl.createDiv();
    this.showPasswordLine();
  }
  renderAddress(setting, draft) {
    const plugin = this.plugin;
    setting.setDesc(
      draft.repo && draft.checked ? `${draft.repo}, branch ${draft.branch}.` : "Its address over HTTPS, as you would clone it. SSH addresses cannot work: phones cannot use SSH."
    ).addText((text) => {
      var _a;
      text.setPlaceholder("https://git.example.com/me/vault.git").setValue((_a = draft.repo) != null ? _a : "");
      text.onChange((value) => {
        const current = plugin.draft;
        if (!current) return;
        const url = value.trim();
        if (url === current.repo) return;
        current.repo = url || null;
        current.checked = false;
        this.refreshDraft();
      });
    });
  }
  renderCommit(setting) {
    const plugin = this.plugin;
    setting.settingEl.addClass("easy-git-sync-draft-footer");
    this.hintEl = setting.descEl;
    setting.addButton((button) => {
      this.commitButton = button;
      button.setCta().onClick(async () => {
        var _a;
        const current = plugin.draft;
        if ((current == null ? void 0 : current.provider) === "other" && !/^https?:\/\//i.test((_a = current.repo) != null ? _a : "")) {
          new import_obsidian4.Notice("Easy Git Sync: enter the repository's address, starting with https://.");
          return;
        }
        button.setDisabled(true);
        await plugin.commitDraft();
        this.update();
      });
    });
    this.refreshDraft();
  }
  // the parts that follow what is typed, without redrawing the field being typed in
  refreshDraft() {
    var _a, _b, _c;
    const plugin = this.plugin;
    const draft = plugin.draft;
    if (!draft) return;
    const login = plugin.draftHasLogin();
    const change = plugin.draftChange();
    const word = draft.provider === "other" ? "login" : "token";
    (_a = this.chooseButton) == null ? void 0 : _a.setDisabled(!login);
    (_b = this.commitButton) == null ? void 0 : _b.setButtonText(change === "login" ? `Save ${word}` : "Start syncing").setDisabled(!login || !draft.repo || change === "none");
    const live = `${plugin.repoLabel} on ${plugin.host.name}`;
    let hint;
    if (!plugin.device.started) {
      hint = "Start syncing shows what will happen before anything syncs.";
    } else if (change === "none") {
      hint = `Nothing changed yet. This device keeps syncing with ${live}.`;
    } else if (change === "login") {
      hint = `Keeps syncing with ${live} and its sync history, with the new ${word}.`;
    } else {
      hint = `This device keeps syncing with ${live} until you press Start syncing. That compares this vault with the new repository first, and its sync history starts over.`;
    }
    (_c = this.hintEl) == null ? void 0 : _c.setText(hint);
  }
  // held in the draft until committed, so a wrong paste never replaces the working token
  onLoginTyped(value, trim) {
    window.clearTimeout(this.tokenTimer);
    this.tokenTimer = window.setTimeout(() => {
      const draft = this.plugin.draft;
      if (!draft) return;
      const token = trim ? value.trim() : value;
      draft.token = token || null;
      if (draft.provider === "other") this.showPasswordLine();
      else void this.checkAccount();
      this.refreshDraft();
    }, 600);
  }
  showPasswordLine() {
    var _a;
    const line = this.accountLine;
    if (!line) return;
    const plugin = this.plugin;
    line.setText(
      ((_a = plugin.draft) == null ? void 0 : _a.token) ? "A new password is entered. It is saved when you press the button below." : plugin.draftSavedToken() ? "A password is saved." : ""
    );
  }
  async checkAccount() {
    const line = this.accountLine;
    const setting = this.tokenSetting;
    const plugin = this.plugin;
    const draft = plugin.draft;
    if (!line || !setting || !draft || !plugin.draftHost()) return;
    setting.setErrorMessage(null);
    if (!plugin.draftHasLogin()) {
      line.setText("");
      return;
    }
    const typed = draft.token !== null;
    const id = ++this.checkId;
    const maxAge = this.revalidate ? 0 : void 0;
    this.revalidate = false;
    const show = ({ account, repos, expiry }) => {
      const who = typed ? `The new token is for @${account.login}` : `A token is saved for @${account.login}`;
      const count = repos.filter((repo) => repo.canPush).length;
      const until = expiry ? ` It expires on ${expiry.toLocaleDateString()}.` : "";
      if (count === 0) {
        line.setText(`${who}.${until}`);
        setting.setErrorMessage("It cannot write to any repository.");
        return;
      }
      setting.setErrorMessage(null);
      line.setText(
        `${who}. ${count} ${count === 1 ? "repository" : "repositories"} available.${until}`
      );
    };
    const cached = plugin.peekDraftLookup();
    if (cached) show(cached);
    else line.setText("Checking the token...");
    try {
      const found = await plugin.draftLookup(maxAge);
      if (!found || id !== this.checkId) return;
      show(found);
      await this.prefill(found);
    } catch (error) {
      if (id !== this.checkId) return;
      line.setText("");
      setting.setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }
  // one repository the token can write to, with one branch: nothing to choose, so it is filled in
  async prefill(found) {
    var _a, _b, _c;
    const plugin = this.plugin;
    const writable = found.repos.filter((repo) => repo.canPush);
    const only = writable.length === 1 ? writable[0] : void 0;
    if (!only || ((_a = plugin.draft) == null ? void 0 : _a.repo) !== null) return;
    if (!await plugin.pickDraftRepo(only.fullName, true)) return;
    const draft = plugin.draft;
    if (!(draft == null ? void 0 : draft.repo) || !((_b = this.repoSetting) == null ? void 0 : _b.settingEl.isConnected)) return;
    this.repoSetting.setDesc(`${draft.repo}, branch ${draft.branch}.`);
    (_c = this.chooseButton) == null ? void 0 : _c.setButtonText("Change");
    this.refreshDraft();
  }
};

// src/merge/json.ts
function mergeJson(base, local, remote, canvas, prefer) {
  const b = base === null ? void 0 : parse(base);
  const l = parse(local);
  const r = parse(remote);
  if (l === void 0 || r === void 0) return null;
  const state = { conflicts: 0, prefer };
  let merged;
  if (canvas && isObject(l) && isObject(r)) {
    const bObj = isObject(b) ? b : {};
    const out = {};
    for (const key of keysOf(l, r)) {
      if (key === "nodes" || key === "edges") {
        const items = mergeItems(
          arrayOf(bObj[key]),
          arrayOf(l[key]),
          arrayOf(r[key]),
          key === "nodes",
          state
        );
        out[key] = items;
      } else {
        const value = merge3(bObj[key], l[key], r[key], state);
        if (value !== void 0) out[key] = value;
      }
    }
    merged = out;
  } else {
    merged = merge3(b, l, r, state);
  }
  if (merged === void 0) merged = l;
  return { text: stringify(merged, local), conflicts: state.conflicts };
}
function parse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return void 0;
  }
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}
function keysOf(first, second) {
  const keys = Object.keys(first);
  for (const key of Object.keys(second)) if (!(key in first)) keys.push(key);
  return keys;
}
function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function merge3(base, local, remote, state) {
  if (same(local, remote)) return local;
  if (same(local, base)) return remote;
  if (same(remote, base)) return local;
  if (local === void 0) return remote;
  if (remote === void 0) return local;
  if (isObject(local) && isObject(remote)) {
    const b = isObject(base) ? base : {};
    const out = {};
    for (const key of keysOf(local, remote)) {
      const value = merge3(b[key], local[key], remote[key], state);
      if (value !== void 0) out[key] = value;
    }
    return out;
  }
  state.conflicts++;
  return state.prefer === "remote" ? remote : local;
}
function idOf(item) {
  return isObject(item) && typeof item.id === "string" ? item.id : null;
}
function mergeItems(base, local, remote, nodes, state) {
  const byId = (items) => {
    const map = /* @__PURE__ */ new Map();
    for (const item of items) {
      const id = idOf(item);
      if (id !== null) map.set(id, item);
    }
    return map;
  };
  const b = byId(base);
  const l = byId(local);
  const r = byId(remote);
  const taken = /* @__PURE__ */ new Set([...l.keys(), ...r.keys()]);
  const out = [];
  const extra = [];
  for (const item of local) {
    const id = idOf(item);
    if (id === null) {
      out.push(item);
      continue;
    }
    const inner = { conflicts: 0, prefer: state.prefer };
    const merged = merge3(b.get(id), item, r.get(id), inner);
    if (merged === void 0) continue;
    out.push(merged);
    const other = r.get(id);
    if (inner.conflicts > 0 && other !== void 0 && nodes && !state.prefer) {
      state.conflicts++;
      extra.push(conflictCopy(other, id, taken));
    } else {
      state.conflicts += inner.conflicts;
    }
  }
  for (const item of remote) {
    const id = idOf(item);
    if (id === null) {
      if (!local.some((x) => same(x, item))) out.push(item);
      continue;
    }
    if (l.has(id)) continue;
    const merged = merge3(b.get(id), void 0, item, state);
    if (merged !== void 0) out.push(merged);
  }
  return [...out, ...extra];
}
function conflictCopy(node, id, taken) {
  let copyId = `${id}-conflict`;
  for (let n = 2; taken.has(copyId); n++) copyId = `${id}-conflict-${n}`;
  taken.add(copyId);
  const copy = isObject(node) ? { ...node } : {};
  copy.id = copyId;
  if (typeof copy.x === "number") copy.x += 40;
  if (typeof copy.y === "number") copy.y += 40;
  copy.color = "1";
  return copy;
}
function stringify(value, like) {
  var _a;
  const indent = (_a = /^[[{]\r?\n([ \t]+)/.exec(like)) == null ? void 0 : _a[1];
  const eol = like.includes("\r\n") ? "\r\n" : "\n";
  let text = indent === void 0 ? JSON.stringify(value) : JSON.stringify(value, null, indent);
  if (eol === "\r\n") text = text.replace(/\n/g, "\r\n");
  return like.endsWith("\n") ? text + eol : text;
}

// node_modules/node-diff3/dist/diff3.mjs
function LCS(buffer1, buffer2) {
  let equivalenceClasses = /* @__PURE__ */ Object.create(null);
  for (let j = 0; j < buffer2.length; j++) {
    const item = buffer2[j];
    if (equivalenceClasses[item]) {
      equivalenceClasses[item].push(j);
    } else {
      equivalenceClasses[item] = [j];
    }
  }
  const NULLRESULT = { buffer1index: -1, buffer2index: -1, chain: null };
  let candidates = [NULLRESULT];
  for (let i = 0; i < buffer1.length; i++) {
    const item = buffer1[i];
    const buffer2indices = equivalenceClasses[item] || [];
    let r = 0;
    let c = candidates[0];
    for (const j of buffer2indices) {
      let s;
      for (s = r; s < candidates.length; s++) {
        if (candidates[s].buffer2index < j && (s === candidates.length - 1 || candidates[s + 1].buffer2index > j)) {
          break;
        }
      }
      if (s < candidates.length) {
        const newCandidate = { buffer1index: i, buffer2index: j, chain: candidates[s] };
        if (r === candidates.length) {
          candidates.push(c);
        } else {
          candidates[r] = c;
        }
        r = s + 1;
        c = newCandidate;
        if (r === candidates.length) {
          break;
        }
      }
    }
    candidates[r] = c;
  }
  return candidates[candidates.length - 1];
}
function diffComm(buffer1, buffer2) {
  const lcs = LCS(buffer1, buffer2);
  let result = [];
  let tail1 = buffer1.length;
  let tail2 = buffer2.length;
  let common = { common: [] };
  function processCommon() {
    if (common.common.length) {
      common.common.reverse();
      result.push(common);
      common = { common: [] };
    }
  }
  for (let candidate = lcs; candidate !== null; candidate = candidate.chain) {
    let different = { buffer1: [], buffer2: [] };
    while (--tail1 > candidate.buffer1index) {
      different.buffer1.push(buffer1[tail1]);
    }
    while (--tail2 > candidate.buffer2index) {
      different.buffer2.push(buffer2[tail2]);
    }
    if (different.buffer1.length || different.buffer2.length) {
      processCommon();
      different.buffer1.reverse();
      different.buffer2.reverse();
      result.push(different);
    }
    if (tail1 >= 0) {
      common.common.push(buffer1[tail1]);
    }
  }
  processCommon();
  result.reverse();
  return result;
}
function diffIndices(buffer1, buffer2) {
  const lcs = LCS(buffer1, buffer2);
  let result = [];
  let tail1 = buffer1.length;
  let tail2 = buffer2.length;
  for (let candidate = lcs; candidate !== null; candidate = candidate.chain) {
    const mismatchLength1 = tail1 - candidate.buffer1index - 1;
    const mismatchLength2 = tail2 - candidate.buffer2index - 1;
    tail1 = candidate.buffer1index;
    tail2 = candidate.buffer2index;
    if (mismatchLength1 || mismatchLength2) {
      result.push({
        buffer1: [tail1 + 1, mismatchLength1],
        buffer1Content: buffer1.slice(tail1 + 1, tail1 + 1 + mismatchLength1),
        buffer2: [tail2 + 1, mismatchLength2],
        buffer2Content: buffer2.slice(tail2 + 1, tail2 + 1 + mismatchLength2)
      });
    }
  }
  result.reverse();
  return result;
}
function diff3MergeRegions(a, o, b) {
  let hunks2 = [];
  function addHunk(h, ab) {
    hunks2.push({
      ab,
      oStart: h.buffer1[0],
      oLength: h.buffer1[1],
      abStart: h.buffer2[0],
      abLength: h.buffer2[1]
    });
  }
  diffIndices(o, a).forEach((item) => addHunk(item, "a"));
  diffIndices(o, b).forEach((item) => addHunk(item, "b"));
  hunks2.sort((x, y) => x.oStart - y.oStart);
  let results = [];
  let currOffset = 0;
  function advanceTo(endOffset) {
    if (endOffset > currOffset) {
      results.push({
        stable: true,
        buffer: "o",
        bufferStart: currOffset,
        bufferLength: endOffset - currOffset,
        bufferContent: o.slice(currOffset, endOffset)
      });
      currOffset = endOffset;
    }
  }
  while (hunks2.length) {
    let hunk = hunks2.shift();
    let regionStart = hunk.oStart;
    let regionEnd = hunk.oStart + hunk.oLength;
    let regionHunks = [hunk];
    advanceTo(regionStart);
    while (hunks2.length) {
      const nextHunk = hunks2[0];
      const nextHunkStart = nextHunk.oStart;
      if (nextHunkStart > regionEnd)
        break;
      regionEnd = Math.max(regionEnd, nextHunkStart + nextHunk.oLength);
      regionHunks.push(hunks2.shift());
    }
    if (regionHunks.length === 1) {
      if (hunk.abLength > 0) {
        const buffer = hunk.ab === "a" ? a : b;
        results.push({
          stable: true,
          buffer: hunk.ab,
          bufferStart: hunk.abStart,
          bufferLength: hunk.abLength,
          bufferContent: buffer.slice(hunk.abStart, hunk.abStart + hunk.abLength)
        });
      }
    } else {
      let bounds = {
        a: [a.length, -1, o.length, -1],
        b: [b.length, -1, o.length, -1]
      };
      while (regionHunks.length) {
        hunk = regionHunks.shift();
        const oStart = hunk.oStart;
        const oEnd = oStart + hunk.oLength;
        const abStart = hunk.abStart;
        const abEnd = abStart + hunk.abLength;
        let b2 = bounds[hunk.ab];
        b2[0] = Math.min(abStart, b2[0]);
        b2[1] = Math.max(abEnd, b2[1]);
        b2[2] = Math.min(oStart, b2[2]);
        b2[3] = Math.max(oEnd, b2[3]);
      }
      const aStart = bounds.a[0] + (regionStart - bounds.a[2]);
      const aEnd = bounds.a[1] + (regionEnd - bounds.a[3]);
      const bStart = bounds.b[0] + (regionStart - bounds.b[2]);
      const bEnd = bounds.b[1] + (regionEnd - bounds.b[3]);
      let result = {
        stable: false,
        aStart,
        aLength: aEnd - aStart,
        aContent: a.slice(aStart, aEnd),
        oStart: regionStart,
        oLength: regionEnd - regionStart,
        oContent: o.slice(regionStart, regionEnd),
        bStart,
        bLength: bEnd - bStart,
        bContent: b.slice(bStart, bEnd)
      };
      results.push(result);
    }
    currOffset = regionEnd;
  }
  advanceTo(o.length);
  return results;
}
function diff3Merge(a, o, b, options) {
  let defaults = {
    excludeFalseConflicts: true,
    stringSeparator: /\s+/
  };
  options = Object.assign(defaults, options);
  if (typeof a === "string")
    a = a.split(options.stringSeparator);
  if (typeof o === "string")
    o = o.split(options.stringSeparator);
  if (typeof b === "string")
    b = b.split(options.stringSeparator);
  let results = [];
  const regions = diff3MergeRegions(a, o, b);
  let okBuffer = [];
  function flushOk() {
    if (okBuffer.length) {
      results.push({ ok: okBuffer });
    }
    okBuffer = [];
  }
  function isFalseConflict(a2, b2) {
    if (a2.length !== b2.length)
      return false;
    for (let i = 0; i < a2.length; i++) {
      if (a2[i] !== b2[i])
        return false;
    }
    return true;
  }
  regions.forEach((region) => {
    if (region.stable) {
      okBuffer.push(...region.bufferContent);
    } else {
      if (options.excludeFalseConflicts && isFalseConflict(region.aContent, region.bContent)) {
        okBuffer.push(...region.aContent);
      } else {
        flushOk();
        results.push({
          conflict: {
            a: region.aContent,
            aIndex: region.aStart,
            o: region.oContent,
            oIndex: region.oStart,
            b: region.bContent,
            bIndex: region.bStart
          }
        });
      }
    }
  });
  flushOk();
  return results;
}

// src/merge/text.ts
function preferSide(segments, prefer) {
  const lines = [];
  let replaced = 0;
  for (const segment of segments) {
    if ("ok" in segment) {
      lines.push(...segment.ok);
      continue;
    }
    replaced++;
    lines.push(...segment.conflict[prefer]);
  }
  return { lines, replaced };
}
function mergeLines(base, local, remote) {
  const segments = [];
  if (base === null) {
    for (const part of diffComm(remote, local)) {
      if (part.common) push(segments, { ok: part.common });
      else pushDifference(segments, part.buffer1, part.buffer2, false);
    }
    return tidy(segments);
  }
  for (const region of diff3Merge(local, base, remote, { excludeFalseConflicts: true })) {
    if (region.ok) {
      push(segments, { ok: region.ok });
      continue;
    }
    const conflict = region.conflict;
    if (conflict) resplit(segments, conflict.o, conflict.b, conflict.a);
  }
  return tidy(segments);
}
function hunks(base, side) {
  return diffIndices(base, side).map((d) => ({
    start: d.buffer1[0],
    length: d.buffer1[1],
    lines: d.buffer2Content
  }));
}
function resplit(segments, base, remote, local) {
  var _a, _b;
  const all = [
    ...hunks(base, remote).map((h) => ({ ...h, side: 0 })),
    ...hunks(base, local).map((h) => ({ ...h, side: 1 }))
  ].sort((x, y) => x.start - y.start || x.length - y.length || x.side - y.side);
  const groups = [];
  for (const hunk of all) {
    const group = groups[groups.length - 1];
    if (group == null ? void 0 : group.some((h) => h.side !== hunk.side && overlaps(h, hunk))) group.push(hunk);
    else groups.push([hunk]);
  }
  let at = 0;
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const first = group == null ? void 0 : group[0];
    if (!group || !first) continue;
    const end = Math.max(...group.map((h) => h.start + h.length));
    push(segments, { ok: base.slice(at, first.start) });
    const next = (_a = groups[i + 1]) == null ? void 0 : _a[0];
    if (group.length > 1) {
      const span = base.slice(first.start, end);
      settle(
        segments,
        span,
        apply(span, first.start, group, 0),
        apply(span, first.start, group, 1)
      );
    } else if (next && ((_b = groups[i + 1]) == null ? void 0 : _b.length) === 1 && first.length === 0 && next.length === 0 && next.start === first.start) {
      push(segments, { ok: unionLines(first.lines, next.lines) });
      i++;
    } else {
      push(segments, { ok: first.lines });
    }
    at = Math.max(at, end);
  }
  push(segments, { ok: base.slice(at) });
}
function apply(span, offset, group, side) {
  const out = [];
  let at = 0;
  for (const h of group) {
    if (h.side !== side) continue;
    out.push(...span.slice(at, h.start - offset), ...h.lines);
    at = h.start - offset + h.length;
  }
  out.push(...span.slice(at));
  return out;
}
function settle(segments, base, remote, local) {
  if (onlyAdded(base, remote, local)) push(segments, { ok: unionLines(remote, local) });
  else pushDifference(segments, remote, local, true);
}
function onlyAdded(base, remote, local) {
  const fromRemote = added(base, remote);
  const fromLocal = added(base, local);
  const common = [];
  let r = 0;
  let l = 0;
  for (const part of diffComm(remote, local)) {
    if (part.common) {
      common.push(...part.common);
      r += part.common.length;
      l += part.common.length;
      continue;
    }
    for (let i = 0; i < part.buffer1.length; i++) if (!fromRemote.has(r + i)) return false;
    for (let i = 0; i < part.buffer2.length; i++) if (!fromLocal.has(l + i)) return false;
    r += part.buffer1.length;
    l += part.buffer2.length;
  }
  return hunks(base, common).every(
    (h) => filled(h.lines) >= filled(base.slice(h.start, h.start + h.length))
  );
}
function added(base, side) {
  const out = /* @__PURE__ */ new Set();
  for (const d of diffIndices(base, side)) {
    for (let i = 0; i < d.buffer2[1]; i++) out.add(d.buffer2[0] + i);
  }
  return out;
}
function filled(lines) {
  return lines.filter((line) => line.trim() !== "").length;
}
function overlaps(x, y) {
  if (x.length === 0 && y.length === 0) return false;
  if (x.length === 0) return y.start < x.start && x.start < y.start + y.length;
  if (y.length === 0) return x.start < y.start && y.start < x.start + x.length;
  return x.start < y.start + y.length && y.start < x.start + x.length;
}
function pushDifference(segments, remote, local, withBase) {
  let head = 0;
  while (head < remote.length && head < local.length && remote[head] === local[head]) head++;
  let tail = 0;
  while (tail < remote.length - head && tail < local.length - head && remote[remote.length - 1 - tail] === local[local.length - 1 - tail]) {
    tail++;
  }
  push(segments, { ok: remote.slice(0, head) });
  const r = remote.slice(head, remote.length - tail);
  const l = local.slice(head, local.length - tail);
  if (!withBase && (r.length === 0 || l.length === 0)) {
    push(segments, { ok: [...r, ...l] });
  } else if (r.length > 0 || l.length > 0) {
    segments.push({ conflict: { remote: r, local: l } });
  }
  push(segments, { ok: remote.slice(remote.length - tail) });
}
function unionLines(first, second) {
  const out = [];
  for (const part of diffComm(first, second)) {
    if (part.common) out.push(...part.common);
    else out.push(...part.buffer1, ...part.buffer2);
  }
  return out;
}
function push(segments, segment) {
  if (segment.ok.length === 0) return;
  const last = segments[segments.length - 1];
  if (last && "ok" in last) last.ok.push(...segment.ok);
  else segments.push({ ok: [...segment.ok] });
}
function tidy(segments) {
  const out = [];
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue;
    const prev = out[out.length - 1];
    const next = segments[i + 1];
    if ("ok" in segment && prev && "conflict" in prev && next && "conflict" in next && segment.ok.length <= 2 && segment.ok.every((line) => line.trim() === "")) {
      prev.conflict.remote.push(...segment.ok, ...next.conflict.remote);
      prev.conflict.local.push(...segment.ok, ...next.conflict.local);
      i++;
      continue;
    }
    out.push(segment);
  }
  return out;
}

// src/merge/markdown.ts
function mergeMarkdown(base, local, remote, labels, prefer) {
  var _a, _b, _c, _d;
  const b = base === null ? null : splitLines(base);
  const l = splitLines(local);
  const r = splitLines(remote);
  const bParts = b ? splitFrontmatter(b.lines) : null;
  const lParts = splitFrontmatter(l.lines);
  const rParts = splitFrontmatter(r.lines);
  let conflicts = 0;
  let replaced = 0;
  const out = [];
  const hasFrontmatter = lParts.frontmatter !== null || rParts.frontmatter !== null;
  const propertyBlocks = [];
  if (hasFrontmatter) {
    const merged = mergeFrontmatter(
      (_a = bParts == null ? void 0 : bParts.frontmatter) != null ? _a : bParts ? [] : null,
      (_b = lParts.frontmatter) != null ? _b : [],
      (_c = rParts.frontmatter) != null ? _c : [],
      prefer
    );
    out.push("---", ...merged.lines, "---");
    for (const conflict of merged.conflicts) {
      if (prefer) {
        replaced++;
        continue;
      }
      conflicts++;
      propertyBlocks.push(
        ...renderConflict(
          [
            { label: labels.remote, lines: conflict.remote },
            { label: labels.local, lines: conflict.local }
          ],
          conflict.key
        )
      );
    }
  }
  out.push(...propertyBlocks);
  const segments = mergeLines((_d = bParts == null ? void 0 : bParts.body) != null ? _d : null, lParts.body, rParts.body);
  if (prefer) {
    const settled = preferSide(segments, prefer);
    out.push(...settled.lines);
    replaced += settled.replaced;
  } else {
    for (const segment of segments) {
      if ("ok" in segment) {
        out.push(...segment.ok);
        continue;
      }
      conflicts++;
      out.push(
        ...renderConflict([
          { label: labels.remote, lines: segment.conflict.remote },
          { label: labels.local, lines: segment.conflict.local }
        ])
      );
    }
  }
  return {
    text: joinLines({ lines: out, eol: l.eol, finalNewline: finalNewline(b, l, r) }),
    conflicts,
    replaced
  };
}
function finalNewline(base, local, remote) {
  if (base === null) return local.finalNewline || remote.finalNewline;
  return local.finalNewline === base.finalNewline ? remote.finalNewline : local.finalNewline;
}
function mergePlainText(base, local, remote, prefer) {
  var _a;
  const b = base === null ? null : splitLines(base);
  const l = splitLines(local);
  const r = splitLines(remote);
  const segments = mergeLines((_a = b == null ? void 0 : b.lines) != null ? _a : null, l.lines, r.lines);
  if (!prefer && segments.some((segment) => "conflict" in segment)) return null;
  const { lines, replaced } = preferSide(segments, prefer != null ? prefer : "local");
  return {
    text: joinLines({ lines, eol: l.eol, finalNewline: finalNewline(b, l, r) }),
    replaced
  };
}

// src/merge/file.ts
function mergeFile(path, base, local, remote, labels, prefer) {
  const l = decodeText(local);
  const r = decodeText(remote);
  if (l === null || r === null)
    return prefer ? { kind: "take", side: prefer } : { kind: "keep-both" };
  const b = base === null ? null : decodeText(base);
  const ext = extension(path);
  if (ext === "md") {
    const merged2 = mergeMarkdown(b, l, r, labels, prefer);
    return {
      kind: "merged",
      bytes: encodeUtf8(merged2.text),
      conflicts: merged2.conflicts,
      replaced: merged2.replaced
    };
  }
  if (ext === "json" || ext === "canvas") {
    const canvas = ext === "canvas";
    const merged2 = mergeJson(b, l, r, canvas, canvas ? prefer : void 0);
    if (merged2) {
      const bytes = encodeUtf8(merged2.text);
      if (!canvas) return { kind: "merged", bytes, conflicts: 0, replaced: 0 };
      return prefer ? { kind: "merged", bytes, conflicts: 0, replaced: merged2.conflicts } : { kind: "merged", bytes, conflicts: merged2.conflicts, replaced: 0 };
    }
  }
  const merged = mergePlainText(b, l, r, prefer);
  if (merged !== null) {
    return {
      kind: "merged",
      bytes: encodeUtf8(merged.text),
      conflicts: 0,
      replaced: merged.replaced
    };
  }
  return { kind: "keep-both" };
}
function extension(path) {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot <= 0 ? "" : name.slice(dot + 1).toLowerCase();
}

// src/merge/similarity.ts
function similarity(a, b) {
  const left = a.split("\n");
  const right = b.split("\n");
  let common = 0;
  for (const part of diffComm(left, right)) {
    if (part.common) common += part.common.length;
  }
  return common / Math.max(left.length, right.length, 1);
}
var RENAME_SIMILARITY = 0.5;

// src/sync/ignore.ts
var import_ignore = __toESM(require_ignore(), 1);
var GitIgnore = class {
  constructor() {
    this.rules = /* @__PURE__ */ new Map();
    this.exclude = null;
  }
  add(dir, content) {
    this.rules.set(dir, (0, import_ignore.default)().add(content));
  }
  addExclude(content) {
    this.exclude = (0, import_ignore.default)().add(content);
  }
  ignores(path, isDir) {
    let ignored = false;
    if (this.exclude) ignored = this.exclude.ignores(path + (isDir ? "/" : ""));
    const parts = path.split("/");
    for (let depth = 0; depth < parts.length; depth++) {
      const dir = parts.slice(0, depth).join("/");
      const rules = this.rules.get(dir);
      if (!rules) continue;
      const rel = parts.slice(depth).join("/") + (isDir ? "/" : "");
      const result = rules.test(rel);
      if (result.ignored) ignored = true;
      else if (result.unignored) ignored = false;
    }
    return ignored;
  }
};
function isHardExcluded(path, stateFile) {
  const kept = `${stateFile.slice(0, stateFile.lastIndexOf("/") + 1)}kept`;
  return path === ".git" || path.startsWith(".git/") || path === ".trash" || path.startsWith(".trash/") || path === stateFile || path === `${stateFile}.tmp` || path === kept || path.startsWith(`${kept}/`) || ICLOUD_PLACEHOLDER.test(path);
}
var ICLOUD_PLACEHOLDER = /(?:^|\/)\.[^/]+\.icloud$/;
function defaultGitignore(configDir) {
  return [
    "# window layout, per device and changed on every click",
    `${configDir}/workspace.json`,
    `${configDir}/workspace-mobile.json`,
    "",
    "# which plugins are on is per device: a phone turns off desktop-only plugins,",
    "# and synced, that would turn them off on the desktop too",
    `${configDir}/community-plugins.json`,
    "",
    ".trash/",
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
    ""
  ].join("\n");
}

// src/sync/plan.ts
function renameCandidates(base, local, remote) {
  const out = [];
  const ext = (path) => path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  for (const [from, sha] of base) {
    const r = remote.get(from);
    const l = local.get(from);
    if (l === void 0 && r !== void 0 && r !== sha) {
      for (const [to, s] of local) {
        if (s !== sha && !base.has(to) && !remote.has(to) && ext(to) === ext(from)) {
          out.push({ from, to, side: "local" });
        }
      }
    }
    if (r === void 0 && l !== void 0 && l !== sha) {
      for (const [to, s] of remote) {
        if (s !== sha && !base.has(to) && !local.has(to) && ext(to) === ext(from)) {
          out.push({ from, to, side: "remote" });
        }
      }
    }
  }
  return out;
}
function plan(base, local, remote, renames = []) {
  const actions = [];
  const handled = /* @__PURE__ */ new Set();
  for (const [from, sha] of base) {
    if (!local.has(from)) {
      const r = remote.get(from);
      if (r !== void 0 && r !== sha) {
        const to = renamedTo(sha, local, base, remote, handled);
        if (to !== null) {
          actions.push({ kind: "pull-renamed", from, to, sha: r, localSha: sha });
          handled.add(from).add(to);
          continue;
        }
      }
    }
    if (!remote.has(from)) {
      const l = local.get(from);
      if (l !== void 0 && l !== sha) {
        const to = renamedTo(sha, remote, base, local, handled);
        if (to !== null) {
          actions.push({ kind: "push-renamed", from, to, localSha: l });
          handled.add(from).add(to);
        }
      }
    }
  }
  for (const { from, to, side } of renames) {
    if (handled.has(from) || handled.has(to)) continue;
    const b = base.get(from);
    const l = local.get(side === "local" ? to : from);
    const r = remote.get(side === "local" ? from : to);
    if (b === void 0 || l === void 0 || r === void 0) continue;
    actions.push({
      kind: "merge-renamed",
      from,
      to,
      renamedOn: side,
      base: b,
      local: l,
      remote: r
    });
    handled.add(from).add(to);
  }
  const paths = /* @__PURE__ */ new Set([...base.keys(), ...local.keys(), ...remote.keys()]);
  for (const path of [...paths].sort()) {
    if (handled.has(path)) continue;
    const action = decide(path, base.get(path), local.get(path), remote.get(path));
    if (action) actions.push(action);
  }
  return actions;
}
function planReplace(local, remote, keep, merges) {
  const actions = [];
  const paths = /* @__PURE__ */ new Set([...local.keys(), ...remote.keys()]);
  for (const path of [...paths].sort()) {
    const l = local.get(path);
    const r = remote.get(path);
    if (l === r) continue;
    if (merges(path)) {
      const action = decide(path, void 0, l, r);
      if (action) actions.push(action);
      continue;
    }
    if (keep === "local") {
      if (l !== void 0) actions.push({ kind: "push", path });
      else actions.push({ kind: "delete-remote", path });
    } else if (r === void 0) {
      if (l !== void 0) actions.push({ kind: "delete-local", path, sha: l });
    } else if (l === void 0) {
      actions.push({ kind: "pull", path, sha: r });
    } else {
      actions.push({ kind: "replace-local", path, sha: r, local: l });
    }
  }
  return actions;
}
function renamedTo(sha, side, base, other, handled) {
  for (const [path, s] of side) {
    if (s === sha && !base.has(path) && !other.has(path) && !handled.has(path)) return path;
  }
  return null;
}
function decide(path, b, l, r) {
  if (l === r) return null;
  if (b === void 0) {
    if (l === void 0 && r !== void 0) return { kind: "pull", path, sha: r };
    if (r === void 0) return { kind: "push", path };
    if (l === void 0) return null;
    return { kind: "merge", path, base: null, local: l, remote: r };
  }
  if (l === b) {
    if (r === void 0) return { kind: "delete-local", path, sha: b };
    return { kind: "pull", path, sha: r };
  }
  if (r === b) {
    if (l === void 0) return { kind: "delete-remote", path };
    return { kind: "push", path };
  }
  if (l === void 0) return r === void 0 ? null : { kind: "restore", path, sha: r };
  if (r === void 0) return { kind: "resurrect", path };
  return { kind: "merge", path, base: b, local: l, remote: r };
}

// src/sync/scan.ts
async function scanLocal(fs, cache, tracked, stateFile, fallbackIgnores = /* @__PURE__ */ new Map()) {
  const trackedDirs = /* @__PURE__ */ new Set();
  const byLower = /* @__PURE__ */ new Map();
  for (const path of tracked) {
    byLower.set(path.toLowerCase(), path);
    for (let i = path.indexOf("/"); i !== -1; i = path.indexOf("/", i + 1)) {
      trackedDirs.add(path.slice(0, i).toLowerCase());
    }
  }
  const ignore2 = new GitIgnore();
  try {
    const exclude = decodeText(await fs.read(".git/info/exclude"));
    if (exclude !== null) ignore2.addExclude(exclude);
  } catch (e) {
  }
  const found = /* @__PURE__ */ new Map();
  const nextCache = {};
  const listing = limit(8);
  const reading = limit(4);
  const walk = async (dir, ignored) => {
    const entries = await listing(() => fs.listDir(dir));
    const gitignorePath = dir === "" ? ".gitignore" : `${dir}/.gitignore`;
    if (entries.files.some((f) => f.path === gitignorePath)) {
      const text = decodeText(await reading(() => fs.read(gitignorePath)));
      if (text !== null) ignore2.add(dir, text);
    } else {
      const fallback = fallbackIgnores.get(dir);
      if (fallback !== void 0) ignore2.add(dir, fallback);
    }
    const files2 = entries.files.map(async (file) => {
      var _a;
      if (isHardExcluded(file.path, stateFile)) return;
      const canonical = tracked.has(file.path) ? file.path : (_a = byLower.get(file.path.toLowerCase())) != null ? _a : file.path;
      if (!tracked.has(canonical) && (ignored || ignore2.ignores(file.path, false))) return;
      const cached = cache[file.path];
      let sha;
      if (cached && cached.mtime === file.mtime && cached.size === file.size) {
        sha = cached.sha;
      } else {
        sha = await reading(async () => gitBlobSha(await fs.read(file.path)));
      }
      nextCache[file.path] = { mtime: file.mtime, size: file.size, sha };
      if (found.has(canonical)) return;
      found.set(canonical, {
        path: canonical,
        actual: file.path,
        sha,
        mtime: file.mtime,
        size: file.size
      });
    });
    const folders = entries.folders.map(async (folder) => {
      if (isHardExcluded(folder, stateFile)) return;
      const ignoredHere = ignored || ignore2.ignores(folder, true);
      if (ignoredHere && !trackedDirs.has(folder.toLowerCase())) return;
      await walk(folder, ignoredHere);
    });
    await Promise.all([...files2, ...folders]);
  };
  await walk("", false);
  const files = new Map([...found].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return { files, cache: nextCache };
}
function limit(size) {
  let active = 0;
  const waiting = [];
  return async (task) => {
    if (active < size) active++;
    else await new Promise((resolve) => waiting.push(resolve));
    try {
      return await task();
    } finally {
      const next = waiting.shift();
      if (next) next();
      else active--;
    }
  };
}

// src/sync/engine.ts
var MassDeleteError = class extends Error {
  constructor(here, there, where = "GitHub") {
    super(`This sync would delete ${here} files here and ${there} on ${where}.`);
    this.here = here;
    this.there = there;
  }
};
var MAX_FILE_SIZE = 100 * 1024 * 1024;
var MAX_ATTEMPTS = 5;
async function sync(initial, options) {
  var _a, _b, _c, _d, _e, _f, _g;
  const { fs, remote } = options;
  const now = (_a = options.now) != null ? _a : (() => /* @__PURE__ */ new Date());
  const report = emptyReport();
  const name = remoteName(options);
  let state = initial;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const head = await remote.head();
    if (head === null) {
      await initialize(options);
      report.initialized = true;
      continue;
    }
    (_b = options.progress) == null ? void 0 : _b.call(options, `Checking ${name}`);
    const { tree, files: remoteFiles } = await readRemote(remote, state, head, options, report);
    const first = state.commit === null;
    const firstSync = first ? (_c = options.firstSync) != null ? _c : "merge" : "merge";
    const tracked = /* @__PURE__ */ new Set([...Object.keys(state.base), ...remoteFiles.keys()]);
    const ignores = first ? await remoteIgnores(remoteFiles, head, options) : void 0;
    (_d = options.progress) == null ? void 0 : _d.call(options, "Checking the vault");
    const scan = await scanLocal(fs, state.cache, tracked, options.stateFile, ignores);
    const base = new Map(Object.entries(state.base));
    const local = new Map([...scan.files].map(([p, e]) => [p, e.sha]));
    const remoteShas = new Map([...remoteFiles].map(([p, f]) => [p, f.sha]));
    let actions;
    if (firstSync === "merge") {
      if (first) await findHistoricalBases(base, local, remoteShas, head, options);
      const renames = await confirmRenames(base, local, remoteShas, scan.files, head, options);
      actions = plan(base, local, remoteShas, renames);
      if (!options.allowMassDelete) guardMassDelete(actions, base.size, name);
    } else {
      const own = `${options.stateFile.slice(0, options.stateFile.lastIndexOf("/"))}/`;
      actions = planReplace(
        local,
        remoteShas,
        firstSync === "use-local" ? "local" : "remote",
        (path) => path === ".gitignore" || path.endsWith("/.gitignore") || path.startsWith(own)
      );
    }
    const incoming = await applyIncoming(
      actions,
      scan.files,
      remoteFiles,
      state,
      head,
      options,
      now,
      report
    );
    const pulledBase = {};
    for (const [path, file] of remoteFiles) pulledBase[path] = file.sha;
    for (const path of incoming.deferred) {
      const old = state.base[path];
      if (old === void 0) delete pulledBase[path];
      else pulledBase[path] = old;
    }
    const cache = { ...scan.cache };
    for (const path of incoming.touched) delete cache[path];
    const knownTree = incoming.deferred.size > 0 ? null : tree;
    state = withKept(
      {
        ...state,
        commit: head,
        tree: knownTree,
        base: pulledBase,
        modes: modesOf(remoteFiles),
        cache,
        conflicts: unique([...state.conflicts, ...report.conflicts.map((c) => c.path)])
      },
      addKept(state.kept, state.commit, incoming.kept)
    );
    await options.saveState(state);
    const changes = [];
    const newShas = /* @__PURE__ */ new Map();
    let edited = 0;
    for (const [path, upload] of incoming.outgoing) {
      if (incoming.deferred.has(path)) continue;
      const existing = remoteFiles.get(path);
      if (upload === null) {
        if (!existing) continue;
        changes.push({ path, read: null, mode: existing.mode });
        newShas.set(path, null);
        continue;
      }
      if (upload.size > MAX_FILE_SIZE) {
        report.skipped.push({ path, reason: "larger than 100 MB" });
        continue;
      }
      if ((existing == null ? void 0 : existing.sha) === upload.sha) continue;
      changes.push({
        path,
        mode: (_e = existing == null ? void 0 : existing.mode) != null ? _e : "100644",
        // hashed as read: the base must record what was uploaded, not what was scanned
        read: async () => {
          const bytes = await upload.read();
          newShas.set(path, await gitBlobSha(bytes));
          return bytes;
        }
      });
      newShas.set(path, upload.sha);
      if (upload.edited !== null) edited = Math.max(edited, upload.edited);
    }
    const kept = state.kept;
    if (changes.length === 0 && !kept) return { state, report };
    (_f = options.progress) == null ? void 0 : _f.call(
      options,
      changes.length > 0 ? `Uploading ${changes.length} ${changes.length === 1 ? "file" : "files"}` : "Keeping this device's version in the history"
    );
    const message = commitMessage({
      device: options.device,
      files: unique([...changes.map((c) => c.path), ...(_g = kept == null ? void 0 : kept.files.map((f) => f.path)) != null ? _g : []]),
      deleted: new Set(changes.filter((c) => c.read === null).map((c) => c.path))
    });
    const result = await remote.commit({
      parent: head,
      baseTree: tree,
      changes,
      message,
      // "the newer version" is judged by author date
      authored: edited > 0 ? new Date(edited) : null,
      kept: kept ? keptCommit(kept, options.device) : null
    });
    if (result === "moved") continue;
    const finalBase = { ...state.base };
    for (const [path, sha] of newShas) {
      if (sha === null) delete finalBase[path];
      else finalBase[path] = sha;
    }
    const modes = { ...state.modes };
    for (const change of changes) {
      if (change.read === null || change.mode === "100644") delete modes[change.path];
      else modes[change.path] = change.mode;
    }
    for (const change of changes) {
      if (change.read === null) report.deletedThere.push(change.path);
      else report.pushed.push(change.path);
    }
    report.commit = result.commit;
    state = withKept(
      {
        ...state,
        commit: result.commit,
        tree: knownTree === null ? null : result.tree,
        base: finalBase,
        modes
      },
      void 0
    );
    return { state, report };
  }
  throw new Error(`${capitalize(name)} kept changing while syncing. Will try again shortly.`);
}
async function preview(state, options) {
  var _a;
  const head = await options.remote.head();
  const report = emptyReport();
  const remoteFiles = head === null ? /* @__PURE__ */ new Map() : (await readRemote(options.remote, state, head, options, report)).files;
  const tracked = /* @__PURE__ */ new Set([...Object.keys(state.base), ...remoteFiles.keys()]);
  let ignores;
  let addsGitignore = false;
  if (head === null) {
    addsGitignore = !await hasFile(options.fs, ".gitignore");
    if (addsGitignore) ignores = /* @__PURE__ */ new Map([["", defaultGitignore(options.configDir)]]);
  } else if (state.commit === null) {
    ignores = await remoteIgnores(remoteFiles, head, options);
  }
  const scan = await scanLocal(options.fs, state.cache, tracked, options.stateFile, ignores);
  const local = new Map([...scan.files].map(([p, e]) => [p, e.sha]));
  const actions = plan(
    new Map(Object.entries(state.base)),
    local,
    new Map([...remoteFiles].map(([p, f]) => [p, f.sha]))
  );
  const isNote = (path) => !path.startsWith(`${options.configDir}/`);
  const count = (...kinds) => actions.filter((a) => kinds.includes(a.kind)).length;
  let same2 = 0;
  for (const [path, sha] of local) if (((_a = remoteFiles.get(path)) == null ? void 0 : _a.sha) === sha) same2++;
  return {
    same: same2,
    upload: count("push", "resurrect", "push-renamed") + (addsGitignore ? 1 : 0),
    download: count("pull", "restore", "pull-renamed"),
    merge: count("merge"),
    deleteHere: count("delete-local"),
    deleteThere: count("delete-remote"),
    emptyRemote: head === null,
    notes: {
      here: [...local.keys()].filter(isNote).length,
      there: [...remoteFiles.keys()].filter(isNote).length,
      differ: actions.filter((a) => isNote("path" in a ? a.path : a.to)).length
    }
  };
}
function emptyReport() {
  return {
    pulled: [],
    pushed: [],
    deletedHere: [],
    deletedThere: [],
    merged: [],
    conflicts: [],
    newer: [],
    keptBoth: [],
    restored: [],
    deferred: [],
    skipped: [],
    commit: null,
    initialized: false
  };
}
async function hasFile(fs, path) {
  try {
    await fs.read(path);
    return true;
  } catch (e) {
    return false;
  }
}
async function initialize(options) {
  let content;
  try {
    content = await options.fs.read(".gitignore");
  } catch (e) {
    content = new TextEncoder().encode(defaultGitignore(options.configDir));
  }
  const message = commitMessage({
    device: options.device,
    files: [".gitignore"]
  });
  await options.remote.initialize(".gitignore", content, message);
}
async function readRemote(remote, state, head, options, report) {
  var _a, _b;
  if (state.commit !== null && state.tree) {
    const files2 = /* @__PURE__ */ new Map();
    for (const [path, sha] of Object.entries(state.base)) {
      files2.set(path, { sha, mode: (_a = state.modes[path]) != null ? _a : "100644" });
    }
    await ((_b = remote.seed) == null ? void 0 : _b.call(remote, state.commit, state.tree, files2));
    if (head === state.commit) return { tree: state.tree, files: files2 };
  }
  const read = await remote.readTree(head);
  const files = /* @__PURE__ */ new Map();
  const lower = /* @__PURE__ */ new Set();
  for (const path of [...read.files.keys()].sort()) {
    const file = read.files.get(path);
    if (!file || isHardExcluded(path, options.stateFile)) continue;
    const key = path.toLowerCase();
    if (lower.has(key)) {
      report.skipped.push({
        path,
        reason: `differs from another file on ${remoteName(options)} only in letter case`
      });
      continue;
    }
    lower.add(key);
    files.set(path, file);
  }
  return { tree: read.tree, files };
}
async function remoteIgnores(remoteFiles, head, options) {
  const wanted = [...remoteFiles].filter(([path]) => path === ".gitignore" || path.endsWith("/.gitignore")).map(([path, file]) => ({ sha: file.sha, path }));
  const out = /* @__PURE__ */ new Map();
  if (wanted.length === 0) return out;
  let blobs;
  try {
    blobs = await options.remote.readBlobs(wanted, head);
  } catch (e) {
    return out;
  }
  for (const { sha, path } of wanted) {
    const bytes = blobs.get(sha);
    const text = bytes ? decodeText(bytes) : null;
    if (text !== null) out.set(path.slice(0, Math.max(0, path.lastIndexOf("/"))), text);
  }
  return out;
}
var HISTORY_VERSIONS = 10;
var HISTORY_BUDGET = 1500;
async function findHistoricalBases(base, local, remote, head, options) {
  var _a;
  const differing = [...local].filter(([path, sha]) => !base.has(path) && remote.has(path) && remote.get(path) !== sha).map(([path]) => path);
  if (differing.length === 0) return;
  let budget = HISTORY_BUDGET;
  let done = 0;
  (_a = options.progress) == null ? void 0 : _a.call(options, `Looking through ${remoteName(options)}'s history`);
  await pool3(differing, 4, async (path) => {
    var _a2;
    if (budget <= 0) return;
    let versions;
    try {
      versions = await options.remote.fileHistory(path, head, HISTORY_VERSIONS);
    } catch (e) {
      return;
    } finally {
      (_a2 = options.progress) == null ? void 0 : _a2.call(
        options,
        `Looking through ${remoteName(options)}'s history (${++done} of ${differing.length})`
      );
    }
    budget -= versions.length + 1;
    const sha = local.get(path);
    if (sha !== void 0 && versions.includes(sha)) base.set(path, sha);
  });
}
var MAX_RENAME_PAIRS = 200;
async function confirmRenames(base, local, remote, localFiles, head, options) {
  var _a, _b;
  const candidates = renameCandidates(base, local, remote);
  if (candidates.length === 0 || candidates.length > MAX_RENAME_PAIRS) return [];
  const wanted = [];
  for (const c of candidates) {
    const b = base.get(c.from);
    if (b) wanted.push({ sha: b, path: c.from });
    const r = c.side === "remote" ? remote.get(c.to) : void 0;
    if (r) wanted.push({ sha: r, path: c.to });
  }
  let blobs;
  try {
    blobs = await options.remote.readBlobs(wanted, head);
  } catch (e) {
    return [];
  }
  const text = (bytes) => bytes ? decodeText(bytes) : null;
  const scored = [];
  for (const candidate of candidates) {
    const before = text(blobs.get((_a = base.get(candidate.from)) != null ? _a : ""));
    let after;
    if (candidate.side === "remote") {
      after = text(blobs.get((_b = remote.get(candidate.to)) != null ? _b : ""));
    } else {
      const entry = localFiles.get(candidate.to);
      after = entry ? text(await options.fs.read(entry.actual).catch(() => void 0)) : null;
    }
    if (before === null || after === null) continue;
    const score = similarity(before, after);
    if (score >= RENAME_SIMILARITY) scored.push({ candidate, score });
  }
  const taken = /* @__PURE__ */ new Set();
  const confirmed = [];
  for (const { candidate } of scored.sort((a, b) => b.score - a.score)) {
    if (taken.has(candidate.from) || taken.has(candidate.to)) continue;
    taken.add(candidate.from).add(candidate.to);
    confirmed.push(candidate);
  }
  return confirmed;
}
function guardMassDelete(actions, baseSize, where) {
  const here = actions.filter((a) => a.kind === "delete-local").length;
  const there = actions.filter((a) => a.kind === "delete-remote").length;
  const limit2 = Math.max(20, baseSize / 2);
  if (here > limit2 || there > limit2) throw new MassDeleteError(here, there, where);
}
async function uploadOf(bytes, edited = null) {
  return { sha: await gitBlobSha(bytes), size: bytes.length, read: async () => bytes, edited };
}
async function applyIncoming(actions, local, remoteFiles, state, head, options, now, report) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const { fs, remote } = options;
  const strategy = (_a = options.conflicts) != null ? _a : "keep-both";
  const outgoing = /* @__PURE__ */ new Map();
  const deferred = /* @__PURE__ */ new Set();
  const touched = /* @__PURE__ */ new Set();
  const kept = [];
  const wanted = [];
  for (const action of actions) {
    if (action.kind === "merge") {
      wanted.push({ sha: action.remote, path: action.path });
      if (action.base) wanted.push({ sha: action.base, path: action.path });
    }
    if (action.kind === "merge-renamed") {
      const remotePath = action.renamedOn === "local" ? action.from : action.to;
      wanted.push({ sha: action.remote, path: remotePath });
      wanted.push({ sha: action.base, path: action.from });
    }
  }
  if (wanted.length > 0) (_b = options.progress) == null ? void 0 : _b.call(options, "Merging");
  const blobs = wanted.length === 0 ? /* @__PURE__ */ new Map() : await remote.readBlobs(wanted, head);
  const blob = (sha, path) => {
    const bytes = blobs.get(sha);
    if (!bytes) throw new Error(`Could not download ${path} from ${remoteName(options)}.`);
    return bytes;
  };
  const readLocal = (path) => {
    var _a2;
    const entry = local.get(path);
    return fs.read((_a2 = entry == null ? void 0 : entry.actual) != null ? _a2 : path);
  };
  const localUpload = (path) => {
    const entry = local.get(path);
    if (!entry) return null;
    return {
      sha: entry.sha,
      size: entry.size,
      read: () => fs.read(entry.actual),
      edited: entry.mtime
    };
  };
  const actualPath = (path) => {
    var _a2, _b2;
    return (_b2 = (_a2 = local.get(path)) == null ? void 0 : _a2.actual) != null ? _b2 : path;
  };
  const write = async (path, data, expected) => {
    touched.add(actualPath(path));
    const ok = await fs.write(actualPath(path), data, expected);
    if (!ok) {
      deferred.add(path);
      report.deferred.push(path);
    }
    return ok;
  };
  let everyone = null;
  const sinceLastSync = () => {
    if (!everyone) everyone = describeRemote(remote, state.commit, head, remoteName(options));
    return everyone;
  };
  const authors = /* @__PURE__ */ new Map();
  const lastAuthor = (path) => {
    let author = authors.get(path);
    if (!author) {
      author = remote.lastChange(path, head).then(
        (commit) => {
          var _a2, _b2;
          return commit ? {
            name: (_a2 = deviceFromMessage(commit.message)) != null ? _a2 : remoteName(options),
            time: (_b2 = commit.authored) != null ? _b2 : commit.date
          } : sinceLastSync();
        },
        () => sinceLastSync()
      );
      authors.set(path, author);
    }
    return author;
  };
  const mergeVersions = async (path, remotePath, baseBytes, localBytes, remoteBytes, localEntry) => {
    const localTime = localEntry ? new Date(localEntry.mtime) : null;
    const clean = mergeFile(path, baseBytes, localBytes, remoteBytes, { local: "", remote: "" });
    if (clean.kind === "merged" && clean.conflicts === 0) {
      const other2 = await sinceLastSync();
      return { merged: clean, other: other2, prefer: void 0, edited: latest(localTime, other2.time) };
    }
    const other = await lastAuthor(remotePath);
    const prefer = strategy === "newest" ? newerOf(localTime, other.time) : void 0;
    const merged = mergeFile(
      path,
      baseBytes,
      localBytes,
      remoteBytes,
      { local: sideLabel(options.device, localTime), remote: sideLabel(other.name, other.time) },
      prefer
    );
    return { merged, other, prefer, edited: latest(localTime, other.time) };
  };
  const keep = async (path, bytes, entry) => {
    var _a2, _b2, _c2;
    const sha = await remote.storeBlob(bytes);
    kept.push({
      path,
      sha,
      mode: (_b2 = (_a2 = remoteFiles.get(path)) == null ? void 0 : _a2.mode) != null ? _b2 : "100644",
      edited: (_c2 = entry == null ? void 0 : entry.mtime) != null ? _c2 : null
    });
  };
  const unkeep = (path) => {
    const at = kept.findIndex((file) => file.path === path);
    if (at !== -1) kept.splice(at, 1);
  };
  const takenPaths = /* @__PURE__ */ new Set([...local.keys(), ...remoteFiles.keys()]);
  for (const action of actions) {
    if (action.kind === "delete-local") {
      const entry = local.get(action.path);
      if (!entry) continue;
      touched.add(entry.actual);
      if (await fs.remove(entry.actual, entry.sha)) report.deletedHere.push(action.path);
      else {
        deferred.add(action.path);
        report.deferred.push(action.path);
      }
    }
  }
  const pulls = [];
  for (const action of actions) {
    switch (action.kind) {
      case "push":
      case "resurrect": {
        const upload = localUpload(action.path);
        if (upload) outgoing.set(action.path, upload);
        if (action.kind === "resurrect") report.restored.push(action.path);
        break;
      }
      case "pull":
      case "restore":
      case "pull-renamed":
      case "replace-local":
        pulls.push(action);
        break;
      case "delete-local":
        break;
      case "delete-remote":
        outgoing.set(action.path, null);
        break;
      case "merge": {
        const localBytes = await readLocal(action.path);
        const remoteBytes = blob(action.remote, action.path);
        const baseBytes = action.base ? (_c = blobs.get(action.base)) != null ? _c : null : null;
        const localEntry = local.get(action.path);
        const { merged, other, prefer, edited } = await mergeVersions(
          action.path,
          action.path,
          baseBytes,
          localBytes,
          remoteBytes,
          localEntry
        );
        const winner = prefer === "remote" ? other.name : options.device;
        if (merged.kind === "merged") {
          const losing = prefer === "remote" && merged.replaced > 0;
          if (losing) await keep(action.path, localBytes, localEntry);
          if (await write(action.path, merged.bytes, action.local)) {
            outgoing.set(action.path, await uploadOf(merged.bytes, edited));
            report.merged.push(action.path);
            if (merged.conflicts > 0)
              report.conflicts.push({ path: action.path, count: merged.conflicts });
            if (merged.replaced > 0)
              report.newer.push({ path: action.path, from: winner, places: merged.replaced });
          } else if (losing) {
            unkeep(action.path);
          }
        } else if (merged.kind === "take") {
          if (merged.side === "local") {
            const upload = localUpload(action.path);
            if (upload) outgoing.set(action.path, upload);
            report.newer.push({ path: action.path, from: winner, places: 0 });
          } else {
            await keep(action.path, localBytes, localEntry);
            if (await write(action.path, remoteBytes, action.local)) {
              report.newer.push({ path: action.path, from: winner, places: 0 });
            } else {
              unkeep(action.path);
            }
          }
        } else {
          const copy = conflictCopyPath(action.path, other.name, now(), (p) => takenPaths.has(p));
          takenPaths.add(copy);
          if (await write(copy, remoteBytes, null)) {
            outgoing.set(action.path, await uploadOf(localBytes, (_d = localEntry == null ? void 0 : localEntry.mtime) != null ? _d : null));
            outgoing.set(copy, await uploadOf(remoteBytes));
            report.keptBoth.push({ path: action.path, copy });
          }
        }
        break;
      }
      case "merge-renamed": {
        const localPath = action.renamedOn === "local" ? action.to : action.from;
        const remotePath = action.renamedOn === "local" ? action.from : action.to;
        const localBytes = await readLocal(localPath);
        const remoteBytes = blob(action.remote, remotePath);
        const localEntry = local.get(localPath);
        const { merged, other, prefer, edited } = await mergeVersions(
          action.to,
          remotePath,
          (_e = blobs.get(action.base)) != null ? _e : null,
          localBytes,
          remoteBytes,
          localEntry
        );
        if (merged.kind !== "merged") {
          if (action.renamedOn === "local") {
            if (await write(action.from, remoteBytes, null)) {
              outgoing.set(action.to, await uploadOf(localBytes, (_f = localEntry == null ? void 0 : localEntry.mtime) != null ? _f : null));
              report.restored.push(action.from);
            }
          } else if (await write(action.to, remoteBytes, null)) {
            outgoing.set(action.from, await uploadOf(localBytes, (_g = localEntry == null ? void 0 : localEntry.mtime) != null ? _g : null));
            report.restored.push(action.from);
          }
          break;
        }
        const losing = prefer === "remote" && merged.replaced > 0;
        if (losing) await keep(localPath, localBytes, localEntry);
        const expected = action.renamedOn === "local" ? action.local : null;
        if (await write(action.to, merged.bytes, expected)) {
          if (action.renamedOn === "remote") {
            const entry = local.get(action.from);
            if (entry) {
              touched.add(entry.actual);
              await fs.remove(entry.actual, action.local);
            }
          } else {
            outgoing.set(action.from, null);
          }
          outgoing.set(action.to, await uploadOf(merged.bytes, edited));
          report.merged.push(action.to);
          if (merged.conflicts > 0)
            report.conflicts.push({ path: action.to, count: merged.conflicts });
          if (merged.replaced > 0) {
            const winner = prefer === "remote" ? other.name : options.device;
            report.newer.push({ path: action.to, from: winner, places: merged.replaced });
          }
        } else if (losing) {
          unkeep(localPath);
        }
        break;
      }
      case "push-renamed": {
        const content = await readLocal(action.from);
        if (await write(action.to, content, null)) {
          const entry = local.get(action.from);
          if (entry) {
            touched.add(entry.actual);
            await fs.remove(entry.actual, action.localSha);
          }
          outgoing.set(action.to, await uploadOf(content, (_h = entry == null ? void 0 : entry.mtime) != null ? _h : null));
        }
        break;
      }
    }
  }
  if (pulls.length > 0) {
    const bySha = /* @__PURE__ */ new Map();
    for (const action of pulls) bySha.set(action.sha, [...(_i = bySha.get(action.sha)) != null ? _i : [], action]);
    const pull = async (action, content) => {
      var _a2, _b2;
      if (action.kind === "pull-renamed") {
        if (await write(action.to, content, action.localSha)) {
          outgoing.set(action.to, await uploadOf(content));
          outgoing.set(action.from, null);
          report.pulled.push(action.to);
        }
        return;
      }
      if (action.kind === "replace-local") {
        const entry = local.get(action.path);
        if (entry) await fs.backup(entry.actual);
        if (await write(action.path, content, action.local)) report.pulled.push(action.path);
        return;
      }
      const expected = (_b2 = (_a2 = local.get(action.path)) == null ? void 0 : _a2.sha) != null ? _b2 : null;
      if (await write(action.path, content, expected)) {
        if (action.kind === "restore") report.restored.push(action.path);
        else report.pulled.push(action.path);
      }
    };
    (_j = options.progress) == null ? void 0 : _j.call(options, `Downloading ${pulls.length} ${pulls.length === 1 ? "file" : "files"}`);
    const arrived = /* @__PURE__ */ new Set();
    let writing = Promise.resolve();
    await remote.readBlobs(
      pulls.map((a) => ({ sha: a.sha, path: a.kind === "pull-renamed" ? a.from : a.path })),
      head,
      (done, total) => {
        var _a2;
        return (_a2 = options.progress) == null ? void 0 : _a2.call(options, `Downloading ${done} of ${total}`);
      },
      (sha, bytes) => {
        const next = writing.then(async () => {
          var _a2;
          arrived.add(sha);
          for (const action of (_a2 = bySha.get(sha)) != null ? _a2 : []) await pull(action, bytes);
        });
        writing = next.catch(() => void 0);
        return next;
      }
    );
    await writing;
    const missing = pulls.find((a) => !arrived.has(a.sha));
    if (missing) {
      const path = missing.kind === "pull-renamed" ? missing.from : missing.path;
      throw new Error(`Could not download ${path} from ${remoteName(options)}.`);
    }
  }
  return { outgoing, deferred, touched, kept };
}
function newerOf(local, remote) {
  if (!local || !remote) return void 0;
  return remote.getTime() > local.getTime() ? "remote" : "local";
}
function latest(...dates) {
  const times = dates.filter((d) => d !== null).map((d) => d.getTime());
  return times.length === 0 ? null : Math.max(...times);
}
function addKept(waiting, parent, added2) {
  var _a;
  if (added2.length === 0) return waiting;
  const files = [...(_a = waiting == null ? void 0 : waiting.files) != null ? _a : []];
  for (const file of added2) if (!files.some((f) => f.path === file.path)) files.push(file);
  return { parent: waiting ? waiting.parent : parent, files };
}
function withKept(state, kept) {
  const { kept: _, ...rest } = state;
  return kept ? { ...rest, kept } : rest;
}
function keptCommit(kept, device) {
  const edited = Math.max(0, ...kept.files.map((f) => {
    var _a;
    return (_a = f.edited) != null ? _a : 0;
  }));
  return {
    parent: kept.parent,
    files: kept.files.map(({ path, sha, mode }) => ({ path, sha, mode })),
    message: commitMessage({ device, files: kept.files.map((f) => f.path), superseded: true }),
    authored: edited > 0 ? new Date(edited) : null
  };
}
async function describeRemote(remote, base, head, where) {
  var _a;
  let commits = [];
  try {
    commits = await remote.commitsSince(base, head);
  } catch (e) {
  }
  commits = commits.filter((c) => !isSuperseded(c.message));
  const devices = unique(commits.map((c) => {
    var _a2;
    return (_a2 = deviceFromMessage(c.message)) != null ? _a2 : where;
  }));
  const name = devices.length === 0 ? where : devices.slice(0, 2).join(", ");
  const newest = commits[0];
  return { name, time: newest ? (_a = newest.authored) != null ? _a : newest.date : null };
}
function remoteName(options) {
  var _a;
  return (_a = options.remoteName) != null ? _a : "GitHub";
}
function modesOf(files) {
  const modes = {};
  for (const [path, file] of files) if (file.mode !== "100644") modes[path] = file.mode;
  return modes;
}
function unique(items) {
  return [...new Set(items)];
}
async function pool3(items, size, run) {
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await run(item);
    }
  });
  await Promise.all(workers);
}

// src/sync/types.ts
function emptyState(target) {
  return {
    version: 1,
    target,
    commit: null,
    tree: null,
    base: {},
    modes: {},
    cache: {},
    conflicts: []
  };
}

// src/main.ts
var TOKEN_SECRET = "easy-git-sync-token";
var DEVICE_KEY = "easy-git-sync-device";
var FULL_SYNC_EVERY = 10 * 6e4;
var OWN_WRITE_ECHO = 5e3;
var EXPIRY_WARNING = 14 * 24 * 60 * 6e4;
var EXPIRY_CHECK_EVERY = 24 * 60 * 6e4;
var LOOKUP_FRESH = 5 * 6e4;
var REQUEST_TIMEOUT = 12e4;
var obsidianHttp = async (request) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => reject(new Error("the request timed out")), REQUEST_TIMEOUT);
  });
  try {
    const response = await Promise.race([
      (0, import_obsidian5.requestUrl)({
        url: request.url,
        method: request.method,
        headers: request.headers,
        ...request.body === void 0 ? {} : { body: request.body },
        ...request.headers["Content-Type"] ? { contentType: request.headers["Content-Type"] } : {},
        throw: false
      }),
      timeout
    ]);
    return { status: response.status, headers: response.headers, body: response.arrayBuffer };
  } finally {
    window.clearTimeout(timer);
  }
};
var EasyGitSync = class extends import_obsidian5.Plugin {
  constructor() {
    super(...arguments);
    this.hostCache = null;
    this.draft = null;
    this.draftHostCache = null;
    this.committing = false;
    this.lookups = /* @__PURE__ */ new Map();
    this.settingTab = null;
    this.expiryChecked = 0;
    this.state = null;
    this.running = null;
    this.again = false;
    this.dirty = false;
    this.lastFullSync = 0;
    this.lastSynced = null;
    this.blocked = null;
    this.lastErrorShown = null;
    this.status = { kind: "idle" };
    this.shownStatus = { kind: "idle" };
    this.statusTimer = null;
    this.savedState = null;
    this.pendingMassDelete = null;
    this.progressNotice = null;
    this.progressTimer = null;
    this.unloaded = false;
    this.editTimer = null;
    this.pollTimer = null;
    this.statusEl = null;
    this.ribbonEl = null;
  }
  async onload() {
    await this.loadSettings();
    this.loadDevice();
    this.fs = new ObsidianFs(this.app);
    this.settingTab = new EasyGitSyncSettingTab(this.app, this);
    this.addSettingTab(this.settingTab);
    this.registerEditorExtension(conflictEditorExtension());
    this.registerMarkdownPostProcessor(conflictPostProcessor(this.app));
    this.statusEl = this.addStatusBarItem();
    this.statusEl.addClass("easy-git-sync-status", "mod-clickable");
    this.registerDomEvent(this.statusEl, "click", (event) => this.showMenu(event));
    this.ribbonEl = this.addRibbonIcon(
      "refresh-cw",
      this.connectionLabel(),
      () => void this.syncNow("manual")
    );
    this.ribbonEl.addClass("easy-git-sync-ribbon");
    this.addCommand({
      id: "sync-now",
      name: "Sync now",
      callback: () => void this.syncNow("manual")
    });
    this.addCommand({
      id: "show-conflicts",
      name: "Show notes with sync conflicts",
      callback: () => this.showConflicts()
    });
    this.addCommand({
      id: "resolve-conflicts-newer",
      name: "Resolve all sync conflicts with the newer version",
      callback: () => void this.resolveAllNewer()
    });
    this.addCommand({
      id: "open-on-github",
      name: "Open this note on the web",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || !this.device.repo) return false;
        const url = this.host.fileUrl(this.device.repo, this.device.branch, file.path);
        if (!url) return false;
        if (!checking) window.open(url);
        return true;
      }
    });
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(this.app.vault.on("modify", (file) => this.onLocalChange(file)));
      this.registerEvent(this.app.vault.on("create", (file) => this.onLocalChange(file)));
      this.registerEvent(this.app.vault.on("delete", (file) => this.onLocalChange(file)));
      this.registerEvent(
        this.app.vault.on("rename", (file, oldPath) => {
          this.followRename(oldPath, file.path);
          this.onLocalChange(file);
        })
      );
      this.registerDomEvent(document, "visibilitychange", () => this.onVisibilityChange());
      this.reschedule();
      this.render();
      if (this.ready()) void this.syncNow("startup");
    });
  }
  onunload() {
    this.unloaded = true;
    if (this.editTimer !== null) window.clearTimeout(this.editTimer);
    if (this.progressTimer !== null) window.clearTimeout(this.progressTimer);
    if (this.statusTimer !== null) window.clearTimeout(this.statusTimer);
    if (this.pollTimer !== null) window.clearInterval(this.pollTimer);
  }
  async loadSettings() {
    this.settings = parseSettings(await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  loadDevice() {
    const saved = this.app.loadLocalStorage(DEVICE_KEY);
    this.device = {
      provider: "github",
      server: "",
      username: "",
      repo: null,
      branch: "main",
      deviceName: defaultDeviceName(),
      started: false,
      ...saved != null ? saved : {}
    };
  }
  get connection() {
    return {
      provider: this.device.provider,
      server: this.device.server,
      username: this.device.username
    };
  }
  get host() {
    var _a;
    const key = JSON.stringify(this.connection);
    if (((_a = this.hostCache) == null ? void 0 : _a.key) !== key) {
      this.hostCache = {
        key,
        host: createHost(this.connection, {
          http: obsidianHttp,
          token: () => this.token(),
          sleep: (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))
        })
      };
    }
    return this.hostCache.host;
  }
  get hostName() {
    return capitalize(this.host.name);
  }
  // "the GitLab token", but "the token for the server"
  get tokenName() {
    const name = this.host.name;
    return name.startsWith("the ") ? `the token for ${name}` : `the ${name} token`;
  }
  beginDraft() {
    if (!this.draft) {
      const { provider, server, username, repo, branch } = this.device;
      this.draft = {
        provider,
        server,
        username,
        token: null,
        repo,
        branch,
        checked: repo !== null
      };
    }
    return this.draft;
  }
  cancelDraft() {
    this.draft = null;
  }
  setDraftConnection(change) {
    const draft = this.beginDraft();
    const before = connectionOf(draft);
    const next = { ...before, ...change };
    if (JSON.stringify(next) === JSON.stringify(before)) return;
    const sameHost = next.provider === before.provider && next.server === before.server;
    const live = this.connection;
    const home = this.device.started && next.provider === live.provider && next.server === live.server;
    const repo = sameHost ? {} : home ? { repo: this.device.repo, branch: this.device.branch, checked: true } : { repo: null, branch: "main", checked: false };
    this.draft = { ...draft, ...next, token: null, ...repo };
  }
  draftHost() {
    var _a;
    const draft = this.draft;
    if (!draft) return null;
    const connection = connectionOf(draft);
    const key = JSON.stringify(connection);
    if (((_a = this.draftHostCache) == null ? void 0 : _a.key) !== key) {
      this.draftHostCache = {
        key,
        host: createHost(connection, {
          http: obsidianHttp,
          token: () => this.draftToken(),
          sleep: (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))
        })
      };
    }
    return this.draftHostCache.host;
  }
  draftToken() {
    var _a;
    const draft = this.draft;
    if (!draft) return null;
    return (_a = draft.token) != null ? _a : this.savedToken(connectionOf(draft));
  }
  draftSavedToken() {
    return this.draft !== null && this.savedToken(connectionOf(this.draft)) !== null;
  }
  draftHasLogin() {
    const draft = this.draft;
    if (!draft) return false;
    return this.draftToken() !== null || draft.provider === "other" && draft.username !== "";
  }
  draftChange() {
    const draft = this.draft;
    if (!draft) return "none";
    if (!this.device.started) return "target";
    const live = this.device;
    const sameTarget = draft.provider === live.provider && draft.server === live.server && draft.repo === live.repo && draft.branch === live.branch;
    if (!sameTarget) return "target";
    return draft.token !== null || draft.username !== live.username ? "login" : "none";
  }
  // quiet: no notices and no branch picker, so it only fills in what leaves nothing to choose
  async pickDraftRepo(fullName2, quiet = false) {
    const draft = this.draft;
    const host = this.draftHost();
    if (!draft || !host) return false;
    let repo;
    try {
      repo = await host.repo(fullName2);
    } catch (error) {
      if (!quiet) new import_obsidian5.Notice(`Easy Git Sync: could not open ${fullName2}. ${describe(error)}`);
      return false;
    }
    if (!repo.canPush) {
      if (!quiet) new import_obsidian5.Notice(`Easy Git Sync: ${readOnly(host.id, repo.fullName)}`, 1e4);
      return false;
    }
    let branch = repo.defaultBranch;
    if (!repo.empty) {
      const branches = await host.branches(repo.fullName, repo.defaultBranch).catch(() => []);
      if (quiet && branches.length !== 1) return false;
      if (branches.length > 1) {
        const picked = await pickBranch(this.app, repo.fullName, branches, repo.defaultBranch);
        if (picked === null) return false;
        branch = picked;
      }
    }
    if (this.draft !== draft || quiet && draft.repo !== null) return false;
    draft.repo = repo.fullName;
    draft.branch = branch;
    draft.checked = true;
    return true;
  }
  // true once the draft is the live connection; false leaves both as they were
  async commitDraft() {
    const draft = this.draft;
    const host = this.draftHost();
    if (!(draft == null ? void 0 : draft.repo) || !host || this.committing || this.unloaded) return false;
    if (this.otherGitPluginEnabled()) {
      new import_obsidian5.Notice("Easy Git Sync: turn off the Git plugin on this device first.");
      return false;
    }
    this.committing = true;
    try {
      if (!draft.checked && !await this.pickDraftRepo(draft.repo)) return false;
      const repo = draft.repo;
      const change = this.draftChange();
      if (change === "none") return false;
      if (change === "login") {
        try {
          const info = await host.repo(repo);
          if (!info.canPush) {
            new import_obsidian5.Notice(`Easy Git Sync: ${readOnly(host.id, repo)}`, 1e4);
            return false;
          }
        } catch (error) {
          new import_obsidian5.Notice(`Easy Git Sync: ${describe(error)}`);
          return false;
        }
        const account2 = await host.account().catch(() => null);
        await this.applyDraft(draft, null, account2 == null ? void 0 : account2.login);
        void this.syncNow("manual");
        return true;
      }
      const start = await this.confirmStart(draft, host);
      if (start === null || this.draft !== draft) return false;
      const account = await host.account().catch(() => null);
      await this.applyDraft(draft, start, account == null ? void 0 : account.login);
      void this.syncNow("manual");
      return true;
    } finally {
      this.committing = false;
    }
  }
  // the preview and the first-sync choice, against the draft and without touching the live sync;
  // "resume" when this device synced with that target before and kept the history
  async confirmStart(draft, host) {
    var _a, _b, _c;
    const repo = (_a = draft.repo) != null ? _a : "";
    const label = repoLabelOf(draft.provider, repo);
    const target = targetOf(draft);
    const remote = host.remote(repo, draft.branch, null);
    const compare = (state) => preview(state, {
      fs: this.fs,
      remote,
      device: this.device.deviceName,
      stateFile: this.stateFile,
      configDir: this.app.vault.configDir,
      conflicts: this.settings.conflicts,
      remoteName: host.name,
      saveState: async () => {
      }
    });
    const notice = new import_obsidian5.Notice(`Easy Git Sync: comparing with ${host.name}...`, 0);
    let kept = (_c = (_b = await this.readState(target)) == null ? void 0 : _b.state) != null ? _c : null;
    let summary;
    try {
      summary = await compare(kept != null ? kept : emptyState(target));
      if (kept && summary.emptyRemote) {
        kept = null;
        summary = await compare(emptyState(target));
      }
    } catch (error) {
      notice.hide();
      new import_obsidian5.Notice(`Easy Git Sync: ${describe(error)}`);
      return null;
    }
    notice.hide();
    const leaving = this.device.started ? `This device stops syncing with ${this.repoLabel} on ${this.host.name}.` : null;
    if (kept == null ? void 0 : kept.commit) {
      const files = (n) => `${n} ${n === 1 ? "file" : "files"}`;
      const changes = [
        summary.upload > 0 ? `${files(summary.upload)} to upload` : null,
        summary.download > 0 ? `${files(summary.download)} to download` : null,
        summary.merge > 0 ? `${files(summary.merge)} to merge` : null,
        summary.deleteThere > 0 ? `${files(summary.deleteThere)} to delete on ${host.name}` : null,
        summary.deleteHere > 0 ? `${files(summary.deleteHere)} to delete here` : null
      ].filter((part) => part !== null);
      const lines2 = [
        "This device synced with it before, so it picks up where it left off.",
        changes.length > 0 ? `Changed since: ${changes.join(", ")}.` : "Nothing changed on either side since."
      ];
      if (leaving) lines2.push(leaving);
      const ok2 = await confirm(this.app, `Start syncing with ${label}?`, lines2, "Start syncing");
      return ok2 ? "resume" : null;
    }
    const { notes } = summary;
    if (!summary.emptyRemote && notes.here > 0 && notes.there > 0 && notes.differ > 0) {
      return chooseFirstSync(this.app, {
        repo: label,
        remote: host.name,
        same: summary.same,
        upload: summary.upload,
        download: summary.download,
        merge: summary.merge,
        newest: this.settings.conflicts === "newest",
        leaving
      });
    }
    const lines = summary.emptyRemote ? [`${label} is empty. This vault becomes its first commit: ${summary.upload} files.`] : [
      `Already the same on both sides: ${summary.same} files.`,
      `Only in this vault, to upload: ${summary.upload}.`,
      `Only on ${host.name}, to download: ${summary.download}.`
    ];
    if (leaving) lines.push(leaving);
    const ok = await confirm(this.app, `Start syncing with ${label}?`, lines, "Start syncing");
    return ok ? "merge" : null;
  }
  // a new target starts a fresh sync history, a resume reads the kept one, a new login keeps it
  async applyDraft(draft, start, account) {
    while (this.running) await this.running.catch(() => {
    });
    if (this.unloaded) return;
    const connection = connectionOf(draft);
    if (draft.token !== null) {
      this.app.secretStorage.setSecret(this.tokenIdFor(connection), draft.token);
    }
    const { firstSync: pending, account: before, ...device } = this.device;
    const login = account != null ? account : start === null ? before : void 0;
    this.device = {
      ...device,
      ...connection,
      repo: draft.repo,
      branch: draft.branch,
      started: true,
      ...login ? { account: login } : {}
    };
    if (start === "resume") {
      this.state = null;
      this.savedState = null;
      await this.loadState();
      this.lockstep = void 0;
      this.lastSynced = null;
    } else if (start !== null) {
      this.device.firstSync = start;
      this.state = emptyState(this.target);
      await this.saveState();
      this.lockstep = void 0;
      this.lastSynced = null;
    } else if (pending) {
      this.device.firstSync = pending;
    }
    this.saveDevice();
    this.draft = null;
    this.blocked = null;
    this.lastErrorShown = null;
    this.expiryChecked = 0;
    this.setStatus({ kind: "idle" });
    this.reschedule();
  }
  // also the prefetch that lets "Change connection" show the token check at once
  async refreshAccount() {
    if (!this.device.started || !this.hasToken() || this.device.provider === "other") return;
    const found = await this.lookup(this.host, this.connection, this.token()).catch(() => null);
    const login = found == null ? void 0 : found.account.login;
    if (!login || login === this.device.account || !this.device.started) return;
    this.device.account = login;
    this.saveDevice();
    this.render();
  }
  // shared for a few minutes: listing costs a request per page, and on GitHub one per repository
  lookup(host, connection, token, maxAge = LOOKUP_FRESH) {
    var _a;
    const key = lookupKey(connection, token);
    const old = this.lookups.get(key);
    if (old && (old.loading || Date.now() - old.at < maxAge)) return old.pending;
    const pending = Promise.all([
      host.account(),
      host.repos(),
      host.tokenExpiry().catch(() => null)
    ]).then(([account, repos, expiry]) => ({ account, repos, expiry }));
    const entry = { at: Date.now(), pending, value: (_a = old == null ? void 0 : old.value) != null ? _a : null, loading: true };
    this.lookups.set(key, entry);
    pending.then(
      (value) => {
        entry.value = value;
        entry.loading = false;
      },
      () => {
        if (this.lookups.get(key) !== entry) return;
        if (old) this.lookups.set(key, old);
        else this.lookups.delete(key);
      }
    );
    return pending;
  }
  peekLookup(connection, token) {
    var _a, _b;
    return (_b = (_a = this.lookups.get(lookupKey(connection, token))) == null ? void 0 : _a.value) != null ? _b : null;
  }
  draftLookup(maxAge) {
    const draft = this.draft;
    const host = this.draftHost();
    if (!draft || !host) return null;
    return this.lookup(host, connectionOf(draft), this.draftToken(), maxAge);
  }
  peekDraftLookup() {
    return this.draft ? this.peekLookup(connectionOf(this.draft), this.draftToken()) : null;
  }
  // an instance Hot Reload or a disable replaced still finishes its awaits, with an outdated device
  saveDevice() {
    if (this.unloaded) return;
    this.app.saveLocalStorage(DEVICE_KEY, this.device);
  }
  // per vault, in case the keychain is shared: two vaults must not overwrite each other's token;
  // and per provider and server, so switching back finds the token that was there
  tokenIdFor(connection) {
    const appId = this.app.appId;
    const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
    const suffix = slug(appId != null ? appId : "");
    const base = suffix ? `${TOKEN_SECRET}-${suffix}` : TOKEN_SECRET;
    const { provider, server, username } = connection;
    if (provider === "github") return base;
    const where = provider === "other" ? `${server}${username}` : server;
    return `${base}-${provider}${where ? `-${slug(where)}` : ""}`;
  }
  get tokenId() {
    return this.tokenIdFor(this.connection);
  }
  savedToken(connection) {
    return this.app.secretStorage.getSecret(this.tokenIdFor(connection)) || null;
  }
  token() {
    return this.savedToken(this.connection);
  }
  // another git server may take a login without a password
  hasToken() {
    return this.token() !== null || this.device.provider === "other" && this.device.username !== "";
  }
  otherGitPluginEnabled() {
    var _a, _b;
    const plugins = this.app.plugins;
    return (_b = (_a = plugins == null ? void 0 : plugins.enabledPlugins) == null ? void 0 : _a.has("obsidian-git")) != null ? _b : false;
  }
  remote() {
    return this.device.repo ? this.host.remote(this.device.repo, this.device.branch, this.keptStash()) : null;
  }
  get target() {
    return targetOf(this.device);
  }
  get pluginDir() {
    var _a;
    return (_a = this.manifest.dir) != null ? _a : `${this.app.vault.configDir}/plugins/${this.manifest.id}`;
  }
  // this device's losing versions, kept on disk until a commit has taken them up
  keptStash() {
    const adapter = this.app.vault.adapter;
    const dir = `${this.pluginDir}/kept`;
    return {
      get: async (sha) => {
        const path = `${dir}/${sha}`;
        return await adapter.exists(path) ? new Uint8Array(await adapter.readBinary(path)) : null;
      },
      put: async (sha, bytes) => {
        if (!await adapter.exists(dir)) await adapter.mkdir(dir);
        await adapter.writeBinary(`${dir}/${sha}`, toArrayBuffer(bytes));
      },
      delete: async (sha) => {
        const path = `${dir}/${sha}`;
        if (await adapter.exists(path)) await adapter.remove(path);
      }
    };
  }
  get stateFile() {
    return `${this.pluginDir}/state.json`;
  }
  ready() {
    return this.device.started && this.device.repo !== null && this.hasToken() && !this.otherGitPluginEnabled() && this.blocked === null;
  }
  get repoLabel() {
    var _a;
    return repoLabelOf(this.device.provider, (_a = this.device.repo) != null ? _a : "");
  }
  // "Syncing with me/notes on GitLab", for the settings, the status bar menu and the ribbon
  connectionLabel() {
    return this.device.started ? `Syncing with ${this.repoLabel} on ${this.host.name}` : "Not connected";
  }
  // the status dot in the settings: the same reading as the ribbon's colour
  health() {
    if (!this.device.started) return "off";
    if (this.status.kind === "error" || this.blocked !== null) return "error";
    if (!this.ready() || this.status.kind === "paused" || this.status.kind === "offline" || this.conflictCount() > 0)
      return "warning";
    return "ok";
  }
  // the sync history stays on disk, so reconnecting to the same target picks up where it left off;
  // connecting anywhere else replaces it
  async disconnect() {
    while (this.running) await this.running.catch(() => {
    });
    if (this.unloaded) return;
    this.draft = null;
    this.app.secretStorage.setSecret(this.tokenId, "");
    this.device = {
      provider: this.device.provider,
      server: this.device.server,
      username: this.device.username,
      repo: null,
      branch: "main",
      deviceName: this.device.deviceName,
      started: false
    };
    this.saveDevice();
    this.state = null;
    this.savedState = null;
    this.lockstep = void 0;
    this.lastSynced = null;
    this.blocked = null;
    this.reschedule();
    this.render();
  }
  reschedule() {
    if (this.pollTimer !== null) window.clearInterval(this.pollTimer);
    this.pollTimer = null;
    const seconds = this.settings.checkInterval;
    if (seconds > 0) this.pollTimer = window.setInterval(() => void this.poll(), seconds * 1e3);
  }
  onLocalChange(file) {
    if (!(file instanceof import_obsidian5.TFile)) return;
    void this.fs.isOwnEcho(file.path, OWN_WRITE_ECHO).then((echo) => {
      if (!echo) this.markDirty(file);
    });
  }
  followRename(from, to) {
    var _a;
    if (!((_a = this.state) == null ? void 0 : _a.conflicts.includes(from))) return;
    this.state = {
      ...this.state,
      conflicts: this.state.conflicts.map((path) => path === from ? to : path)
    };
    void this.saveState();
  }
  markDirty(file) {
    var _a;
    if (file instanceof import_obsidian5.TFile && ((_a = this.state) == null ? void 0 : _a.conflicts.includes(file.path)))
      void this.recheckConflict(file);
    this.dirty = true;
    if (this.editTimer !== null) window.clearTimeout(this.editTimer);
    this.editTimer = null;
    const seconds = this.settings.syncAfterEdit;
    if (seconds > 0 && this.ready()) {
      this.editTimer = window.setTimeout(() => {
        this.editTimer = null;
        void this.syncNow("edit");
      }, seconds * 1e3);
    }
  }
  // leaving the app is the last chance a phone gives: iOS suspends it within seconds
  onVisibilityChange() {
    if (!this.ready()) return;
    if (document.visibilityState === "hidden") {
      if (this.dirty) void this.syncNow("background");
    } else if (Date.now() - this.lastFullSync > 3e4) {
      void this.syncNow("resume");
    }
  }
  async poll() {
    var _a, _b, _c;
    if (!this.ready() || this.running || document.visibilityState === "hidden") return;
    if (this.dirty || Date.now() - this.lastFullSync > FULL_SYNC_EVERY) {
      await this.syncNow("poll");
      return;
    }
    try {
      const head = await ((_a = this.remote()) == null ? void 0 : _a.head());
      if (head !== ((_c = (_b = this.state) == null ? void 0 : _b.commit) != null ? _c : null)) await this.syncNow("poll");
    } catch (error) {
      this.handleError(error, false);
    }
  }
  async syncNow(reason, allowMassDelete = false) {
    if (this.unloaded) return;
    if (reason === "manual") this.blocked = null;
    if (!this.ready()) {
      if (reason === "manual") new import_obsidian5.Notice(`Easy Git Sync: ${this.notReadyReason()}`);
      this.render();
      return;
    }
    if (reason === "manual" && !this.progressNotice) {
      this.progressNotice = new import_obsidian5.Notice("Easy Git Sync: syncing...", 0);
    }
    if (this.running) {
      this.again = true;
      return this.running;
    }
    this.running = this.run(reason, allowMassDelete).finally(() => {
      this.running = null;
      const massDelete = this.pendingMassDelete;
      this.pendingMassDelete = null;
      if (massDelete) {
        void this.confirmMassDelete(massDelete);
      } else if (this.again) {
        this.again = false;
        void this.syncNow("edit");
      }
    });
    return this.running;
  }
  syncOptions(allowMassDelete) {
    const remote = this.remote();
    if (!remote) throw new Error("No repository chosen.");
    return {
      fs: this.fs,
      remote,
      device: this.device.deviceName,
      stateFile: this.stateFile,
      configDir: this.app.vault.configDir,
      allowMassDelete,
      conflicts: this.settings.conflicts,
      remoteName: this.host.name,
      ...this.device.firstSync ? { firstSync: this.device.firstSync } : {},
      saveState: async (state) => {
        this.state = state;
        await this.saveState();
      },
      progress: (text) => {
        this.setStatus({ kind: "syncing", text });
        this.showProgress(text);
      }
    };
  }
  async run(reason, allowMassDelete) {
    this.setStatus({ kind: "syncing", text: "Syncing" });
    try {
      await this.flushEditors();
      this.dirty = false;
      const state = await this.loadState();
      const lockstep = await this.getLockstep();
      const blocker = await (lockstep == null ? void 0 : lockstep.blocker().catch(() => null));
      if (blocker) {
        this.dirty = true;
        this.setStatus({ kind: "paused", text: `Waiting: ${blocker}` });
        if (reason === "manual" || this.progressNotice) {
          this.tell(
            `paused, because ${blocker} Syncing resumes once git is back to normal.`,
            8e3
          );
        }
        return;
      }
      const before = lockstep ? await lockstep.beforeSync(state.commit).catch((e) => {
        warn("git push", e);
        return null;
      }) : null;
      const first = state.commit === null;
      const result = await sync(state, this.syncOptions(allowMassDelete));
      this.state = result.state;
      await this.saveState();
      if (this.device.firstSync && result.state.commit !== null) {
        const { firstSync: _, ...device } = this.device;
        this.device = device;
        this.saveDevice();
      }
      const commit = result.state.commit;
      if (lockstep && commit && before)
        await lockstep.afterSync(commit, before).catch((e) => warn("git reset", e));
      this.lastFullSync = Date.now();
      this.lastSynced = /* @__PURE__ */ new Date();
      this.lastErrorShown = null;
      await this.recheckConflicts();
      this.setStatus({ kind: "idle" });
      this.announce(result.report, reason === "manual" || this.progressNotice !== null, first);
      void this.warnOfExpiry();
    } catch (error) {
      this.dirty = true;
      this.handleError(error, reason === "manual");
      if (error instanceof MassDeleteError) this.pendingMassDelete = error;
    }
  }
  // saving an unchanged editor touches its mtime, and a touched note looks edited
  async flushEditors() {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (!(view instanceof import_obsidian5.MarkdownView) || !view.file) continue;
      const disk = await this.app.vault.cachedRead(view.file);
      if (disk.replace(/\r\n/g, "\n") !== view.editor.getValue()) await view.save();
    }
  }
  async getLockstep() {
    var _a;
    if (!import_obsidian5.Platform.isDesktopApp || !this.device.repo) return null;
    if (!this.lockstep) {
      const adapter = this.app.vault.adapter;
      const base = (_a = adapter.getBasePath) == null ? void 0 : _a.call(adapter);
      this.lockstep = base ? await GitLockstep.detect(
        base,
        this.host.cloneUrl(this.device.repo),
        this.device.branch,
        () => this.host.gitLogin(),
        this.stateFile
      ) : null;
    }
    return this.lockstep;
  }
  async confirmMassDelete(error) {
    const where = [
      error.here > 0 ? `${error.here} files in this vault` : null,
      error.there > 0 ? `${error.there} files on ${this.host.name}` : null
    ].filter(Boolean).join(" and ");
    const ok = await confirm(
      this.app,
      "Delete most of the vault?",
      [
        `This sync would delete ${where}. That is usually a vault that did not finish loading, a moved folder, or an emptied repository, not something done on purpose.`,
        `Nothing is deleted until you confirm. Deleted files stay in ${this.host.name}'s history either way.`
      ],
      "Delete them",
      true
    );
    if (ok) {
      this.blocked = null;
      await this.syncNow("manual", true);
    }
  }
  handleError(error, manual) {
    if (error instanceof OfflineError) {
      this.setStatus({ kind: "offline" });
      if (manual || this.progressNotice) {
        this.tell(`${this.hostName} cannot be reached. Changes sync once it can.`, 6e3);
      }
      return;
    }
    if (error instanceof MassDeleteError) {
      this.blocked = "Waiting for you to confirm a large deletion.";
      this.setStatus({ kind: "paused", text: this.blocked });
      if (this.progressNotice) this.tell("waiting for you to confirm a large deletion.", 4e3);
      return;
    }
    const message = describe(error);
    if (error instanceof RemoteError && (error.kind === "auth" || error.kind === "not-found" || error.kind === "forbidden")) {
      const login = this.device.provider === "other" ? "login" : "token";
      this.blocked = error.kind === "auth" ? `${this.hostName} did not accept the ${login}. It may have expired or been revoked: ${login === "token" ? "create a new one" : "check it"} in the settings.` : `${this.repoLabel}: ${message} Check that the ${login} still has access to it.`;
      this.setStatus({ kind: "paused", text: this.blocked });
      if (manual || this.progressNotice || this.lastErrorShown !== this.blocked)
        this.tell(this.blocked, 15e3);
      this.lastErrorShown = this.blocked;
      return;
    }
    console.error("Easy Git Sync:", error);
    this.setStatus({ kind: "error", text: message });
    if (manual || this.progressNotice || this.lastErrorShown !== message)
      this.tell(message, 1e4);
    this.lastErrorShown = message;
  }
  // shown only once a step lasts a moment: a sync with nothing to do would flash unreadable text
  showProgress(text) {
    if (!this.progressNotice) return;
    if (this.progressTimer !== null) window.clearTimeout(this.progressTimer);
    const message = `Easy Git Sync: ${text.charAt(0).toLowerCase()}${text.slice(1)}...`;
    this.progressTimer = window.setTimeout(() => {
      var _a;
      this.progressTimer = null;
      (_a = this.progressNotice) == null ? void 0 : _a.setMessage(message);
    }, 400);
  }
  tell(message, duration) {
    const content = typeof message === "string" ? `Easy Git Sync: ${message}` : createFragment((f) => {
      f.appendText("Easy Git Sync: ");
      message(f);
    });
    const notice = this.progressNotice;
    this.progressNotice = null;
    if (this.progressTimer !== null) window.clearTimeout(this.progressTimer);
    this.progressTimer = null;
    if (!notice) {
      new import_obsidian5.Notice(content, duration);
      return;
    }
    notice.setMessage(content);
    window.setTimeout(() => notice.hide(), duration);
  }
  announce(report, manual, first) {
    const lines = [];
    let duration = 4e3;
    if (report.conflicts.length > 0) {
      duration = 15e3;
      lines.push((f) => {
        f.appendText(
          report.conflicts.length === 1 ? "a note changed on two devices in the same place: " : `${report.conflicts.length} notes changed on two devices in the same places: `
        );
        report.conflicts.forEach((c, i) => {
          if (i > 0) f.appendText(", ");
          const link = f.createEl("a", { text: c.path, href: "#" });
          link.addEventListener("click", (event) => {
            event.preventDefault();
            void this.openConflict(c.path);
          });
        });
        f.appendText(". Both versions are in the note, marked. Keep one, keep both, or edit it.");
      });
    }
    if (report.newer.length > 0) {
      duration = Math.max(duration, 1e4);
      lines.push((f) => {
        f.appendText("changed in the same place on two devices, kept the newer version: ");
        report.newer.forEach((n, i) => {
          if (i > 0) f.appendText(", ");
          f.appendText(
            n.places === 0 ? `${n.path} (from ${n.from})` : `${n.path} (from ${n.from}, in ${n.places} ${n.places === 1 ? "place" : "places"})`
          );
        });
        f.appendText(`. The other version is in ${this.host.name}'s history.`);
      });
    }
    for (const kept of report.keptBoth) {
      duration = 15e3;
      lines.push(
        (f) => f.appendText(
          `${kept.path} changed on two devices. Both are kept: the other version is ${kept.copy}.`
        )
      );
    }
    if (report.restored.length > 0) {
      duration = Math.max(duration, 1e4);
      lines.push(
        (f) => f.appendText(
          `kept ${report.restored.join(", ")}: deleted on one device, but edited on another.`
        )
      );
    }
    if (report.skipped.length > 0) {
      duration = 15e3;
      lines.push(
        (f) => f.appendText(
          `not synced: ${report.skipped.map((s) => `${s.path} (${s.reason})`).join("; ")}.`
        )
      );
    }
    const changed = report.pulled.length + report.pushed.length + report.deletedHere.length + report.deletedThere.length + report.merged.length;
    let summary = null;
    if (first) {
      const deleted = [
        report.deletedHere.length > 0 ? `${report.deletedHere.length} deleted here` : null,
        report.deletedThere.length > 0 ? `${report.deletedThere.length} deleted on ${this.host.name}` : null
      ].filter(Boolean);
      summary = `in sync with ${this.repoLabel}: ${report.pulled.length} files downloaded, ${report.pushed.length} uploaded, ${report.merged.length} merged${deleted.length > 0 ? `, ${deleted.join(", ")}` : ""}.`;
    } else if (manual) {
      summary = changed === 0 ? "up to date." : `synced ${changed} ${changed === 1 ? "file" : "files"}.`;
    }
    if (summary !== null) {
      const text = summary;
      lines.unshift((f) => f.appendText(text));
    }
    if (lines.length === 0) return;
    this.tell((f) => {
      lines.forEach((line, i) => {
        if (i > 0) f.createEl("br");
        line(f);
      });
    }, duration);
  }
  // once a day at most, and once per expiry date: a token that runs out stops every sync
  async warnOfExpiry() {
    if (Date.now() - this.expiryChecked < EXPIRY_CHECK_EVERY) return;
    this.expiryChecked = Date.now();
    const expiry = await this.host.tokenExpiry().catch(() => null);
    if (!expiry || expiry.getTime() - Date.now() > EXPIRY_WARNING) return;
    const day = expiry.toISOString().slice(0, 10);
    if (this.device.expiryWarned === day) return;
    this.device.expiryWarned = day;
    this.saveDevice();
    const when = expiry.getTime() < Date.now() ? "expired on" : "expires on";
    new import_obsidian5.Notice(
      `Easy Git Sync: ${this.tokenName} ${when} ${expiry.toLocaleDateString()}. Create a new one in the settings to keep syncing.`,
      15e3
    );
  }
  async recheckConflicts() {
    if (!this.state) return;
    const still = [];
    for (const path of this.state.conflicts) {
      const file = this.app.vault.getFileByPath(path);
      if (file && hasConflictMarker(await this.app.vault.cachedRead(file))) still.push(path);
    }
    if (still.length !== this.state.conflicts.length) {
      this.state = { ...this.state, conflicts: still };
      await this.saveState();
    }
    this.render();
  }
  async recheckConflict(file) {
    if (!this.state) return;
    const text = await this.app.vault.read(file);
    if (hasConflictMarker(text)) return;
    this.state = { ...this.state, conflicts: this.state.conflicts.filter((p) => p !== file.path) };
    await this.saveState();
    this.render();
  }
  conflictCount() {
    var _a, _b;
    return (_b = (_a = this.state) == null ? void 0 : _a.conflicts.length) != null ? _b : 0;
  }
  async resolveAllNewer() {
    var _a, _b;
    const plan2 = [];
    let resolvable = 0;
    let undecided = 0;
    for (const path of (_b = (_a = this.state) == null ? void 0 : _a.conflicts) != null ? _b : []) {
      const file = this.app.vault.getFileByPath(path);
      if (!file) continue;
      const result = resolveAllNewer(await this.app.vault.read(file));
      resolvable += result.resolved;
      undecided += result.skipped;
      if (result.resolved > 0) plan2.push({ file, resolved: result.resolved });
    }
    if (resolvable === 0) {
      new import_obsidian5.Notice(
        undecided > 0 ? "Easy Git Sync: none of the conflicts says which version is newer. Resolve them in the notes." : "Easy Git Sync: no conflicts to resolve."
      );
      return;
    }
    const notes = `${plan2.length} ${plan2.length === 1 ? "note" : "notes"}`;
    const body = [
      `${resolvable} ${resolvable === 1 ? "conflict" : "conflicts"} in ${notes} will keep the version that was edited last. Both versions are already in ${this.host.name}'s history.`
    ];
    if (undecided > 0) {
      body.push(
        `${undecided} ${undecided === 1 ? "conflict does" : "conflicts do"} not say which version is newer, and ${undecided === 1 ? "stays" : "stay"} as ${undecided === 1 ? "it is" : "they are"}.`
      );
    }
    const ok = await confirm(this.app, "Keep the newer version everywhere?", body, "Keep newer");
    if (!ok) return;
    await this.flushEditors();
    let done = 0;
    for (const { file } of plan2) {
      await this.app.vault.process(file, (text) => {
        const result = resolveAllNewer(text);
        done += result.resolved;
        return result.text;
      });
    }
    await this.recheckConflicts();
    new import_obsidian5.Notice(
      `Easy Git Sync: kept the newer version in ${done} ${done === 1 ? "place" : "places"}.`
    );
  }
  showConflicts() {
    var _a, _b;
    new ConflictsModal(
      this.app,
      (_b = (_a = this.state) == null ? void 0 : _a.conflicts) != null ? _b : [],
      (path) => void this.openConflict(path)
    ).open();
  }
  async openConflict(path) {
    const file = this.app.vault.getFileByPath(path);
    if (!file) return;
    const leaf = this.app.workspace.getLeaf(false);
    await leaf.openFile(file);
    const view = leaf.view;
    if (!(view instanceof import_obsidian5.MarkdownView)) return;
    const line = view.editor.getValue().split("\n").findIndex((l) => /^<{7}(?: |$)/.test(l));
    if (line >= 0) {
      view.editor.setCursor({ line, ch: 0 });
      view.editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
    }
  }
  async loadState() {
    var _a, _b, _c;
    if (((_a = this.state) == null ? void 0 : _a.target) === this.target) return this.state;
    const saved = await this.readState(this.target);
    this.savedState = (_b = saved == null ? void 0 : saved.json) != null ? _b : null;
    this.state = (_c = saved == null ? void 0 : saved.state) != null ? _c : emptyState(this.target);
    return this.state;
  }
  // the state on disk if it belongs to the target; the copy is read only when the file is unreadable
  async readState(target) {
    const adapter = this.app.vault.adapter;
    for (const path of [this.stateFile, `${this.stateFile}.tmp`]) {
      try {
        if (!await adapter.exists(path)) continue;
        const text = await adapter.read(path);
        const saved = JSON.parse(text);
        if (saved.version !== 1 || saved.target !== target) return null;
        return { state: saved, json: path === this.stateFile ? text : null };
      } catch (error) {
        warn(`reading ${path}`, error);
      }
    }
    return null;
  }
  // copy first: iOS can kill the app mid-write, and loading falls back to the copy
  async saveState() {
    if (!this.state) return;
    const json = JSON.stringify(this.state);
    if (json === this.savedState) return;
    await this.app.vault.adapter.write(`${this.stateFile}.tmp`, json);
    await this.app.vault.adapter.write(this.stateFile, json);
    this.savedState = json;
  }
  setStatus(status) {
    this.status = status;
    if (this.statusTimer !== null) window.clearTimeout(this.statusTimer);
    this.statusTimer = null;
    if (status.kind === "syncing") {
      this.statusTimer = window.setTimeout(() => {
        this.statusTimer = null;
        this.shownStatus = this.status;
        this.render();
      }, 400);
      return;
    }
    this.shownStatus = status;
    this.render();
  }
  notReadyReason() {
    var _a;
    if (this.otherGitPluginEnabled())
      return "paused while the Git plugin is turned on in this vault.";
    if (this.device.provider === "other") {
      if (!this.device.repo) return "enter the repository's address in the settings to start.";
      if (!this.hasToken()) return "enter the login for the repository in the settings to start.";
    }
    if (!this.hasToken())
      return `add ${this.tokenName.replace(/^the /, "a ")} in the settings to start.`;
    if (!this.device.repo) return "choose a repository in the settings to start.";
    if (!this.device.started) return 'press "Start syncing" in the settings.';
    return (_a = this.blocked) != null ? _a : "not ready.";
  }
  statusDescription() {
    var _a, _b;
    const s = this.status;
    const conflicts = (_b = (_a = this.state) == null ? void 0 : _a.conflicts.length) != null ? _b : 0;
    const suffix = conflicts > 0 ? ` ${conflicts} ${conflicts === 1 ? "note has" : "notes have"} a conflict to look at.` : "";
    if (!this.ready() && s.kind !== "syncing")
      return `Not syncing: ${this.notReadyReason()}${suffix}`;
    switch (s.kind) {
      case "syncing":
        return `${s.text}...`;
      case "offline":
        return `${this.hostName} cannot be reached. Changes sync once it can.${suffix}`;
      case "error":
      case "paused":
      case "setup":
        return `${s.text}${suffix}`;
      case "idle":
        return this.lastSynced ? `Last synced at ${this.lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.${suffix}` : `Not synced yet this session.${suffix}`;
    }
  }
  render() {
    var _a, _b, _c;
    const conflicts = (_b = (_a = this.state) == null ? void 0 : _a.conflicts.length) != null ? _b : 0;
    const s = this.shownStatus;
    let icon = "check";
    let text = "Synced";
    if (!this.ready() && s.kind !== "syncing") {
      icon = "pause";
      text = this.device.started ? "Sync paused" : "Sync not set up";
    } else if (s.kind === "syncing") {
      icon = "refresh-cw";
      text = s.text;
    } else if (s.kind === "paused") {
      icon = "pause";
      text = "Sync waiting";
    } else if (s.kind === "offline") {
      icon = "wifi-off";
      text = "Offline";
    } else if (s.kind === "error") {
      icon = "alert-triangle";
      text = "Sync error";
    }
    if (conflicts > 0 && s.kind !== "syncing") {
      icon = "git-merge";
      text = `${conflicts} ${conflicts === 1 ? "conflict" : "conflicts"}`;
    }
    if (this.statusEl) {
      this.statusEl.empty();
      (0, import_obsidian5.setIcon)(this.statusEl.createSpan({ cls: "easy-git-sync-status-icon" }), icon);
      this.statusEl.createSpan({ text });
      this.statusEl.setAttr("aria-label", `${this.connectionLabel()}. ${this.statusDescription()}`);
      this.statusEl.toggleClass("is-syncing", s.kind === "syncing");
    }
    if (this.ribbonEl) {
      this.ribbonEl.toggleClass("is-syncing", s.kind === "syncing");
      this.ribbonEl.toggleClass("has-problem", s.kind === "error" || this.blocked !== null);
      this.ribbonEl.toggleClass("has-conflicts", conflicts > 0);
      this.ribbonEl.setAttr("aria-label", `${this.connectionLabel()}. ${this.statusDescription()}`);
    }
    (_c = this.settingTab) == null ? void 0 : _c.refreshConnection();
  }
  showMenu(event) {
    var _a, _b;
    const menu = new import_obsidian5.Menu();
    menu.addItem((item) => item.setTitle(this.connectionLabel()).setIsLabel(true));
    menu.addItem((item) => item.setTitle(this.statusDescription()).setIsLabel(true));
    menu.addItem(
      (item) => item.setTitle("Sync now").setIcon("refresh-cw").onClick(() => void this.syncNow("manual"))
    );
    const conflicts = (_b = (_a = this.state) == null ? void 0 : _a.conflicts.length) != null ? _b : 0;
    if (conflicts > 0) {
      menu.addItem(
        (item) => item.setTitle(`Show conflicts (${conflicts})`).setIcon("git-merge").onClick(() => this.showConflicts())
      );
      menu.addItem(
        (item) => item.setTitle("Resolve all with the newer version").setIcon("history").onClick(() => void this.resolveAllNewer())
      );
    }
    menu.addItem(
      (item) => item.setTitle("Settings").setIcon("settings").onClick(() => {
        const setting = this.app.setting;
        setting == null ? void 0 : setting.open();
        setting == null ? void 0 : setting.openTabById(this.manifest.id);
      })
    );
    menu.showAtMouseEvent(event);
  }
};
function readOnly(provider, repo) {
  switch (provider) {
    case "github":
      return `the token can read ${repo} but not write to it. Give it "Contents: Read and write" for this repository.`;
    case "gitlab":
      return `the token can read ${repo} but not write to it. It needs the write_repository scope, and you need the Developer role or higher on the project.`;
    case "bitbucket":
      return `the token can read ${repo} but not write to it. It needs the write:repository scope, and you need write access to the repository.`;
    case "forgejo":
      return `the token can read ${repo} but not write to it. Give it "Read and write" on repository, and check that you can push to it.`;
    case "other":
      return `the login can read ${repo} but not write to it.`;
  }
}
function lookupKey({ provider, server, username }, token) {
  return JSON.stringify([provider, server, username, token]);
}
function connectionOf({ provider, server, username }) {
  return { provider, server, username };
}
function targetOf(t) {
  const { provider, server, repo, branch } = t;
  if (provider === "github") return `${repo}@${branch}`;
  const where = provider === "other" ? "" : `${server.replace(/^https?:\/\//, "")}/`;
  return `${provider}:${where}${repo}@${branch}`;
}
function repoLabelOf(provider, repo) {
  if (provider !== "other") return repo;
  try {
    return new URL(repo).pathname.replace(/^\/+|\.git$/g, "") || repo;
  } catch (e) {
    return repo;
  }
}
function describe(error) {
  return error instanceof Error ? error.message : String(error);
}
function warn(what, error) {
  console.warn(`Easy Git Sync: ${what} failed:`, error);
}

/* nosourcemap */