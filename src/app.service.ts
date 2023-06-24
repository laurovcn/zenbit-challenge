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

    const rawQuery = await this.prisma.$queryRaw`
      SELECT l.uuid AS lease_uuid, ROUND(SUM(cc_local.exchange_rate * (cd.period_amount * csc.amount_pos_neg)), 4) as period_amount_extend
      FROM lease l 
      LEFT JOIN cost_sched cs ON l.uuid = cs.lease_uuid 
      LEFT JOIN cost_sched_category csc ON cs.cost_sched_category_uuid = csc.uuid 
      LEFT JOIN client_currency cc_local ON cs.currency_code = cc_local.currency_code AND cc_local.client_uuid = ${query.clientUuid}
      LEFT JOIN cost_data cd ON cs.uuid = cd.cost_sched_uuid
      WHERE l.deleted_at IS NULL AND cs.deleted_at IS NULL AND l.lease_status = 'Active' AND l.client_uuid = ${query.clientUuid}
        AND cd.period_date BETWEEN ${yearPeriod.start} AND ${yearPeriod.end}
      GROUP BY l.uuid
    `;

    const prismaStatement = await this.prisma.leaseModel.findMany({
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

    return { rawQuery, prismaStatement };
  }
}
