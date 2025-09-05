import { Body, Controller, Get, Ip, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { UrlEntity } from './entities/url.entity';
import type { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/urls')
  async getURLs(
    @Req() req: Request,
    @Ip() srcIp: string,
  ): Promise<UrlEntity[]> {
    const clientIp = this.getClientIp(req, srcIp);
    return this.appService.getURLs(clientIp);
  }

  @Post('/urls')
  async submitURLs(
    @Req() req: Request,
    @Ip() srcIp: string,
    @Body() urlsInput: { urls: string[] },
  ): Promise<void> {
    const clientIp = this.getClientIp(req, srcIp);
    await this.appService.submitURLs(clientIp, urlsInput);
  }

  private getClientIp(req: Request, srcIp: string): string {
    const headerIp = req.headers['x-forwarded-for'] as string | undefined;
    return headerIp?.split(',')[0].trim() ?? srcIp;
  }
}
