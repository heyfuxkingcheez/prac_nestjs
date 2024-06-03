import { IsIn, IsNumber, IsOptional } from "class-validator";

export class PaginatePostDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  where__postNum_more_than?: number;

  @IsNumber()
  @IsOptional()
  where__postNum_less_than?: number;

  @IsIn(["ASC", "DESC"])
  @IsOptional()
  order__createdAt: "ASC" | "DESC" = "ASC";

  @IsNumber()
  @IsOptional()
  take: number = 20;
}
