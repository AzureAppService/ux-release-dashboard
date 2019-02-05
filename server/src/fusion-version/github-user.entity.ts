import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { GithubCommit } from './github-commits.entity';

@Entity()
export class GithubCommitAuthor {
  @PrimaryColumn()
  name: string;
  @Column()
  email: string;

  @Column({ nullable: true })
  login: string;

  @Column({ nullable: true })
  // tslint:disable-next-line:variable-name
  avatar_url: string;

  @Column()
  date: string;

  @OneToMany(type => GithubCommit, version => version.commit.author)
  githubCommits: GithubCommit[];
}
