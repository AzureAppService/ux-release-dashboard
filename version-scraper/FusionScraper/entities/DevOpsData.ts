import {Entity, Column, CreateDateColumn, PrimaryColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany} from "typeorm";
import { FusionVersion } from "./FusionVersion";

export class RequestedFor {

    @Column()
    displayName: string;

}
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