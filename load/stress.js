// Stress test with k6 (https://k6.io): ramps public traffic past the expected
// load to find where latency and errors break down. Runs only against a local
// server; see load/README.md.
import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:3100").replace(/\/+$/, "");
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

// k6 has no URL global, so the host is read with a regex.
const host = (BASE_URL.match(/^https?:\/\/(\[[^\]]+\]|[^/:]+)/) || [])[1];
if (!LOCAL_HOSTS.includes(host)) {
  throw new Error(`Refusing to stress ${BASE_URL}: only a local server (${LOCAL_HOSTS.join(", ")}) is allowed.`);
}

// A shared scenario taken from the end-to-end tests.
const SHARED =
  "v1.N4IgzgxgFgpgtgQwGowE5gJYHsB2IBcAjADQgBGCYMAogDYwQAu2OAkgCYEgBMADNwGYAtLwDsIUmCgJUMMAVAAHRQQEBWXr1KKwWGAW4BOUQBZSANywAPAoUEAOSQFdEqW4IGk0EW-cOkAKyccRnkiADYtcgxadidbAXDtHHNbO1IyHABzAnDuUggffBNRUidFPHxuQgBfDNoEHABrAnsSEEYnVBwsJ0YCHCdaWhqgA";

const PEAK = Number(__ENV.PEAK_VUS || 200);

export const options = {
  stages: [
    { duration: "1m", target: Math.round(PEAK * 0.25) },
    { duration: "2m", target: Math.round(PEAK * 0.5) },
    { duration: "2m", target: PEAK },
    { duration: "3m", target: PEAK },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
    "http_req_duration{name:simulator/og}": ["p(95)<3000"],
    checks: ["rate>0.99"],
  },
};

const ok = (name) => ({ [`${name} 200`]: (res) => res.status === 200 });

function page(path, name) {
  const res = http.get(`${BASE_URL}${path}`, { tags: { name } });
  check(res, ok(name));
}

// Weights roughly follow how visitors move: most land on the home page or the simulator.
const journeys = [
  [30, () => group("home", () => page("/", "home"))],
  [30, () => group("simulator", () => page("/simulator", "simulator"))],
  [15, () => group("shared scenario", () => page(`/simulator?e=${SHARED}`, "simulator?e"))],
  [10, () => group("how it works", () => {
    page("/how-it-works", "how-it-works");
    page("/how-it-works/senate", "how-it-works/senate");
  })],
  // Renders a PNG on every request, the most CPU-bound route.
  [10, () => group("og image", () => page(`/simulator/og?e=${SHARED}`, "simulator/og"))],
  [5, () => group("session", () => page("/api/auth/get-session", "get-session"))],
];
const total = journeys.reduce((sum, [weight]) => sum + weight, 0);

export default function () {
  let roll = Math.random() * total;
  const [, run] = journeys.find(([weight]) => (roll -= weight) < 0);
  run();
  sleep(1 + Math.random() * 2);
}
