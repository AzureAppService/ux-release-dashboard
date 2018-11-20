import React from "react";
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

export default function LoadingPage() {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      }}
    >
      <Spinner
        size={SpinnerSize.large}
        label="Loading"
        ariaLive="assertive"
      />
    </div>
  );
}
