import { IsIn, IsNumber, IsOptional } from "class-validator";

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  where__postNum__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__postNum__less_than?: number;

  @IsIn(["ASC", "DESC"])
  @IsOptional()
  order__createdAt: "ASC" | "DESC" = "ASC";

  @IsNumber()
  @IsOptional()
  take: number = 20;
}
