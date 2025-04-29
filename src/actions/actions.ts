// app/actions/routes.ts
"use server";

import fetch from "node-fetch";
import { importGtfs } from "gtfs";                      // GTFS import/query library :contentReference[oaicite:1]{index=1}
import GtfsRealtimeBindings from "gtfs-realtime-bindings"; // GTFS-Realtime parser :contentReference[oaicite:2]{index=2}                         // Uber API wrapper :contentReference[oaicite:3]{index=3}
import { PrismaClient } from "@prisma/client";
  
// Prevent multiple PrismaClient instances in dev :contentReference[oaicite:4]{index=4}
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * 1. Forward geocode a place name into {lat, lng} via Mapbox Geocoding API :contentReference[oaicite:5]{index=5}
 */
export async function getGeocode(query: string): Promise<{ lat: number; lng: number }> {
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${process.env.MAPBOX_TOKEN}`
  );
  if (!res.ok) throw new Error("Geocoding failed");
  const body = await res.json();
  const [lng, lat] = body.features[0].center;
  return { lat, lng };
}

/**
 * 2. Fetch driving, walking, cycling routes from Mapbox Directions API :contentReference[oaicite:6]{index=6}
 */
export async function getMapboxRoutes(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<any[]> {
  const url = [
    `https://api.mapbox.com/directions/v5/mapbox/driving/`,
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
    `?alternatives=true&geometries=geojson`,
    `&access_token=${process.env.MAPBOX_TOKEN}`
  ].join("");
  const res = await fetch(url);
  if (!res.ok) throw new Error("Mapbox routing failed");
  const data = await res.json();
  return data.routes;
}

/**
 * 3. Compute next public-transit itineraries via GTFS & GTFS-Realtime :contentReference[oaicite:7]{index=7}
 */
/*export async function getTransitRoutes(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<any[]> {
  // 1) import GTFS feeds (static) into SQLite
  await importGtfs({ });
  // 2) fetch GTFS-Realtime feeds
  const feed = await fetch(process.env.GTFS_RT_URL as string);
  const rt = GtfsRealtimeBindings.FeedMessage.decode(await feed.arrayBuffer());
  // 3) integrate schedule + realtime data to build itineraries...
  // (Implementation depends on your routing logic)
  return []; // return list of transit itineraries
}*/

/**
 * 4. Get ride-sharing ETAs & price estimates from Uber API :contentReference[oaicite:8]{index=8}
 */

/**
 * 5. Merge & sort all mode-options by wait time + total duration :contentReference[oaicite:9]{index=9}
 */
export function aggregateAndSort(routes: Array<{ wait: number; duration: number }>) {
  return [...routes].sort((a, b) => {
    // primary: wait time, secondary: duration
    if (a.wait !== b.wait) return a.wait - b.wait;
    return a.duration - b.duration;
  });
}

/**
 * 6. Estimate a ride booking (fare_id) & then create a request :contentReference[oaicite:10]{index=10}
 */
export async function bookRide(
  productId: string,
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<any> {
  // 1) get fare_id
  const estimate = await fetch(
    `https://api.uber.com/v1.2/requests/estimate` +
    `?product_id=${productId}` +
    `&start_latitude=${start.lat}&start_longitude=${start.lng}` +
    `&end_latitude=${end.lat}&end_longitude=${end.lng}`,
    { headers: { Authorization: `Bearer ${process.env.UBER_ACCESS_TOKEN}` } }
  );
  if (!estimate.ok) throw new Error("Estimate failed");
  const { fare_id } = await estimate.json();
  // 2) book ride
  const booking = await fetch(
    `https://api.uber.com/v1.2/requests`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UBER_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fare_id, product_id: productId })
    }
  );
  if (!booking.ok) throw new Error("Booking failed");
  return booking.json();
}

/**
 * 7. Log the user’s selected route for history/analytics in your database :contentReference[oaicite:11]{index=11}
 */
/*export async function logRouteSelection(
  userId: string,
  route: any
): Promise<void> {
  await prisma.routeLog.create({
    data: {
      userId,
      mode: route.mode,
      duration: route.duration,
      wait: route.wait,
      createdAt: new Date()
    }
  });
}*/
