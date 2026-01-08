import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AuthModule } from './auth.module';

// Get All Users
import { GetAllUsersController } from '../features/users/get-all/get-all.controller';
import { GetAllUsersService } from '../features/users/get-all/get-all.service';

// Get User By ID
import { GetUserByIdController } from '../features/users/get-by-id/get-by-id.controller';
import { GetUserByIdService } from '../features/users/get-by-id/get-by-id.service';

// Get User Profile
import { GetUserProfileController } from '../features/users/get-profile/get-profile.controller';
import { GetUserProfileService } from '../features/users/get-profile/get-profile.service';

// Update User
import { UpdateUserController } from '../features/users/update/update.controller';
import { UpdateUserService } from '../features/users/update/update.service';

// Delete User
import { DeleteUserController } from '../features/users/delete/delete.controller';
import { DeleteUserService } from '../features/users/delete/delete.service';

// Create User
import { CreateUserController } from '../features/users/create/create.controller';
import { CreateUserService } from '../features/users/create/create.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [
    GetAllUsersController,
    GetUserByIdController,
    GetUserProfileController,
    CreateUserController,
    UpdateUserController,
    DeleteUserController,
  ],
  providers: [
    GetAllUsersService,
    GetUserByIdService,
    GetUserProfileService,
    CreateUserService,
    UpdateUserService,
    DeleteUserService,
  ],
  exports: [],
})
export class UsersModule {}
