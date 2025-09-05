import { Injectable } from '@nestjs/common';
import { AppRepository } from './app.repository';
import { UrlEntity } from './entities/url.entity';

@Injectable()
export class AppService {
  constructor(private readonly appRepository: AppRepository) {}

  /**
   * Submit URLs to be recorded by the submitter's IP address
   *
   * @param srcIp The submitter's IP address; Filled in by NestJS
   * @param urlsInput The body of the request
   */
  async submitURLs(
    srcIp: string,
    urlsInput: { urls: string[] },
  ): Promise<void> {
    await this.appRepository.upsert(srcIp, urlsInput);
  }

  /**
   * Get an array of URLs by the src IP address
   * @param srcIp The IP address of the requester
   */
  async getURLs(srcIp: string): Promise<UrlEntity[]> {
    return this.appRepository.get(srcIp);
  }
}
