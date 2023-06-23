import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { IFilter } from './interfaces/IFilter';
import * as dayjs from 'dayjs';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(query: IFilter) {
    const currentDate = dayjs();

    const yearStart = currentDate.startOf('year');

    const yearEnd = currentDate.endOf('year');

    const yearPeriod = {
      start: new Date(yearStart.format('YYYY-MM-DD')),
      end: new Date(yearEnd.format('YYYY-MM-DD')),
    };

    const consult = `
    SELECT l.uuid AS lease\_uuid, ROUND(SUM(cc\_local.exchange_rate 
      \* (cd.period_amount \* csc.amount\_pos\_neg)),4) as period\_amount\_extend

      FROM lease l 
      LEFT JOIN cost\_sched cs ON l.uuid = cs.lease\_uuid 
      LEFT JOIN cost\_sched\_category csc ON cs.cost\_sched\_category\_uuid = csc.uuid 
      LEFT JOIN client\_currency cc\_local on cs.currency\_code = cc\_local.currency\_code AND cc\_local.client\_uuid = '${query.clientUuid}' 
      LEFT JOIN cost\_data cd ON cs.uuid = cd.cost\_sched\_uuid
       
       WHERE l.deleted\_at IS NULL AND cs.deleted\_at IS NULL AND l.lease\_status = 'Active' AND l.client\_uuid = 
       '${query.clientUuid}' AND cd.period\_date BETWEEN '${yearPeriod.start}' AND '${yearPeriod.end}' GROUP BY l.uuid`;

    return await this.prisma.leaseModel.findMany({
      select: {
        uuid: true,
        costSchedule: {
          where: {
            deletedAt: null,
          },
          select: {
            costData: {
              where: {
                periodDate: {
                  gte: yearPeriod.start,
                  lte: yearPeriod.end,
                },
              },
            },
            costScheduleCategory: {
              select: {
                amountPos: true,
              },
            },
            currencyModel: {
              select: {
                clientCurrencyModels: {
                  select: {
                    exchangeRate: true,
                  },
                  where: {
                    clientUuid: query.clientUuid,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        deletedAt: null,
        leaseStatus: 'Active',
        clientUuid: query.clientUuid,
      },
      distinct: 'uuid',
    });
  }
}
