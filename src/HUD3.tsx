import React, { useState } from "react";

import locationsData from "./assets/locations.json";
import { Character, Stat } from "./Stage";
interface HUDProps {

    state: any;

    onLocationClick: (
        location: string
    ) => void;
}

function TopBar({
  day,
  openMap,
  openStats,
}: {
  day: number;
  openMap: () => void;
  openStats: () => void;
}) {
  return (
    <div
      style={{
        backgroundColor: "#222",
        color: "white",
        padding: "10px",
        display: "flex",
        gap: "10px",
        alignItems: "center",
      }}
    >
      <button onClick={openMap}>🗺 Map</button>
      <button onClick={openStats}>📊 Stats</button>
      <span>📅 Day {day}</span>
    </div>
  );
}

function MapScreen({
  currentDeck,
  currentDeckIndex,
  setCurrentDeckIndex,
  close,
  onLocationClick,
}: any) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#111",
        zIndex: 99999,
        overflow: "auto",
      }}
    >
      <button
        onClick={close}
        style={{
          position: "fixed",
          right: "10px",
          top: "10px",
        }}
      >
        ✕
      </button>

      <div
        style={{
          textAlign: "center",
          marginTop: "10px",
          color: "white",
        }}
      >
        <button
          onClick={() =>
            setCurrentDeckIndex(
              Math.max(0, currentDeckIndex - 1)
            )
          }
        >
          ◀
        </button>

        {currentDeck.floorname}

        <button
          onClick={() =>
            setCurrentDeckIndex(
              Math.min(
                locationsData.floors.length - 1,
                currentDeckIndex + 1
              )
            )
          }
        >
          ▶
        </button>
      </div>

      <MapImage
        currentDeck={currentDeck}
        onLocationClick={onLocationClick}
        close={close}
      />
    </div>
  );
}

function MapImage({
  currentDeck,
  onLocationClick,
  close,
}: any) {
  return (
    <div
      style={{
        position: "relative",
        height: "95vw",
        maxWidth: "1000px",
        margin: "20px auto",
      }}
    >
      <img
        src={currentDeck.map}
        alt={currentDeck.floorname}
        style={{
          width: "100%",
          display: "block",
        }}
      />

      {currentDeck.locations?.map((location: any) => (
        <div
          key={location.name}
          title={location.name}
          onClick={() => {
            onLocationClick(location.name);
            close();
          }}
          style={{
            position: "absolute",
            left: `${location.left}%`,
            top: `${location.top}%`,
            width: `${location.width}%`,
            height: `${location.height}%`,
            border: "2px solid red",
            backgroundColor: "rgba(255,0,0,0.15)",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  );
}
function StatsScreen({
  state,
  close,
}: {
  state: any;
  close: () => void;
}) {
   return (
    <div
      style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "#222",
                        color: "white",
                        zIndex: 99999
                    }}
                >

                     <button
                        onClick={() =>{close}}
                        style={{
                            position: "fixed",
                            right: "10px",
                            top: "10px"
                        }}
                    >
                        ✕
                    </button>

                   <div style={{ padding: "20px" }}>
    <h2>Character Stats</h2>

    <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
            <tr>
                <th>Character</th>
                {state.characterDb.stats.map((stat: Stat) => (
              
                    <th key={stat.name}>
                        {stat.icon} {stat.name}
                    </th>
                ))}

                <th>Present</th>
            </tr>
        </thead>

        <tbody>
            {state.characterDb.characters.map(    (char: Character, charIndex: number) => (
           
                <tr key={char.name}>
                    <td>{char.name}</td>
                    {state.characterDb.stats.map((stat: Stat) => (
                  
                        <td key={stat.name}>
                            {
                                state
                                    .characterStats[stat.name]
                                    .value[charIndex]
                            }
                        </td>
                    ))}

                    <td style={{ textAlign: "center" }}>
                        {
                            state.characterPresent?.[char.name]
                                ? "🟢"
                                : "⚫"
                        }
                    </td>
                </tr>
            ))}
        </tbody>
    </table>

    <br />

    <div>
        📅 Day: {state.day}
    </div>

    <div>
        📍 Current Location: {state.currentLocation}
    </div>

    <div>
        LOG: {state.log}
    </div>
</div>

                </div>
   
  );
}
export default function HUD({
  state,
  onLocationClick,
}: HUDProps) {

  const [activeScreen, setActiveScreen] =
    useState<"none" | "map" | "stats">("none");

  const [currentDeckIndex, setCurrentDeckIndex] =
    useState(0);

  const currentDeck =
    locationsData.floors[currentDeckIndex];

  return (
    <>
      <TopBar
        day={state.day}
        openMap={() => setActiveScreen("map")}
        openStats={() => setActiveScreen("stats")}
      />

      {activeScreen === "map" && (
        <MapScreen
          currentDeck={currentDeck}
          currentDeckIndex={currentDeckIndex}
          setCurrentDeckIndex={setCurrentDeckIndex}
          close={() => setActiveScreen("none")}
          onLocationClick={onLocationClick}
        />
      )}

      {activeScreen === "stats" && (
        <StatsScreen
          state={state}
          close={() => setActiveScreen("none")}
        />
      )}
    </>
  );
}
