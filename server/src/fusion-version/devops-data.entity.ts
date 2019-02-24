import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { FusionVersion } from './fusion-version.entity';

export class RequestedFor {
  @Column()
  displayName: string;
}
// tslint:disable-next-line:max-classes-per-file
@Entity()
export class DevOpsData {
  @PrimaryColumn()
  id: number;

  @Column()
  buildNumber: string;

  @Column()
  status: string;

  @Column()
  result: string;

  @Column()
  startTime: string;

  @Column()
  finishTime: string;

  @Column()
  url: string;

  @Column()
  sourceBranch: string;

  @Column()
  sourceVersion: string;

  @Column(type => RequestedFor)
  requestedFor: RequestedFor;

  @OneToMany(type => FusionVersion, version => version.devOpsData)
  versions: FusionVersion[];
}
