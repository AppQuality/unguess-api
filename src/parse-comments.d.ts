
declare module 'parse-comments' {
  export default class Comments {
    constructor();
    parse(content: string): Array<{
      line: number;
      value: string;
    }>;
  }
}

