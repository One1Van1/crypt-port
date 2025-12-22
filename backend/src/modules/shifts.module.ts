import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from '../entities/shift.entity';
import { Platform } from '../entities/platform.entity';

// Start Shift
import { StartShiftController } from '../features/shifts/start/start.controller';
import { StartShiftService } from '../features/shifts/start/start.service';

// End Shift
import { EndShiftController } from '../features/shifts/end/end.controller';
import { EndShiftService } from '../features/shifts/end/end.service';

// Get My Current Shift
import { GetMyCurrentShiftController } from '../features/shifts/get-my-current/get-my-current.controller';
import { GetMyCurrentShiftService } from '../features/shifts/get-my-current/get-my-current.service';

// Get All Shifts
import { GetAllShiftsController } from '../features/shifts/get-all/get-all.controller';
import { GetAllShiftsService } from '../features/shifts/get-all/get-all.service';

// Get Shift By ID
import { GetShiftByIdController } from '../features/shifts/get-by-id/get-by-id.controller';
import { GetShiftByIdService } from '../features/shifts/get-by-id/get-by-id.service';

// Get Shifts Statistics
import { GetShiftsStatisticsController } from '../features/shifts/statistics/statistics.controller';
import { GetShiftsStatisticsService } from '../features/shifts/statistics/statistics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shift, Platform])],
  controllers: [
    StartShiftController,
    EndShiftController,
    GetMyCurrentShiftController,
    GetAllShiftsController,
    GetShiftByIdController,
    GetShiftsStatisticsController,
  ],
  providers: [
    StartShiftService,
    EndShiftService,
    GetMyCurrentShiftService,
    GetAllShiftsService,
    GetShiftByIdService,
    GetShiftsStatisticsService,
  ],
  exports: [],
})
export class ShiftsModule {}
