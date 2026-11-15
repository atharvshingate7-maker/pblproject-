"use client";

import * as React from "react";

/** The small graphic under each numeral. */
export type WarpCardDetail = "slider" | "ring" | "wave" | "cross" | "none";

/** One stat card on the ring. */
export interface WarpCard {
  /** Two-line title, top left. Use "\n" for the line break. */
  title: string;
  /** The big thin numeral, for example "25". */
  value: string;
  /** Small superscript unit after the numeral, for example "%". */
  unit?: string;
  /** Small label at the bottom left. */
  footer?: string;
  /** Mesh gradient: 42 colours, a 6 by 7 grid read row by row from the top left, smoothed with a B-spline. */
  mesh?: string[];
  /** Numeral fill, left to right. */
  numeral?: [string, string];
  /** Colour of the glow this card casts onto the top and bottom edges while it faces the viewer. */
  glow?: string;
  /** The small graphic under the numeral. */
  detail?: WarpCardDetail;
  /** Detail accent colour: slider knob glow, waveform marker, ring ticks. */
  accent?: string;
  /** Labels for the detail: slider ends, or the crosshair pill and its two badges. */
  labels?: string[];
}

export interface WarpCarouselProps {
  cards?: WarpCard[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  autoplay?: boolean;
  interval?: number;
  step?: number;
  background?: string;
  glow?: string;
  warp?: number;
  font?: string;
  seconds?: number;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_FONT =
  "\"Inter\", \"SF Pro Display\", \"SF Pro Text\", -apple-system, BlinkMacSystemFont, system-ui, \"Helvetica Neue\", Arial, sans-serif";

export const WARP_CAROUSEL_CARDS: WarpCard[] = [
  {
    title: "Motion budget\nper page",
    value: "25",
    unit: "%",
    footer: "Tuned per screen",
    detail: "slider",
    labels: ["Calm", "Lively"],
    numeral: ["#3ad2ff", "#8cf6ff"],
    accent: "#7fe8ff",
    glow: "#12b0e8",
    mesh: [
      "#022852",
      "#031e3f",
      "#031934",
      "#021831",
      "#021b36",
      "#022246",
      "#022345",
      "#020e1e",
      "#01040f",
      "#000416",
      "#020b31",
      "#021c57",
      "#01172f",
      "#01010c",
      "#03001d",
      "#0a0f4c",
      "#112383",
      "#0b36af",
      "#021142",
      "#050b47",
      "#0c2e8f",
      "#165bd4",
      "#1675fd",
      "#167bff",
      "#03288e",
      "#0438af",
      "#0d66e7",
      "#107eec",
      "#30afff",
      "#71dcff",
      "#0356e8",
      "#0259ec",
      "#0945b0",
      "#001a49",
      "#3f7c9d",
      "#d4ffff",
      "#0365ff",
      "#0256ea",
      "#052a87",
      "#00001f",
      "#1f4c7b",
      "#9ee7ff",
    ],
  },
  {
    title: "Loop length\nseconds",
    value: "20",
    unit: "s",
    footer: "Seamless on every loop",
    detail: "cross",
    labels: ["Preview", "in", "out"],
    numeral: ["#e2a6ff", "#fff6ff"],
    accent: "#d9a8ff",
    glow: "#62bce8",
    mesh: [
      "#4c2d5f",
      "#3b2245",
      "#3e285b",
      "#33204f",
      "#381844",
      "#572571",
      "#644096",
      "#4f3688",
      "#8358f6",
      "#8d54f3",
      "#5e20ac",
      "#6e24b7",
      "#482e6d",
      "#261b48",
      "#825bf6",
      "#d48cff",
      "#d07bff",
      "#b359ff",
      "#2d1837",
      "#140a1b",
      "#2c1d66",
      "#3a2383",
      "#693bca",
      "#8b42ef",
      "#411c5b",
      "#300753",
      "#3b006e",
      "#500f79",
      "#7e31c1",
      "#9541f3",
      "#44245a",
      "#3f0c69",
      "#6f15b9",
      "#d17cff",
      "#e2a3ff",
      "#a668ff",
      "#4b2f60",
      "#4d2172",
      "#6819aa",
      "#9b48dc",
      "#965dc9",
      "#7745c4",
    ],
  },
  {
    title: "Frame rate\nsteady",
    value: "95",
    unit: "fps",
    footer: "Smooth on every screen",
    detail: "ring",
    numeral: ["#f4eeb6", "#c4c688"],
    accent: "#f6efc0",
    glow: "#dacbe9",
    mesh: [
      "#ff623e",
      "#f57337",
      "#e49435",
      "#fba03f",
      "#ef6b36",
      "#f14c36",
      "#f29a3e",
      "#a0a92e",
      "#a2ba36",
      "#fffe65",
      "#ffd852",
      "#f2863b",
      "#a5b12e",
      "#46821d",
      "#6a6127",
      "#b88b44",
      "#b6bd41",
      "#c4b838",
      "#7e9f27",
      "#3b5a19",
      "#412c10",
      "#0d1700",
      "#255b0c",
      "#98ad28",
      "#a5b232",
      "#3e7c1e",
      "#002800",
      "#00300f",
      "#5b9745",
      "#c1b833",
      "#f3983b",
      "#b3b431",
      "#6fa31f",
      "#9bc976",
      "#edd896",
      "#fd8c3d",
      "#ff5f3b",
      "#ff7d47",
      "#ffa880",
      "#ffc1d8",
      "#ff8d99",
      "#ff5438",
    ],
  },
  {
    title: "Components\nin the kit",
    value: "72",
    footer: "Made by hand",
    detail: "wave",
    numeral: ["#fffdf8", "#e8603f"],
    accent: "#ff6a3d",
    glow: "#6cc0ea",
    mesh: [
      "#48001c",
      "#400119",
      "#41011d",
      "#4b021e",
      "#47021a",
      "#480019",
      "#7e0036",
      "#8c0033",
      "#4b0120",
      "#10000c",
      "#1f010b",
      "#390116",
      "#e84396",
      "#ff568c",
      "#dc433c",
      "#0e0705",
      "#090004",
      "#2f0213",
      "#ff9fd9",
      "#ff6f90",
      "#a53625",
      "#190d05",
      "#050002",
      "#2f0110",
      "#ff67b5",
      "#b11348",
      "#000000",
      "#11000c",
      "#3e021b",
      "#8a0c31",
      "#e31771",
      "#5d0027",
      "#3a0021",
      "#620030",
      "#640627",
      "#dc184a",
      "#c10b5f",
      "#920245",
      "#ab054f",
      "#910041",
      "#650226",
      "#c01240",
    ],
  },
];

const CW = 256;
const CH = 320;
const G = {
  qA: 0.46401,
  XLA: 165.774,
  zA: 35.354,
  psiA: 1.44638,
  a1: 1.31454,
  a2: 1.10948,
  qB: 0.74999,
  XB: 204.525,
  ZB: 355.405,
  bB: 0.69311,
  bE: 0.04614,
  vC: 203.134,
  aC: 229.26,
  kB: 0.01087,
  bP: 0.99129,
  qPR: 1.01828,
  bPL: 1.0092,
  qPL: 1.07139,
};

type Pose = [number, number, number];

function poseAt(q0: number): Pose {
  let q = q0;
  if (Math.abs(q) < 1) q -= G.kB * Math.sin(Math.PI * q) ** 2;
  const s = q < 0 ? -1 : 1;
  const a = Math.abs(q);
  const half = CW / 2;
  if (a <= G.qA) {
    const t = a / G.qA;
    const xl = -half + (G.XLA + half) * Math.pow(t, G.a1);
    const zl = G.zA * t ** 4;
    const psi = G.psiA * Math.pow(t, G.a2);
    return [s * (xl + half * Math.cos(psi)), zl + half * Math.sin(psi), s * psi];
  }
  const dXL = ((G.XLA + half) * G.a1) / G.qA;
  const dZL = (G.zA * 4) / G.qA;
  const dps = (G.psiA * G.a2) / G.qA;
  let Hx: number;
  let Hz: number;
  if (a <= G.qB) {
    const L = G.qB - G.qA;
    const t = (a - G.qA) / L;
    const hx = G.XLA + CW * Math.cos(G.psiA);
    const hz = G.zA + CW * Math.sin(G.psiA);
    const dhx = dXL - CW * Math.sin(G.psiA) * dps;
    const dhz = dZL + CW * Math.cos(G.psiA) * dps;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
    const h10 = t ** 3 - 2 * t ** 2 + t;
    const h01 = -2 * t ** 3 + 3 * t ** 2;
    const h11 = t ** 3 - t ** 2;
    Hx = h00 * hx + h10 * L * dhx * G.bB + h01 * G.XB + h11 * L * G.vC * G.bE;
    Hz = h00 * hz + h10 * L * dhz * G.bB + h01 * G.ZB;
  } else {
    const d = a - G.qB;
    Hx = G.XB + G.vC * d + G.aC * d * d;
    Hz = G.ZB;
  }
  const qP = s < 0 ? G.qPL : G.qPR;
  const LP = qP - G.qA;
  const tp = Math.min(1, (a - G.qA) / LP);
  const psi = (2 * tp ** 3 - 3 * tp ** 2 + 1) * G.psiA + (tp ** 3 - 2 * tp ** 2 + tp) * LP * G.kB;
  return [s * (Hx - half * Math.cos(psi)), Hz - half * Math.sin(psi), s * psi];
}

export function WarpCarousel({
  cards = WARP_CAROUSEL_CARDS,
  index,
  defaultIndex = 0,
  onIndexChange,
  autoplay = true,
  interval = 5,
  step = 2,
  background = "#000000",
  glow = "#ffffff",
  warp = 0.2,
  font = DEFAULT_FONT,
  seconds,
  ariaLabel = "Warp Carousel",
  className = "",
  style,
}: WarpCarouselProps) {
  const [current, setCurrent] = React.useState(defaultIndex);
  const effectiveIndex = index !== undefined ? index : current;

  React.useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + step) % cards.length);
    }, interval * 1000);
    return () => clearInterval(timer);
  }, [autoplay, interval, step, cards.length]);

  const handleClick = (i: number) => {
    if (onIndexChange) onIndexChange(i);
    setCurrent(i);
  };

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-${background} to-black ${className}`}
      style={style}
    >
      {cards.map((card, i) => (
        <button
          key={i}
          onClick={() => handleClick(i)}
          className="absolute transition-opacity duration-300"
          style={{
            opacity: i === effectiveIndex ? 1 : 0.3,
            transform: `rotateY(${i * 90}deg) translateZ(${warp * 200}px)`,
          }}
        >
          <div className="text-center" style={{ fontFamily: font }}>
            <h3 className="text-sm" dangerouslySetInnerHTML={{ __html: card.title.replace(/\n/g, "<br/>") }} />
            <p className="text-4xl font-bold">
              {card.value}
              {card.unit && <span className="text-sm align-top">{card.unit}</span>}
            </p>
            {card.footer && <span className="text-xs">{card.footer}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

export default WarpCarousel;
