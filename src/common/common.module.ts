import { Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { CommonController } from "./common.controller";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
