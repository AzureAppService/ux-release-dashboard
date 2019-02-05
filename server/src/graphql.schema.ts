/* tslint:disable */
export class DevOpsData {
    id: number;
    buildNumber: string;
    status: string;
    result: string;
    startTime: string;
    url: string;
    sourceBranch: string;
    sourceVersion: string;
    requestedFor?: RequestedFor;
}

export class FusionLocation {
    name: string;
    url: string;
    prod: boolean;
    latestVersion?: FusionVersion;
    versionHistory?: FusionVersion[];
}

export class FusionVersion {
    id?: number;
    createdAt?: DateTime;
    name?: string;
    version?: string;
    prod?: boolean;
    lastVersion?: string;
    diffUrl?: string;
    devOpsData?: DevOpsData;
    githubCommitData?: GithubCommits[];
}

export class GithubCommitAuthor {
    name: string;
    email: string;
    date: string;
}

export class GithubCommitData {
    author: GithubCommitAuthor;
    message: string;
}

export class GithubCommits {
    sha: string;
    commit?: GithubCommitData;
}

export class IbizaVersion {
    id?: number;
    name?: string;
    version?: string;
    createdAt?: DateTime;
}

export abstract class IQuery {
    abstract fusionLocations(): FusionLocation[] | Promise<FusionLocation[]>;

    abstract getFusionLocation(location?: string): FusionLocation | Promise<FusionLocation>;

    abstract ibizaStages(): Stage[] | Promise<Stage[]>;

    abstract getIbizaStage(name?: string): Stage | Promise<Stage>;

    abstract temp__(): boolean | Promise<boolean>;
}

export class RequestedFor {
    displayName: string;
}

export class Stage {
    name: string;
    latestVersion?: IbizaVersion;
    versionHistory?: IbizaVersion[];
}

export type Date = any;
export type DateTime = any;
export type Time = any;
