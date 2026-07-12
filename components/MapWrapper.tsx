"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./Map"), { 
  ssr: false,
  loading: () => <div style={{ height: 400, width: "100%", background: "var(--panel-bg)", borderRadius: "1rem" }} />
});

export default function MapWrapper({ units }: { units: any[] }) {
  return <MapComponent units={units} />;
}
