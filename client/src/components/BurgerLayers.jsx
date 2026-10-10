import { useEffect, useRef, useState } from "react";
import "./BurgerLayers.css";

// top/bottom: % chiều cao ảnh, chỉnh lại cho khớp ảnh thật
const ITEMS = [
  { name: "Vỏ Bánh Mì Nướng Bơ Tỏi", desc: "Giòn thơm, thơm béo vị bơ nguyên chất", top: 0,  bottom: 22 },
  { name: "Thịt Xông Khói Giòn Rụm", desc: "Bacon nướng giòn thơm béo ngậy",         top: 20, bottom: 42 },
  { name: "Cà Chua Tươi Tươi Sạch",  desc: "Nông sản Đà Lạt tươi sạch trong ngày",   top: 40, bottom: 60 },
  { name: "Thịt Bò Nướng Than Hồng", desc: "Thịt bò Úc nhập khẩu 100% mềm ngọt",     top: 58, bottom: 74 },
  { name: "Rau Xà Lách & Đế Bánh",   desc: "Giữ độ nóng hổi và hương vị vẹn toàn",   top: 72, bottom: 100 },
];

export default function BurgerLayers({ src, onOrderClick }) {
  const [active, setActive] = useState(null);
  const box = useRef(null);

  useEffect(() => {
    const onDown = (e) => { if (box.current && !box.current.contains(e.target)) setActive(null); };
    const onKey = (e) => { if (e.key === "Escape") setActive(null); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const it = active === null ? null : ITEMS[active];
  const clip = it
    ? `inset(${it.top}% 0 ${100 - it.bottom}% 0)`
    : "inset(0% 0 0% 0)";

  return (
    <div className="bl" ref={box}>
      <div className="bl__img">
        <img className="bl__dim" src={src} alt="" draggable={false} />
        <img className="bl__lit" src={src} alt="Burger" draggable={false} style={{ clipPath: clip }} />
      </div>

      <ul className="bl__list">
        {ITEMS.map((x, i) => (
          <li key={i}>
            <button
              type="button"
              aria-pressed={active === i}
              className={active === i ? "is-active" : ""}
              onClick={() => setActive(active === i ? null : i)}
            >
              <b>{i + 1}</b>
              <span><strong>{x.name}</strong><small>{x.desc}</small></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
