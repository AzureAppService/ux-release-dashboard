
import { GithubCommitAuthor } from './github-user.entity';
import { Column, ManyToOne, Entity, PrimaryColumn, ManyToMany } from 'typeorm';
import { FusionVersion } from './FusionVersion';

// tslint:disable-next-line:max-classes-per-file
export class GithubCommitData {
  @Column()
  message: string;

  @ManyToOne(type => GithubCommitAuthor, author => author.githubCommits, {
    cascade: true,
    eager: true,
  })
  author: GithubCommitAuthor;

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
