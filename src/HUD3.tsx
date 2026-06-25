import React, { useState } from "react";

import locationsData from "./assets/locations.json";

interface HUDProps {

    state: any;

    onLocationClick: (
        location: string
    ) => void;
}

export default function HUD({

    state,

    onLocationClick

}: HUDProps) {

    const [activeScreen, setActiveScreen] =
        useState<"none" | "map" | "stats">(
            "none"
        );

    const [currentDeckIndex, setCurrentDeckIndex] =
        useState(0);

    const currentDeck =
        locationsData.floors[
            currentDeckIndex
        ];

    return (

        <div>

            {/* TOP BAR */}

            <div
                style={{
                    backgroundColor: "#222",
                    color: "white",
                    padding: "10px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center"
                }}
            >

                <button
                    onClick={() =>
                        setActiveScreen("map")
                    }
                >
                    🗺 Map
                </button>

                <button
                    onClick={() =>
                        setActiveScreen("stats")
                    }
                >
                    📊 Stats
                </button>

                <span>
                    📅 Day {state.day}
                </span>

            </div>

            {/* MAP SCREEN */}

            {activeScreen === "map" && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "#111",
                        zIndex: 99999,
                        overflow: "auto"
                    }}
                >

                    {/* CLOSE */}

                    <button
                        onClick={() =>
                            setActiveScreen("none")
                        }
                        style={{
                            position: "fixed",
                            right: "10px",
                            top: "10px",
                            zIndex: 100000
                        }}
                    >
                        ✕
                    </button>

                    {/* DECK NAV */}

                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "10px",
                            color: "white"
                        }}
                    >

                        <button
                            onClick={() =>
                                setCurrentDeckIndex(
                                    Math.max(
                                        0,
                                        currentDeckIndex - 1
                                    )
                                )
                            }
                        >
                            ◀
                        </button>

                        {" "}

                        {currentDeck.floorname}

                        {" "}

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

                    {/* MAP IMAGE */}

                    <div
                        style={{
                            position: "relative",
                            height: "95vw",
                            maxWidth: "1000px",
                            margin: "20px auto"
                        }}
                    >

                        <img
                            src={currentDeck.map}
                            alt={currentDeck.floorname}
                            style={{
                                width: "100%",
                                display: "block"
                            }}
                        />

                        {/* HOTSPOTS */}

                        {currentDeck.locations.map(
                            (location: any) => (

                                <div

                                    key={
                                        location.name
                                    }

                                    onClick={() => {

                                        onLocationClick(
                                            location.name
                                        );

                                        setActiveScreen(
                                            "none"
                                        );

                                    }}

                                    title={
                                        location.name
                                    }

                                    style={{
                                        position:
                                            "absolute",

                                        left:
                                            `${location.left}%`,

                                        top:
                                            `${location.top}%`,

                                        width:
                                            `${location.width}%`,

                                        height:
                                            `${location.height}%`,

                                        border:
                                            "2px solid red",

                                        backgroundColor:
                                            "rgba(255,0,0,0.15)",

                                        cursor:
                                            "pointer"
                                    }}

                                />
                            )
                        )}

                    </div>

                </div>

            )}

            {/* STATS SCREEN */}

            {activeScreen === "stats" && (

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
                        onClick={() =>
                            setActiveScreen("none")
                        }
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

                {state.characterDb.stats.map(stat => (
                    <th key={stat.name}>
                        {stat.icon} {stat.name}
                    </th>
                ))}

                <th>Present</th>
            </tr>
        </thead>

        <tbody>
            {state.characterDb.characters.map((char, charIndex) => (
                <tr key={char.name}>
                    <td>{char.name}</td>

                    {state.characterDb.stats.map(stat => (
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

            )}

        </div>

    );
}
