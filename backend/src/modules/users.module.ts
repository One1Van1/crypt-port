import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

// Get All Users
import { GetAllUsersController } from '../features/users/get-all/get-all.controller';
import { GetAllUsersService } from '../features/users/get-all/get-all.service';

// Get User By ID
import { GetUserByIdController } from '../features/users/get-by-id/get-by-id.controller';
import { GetUserByIdService } from '../features/users/get-by-id/get-by-id.service';

// Update User
import { UpdateUserController } from '../features/users/update/update.controller';
import { UpdateUserService } from '../features/users/update/update.service';

// Delete User
import { DeleteUserController } from '../features/users/delete/delete.controller';
import { DeleteUserService } from '../features/users/delete/delete.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [
    GetAllUsersController,
    GetUserByIdController,
    UpdateUserController,
    DeleteUserController,
  ],
  providers: [
    GetAllUsersService,
    GetUserByIdService,
    UpdateUserService,
    DeleteUserService,
  ],
  exports: [],
})
export class UsersModule {}
