import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const getMousePos = (e, container) => {
  if (container) {
    const bounds = container.getBoundingClientRect();
    return {
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    };
  }
  return { x: e.clientX, y: e.clientY };
};

const Crosshair = ({
  color = "white",
  containerRef = null,
  targetSelector = "a, button, .shop-item, .dock-item, .coin-entity",
}) => {
  const cursorRef = useRef(null);
  const lineHorizontalRef = useRef(null);
  const lineVerticalRef = useRef(null);
  const filterXRef = useRef(null);
  const filterYRef = useRef(null);
  const requestRef = useRef(null);

  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (ev) => {
      mouse.current = getMousePos(ev, containerRef?.current);

      if (containerRef?.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        if (
          ev.clientX < bounds.left ||
          ev.clientX > bounds.right ||
          ev.clientY < bounds.top ||
          ev.clientY > bounds.bottom
        ) {
          gsap.to([lineHorizontalRef.current, lineVerticalRef.current], {
            opacity: 0,
          });
        } else {
          gsap.to([lineHorizontalRef.current, lineVerticalRef.current], {
            opacity: 1,
          });
        }
      }
    };

    const target = containerRef?.current || window;
    target.addEventListener("mousemove", handleMouseMove);

    gsap.set([lineHorizontalRef.current, lineVerticalRef.current], {
      opacity: 0,
    });

    const onMouseMove = () => {
      gsap.to([lineHorizontalRef.current, lineVerticalRef.current], {
        duration: 0.9,
        ease: "Power3.easeOut",
        opacity: 1,
      });

      requestRef.current = requestAnimationFrame(render);

      target.removeEventListener("mousemove", onMouseMove);
    };

    target.addEventListener("mousemove", onMouseMove);

    const primitiveValues = { turbulence: 0 };

    const tl = gsap
      .timeline({
        paused: true,
        onStart: () => {
          if (lineHorizontalRef.current)
            lineHorizontalRef.current.style.filter = `url(#filter-noise-x)`;
          if (lineVerticalRef.current)
            lineVerticalRef.current.style.filter = `url(#filter-noise-y)`;
        },
        onUpdate: () => {
          if (filterXRef.current && filterYRef.current) {
            filterXRef.current.setAttribute(
              "baseFrequency",
              primitiveValues.turbulence,
            );
            filterYRef.current.setAttribute(
              "baseFrequency",
              primitiveValues.turbulence,
            );
          }
        },
        onComplete: () => {
          if (lineHorizontalRef.current && lineVerticalRef.current) {
            lineHorizontalRef.current.style.filter =
              lineVerticalRef.current.style.filter = "none";
          }
        },
      })
      .to(primitiveValues, {
        duration: 0.5,
        ease: "power1",
        startAt: { turbulence: 1 },
        turbulence: 0,
      });

    const enter = () => tl.restart();
    const leave = () => tl.progress(1).kill();

    const render = () => {
      if (lineHorizontalRef.current && lineVerticalRef.current) {
        gsap.set(lineVerticalRef.current, { x: mouse.current.x });
        gsap.set(lineHorizontalRef.current, { y: mouse.current.y });
      }

      requestRef.current = requestAnimationFrame(render);
    };

    // --- Event Delegation for Dynamic Elements (Coins) ---
    const handleMouseOver = (e) => {
      if (!e.target || typeof e.target.closest !== "function") return;

      const target = e.target.closest(targetSelector);

      if (target) {
        if (!e.relatedTarget || !target.contains(e.relatedTarget)) {
          enter();
          target.addEventListener("mouseleave", leave, { once: true });
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      target.removeEventListener("mousemove", handleMouseMove);
      target.removeEventListener("mousemove", onMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [containerRef, targetSelector]);

  return (
    <div
      ref={cursorRef}
      className="cursor"
      style={{
        position: containerRef ? "absolute" : "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10000,
      }}>
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
        }}>
        <defs>
          <filter id="filter-noise-x">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.000001"
              numOctaves="1"
              ref={filterXRef}
            />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
          <filter id="filter-noise-y">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.000001"
              numOctaves="1"
              ref={filterYRef}
            />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
        </defs>
      </svg>
      <div
        ref={lineHorizontalRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "1px",
          background: color,
          pointerEvents: "none",
          top: 0,
          opacity: 0,
        }}></div>
      <div
        ref={lineVerticalRef}
        style={{
          position: "absolute",
          height: "100%",
          width: "1px",
          background: color,
          pointerEvents: "none",
          left: 0,
          opacity: 0,
        }}></div>
    </div>
  );
};

export default Crosshair;
