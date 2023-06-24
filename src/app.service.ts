import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { ILeasesFilter } from './interfaces/ILeasesFilter';
import * as dayjs from 'dayjs';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async calculateLeasesTotalAmount(query: ILeasesFilter) {
    const currentDate = dayjs();
    const yearStart = currentDate.startOf('year');
    const yearEnd = currentDate.endOf('year');

    const yearPeriod = {
      start: yearStart.toDate(),
      end: yearEnd.toDate(),
    };

    const leases = await this.prisma.leaseModel.findMany({
      where: {
        deletedAt: null,
        leaseStatus: 'Active',
        clientUuid: query.clientUuid,
      },
      select: {
        uuid: true,
        leaseStatus: true,
        clientUuid: true,
        costSchedule: {
          where: {
            deletedAt: null,
          },
          select: {
            uuid: true,
            costScheduleCategoryUuid: true,
            currencyCode: true,
            costData: {
              where: {
                periodDate: {
                  gte: yearPeriod.start,
                  lte: yearPeriod.end,
                },
              },
              select: {
                periodAmount: true,
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
      distinct: ['uuid'],
    });

    const leasesWithTotal = leases.map((lease) => {
      const total = lease.costSchedule.reduce((acc, costSchedule) => {
        const costData = costSchedule.costData.reduce((acc, costData) => {
          const exchangeRate =
            costSchedule.currencyModel.clientCurrencyModels[0].exchangeRate;
          const amount =
            costData.periodAmount.toNumber() * exchangeRate.toNumber();
          return acc + amount;
        }, 0);
        return acc + costData;
      }, 0);
      return {
        ...lease,
        total,
      };
    });

    return leasesWithTotal;
  }
}
