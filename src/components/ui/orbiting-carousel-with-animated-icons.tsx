"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Bug,
  Globe,
  Server,
  Activity,
  Cpu,
  Lock,
  Eye,
  Terminal,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Incident telemetry & forensic vectors dataset
export interface ThreatNode {
  id: string;
  caseId: string;
  name: string;
  role: string;
  company: string;
  vector: string;
  risk: "critical" | "high" | "medium";
  score: number;
  iconName: string;
  color: string;
  gradient: string;
}

export const THREAT_NODES: ThreatNode[] = [
  {
    id: "1",
    caseId: "CY-2024-047",
    name: "TechVault Exfiltration",
    role: "Insider Data Exfiltration",
    company: "TechVault Pvt Ltd",
    vector: "TOR VPN Egress · Cloud Storage API",
    risk: "critical",
    score: 94,
    iconName: "ShieldAlert",
    color: "#f87171",
    gradient: "from-red-500/20 to-orange-500/20",
  },
  {
    id: "2",
    caseId: "CY-2024-046",
    name: "MediCore Ransomware",
    role: "Automated Ransomware Triage",
    company: "MediCore Hospital Systems",
    vector: "Edge RCE · SAM Database Dump",
    risk: "critical",
    score: 98,
    iconName: "Bug",
    color: "#ef4444",
    gradient: "from-rose-500/20 to-red-600/20",
  },
  {
    id: "3",
    caseId: "CY-2024-045",
    name: "FinBridge BEC Fraud",
    role: "CEO Email Impersonation",
    company: "FinBridge Capital",
    vector: "DMARC Bypass · ₹1.2 Cr Wire Fraud",
    risk: "high",
    score: 82,
    iconName: "Globe",
    color: "#fbbf24",
    gradient: "from-amber-500/20 to-yellow-600/20",
  },
  {
    id: "4",
    caseId: "CY-2024-044",
    name: "InfraTech Cloud Breach",
    role: "Unauthorized Admin Access",
    company: "InfraTech Solutions",
    vector: "Credential Stuffing · TOR Exit Node",
    risk: "high",
    score: 79,
    iconName: "Server",
    color: "#38bdf8",
    gradient: "from-sky-500/20 to-blue-600/20",
  },
  {
    id: "5",
    caseId: "CY-2024-047",
    name: "Neural Sentinel Core",
    role: "Autonomous Vector Correlation",
    company: "CyberIntel AI Mesh",
    vector: "Realtime Kill-Chain Analysis",
    risk: "medium",
    score: 88,
    iconName: "Cpu",
    color: "#a855f7",
    gradient: "from-purple-500/20 to-indigo-600/20",
  },
  {
    id: "6",
    caseId: "CY-2024-046",
    name: "Quantum Egress Filter",
    role: "Zero-Day Exfiltration Blocker",
    company: "Defense Perimeter",
    vector: "Deep Packet Inspection · TLS 1.3",
    risk: "high",
    score: 85,
    iconName: "Lock",
    color: "#34d399",
    gradient: "from-emerald-500/20 to-teal-600/20",
  },
  {
    id: "7",
    caseId: "CY-2024-045",
    name: "Signal Telemetry Radar",
    role: "Active C2 Beacon Detection",
    company: "Autonomous Sensor Array",
    vector: "Port 8443 Anomalous Beaconing",
    risk: "high",
    score: 91,
    iconName: "Activity",
    color: "#06b6d4",
    gradient: "from-cyan-500/20 to-blue-600/20",
  },
  {
    id: "8",
    caseId: "CY-2024-044",
    name: "DarkWeb Forensic Probe",
    role: "Credential Leak Hunter",
    company: "Threat Intel Network",
    vector: "Compromised Asset Fingerprinting",
    risk: "medium",
    score: 76,
    iconName: "Eye",
    color: "#f472b6",
    gradient: "from-pink-500/20 to-rose-600/20",
  },
];

// Helper to render animated icon based on name
const renderAnimatedIcon = (name: string, color: string, size = 20) => {
  switch (name) {
    case "ShieldAlert":
      return <ShieldAlert size={size} color={color} className="animate-pulse" />;
    case "Bug":
      return <Bug size={size} color={color} className="animate-bounce" style={{ animationDuration: '2s' }} />;
    case "Globe":
      return <Globe size={size} color={color} className="animate-spin" style={{ animationDuration: '10s' }} />;
    case "Server":
      return <Server size={size} color={color} />;
    case "Cpu":
      return <Cpu size={size} color={color} className="animate-pulse" />;
    case "Lock":
      return <Lock size={size} color={color} />;
    case "Activity":
      return <Activity size={size} color={color} className="animate-pulse" />;
    case "Eye":
      return <Eye size={size} color={color} />;
    default:
      return <Terminal size={size} color={color} />;
  }
};

interface OrbitCarouselProps {
  onSelectCase?: (caseId: string) => void;
  className?: string;
}

