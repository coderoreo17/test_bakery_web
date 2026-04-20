"use client";

import { useState } from "react";
import { TypeAnimation } from "react-type-animation";

export default function HeroText() {
  const [fade, setFade] = useState(false);

  return (
    <h1 className="text-lg md:text-xl mb-8 text-gray-200">
      <span
        className={`text-white transition-opacity duration-700 ${
          fade ? "opacity-0" : "opacity-100"
        }`}
      >
        <TypeAnimation
          sequence={[
            "Order delicious cakes & bakery treats online. Customize your dream cake and pick it fresh.",
            3000,
            () => setFade(true),   // fade out
            500,
            (el) => {
              el.textContent = ""; // clear text
              setFade(false);      // fade in again
            },
          ]}
          wrapper="span"
          speed={40}
          repeat={Infinity}
          cursor={true}
        />
      </span>
    </h1>
  );
}