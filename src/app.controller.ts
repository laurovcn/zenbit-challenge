import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { IFilter } from './interfaces/IFilter';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query() query: IFilter) {
    return this.appService.getHello(query);
  }
}
