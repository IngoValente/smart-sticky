import "./styles.css";
import { useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useCallback, useState } from "react";
import useMeasure from "react-use-measure";
import { mergeRefs } from "./mergeRefs";

import Main from "./Main";

const ListItem = (props) => <li {...props} />;

function useSticky() {
  const ref = useRef<HTMLDivElement>(null);
  const maxScroll = useRef<number>();
  const topMax = useRef<number>();
  const bottomMax = useRef<number>();
  const lastPos = useRef(0);
  const direction = useRef<"up" | "down" | undefined>();
  const disabled = useRef(false);

  const [boundsRef, bounds] = useMeasure();

  const { scrollY } = useScroll({
    target: undefined
  });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start start"]
  });

  useTransform([scrollY, scrollYProgress], ([a, elV]) => {
    if (!maxScroll.current || !ref.current || disabled.current) return;
    const v = Math.max(0, Math.min(a, maxScroll.current));
    if (lastPos.current === v) return;
    if (lastPos.current > v) {
      lastPos.current = v;
      direction.current = "up";
    } else {
      lastPos.current = v;
      direction.current = "down";
    }

    const fixState = ref.current.getAttribute("data-fixed");

    if (v >= bottomMax.current) {
      if (fixState === "bottom") {
        ref.current.style.position = "absolute";
        ref.current.style.bottom = 0;
        ref.current.style.top = "auto";
        ref.current.setAttribute("data-fixed", "none");
      }
      return;
    }

    if (v <= topMax.current) {
      if (fixState === "top") {
        ref.current.style.position = "relative";
        ref.current.style.top = 0;
        ref.current.style.bottom = "auto";
        ref.current.setAttribute("data-fixed", "none");
      }
      return;
    }

    if (direction.current === "up") {
      if (fixState === "bottom") {
        const p = ref.current.getBoundingClientRect();
        ref.current.style.position = "absolute";
        ref.current.style.top = v + p.top - topMax.current + "px";
        ref.current.style.bottom = "auto";
        ref.current.setAttribute("data-fixed", "none");
        return;
      }
      if (fixState !== "top" && elV >= 1) {
        ref.current.style.position = "fixed";
        ref.current.style.top = 0;
        ref.current.style.bottom = "auto";
        ref.current.setAttribute("data-fixed", "top");
        return;
      }
    }

    if (direction.current === "down") {
      if (fixState === "top") {
        ref.current.style.position = "absolute";
        ref.current.style.top = v - topMax.current + "px";
        ref.current.style.bottom = "auto";
        ref.current.setAttribute("data-fixed", "none");
        return;
      }
      if (fixState !== "bottom" && elV <= 0) {
        ref.current.style.top = "auto";
        ref.current.style.bottom = 0;
        ref.current.style.position = "fixed";
        ref.current.setAttribute("data-fixed", "bottom");
        return;
      }
    }
  });

  const track = useCallback(() => {
    maxScroll.current = document.body.scrollHeight - window.innerHeight;

    if (!ref.current) return;

    const parent = ref.current.offsetParent || ref.current.parentElement;
    const { height: parentHeight } = parent.getBoundingClientRect();
    topMax.current = parent.offsetTop;
    bottomMax.current = parent.offsetTop + parentHeight - window.innerHeight;
    const p = ref.current.getBoundingClientRect();

    if (ref.current.getAttribute("data-fixed") === "bottom") {
      ref.current.style.top = window.innerHeight - p.height + "px";
    } else if (p.height < window.innerHeight) {
      ref.current.setAttribute("data-fixed", "none");
      ref.current.style.position = "sticky";
      ref.current.style.top = 0;
      disabled.current = true;
    } else if (disabled.current) {
      disabled.current = false;
      ref.current.style.position = "fixed";
      ref.current.style.top = 0;
      ref.current.setAttribute("data-fixed", "top");
    }
  }, [ref]);

  useEffect(() => {
    window.addEventListener("resize", track);
    track();
    return () => {
      window.removeEventListener("resize", track);
    };
  }, [track]);

  useEffect(() => {
    if (bounds.height > 0) {
      console.log("Handle height change!");
    }
  }, [bounds.height, track, scrollY, scrollYProgress]);

  return mergeRefs([boundsRef, ref]);
}

const Sidebar = ({ short = false, ...props }) => {
  const ref = useSticky();

  const [large, setLarge] = useState(false);

  return (
    <div {...props}>
      <div className="wrapper" ref={ref}>
        <ListItem>TOP</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <button onClick={() => setLarge((s) => !s)}>Toggle</button>
        {large && (
          <div style={{ width: "100%", height: "380px", background: "red" }} />
        )}
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        <ListItem>Fill content</ListItem>
        {!short && (
          <>
            <ListItem>Fill content</ListItem>
            <ListItem>Fill content</ListItem>
            <ListItem>Fill content</ListItem>
            <ListItem>Fill content</ListItem>
            <ListItem>Fill content</ListItem>
            <ListItem>Fill content</ListItem>
            <ListItem>Fill content</ListItem>
          </>
        )}
        <ListItem>BOTTOM</ListItem>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <>
      <header />
      <div className="app">
        <div />
        <Sidebar className="sidebar" />
        <Main />
        <Sidebar className="ssidebar" short>
          Hi world
        </Sidebar>
        <div />
      </div>
      <footer />
    </>
  );
}
