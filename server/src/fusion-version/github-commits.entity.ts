import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
} from 'typeorm';
import { FusionVersion } from './fusion-version.entity';

export class GithubCommitAuthor {
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  date: string;
}
// tslint:disable-next-line:max-classes-per-file
export class GithubCommitData {
  @Column(type => GithubCommitAuthor)
  author: GithubCommitAuthor;
  @Column()
  message: string;
}
// tslint:disable-next-line:max-classes-per-file
@Entity()
export class GithubCommit {
  @PrimaryColumn()
  sha: string;

  @Column(type => GithubCommitData)
  commit?: GithubCommitData;

  @ManyToMany(type => FusionVersion, version => version.githubCommitData)
  versions: FusionVersion[];
}