export default function OrbitCarousel({ onSelectCase, className = "" }: OrbitCarouselProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [screenSize, setScreenSize] = useState<"xs" | "sm" | "md" | "lg">("lg");

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 640) setScreenSize("xs");
      else if (w < 768) setScreenSize("sm");
      else if (w < 1024) setScreenSize("md");
      else setScreenSize("lg");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const radius = screenSize === "xs" ? 115 : screenSize === "sm" ? 135 : screenSize === "md" ? 160 : 185;
  const nodeSize = screenSize === "xs" ? 44 : screenSize === "sm" ? 50 : 56;
  const containerSize = radius * 2 + nodeSize + 40;

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % THREAT_NODES.length);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + THREAT_NODES.length) % THREAT_NODES.length);
  }, []);

  // Auto rotation
  useEffect(() => {
    if (isHovering) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isHovering, next]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prev, next]);

  const activeNode = THREAT_NODES[activeIndex];

  const handleCardAction = () => {
    if (onSelectCase) {
      onSelectCase(activeNode.caseId);
    } else {
      navigate(`/cases/${activeNode.caseId}/analysis`);
    }
  };

  const getRotation = (index: number) => {
    return (index - activeIndex) * (360 / THREAT_NODES.length);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none py-6 ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Outer ambient radar ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        {/* Radar concentric circular guides */}
        <div
          className="absolute rounded-full border border-white/10 pointer-events-none"
          style={{ width: radius * 2, height: radius * 2 }}
        />
        <div
          className="absolute rounded-full border border-dashed border-white/5 pointer-events-none"
          style={{ width: radius * 1.3, height: radius * 1.3 }}
        />
        <div
          className="absolute rounded-full border border-white/5 pointer-events-none"
          style={{ width: radius * 2.4, height: radius * 2.4 }}
        />

        {/* Center Active Dossier Card with Liquid Glassmorphism */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="z-20 relative text-center p-4 sm:p-5"
            style={{
              width: screenSize === "xs" ? 220 : screenSize === "sm" ? 250 : 280,
              background: "rgba(14, 14, 20, 0.85)",
              backdropFilter: "blur(24px) saturate(160%)",
              WebkitBackdropFilter: "blur(24px) saturate(160%)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              borderRadius: "1.35rem",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
            }}
          >
            {/* Top pill badge */}
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <span
                className="text-[0.62rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                style={{
                  background: `${activeNode.color}22`,
                  color: activeNode.color,
                  border: `1px solid ${activeNode.color}44`,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {activeNode.risk} risk
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[0.6rem] text-slate-400 font-mono">SCORE</span>
                <span className="text-sm font-black text-white font-mono">{activeNode.score}</span>
              </div>
            </div>

            {/* Active Icon representation */}
            <div
              className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-2.5 shadow-lg relative"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: `0 0 25px ${activeNode.color}33`,
              }}
            >
              {renderAnimatedIcon(activeNode.iconName, activeNode.color, 24)}
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping"
                style={{ background: activeNode.color }}
              />
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                style={{ background: activeNode.color }}
              />
            </div>

            {/* Title & info */}
            <h3
              className="text-sm sm:text-base font-extrabold text-white truncate mb-0.5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {activeNode.name}
            </h3>
            <p className="text-[0.68rem] text-slate-400 truncate mb-1">{activeNode.company}</p>
            <p className="text-[0.62rem] text-slate-500 font-mono truncate mb-3">
              {activeNode.vector}
            </p>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/10">
              <button
                onClick={prev}
                aria-label="Previous node"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all border border-white/10"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                onClick={handleCardAction}
                className="flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-black bg-white hover:bg-slate-200 transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-white/20"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span>View in Detail</span>
                <ArrowRight size={12} />
              </button>

              <button
                onClick={next}
                aria-label="Next node"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all border border-white/10"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Orbiting Threat Nodes with Counter-Rotation */}
        {THREAT_NODES.map((node, i) => {
          const rotation = getRotation(i);
          const isActive = i === activeIndex;

          return (
            <motion.div
              key={node.id}
              animate={{
                transform: `rotate(${rotation}deg) translateY(-${radius}px)`,
              }}
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 22,
                delay: isActive ? 0 : Math.abs(i - activeIndex) * 0.03,
              }}
              style={{
                width: nodeSize,
                height: nodeSize,
                position: "absolute",
                top: `calc(50% - ${nodeSize / 2}px)`,
                left: `calc(50% - ${nodeSize / 2}px)`,
                zIndex: isActive ? 25 : 10,
              }}
            >
              {/* Counter-rotation to keep the icon and badge upright */}
              <motion.div
                animate={{ rotate: -rotation }}
                transition={{
                  type: "spring",
                  stiffness: 160,
                  damping: 22,
                }}
                className="w-full h-full"
              >
                <motion.div
                  onClick={() => setActiveIndex(i)}
                  whileHover={{
                    scale: 1.18,
                    boxShadow: `0 0 20px ${node.color}66`,
                  }}
                  whileTap={{ scale: 0.94 }}
                  className={`w-full h-full rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-md relative ${
                    isActive
                      ? "border-2 border-white bg-slate-900/90 shadow-xl"
                      : "border border-white/15 bg-slate-950/70 hover:border-white/50 opacity-80 hover:opacity-100"
                  }`}
                  style={{
                    boxShadow: isActive ? `0 0 25px ${node.color}55` : "0 8px 20px rgba(0,0,0,0.6)",
                  }}
                >
                  {renderAnimatedIcon(node.iconName, node.color, screenSize === "xs" ? 17 : 20)}
                  <span
                    className="text-[0.52rem] font-mono font-bold mt-0.5 text-slate-300 truncate max-w-[42px]"
                  >
                    {node.caseId.replace("CY-2024-", "#")}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Indicator Dots */}
      <div className="flex justify-center mt-4 space-x-1.5 z-10">
        {THREAT_NODES.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to node ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export { OrbitCarousel };
