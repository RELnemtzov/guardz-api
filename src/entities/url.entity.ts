export class UrlEntity {
  public url: string;
  public timestamp: number;

  constructor(url: string) {
    this.url = url;
    this.timestamp = Date.now();
  }
}
