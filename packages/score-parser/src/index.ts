export interface NumberedScoreMeta {
  version?: string;
  titles?: string[];
  authors?: string[];
  key?: string;
  beat?: string;
  speed?: number;
}

export type NumberedScoreNotes = string[];

export interface NumberedScore {
  meta: NumberedScoreMeta;
  notes: NumberedScoreNotes;
}

export function parseNumberedScore(input: string) {
  let meta: NumberedScoreMeta = {};
  const notes: NumberedScoreNotes = [];
  const score = {
    meta,
    notes,
  };
  const lines = input.split('\n');
  let handleScoreBegan = false; // 是否已经开始解析简谱主体部分
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const splitResult = splitLine(line);
    // 拆出来两部分的才是合法简谱代码
    if (splitResult.length < 2) continue;
    const [symbol, content] = splitResult as [string, string];

    // 解析 meta 部分的信息，且在主体开始解析后不再解析，直接忽略
    // 暂不关心歌词部分 , 'C'
    if (['Q'].includes(symbol)) {
      if (handleScoreBegan) continue;
      switch (symbol) {
        case 'V':
          meta.version = content.trim();
          break;
        case 'B':
          meta.titles = meta.titles || [];
          meta.titles.push(content.trim());
          break;
        case 'D':
          meta.key = content.trim();
          break;
        case 'P':
          meta.beat = content.trim();
          break;
        case 'J':
          meta.speed = parseInt(content.trim());
          break;
        default:
          break;
      }
      continue;
    }
    // 开始解析简谱主体部分
    const chars = content.split('').filter(char => char !== ' ');
    const notes = [];
    const charQueue = [];
    let lastNumCharIndex = -1;
    for (let j = 0; j < chars.length; j++) {
      const char = chars[j];
      // /(0-8)/.test(char)
      // char.charCodeAt(0)
      if (/(0-8)/.test(char)) {
        const prevNumChar = charQueue[lastNumCharIndex];
        if (prevNumChar) {
          const slice = charQueue.splice(lastNumCharIndex)
        }
        charQueue.push(char);
        continue;
      } else {
        charQueue.push(char);
        continue;
      }
    }

    const matcher = findSymbolHandler(symbol);
    if (!matcher || matcher.for !== 'body' && matcher.for !== 'meta') continue;
    if (matcher.for === 'meta' && handleScoreBegan) continue;
    const handleResult = matcher.handler({ symbol, content, score });
    if (matcher.for === 'meta') {
      Object.assign(meta, handleResult);
      continue;
    }
    handleScoreBegan = true;
  }
}

function splitLine(line: string): [] | [string, string] {
  line = line.trim();
  const separator = ':';
  const index = line.indexOf(separator);
  if (index < 1) { // 分隔符在行首也不可以
    return [];
  }
  const symbol = line.substring(0, index);
  const restContent = line.substring(index + 1);
  return [symbol, restContent];
}

function findSymbolHandler(symbol: string) {
  // for (let i = 0; i < lineHeadSymbols.length; i++) {
  //   const symbolConfig = lineHeadSymbols[i];
  //   if (matchSymbolPattern(symbolConfig.pattern, symbol)) {
  //     return symbolConfig;
  //   }
  // }
  return lineHeadSymbolMatchers.find(config => matchSymbolPattern(config.pattern, symbol));
}

function matchSymbolPattern(pattern: LineSymbolMatcher['pattern'], symbol: string) {
  return symbol === pattern
    || isRegExp(pattern) && pattern.test(symbol);
}

function isRegExp(regex: any): regex is RegExp {
  return regex instanceof RegExp;
}

const lineIdentifiers = {
};

interface LineHandlerContext {
  symbol: string;
  content: string;
  score: Readonly<NumberedScore>;
}

interface LineSymbolMatcher {
  pattern: string | RegExp;
  for: 'meta' | 'body'
  /** 当开始处理谱子之后，再遇到该标识符是否需要继续处理，默认`false` */
  continueAfterScore?: boolean;
  handler: (context: LineHandlerContext) => Partial<NumberedScoreMeta> | NumberedScoreNotes;
}

const lineHeadSymbolMatchers: LineSymbolMatcher[] = [
  {
    pattern: 'V', // 提取版本信息
    for: 'meta',
    handler: (context: LineHandlerContext) => {
      return {
        version: context.content.trim(),
      }
    },
  },
  {
    pattern: 'D', // 提取音调/调号
    for: 'meta',
    handler: (context: LineHandlerContext) => {
      return {
        // 音调/调号
        key: context.content.trim(),
      };
    },
  },
  {
    pattern: 'P', // 提取节拍
    for: 'meta',
    handler: (context: LineHandlerContext) => {
      return {
        beat: context.content.trim(),
      };
    },
  },
  {
    pattern: 'J', // 提取节奏/速度
    for: 'meta',
    handler: (context: LineHandlerContext) => {
      return {
        speed: parseInt(context.content.trim()),
      };
    },
  },
  {
    pattern: /^Q\d*$/,  // 提取简谱
    for: 'body',
    continueAfterScore: true,
    handler: (context: LineHandlerContext) => {
      return {
        // 音调/调号
        key: context.content.trim(),
      }
    },
  },
  {
    pattern: /^C\d*$/,  // 提取歌词
    for: 'body',
    continueAfterScore: true,
    handler: (context: LineHandlerContext) => {
      return {
        // 音调/调号
        key: context.content.trim(),
      }
    },
  },
];
