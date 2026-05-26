"use client";

import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  Tooltip
} from "react-leaflet";
import type { LatLngExpression, PathOptions } from "leaflet";

type CollaborationSite = {
  city: string;
  institution: string;
  country: "United States" | "China";
  clinicians: number;
  latitude: number;
  longitude: number;
  role: string;
};

type Region = {
  name: string;
  coordinates: LatLngExpression[];
};

const regionStyle: PathOptions = {
  color: "#D5CBB8",
  fillColor: "#E8E1D2",
  fillOpacity: 1,
  opacity: 1,
  weight: 1
};

const worldRegions: Region[] = [
  {
    name: "North America",
    coordinates: [
      [67, -165],
      [72, -125],
      [58, -65],
      [43, -55],
      [25, -82],
      [18, -105],
      [28, -130],
      [48, -150]
    ]
  },
  {
    name: "South America",
    coordinates: [
      [12, -81],
      [6, -52],
      [-18, -39],
      [-55, -67],
      [-34, -78],
      [-8, -82]
    ]
  },
  {
    name: "Greenland",
    coordinates: [
      [83, -73],
      [82, -20],
      [70, -15],
      [60, -45],
      [66, -72]
    ]
  },
  {
    name: "Europe",
    coordinates: [
      [70, -10],
      [62, 32],
      [45, 40],
      [36, 5],
      [45, -10]
    ]
  },
  {
    name: "Africa",
    coordinates: [
      [35, -18],
      [32, 35],
      [8, 52],
      [-35, 22],
      [-28, -8],
      [5, -18]
    ]
  },
  {
    name: "Asia",
    coordinates: [
      [72, 35],
      [64, 116],
      [50, 150],
      [25, 138],
      [8, 104],
      [22, 70],
      [40, 45]
    ]
  },
  {
    name: "Australia",
    coordinates: [
      [-11, 113],
      [-16, 153],
      [-39, 145],
      [-34, 115]
    ]
  }
];

function graticuleLines() {
  const lines: LatLngExpression[][] = [];

  for (const latitude of [-60, -30, 0, 30, 60]) {
    lines.push([
      [latitude, -180],
      [latitude, 180]
    ]);
  }

  for (const longitude of [-120, -60, 0, 60, 120]) {
    lines.push([
      [-70, longitude],
      [80, longitude]
    ]);
  }

  return lines;
}

export function LeafletClinicalMap({
  sites
}: {
  sites: CollaborationSite[];
}) {
  const jhu = sites.find((site) => site.city === "Baltimore");
  const nju = sites.find((site) => site.city === "Nanjing");
  const collaborationLine =
    jhu && nju
      ? ([
          [jhu.latitude, jhu.longitude],
          [nju.latitude, nju.longitude]
        ] as LatLngExpression[])
      : [];

  return (
    <MapContainer
      attributionControl={false}
      center={[24, 20]}
      className="h-[440px] w-full bg-[#F7F3EA]"
      maxBounds={[
        [-70, -180],
        [84, 180]
      ]}
      maxBoundsViscosity={0.8}
      maxZoom={5}
      minZoom={1}
      scrollWheelZoom={false}
      zoom={2}
      zoomControl
    >
      {graticuleLines().map((line, index) => (
        <Polyline
          key={`grid-${index}`}
          positions={line}
          pathOptions={{ color: "#E5E0D5", opacity: 0.9, weight: 1 }}
        />
      ))}

      {worldRegions.map((region) => (
        <Polygon
          key={region.name}
          positions={region.coordinates}
          pathOptions={regionStyle}
        >
          <Tooltip direction="center" permanent>
            <span className="font-mono text-[10px] text-muted">
              {region.name}
            </span>
          </Tooltip>
        </Polygon>
      ))}

      {collaborationLine.length > 0 ? (
        <Polyline
          positions={collaborationLine}
          pathOptions={{
            color: "#A6192E",
            dashArray: "6 6",
            opacity: 0.85,
            weight: 2
          }}
        />
      ) : null}

      {sites.map((site) => {
        const isCoreSite = site.role.includes("Research");

        return (
          <CircleMarker
            key={`${site.city}-${site.institution}`}
            center={[site.latitude, site.longitude]}
            pathOptions={{
              color: isCoreSite ? "#A6192E" : "#002D72",
              fillColor: isCoreSite ? "#A6192E" : "#002D72",
              fillOpacity: 0.82,
              opacity: 1,
              weight: 1
            }}
            radius={Math.max(7, Math.min(14, site.clinicians / 1.6))}
          >
            <Tooltip direction="top" offset={[0, -6]} permanent>
              <span className="font-mono text-[10px] text-ink">
                {site.city}
              </span>
            </Tooltip>
            <Popup>
              <div className="min-w-44">
                <p className="font-semibold text-ink">{site.city}</p>
                <p className="mt-1 text-sm text-muted">{site.institution}</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.08em] text-accent">
                  {site.role}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {site.clinicians} illustrative clinician evaluators
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
