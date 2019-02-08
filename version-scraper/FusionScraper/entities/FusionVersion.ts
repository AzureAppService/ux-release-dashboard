import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, ManyToMany, JoinTable, Unique, ManyToOne} from "typeorm";
import { DevOpsData } from "./DevOpsData";
import { GithubCommit } from "./GithubCommits";

@Entity()
export class FusionVersion {
    @PrimaryGeneratedColumn()
    id: number;
    
    @CreateDateColumn()
    createdAt: string;

    @Column()
    name: string;

    @Column()
    version: string;

    @Column()
    prod: boolean;

    @Column({default: 'public'})
    cloud: string;

    @Column({nullable:true})
    diffUrl: string;
    
    @ManyToOne(type => DevOpsData, build => build.versions, {cascade: true})
    @JoinColumn()
    devOpsData?: DevOpsData;

    @Column()
    lastVersion?: string;

    @ManyToMany(type => GithubCommit, commit => commit.versions,{cascade: true})
    @JoinTable()
    githubCommitData?: GithubCommit[];
}