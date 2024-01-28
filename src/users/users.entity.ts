import { IsNotEmpty, IsString } from 'class-validator';
import { CommonEntity } from '../common/entities/common.entity';
import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'USER',
})
export class UserEntity extends CommonEntity {
  @IsString()
  @IsNotEmpty({ message: '이름을 작성해주세요.' })
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '부서를 작성해주세요.' })
  @Column({ type: 'varchar', nullable: false })
  department: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: false })
  password: string;
}
