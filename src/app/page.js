"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./page.module.css";

export default function Home() {
  const appID = process.env.NEXT_PUBLIC_APP_ID;
  const appKey = process.env.NEXT_PUBLIC_APP_KEY;
  const [departureData, setDepartureData] = useState();
  const [date, setDate] = useState(null);

  useEffect(() => {
    async function getDepartureData() {
      try {
        const response = await axios.get(
          `https://api.tfl.gov.uk/Line/elizabeth/Arrivals/910GILFORD?app_id=${appID}&app_key=${appKey}`
        );

        if (response.data) {
          // Map over the data to add a formatted time
          const updatedData = response.data.map((item) => {
            const arrivalDate = new Date(item.expectedArrival);
            const hours = arrivalDate.getUTCHours();
            const minutes = arrivalDate.getUTCMinutes();
            const formattedTime = `${hours
              .toString()
              .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

            return {
              ...item,
              formattedArrivalTime: formattedTime, // Add the new key
            };
          });

          setDepartureData(updatedData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    getDepartureData();
  }, [appID, appKey]);

  useEffect(() => {
    setDate(new Date()); // Set the initial date on the client
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!date) return null;

  const groupedByPlatform = departureData
    ?.sort((a, b) => new Date(a.expectedArrival) - new Date(b.expectedArrival)) // Sort by expected arrival time
    .reduce((acc, s) => {
      if (!acc[s.platformName]) {
        acc[s.platformName] = [];
      }
      acc[s.platformName].push(s);
      return acc;
    }, {});

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Departures from {departureData?.[0].stationName}</h1>
        <p>
          Current Date & Time : {date.toLocaleDateString()},{" "}
          {date.toLocaleTimeString()}
        </p>

        <div className={styles.departureData}>
          {Object.entries(groupedByPlatform || {}).map(
            ([platform, departures], index) => (
              <div key={index} className={styles.platformGroup}>
                <h2>{platform}</h2>
                {departures.map((s, i) => (
                  <div key={i} className={styles.departureItem}>
                    <p>
                      {s.formattedArrivalTime} - {s.destinationName}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* {departureData?.map((s, i) => (
          <div key={i}>
            <p>Platform: {s.platformName}</p>
            <p>Destination: {s.destinationName}</p>
            <p>Expected Arrival: {s.formattedArrivalTime}</p>
          </div>
        ))} */}
      </main>
      <footer className={styles.footer}>
        Designed and Developed by
        <a href="https://prish.al" target="_blank" rel="noopener noreferrer">
          Prish.al
        </a>
      </footer>
    </div>
  );
}
