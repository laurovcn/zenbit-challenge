import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ILeasesFilter } from './interfaces/ILeasesFilter';
import { LeaseStatusEnum } from '@prisma/client';
import { PrismaService } from './database/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, PrismaService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('calculateLeasesTotalAmount', () => {
    it('should calculate the total amount of leases', async () => {
      // Arrange
      const query: ILeasesFilter = { clientUuid: 'clientUuid' };
      const expectedTotalAmount = [
        {
          total: 100,
          totalAmount: 100,
          uuid: 'uuid',
          leaseStatus: LeaseStatusEnum.Active,
          leaseStart: 'leaseStart',
          clientUuid: 'clientUuid',
          costSchedule: [
            {
              uuid: 'costScheduleUuid',
              costScheduleCategoryUuid: 'costScheduleCategoryUuid',
              currencyCode: 'USD',
              costData: [],
              costScheduleCategory: {
                amountPos: 0,
              },
              currencyModel: {
                clientCurrencyModels: [
                  {
                    exchangeRate: 1 as any,
                  },
                ],
              },
            },
          ],
        },
      ];

      jest
        .spyOn(appService, 'calculateLeasesTotalAmount')
        .mockResolvedValue(expectedTotalAmount);

      const result = await appController.calculateLeasesTotalAmount(query);

      expect(result).toBe(expectedTotalAmount);
      expect(appService.calculateLeasesTotalAmount).toHaveBeenCalledWith(query);
    });
  });
});
