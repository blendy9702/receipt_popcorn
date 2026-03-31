"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./SplitText.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type SplitType = "chars" | "words" | "lines" | "words, chars";

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: SplitType;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: React.CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
}

export function SplitText({
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  tag = "p",
  textAlign = "center",
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.fonts.status === "loaded";
  });

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (document.fonts.status !== "loaded") {
      document.fonts.ready.then(() => setFontsLoaded(true));
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      if (animationCompletedRef.current) return;

      const el = ref.current;
      const targets = el.querySelectorAll(".split-char, .split-word");

      if (!targets.length) return;

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";
      const sign =
        marginValue === 0
          ? ""
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      const ctx = gsap.context(() => {
        gsap.fromTo(targets, from, {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
            fastScrollEnd: true,
            anticipatePin: 0.4,
          },
          onComplete: () => {
            animationCompletedRef.current = true;
            onCompleteRef.current?.();
          },
          willChange: "transform, opacity",
          force3D: true,
        });
      }, ref);

      return () => {
        ctx.revert();
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
      ],
      scope: ref,
    },
  );

  const renderContent = () => {
    const useChars = splitType.includes("chars");
    const useWords = splitType.includes("words");

    if (useChars && !useWords) {
      return text.split("").map((char, index) => (
        <span key={index} className="split-char">
          {char}
        </span>
      ));
    }

    if (useWords && !useChars) {
      const words = text.split(/\s+/);
      return words.map((word, index) => (
        <span key={index} className="split-word">
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </span>
      ));
    }

    if (useWords && useChars) {
      const words = text.split(/\s+/);
      return words.map((word, wordIndex) => (
        <span key={wordIndex} className="split-word">
          {word.split("").map((char, charIndex) => (
            <span
              key={`${wordIndex}-${charIndex}`}
              className="split-char"
            >
              {char}
            </span>
          ))}
          {wordIndex < words.length - 1 ? "\u00A0" : ""}
        </span>
      ));
    }

    return text;
  };

  const Tag = tag as React.ElementType;

  return (
    <Tag
      ref={ref}
      style={{
        textAlign,
        wordWrap: "break-word",
        willChange: "transform, opacity",
      }}
      className={`split-parent inline-block overflow-hidden whitespace-normal ${className}`}
    >
      {renderContent()}
    </Tag>
  );
}
