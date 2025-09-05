import { Injectable } from '@nestjs/common';
import { UrlEntity } from './entities/url.entity';

/**
 * Should really be using better persistence like DB or otherwise.
 * For the purposes of this exercise, I'll do it in memory, but use promises anyway
 */
@Injectable()
export class AppRepository {
  private urlsMap = new Map<string, UrlEntity[]>();

  /**
   * Submit URLs to be recorded by the submitter's IP address
   *
   * @param srcIp The submitter's IP address; Filled in by NestJS
   * @param urlsInput The body of the request
   */
  async upsert(srcIp: string, urlsInput: { urls: string[] }): Promise<void> {
    if (this.urlsMap.has(srcIp)) {
      // already encountered - add
      const currUrls: UrlEntity[] = this.urlsMap.get(srcIp) ?? [];

      for (const url of urlsInput.urls) {
        let found = false;
        for (const currUrl of currUrls) {
          if (currUrl.url === url) {
            // found; don't add duplicate
            found = true;
            break;
          }
        }
        if (!found) {
          currUrls.push(new UrlEntity(url));
        }
      }
      this.urlsMap.set(srcIp, currUrls);
    } else {
      // Initialize new entry with supplied URLs
      const urlsEntities: UrlEntity[] = [];
      for (const url of urlsInput.urls) {
        urlsEntities.push(new UrlEntity(url));
      }
      this.urlsMap.set(srcIp, urlsEntities);
    }
    // instead of await
    return Promise.resolve();
  }

  /**
   * Retrieve the set of URLs submitted for the src IP address
   * @param srcIp The IP Address of the requester
   */
  async get(srcIp: string): Promise<UrlEntity[]> {
    return Promise.resolve(this.urlsMap.get(srcIp) ?? []);
  }
}
