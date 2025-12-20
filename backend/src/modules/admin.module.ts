import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

// Admin Controllers
import { UpdateUserRoleController } from '../features/admin/update-user-role/update-user-role.controller';

// Admin Services
import { UpdateUserRoleService } from '../features/admin/update-user-role/update-user-role.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UpdateUserRoleController],
  providers: [UpdateUserRoleService],
})
export class AdminModule {}
