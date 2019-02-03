import React from "react";
import { ActionButton } from "office-ui-fabric-react/lib/Button";
import { navigate } from "@reach/router";
import "./versionCard.css";
import moment from "moment-es6";

export default function Fusion(props) {
  const { header, items } = props;
  const onHistoryClick = location => {
    navigate(`/fusion/history/${location}`);
  };
  const onBuildClick = buildNumber => {
    const versionSplit = buildNumber.split(".");
    const bn = versionSplit[versionSplit.length - 1];
    window.open(
      `https://azure-functions-ux.visualstudio.com/azure-functions-ux/_build/results?buildId=${bn}`,
      "_blank"
    );
  };
  return (
    <div className="fxs-overview-section">
      <h1>{header || "header"}</h1>
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Version</th>
            <th>Release Date</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr>
              <td>{item.name}</td>
              <td>
                <ActionButton
                  iconProps={{ iconName: "link" }}
                  allowDisabledFocus={true}
                  onClick={() => onBuildClick(item.version)}
                >
                  {item.version}
                </ActionButton>
              </td>
              <td>
                {moment
                  .utc(item.createdAt)
                  .local()
                  .format("YYYY-MM-DD hh:mm a")}
              </td>
              <td>
                <ActionButton
                  iconProps={{ iconName: "link" }}
                  allowDisabledFocus={true}
                  onClick={() => onHistoryClick(item.name)}
                >
                  Open
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
