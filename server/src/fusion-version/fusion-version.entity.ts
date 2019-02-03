import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  Unique,
  ManyToOne,
} from 'typeorm';
import { DevOpsData } from './devops-data.entity';
import { GithubCommit } from './github-commits.entity';

@Entity()
export class FusionVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  name: string;

  @Column()
  version: string;

  @Column()
  prod: boolean;

  @ManyToOne(type => DevOpsData, build => build.versions, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  devOpsData?: DevOpsData;

  @Column({ nullable: true })
  lastVersion?: string;

  @ManyToMany(type => GithubCommit, commit => commit.versions, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  githubCommitData?: GithubCommit[];
}
