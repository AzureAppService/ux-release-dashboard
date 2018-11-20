import React from "react";
import "./versionCard.css";
export default function VersionCard(props) {
  const { header, items } = props;
  return (
    <div className="fxs-overview-section">
      <h1>{header || "header"}</h1>
      <ul>
        {items.map(item => (
          <li class="property">
            <div class="property-label">
              <span>{item.label}</span>
            </div>
            <div class="property-value">
              <span>{item.value}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
