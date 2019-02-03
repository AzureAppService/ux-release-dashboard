"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var typeorm_1 = require("typeorm");
var FusionVersion_1 = require("./entities/FusionVersion");
var DevOpsData_1 = require("./entities/DevOpsData");
var GithubCommits_1 = require("./entities/GithubCommits");
var axios_1 = require("axios");
var fusionLocations = [
    'db3',
    'hk1',
    'bay',
    'blu',
    'france',
    'india',
    'brazil',
    'australia',
    'db3-staging',
    'hk1-staging',
    'bay-staging',
    'blu-staging',
    'france-staging',
    'india-staging',
    'brazil-staging',
    'australia-staging',
];
var functionObjs = fusionLocations.map(function (loc) { return ({
    name: loc,
    prod: loc.indexOf('staging') > -1,
    environment: 'public',
    uri: "https://functions-" + loc + ".azurewebsites.net/api/version"
}); });
functionObjs.push({
    name: 'next',
    prod: false,
    environment: 'public',
    uri: "https://functions-next.azure.com/api/version"
});
functionObjs.push({
    name: 'mooncake',
    prod: true,
    environment: 'mooncake',
    uri: "https://functions.ext.azure.cn/api/version"
});
functionObjs.push({
    name: 'mooncake-staging',
    prod: false,
    environment: 'mooncake',
    uri: "https://functions-china-east-staging.chinacloudsites.cn/api/version"
});
functionObjs.push({
    name: 'fairfax',
    prod: true,
    environment: 'fairfax',
    uri: "https://functions.ext.azure.us/api/version"
});
functionObjs.push({
    name: 'fairfax-staging',
    prod: false,
    environment: 'fairfax',
    uri: "https://functions-usgov-iowa-staging.azurewebsites.us/api/version"
});
functionObjs.push({
    name: 'blackforest',
    prod: true,
    environment: 'blackforest',
    uri: "https://functions.ext.microsoftazure.de/api/version"
});
functionObjs.push({
    name: 'blackforest-staging',
    prod: false,
    environment: 'blackforest',
    uri: "https://functions-germany-central-staging.azurewebsites.de/api/version"
});
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
var getDevOpsBuild = function (version, retry) {
    if (retry === void 0) { retry = 0; }
    return __awaiter(_this, void 0, void 0, function () {
        var versionSplit, v, call, BuildInfo, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    versionSplit = version.split('.');
                    v = versionSplit[versionSplit.length - 1];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 8]);
                    return [4 /*yield*/, axios_1["default"].get("https://azure-functions-ux.visualstudio.com/95c5b65b-c568-42b7-8b23-d8e9640a79dd/_apis/build/builds/" + v)];
                case 2:
                    call = _a.sent();
                    BuildInfo = call.data;
                    if (call.status === 200) {
                        return [2 /*return*/, {
                                id: BuildInfo.id,
                                buildNumber: BuildInfo.buildNumber,
                                status: BuildInfo.status,
                                result: BuildInfo.result,
                                startTime: BuildInfo.startTime,
                                finishTime: BuildInfo.finishTime,
                                url: BuildInfo.url,
                                sourceBranch: BuildInfo.sourceBranch.split('/')[2],
                                sourceVersion: BuildInfo.sourceVersion,
                                requestedFor: {
                                    displayName: BuildInfo.requestedFor.displayName
                                }
                            }];
                    }
                    if (!(retry < 5)) return [3 /*break*/, 4];
                    return [4 /*yield*/, sleep(5000)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, getDevOpsBuild(version, retry + 1)];
                case 4: return [2 /*return*/, null];
                case 5:
                    err_1 = _a.sent();
                    if (!(retry < 5)) return [3 /*break*/, 7];
                    return [4 /*yield*/, sleep(5000)];
                case 6:
                    _a.sent();
                    return [2 /*return*/, getDevOpsBuild(version, retry + 1)];
                case 7: return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
};
var getGithubSinceLast = function (commitId1, commitId2, retry) {
    if (retry === void 0) { retry = 0; }
    return __awaiter(_this, void 0, void 0, function () {
        var call, commitsData, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 7]);
                    return [4 /*yield*/, axios_1["default"].get("https://api.github.com/repos/azure/azure-functions-ux/compare/" + commitId1 + "..." + commitId2)];
                case 1:
                    call = _a.sent();
                    if (call.status === 200) {
                        commitsData = call.data.commits.map(function (x) {
                            return {
                                sha: x.sha,
                                commit: {
                                    author: x.commit.author,
                                    committer: x.commit.commiter,
                                    message: x.commit.message
                                }
                            };
                        });
                        return [2 /*return*/, commitsData];
                    }
                    if (!(retry < 5)) return [3 /*break*/, 3];
                    return [4 /*yield*/, sleep(5000)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getGithubSinceLast(commitId1, commitId2, retry + 1)];
                case 3: return [2 /*return*/, null];
                case 4:
                    err_2 = _a.sent();
                    if (!(retry < 5)) return [3 /*break*/, 6];
                    return [4 /*yield*/, sleep(5000)];
                case 5:
                    _a.sent();
                    return [2 /*return*/, getGithubSinceLast(commitId1, commitId2, retry + 1)];
                case 6: return [2 /*return*/, null];
                case 7: return [2 /*return*/];
            }
        });
    });
};
var isNewerVersion = function (lastVersion, newVersion) {
    var lastVersionSplit = lastVersion.split('.');
    var newVersionSplit = newVersion.split('.');
    var lastVersionBuildNumber = +lastVersionSplit[lastVersionSplit.length - 1];
    var newVersionBuildNumber = +newVersionSplit[newVersionSplit.length - 1];
    return newVersionBuildNumber > lastVersionBuildNumber;
};
function run(context, req) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, promises;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, typeorm_1.createConnection({
                        type: 'postgres',
                        host: process.env.POSTGRES_ENDPOINT,
                        port: 5432,
                        username: process.env.POSTGRES_USERNAME,
                        password: process.env.POSTGRES_PASSWORD,
                        database: process.env.POSTGRES_DB,
                        ssl: true,
                        entities: [DevOpsData_1.DevOpsData, FusionVersion_1.FusionVersion, GithubCommits_1.GithubCommit]
                    })];
                case 1:
                    connection = _a.sent();
                    promises = functionObjs.map(function (obj) { return __awaiter(_this, void 0, void 0, function () {
                        var versionUri, versionFileCall, devOpsData, document, lastVersion, githubCommitData, post;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    versionUri = obj.uri;
                                    return [4 /*yield*/, axios_1["default"].get(versionUri)];
                                case 1:
                                    versionFileCall = _a.sent();
                                    return [4 /*yield*/, getDevOpsBuild(versionFileCall.data)];
                                case 2:
                                    devOpsData = _a.sent();
                                    document = {
                                        name: obj.name,
                                        prod: obj.prod,
                                        version: versionFileCall.data,
                                        devOpsData: devOpsData,
                                        lastVersion: null,
                                        githubCommitData: null
                                    };
                                    return [4 /*yield*/, connection.manager
                                            .getRepository(FusionVersion_1.FusionVersion)
                                            .createQueryBuilder('version')
                                            .where('version.name = :name', { name: obj.name })
                                            .leftJoinAndSelect("version.devOpsData", "DevOpsData")
                                            .orderBy('version.createdAt', 'DESC', 'NULLS LAST')
                                            .getOne()];
                                case 3:
                                    lastVersion = _a.sent();
                                    console.log(lastVersion);
                                    if (!(!lastVersion || lastVersion.version !== versionFileCall.data)) return [3 /*break*/, 7];
                                    if (!lastVersion) return [3 /*break*/, 5];
                                    document.lastVersion = lastVersion.version;
                                    if (!isNewerVersion(document.lastVersion, document.version)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, getGithubSinceLast(lastVersion.devOpsData.sourceVersion, devOpsData.sourceVersion)];
                                case 4:
                                    githubCommitData = _a.sent();
                                    document.githubCommitData = githubCommitData;
                                    _a.label = 5;
                                case 5:
                                    post = connection.manager.create(FusionVersion_1.FusionVersion, document);
                                    return [4 /*yield*/, connection.manager.save(FusionVersion_1.FusionVersion, post)];
                                case 6:
                                    _a.sent();
                                    _a.label = 7;
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(promises)];
                case 2:
                    _a.sent();
                    connection.close();
                    return [2 /*return*/];
            }
        });
    });
}
exports.run = run;
//# sourceMappingURL=index.js.map