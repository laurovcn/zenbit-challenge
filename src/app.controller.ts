import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ILeasesFilter } from './interfaces/ILeasesFilter';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('leases/total-amount')
@ApiTags('Leases Total Amount')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiQuery({ name: 'clientUuid', type: 'string', required: false })
  @Get()
  calculateLeasesTotalAmount(@Query() query: ILeasesFilter) {
    return this.appService.calculateLeasesTotalAmount(query);
  }
}
