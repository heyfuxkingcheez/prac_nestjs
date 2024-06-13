import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export abstract class BaseModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({
    type: "timestamp",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp",
  })
  updatedAt: Date;
}
