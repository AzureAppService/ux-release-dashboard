import {Entity, Column, CreateDateColumn, PrimaryColumn, ManyToMany, Unique, PrimaryGeneratedColumn} from "typeorm";
import { FusionVersion } from "./FusionVersion";

export class GithubCommitAuthor {
    @Column()
    name: string;
    @Column()
    email: string;
    @Column()
    date: string;
}
export class GithubCommitData {
    @Column(type => GithubCommitAuthor)
    author : GithubCommitAuthor;
    @Column()
    message : string;
}
@Entity()
export class GithubCommit {

    @PrimaryColumn()
    sha: string;

    @Column(type => GithubCommitData)
    commit: GithubCommitData;

    @ManyToMany(type => FusionVersion, version => version.githubCommitData)
    versions: FusionVersion[];
}