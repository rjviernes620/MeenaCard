import { useState, useEffect, useRef } from "react"
import confetti from "canvas-confetti"
import wholesomeImg from "./assets/wholesome-photo.jpg"
import memeImg from "./assets/meme.png"

/* ── intersection reveal ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({
  children,
  delay = 0,
  from = "bottom",
}: {
  children: React.ReactNode
  delay?: number
  from?: "bottom" | "left" | "right" | "scale"
}) {
  const { ref, visible } = useInView()
  const hidden: React.CSSProperties =
    from === "bottom" ? { opacity: 0, transform: "translateY(48px)" }
      : from === "left" ? { opacity: 0, transform: "translateX(-40px)" }
        : from === "right" ? { opacity: 0, transform: "translateX(40px)" }
          : { opacity: 0, transform: "scale(0.88)" }

  return (
    <div
      ref={ref}
      style={{
        ...(visible ? { opacity: 1, transform: "none" } : hidden),
        transition: `opacity 1.1s cubic-bezier(0.22,0.61,0.36,1) ${delay}ms, transform 1.1s cubic-bezier(0.22,0.61,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ── falling petals ── */
const PETALS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${3 + Math.random() * 94}%`,
  delay: `${Math.random() * 10}s`,
  dur: `${8 + Math.random() * 7}s`,
  size: `${8 + Math.random() * 10}px`,
  color: ["#f4c2c2", "#e8a0bf", "#fce4ec", "#f8bbd0", "#f9a8d4"][i % 5],
}))

function Petals() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 5 }}>
      {PETALS.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left, top: "-16px",
            width: p.size, height: p.size,
            borderRadius: "50% 0 50% 0",
            background: p.color,
            opacity: 0.75,
            animation: `petalsRain ${p.dur} ${p.delay} ease-in infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ── gold divider ── */
function Divider({ icon = "✦" }: { icon?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 40px 0" }}>
      <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.6))" }} />
      <span style={{ color: "#d4af37", fontSize: "14px" }}>{icon}</span>
      <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,rgba(212,175,55,0.6),transparent)" }} />
    </div>
  )
}

/* ── sparkle dot ── */
function Star({ x, y, delay, size = 6 }: { x: string; y: string; delay: string; size?: number }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: size, height: size,
      background: "#f5e08a",
      clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
      animation: `starTwinkle 2.6s ${delay} ease-in-out infinite`,
      zIndex: 6,
    }} />
  )
}



/* ══════════════════════════════════════════ */
export default function App() {
  const [stage, setStage] = useState<"sealed" | "opening" | "open">("sealed")
  const [presentTaps, setPresentTaps] = useState(0)
  const [tapParticles, setTapParticles] = useState<{ id: number; x: number; icon: string }[]>([])
  const [isWobbling, setIsWobbling] = useState(false)
  const particleIdRef = useRef(0)

  const VOUCHER_URL =
    import.meta.env.VITE_VOUCHER_URL ||
    import.meta.env.VOUCHER_URL

  const fireCelebrationConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#c9a84c", "#f5e08a", "#d4af37", "#ffffff", "#f4c2c2", "#e8a0bf"],
      })
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.65 },
          colors: ["#c9a84c", "#f5e08a", "#ffffff"],
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.65 },
          colors: ["#c9a84c", "#f5e08a", "#ffffff"],
        })
      }, 250)
    } catch (e) {
      console.error("Confetti launch error:", e)
    }
  }

  const openCard = () => {
    if (stage !== "sealed") return
    setStage("opening")
    setTimeout(() => setStage("open"), 800)
  }

  const tapPresent = () => {
    if (presentTaps >= 10) {
      fireCelebrationConfetti()
      return
    }

    const nextTaps = presentTaps + 1
    setPresentTaps(nextTaps)

    setIsWobbling(true)
    setTimeout(() => setIsWobbling(false), 400)

    // Spawn 3 burst particles per tap
    const icons = ["🎁", "🎀", "✨", "⭐", "🎉", "💖", "🥂", "💖", "✨"]
    const newParticles: { id: number; x: number; icon: string }[] = []

    for (let i = 0; i < 3; i++) {
      particleIdRef.current += 1
      const id = particleIdRef.current
      const icon = icons[Math.floor(Math.random() * icons.length)]
      const x = 20 + Math.random() * 60
      newParticles.push({ id, x, icon })
    }

    setTapParticles(prev => [...prev, ...newParticles])

    setTimeout(() => {
      const idsToRemove = new Set(newParticles.map(p => p.id))
      setTapParticles(prev => prev.filter(p => !idsToRemove.has(p.id)))
    }, 1800)

    if (nextTaps === 10) {
      fireCelebrationConfetti()
    }
  }

  /* ── SEALED ── */
  if (stage !== "open") {
    return (
      <div style={{
        width: "100%", maxWidth: "430px", minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 25%, #2e1630 0%, #130b10 55%, #080507 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <Petals />
        <Star x="10%" y="15%" delay="0s" />
        <Star x="84%" y="20%" delay="0.7s" />
        <Star x="20%" y="78%" delay="1.3s" size={8} />
        <Star x="76%" y="72%" delay="0.4s" size={5} />
        <Star x="52%" y="8%" delay="1s" size={7} />

        {/* ambient orbs */}
        {[
          { w: 280, t: "0%", l: "50%", tl: "-50%", c: "rgba(200,100,160,0.14)", d: "4s" },
          { w: 160, t: "72%", l: "10%", tl: "0", c: "rgba(212,175,55,0.10)", d: "5s" },
          { w: 200, t: "65%", l: "80%", tl: "0", c: "rgba(150,60,120,0.12)", d: "3.5s" },
        ].map((o, i) => (
          <div key={i} style={{
            position: "absolute",
            width: o.w, height: o.w,
            top: o.t, left: o.l, transform: `translateX(${o.tl})`,
            background: o.c, borderRadius: "50%", filter: "blur(64px)",
            animation: `orbPulse ${o.d} ${i * 0.9}s ease-in-out infinite`,
          }} />
        ))}

        <div style={{
          zIndex: 10,
          opacity: stage === "opening" ? 0 : 1,
          transform: stage === "opening" ? "scale(0.85) translateY(-50px)" : "scale(1)",
          transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "28px",
          padding: "0 36px",
        }}>
          {/* eyebrow */}
          <div style={{ animation: "fadeUp 1.1s 0.2s ease both", textAlign: "center" }}>
            <p className="font-display" style={{ color: "rgba(212,175,55,0.55)", fontSize: "10px", letterSpacing: "0.45em", marginBottom: "10px" }}>
              ESPECIALLY FOR YOU
            </p>
            <p className="font-script" style={{
              fontSize: "58px", lineHeight: 1,
              background: "linear-gradient(90deg,#c9a84c,#f5e08a,#d4af37,#f5e08a,#c9a84c)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "shimmer 4s linear infinite, fadeUp 1.1s 0.2s ease both",
            }}>
              Meena
            </p>
          </div>

          {/* card graphic */}
          <div
            onClick={openCard}
            style={{ cursor: "pointer", animation: "fadeUp 1s 0.5s ease both", position: "relative" }}
          >
            {/* card */}
            <div style={{
              width: "260px", height: "340px",
              background: "linear-gradient(160deg, #2e1630 0%, #1a0e14 60%, #110a0d 100%)",
              border: "1.5px solid rgba(212,175,55,0.45)",
              borderRadius: "20px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: "12px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(212,175,55,0.15)",
              position: "relative", overflow: "hidden",
              animation: "ringPulse 3s 1.5s ease-in-out infinite",
            }}>
              {/* inner glow */}
              <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.08) 0%, transparent 65%)",
                pointerEvents: "none",
              }} />

              {/* corner ornaments */}
              {[
                { top: "14px", left: "14px" },
                { top: "14px", right: "14px" },
                { bottom: "14px", left: "14px" },
                { bottom: "14px", right: "14px" },
              ].map((pos, i) => (
                <div key={i} style={{
                  position: "absolute", ...pos,
                  color: "rgba(212,175,55,0.5)", fontSize: "18px",
                  animation: `starTwinkle 3s ${i * 0.5}s ease-in-out infinite`,
                }}>✦</div>
              ))}

              {/* floral lines top */}
              <div style={{
                position: "absolute", top: "28px", left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: "6px",
              }}>
                {["🌸", "🌷", "🌸"].map((f, i) => (
                  <span key={i} style={{ fontSize: "18px", animation: `floatPetal ${3 + i}s ${i * 0.4}s ease-in-out infinite` }}>{f}</span>
                ))}
              </div>

              <span style={{ fontSize: "56px", animation: "heartbeat 2s ease-in-out infinite", zIndex: 1 }}>💍</span>

              <p className="font-script" style={{
                fontSize: "38px", lineHeight: 1, textAlign: "center", zIndex: 1,
                background: "linear-gradient(90deg,#c9a84c,#f5e08a,#d4af37)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Today is<br />your day
              </p>

              {/* floral bottom */}
              <div style={{
                position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: "6px",
              }}>
                {["🌷", "🌸", "🌷"].map((f, i) => (
                  <span key={i} style={{ fontSize: "18px", animation: `floatPetal ${3.5 + i * 0.5}s ${i * 0.6}s ease-in-out infinite` }}>{f}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ animation: "fadeUp 1s 0.9s ease both", textAlign: "center" }}>
            <button
              onClick={openCard}
              style={{
                background: "linear-gradient(135deg,#c9a84c,#f5e08a,#d4af37)",
                color: "#1a0e05",
                border: "none",
                padding: "15px 46px",
                borderRadius: "50px",
                fontFamily: "var(--font-display)",
                fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 36px rgba(212,175,55,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)" }}
            >
              OPEN YOUR CARD ✨
            </button>
            <p className="font-serif" style={{ color: "rgba(212,175,55,0.4)", fontSize: "12px", fontStyle: "italic", marginTop: "10px" }}>
              tap the card or press above
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════ CARD OPEN ══════════════ */
  return (
    <div style={{
      width: "100%", maxWidth: "430px",
      background: "radial-gradient(ellipse at 50% 0%, #2e1630 0%, #130b10 45%, #080507 100%)",
      position: "relative", overflowX: "hidden",
      minHeight: "100vh",
    }}>
      <Petals />
      <Star x="6%" y="4%" delay="0s" size={7} />
      <Star x="88%" y="8%" delay="0.6s" size={5} />
      <Star x="14%" y="32%" delay="1.2s" size={6} />
      <Star x="82%" y="38%" delay="0.9s" size={8} />
      <Star x="50%" y="18%" delay="1.8s" size={5} />
      <Star x="30%" y="62%" delay="0.3s" size={6} />
      <Star x="70%" y="58%" delay="2s" size={7} />

      {/* ── HERO ── */}
      <div style={{
        padding: "72px 32px 56px",
        textAlign: "center",
        position: "relative",
        borderBottom: "1px solid rgba(212,175,55,0.12)",
      }}>
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "300px", height: "200px",
          background: "radial-gradient(ellipse,rgba(212,175,55,0.1) 0%,transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ animation: "fadeUp 1s 0.1s ease both" }}>
          <p className="font-display" style={{ color: "rgba(212,175,55,0.5)", fontSize: "10px", letterSpacing: "0.45em", marginBottom: "8px" }}>
            ON YOUR WEDDING DAY
          </p>
        </div>

        <div style={{ animation: "fadeUp 1s 0.3s ease both" }}>
          <p style={{
            fontFamily: "var(--font-script)",
            fontSize: "72px", lineHeight: 1.05,
            background: "linear-gradient(90deg,#c9a84c,#f5e08a,#d4af37,#f5e08a,#c9a84c)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            animation: "shimmer 4s linear infinite",
          }}>
            Meena
          </p>
        </div>

        <div style={{ animation: "fadeUp 0.9s 0.5s ease both" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "16px",
            margin: "12px 0",
          }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.6))" }} />
            <span style={{ fontSize: "32px", animation: "heartbeat 2s ease-in-out infinite" }}>💐</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,rgba(212,175,55,0.6),transparent)" }} />
          </div>
        </div>

        <div style={{ animation: "fadeUp 1s 0.7s ease both" }}>
          <p className="font-display" style={{ color: "#d4af37", fontSize: "18px", letterSpacing: "0.25em" }}>
            Hibachi Benhihana Teriyaki
          </p>
        </div>

        <div style={{ animation: "fadeUp 1s 1s ease both" }}>
          <p className="font-serif" style={{
            color: "rgba(240,230,204,0.72)",
            fontSize: "16px", fontStyle: "italic", lineHeight: 1.8, marginTop: "20px",
          }}>
            So this is what I call —<br />
            cardmaxxing. Cool no?
          </p>
        </div>

        {/* Divider & Meme Image */}
        <div style={{ animation: "fadeUp 1s 1.1s ease both", margin: "24px 0" }}>
          <Divider icon="✦" />
          <div style={{
            margin: "20px auto",
            borderRadius: "18px", overflow: "hidden",
            border: "1.5px solid rgba(212,175,55,0.35)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            maxWidth: "320px",
            background: "#130b10"
          }}>
            <img
              src={memeImg}
              alt="Meme"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
          <Divider icon="✦" />
        </div>

        {/* bouquet row */}
        <div style={{ animation: "fadeUp 1s 1.2s ease both", marginTop: "24px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
            {["🌹", "🌸", "💐", "🌸", "🌹"].map((f, i) => (
              <span key={i} style={{ fontSize: "24px", animation: `floatPetal ${3 + i * 0.4}s ${i * 0.25}s ease-in-out infinite` }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── BIG PHOTO ── */}
      <div style={{ padding: "48px 24px 0" }}>
        <Reveal delay={100} from="scale">
          <div style={{
            borderRadius: "24px", overflow: "visible",
            border: "2px solid rgba(212,175,55,0.35)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            position: "relative",
            background: "#1a0e14",
          }}>
            <div style={{ borderRadius: "22px", overflow: "hidden" }}>
              <img
                src={wholesomeImg}
                alt="A wholesome moment"
                style={{ width: "100%", height: "290px", objectFit: "cover", objectPosition: "center 20%", opacity: 0.92, display: "block" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(8,5,7,0.05) 0%, rgba(8,5,7,0.45) 100%)",
                pointerEvents: "none"
              }} />
            </div>

            <div style={{
              position: "absolute", bottom: "-22px", left: "50%", transform: "translateX(-50%)",
              textAlign: "center", width: "92%", zIndex: 5
            }}>
              <div className="comic-speech-bubble" style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', 'Comic Sans', cursive, sans-serif", fontWeight: 700 }}>
                "This is still a very cool wholesome photo too"
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── MAIN MESSAGE ── */}
      <div style={{ padding: "48px 28px" }}>
        <Reveal delay={0}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <p className="font-display" style={{ color: "rgba(212,175,55,0.5)", fontSize: "10px", letterSpacing: "0.4em", marginBottom: "8px" }}>
              A MESSAGE FOR YOU
            </p>
            <p className="font-script" style={{
              fontSize: "44px",
              background: "linear-gradient(90deg,#c9a84c,#f5e08a,#d4af37)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Hello There Meena
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div style={{
            background: "rgba(212,175,55,0.04)",
            border: "1px solid rgba(212,175,55,0.18)",
            borderRadius: "20px",
            padding: "32px 26px",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
              padding: "0 16px",
              background: "radial-gradient(ellipse at center, #130b10 30%, transparent 100%)",
            }}>
              <span style={{ color: "#d4af37", fontSize: "20px" }}>✦</span>
            </div>
            <p className="font-serif" style={{
              color: "rgba(240,230,204,0.85)",
              fontSize: "16px", fontStyle: "italic", lineHeight: 1.9,
              textAlign: "center",
            }}>
              I present the Weddingmaxx card because you deserve only the bestest of cards.
              This card is very card. It may not be made out of card but it came in a card
              so this card is a card. It's peak. Absolute Card
            </p>
          </div>
        </Reveal>

        <div style={{ margin: "28px 0" }}>
          <Divider icon="🌸" />
        </div>

        <Reveal delay={80}>
          <p className="font-serif" style={{
            color: "rgba(240,230,204,0.78)",
            fontSize: "16px", fontStyle: "italic", lineHeight: 1.9,
            textAlign: "center", padding: "0 8px",
          }}>
            All crafted jokes aside. You're probably reading this after the event
            absolutely exhausted but hopefully enjoyed yourself. And as I spam speed
            finishing the code for this card (because I thought of this idea the day before)
            I just wanted to say I love you lots and I'm so so proud of you. This is a huge ass moment
            and I'm glad I could be a part of it.
          </p>
        </Reveal>

        <div style={{ margin: "28px 0" }}>
          <Divider icon="💛" />
        </div>

        {/* <Reveal delay={80}>
          <p className="font-serif" style={{
            color: "rgba(240,230,204,0.78)",
            fontSize: "16px", fontStyle: "italic", lineHeight: 1.9,
            textAlign: "center", padding: "0 8px",
          }}>
            May your marriage be as warm as your smile, as deep as your kindness,
            and as endless as the love you so generously give.
            You have found someone who sees you fully — and darling, they are so lucky.
          </p>
        </Reveal> */}
      </div>



      {/* ── INTERACTIVE PRESENT ── */}
      <Reveal delay={100}>
        <div style={{ padding: "0 24px 48px", textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(160deg, rgba(46,22,48,0.95), rgba(26,14,20,0.98))",
            border: "1px solid rgba(212,175,55,0.45)",
            borderRadius: "28px",
            padding: "40px 24px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.25)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Ambient inner glow */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* floating particles */}
            {tapParticles.map(p => (
              <div
                key={p.id}
                style={{
                  position: "absolute",
                  bottom: "90px",
                  left: `${p.x}%`,
                  fontSize: "28px",
                  animation: "floatParticle 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
                  pointerEvents: "none",
                  zIndex: 10,
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
                }}
              >
                {p.icon}
              </div>
            ))}

            <p className="font-display" style={{ color: "rgba(212,175,55,0.7)", fontSize: "11px", letterSpacing: "0.45em", marginBottom: "12px" }}>
              {presentTaps >= 10 ? "✨ GIFT UNLOCKED ✨" : "✦ TAP TO OPEN YOUR PRESENT ✦"}
            </p>

            <h2 className="font-script" style={{
              fontSize: "42px", marginBottom: "22px", lineHeight: 1.1,
              background: "linear-gradient(90deg,#c9a84c,#f5e08a,#d4af37,#f5e08a,#c9a84c)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "shimmer 4s linear infinite",
            }}>
              {presentTaps >= 10 ? "Your present is open!" : "Tap to open your present"}
            </h2>

            {/* Present interactive button */}
            <div style={{ position: "relative", display: "inline-block", margin: "0 auto 24px" }}>
              {/* Outer pulsing ring */}
              <div style={{
                position: "absolute", inset: "-12px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 70%)",
                animation: "pulseGlow 2.5s ease-in-out infinite",
                pointerEvents: "none",
              }} />

              <button
                onClick={tapPresent}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1.5px solid rgba(212,175,55,0.4)",
                  borderRadius: "50%",
                  width: "120px", height: "120px",
                  cursor: "pointer",
                  fontSize: "64px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: isWobbling
                    ? "wobbleGift 0.4s ease"
                    : presentTaps >= 10
                      ? "presentPulse 2.5s ease-in-out infinite"
                      : "gentleFloat 3s ease-in-out infinite",
                  transition: "transform 0.15s ease, box-shadow 0.2s ease",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
                aria-label="Tap to open your present"
              >
                🎁
              </button>

              {presentTaps < 10 && (
                <div style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  background: "linear-gradient(135deg, #d4af37, #f5e08a)",
                  color: "#1a0e05",
                  borderRadius: "50%",
                  width: "34px", height: "34px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: "bold",
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.6)",
                  pointerEvents: "none",
                  border: "2px solid #1a0e14",
                }}>
                  {10 - presentTaps}
                </div>
              )}
            </div>

            {/* Progress indicators before 10 taps */}
            {presentTaps < 10 && (
              <div style={{ maxWidth: "260px", margin: "0 auto" }}>
                {/* Progress bar */}
                <div style={{
                  width: "100%", height: "10px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "6px", margin: "0 auto 14px",
                  overflow: "hidden", border: "1px solid rgba(212,175,55,0.3)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)"
                }}>
                  <div style={{
                    width: `${(presentTaps / 10) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #c9a84c, #f5e08a, #d4af37)",
                    transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 0 14px rgba(245,224,138,0.9)"
                  }} />
                </div>

                <p className="font-serif" style={{ color: "rgba(240,230,204,0.85)", fontSize: "15px", fontStyle: "italic" }}>
                  {presentTaps === 0
                    ? "Tap the gift 10 times to unlock your surprise! ✨"
                    : presentTaps < 4
                      ? `Unwrapping the ribbon... (${presentTaps}/10) 🎀`
                      : presentTaps < 8
                        ? `Opening the golden box... (${presentTaps}/10) 🌟`
                        : `Almost open! ${10 - presentTaps} tap left! 💥`}
                </p>
              </div>
            )}

            {/* UNLOCKED VOUCHER VISUALS & LINK */}
            {presentTaps >= 10 && (
              <div style={{
                animation: "revealPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                marginTop: "20px",
                background: "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(245,224,138,0.08))",
                border: "1.5px solid rgba(212,175,55,0.6)",
                borderRadius: "22px",
                padding: "28px 22px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                  background: "linear-gradient(90deg, #c9a84c, #f5e08a, #d4af37, #f5e08a, #c9a84c)",
                  backgroundSize: "200% auto",
                  animation: "ticketShimmer 3s linear infinite"
                }} />

                <div style={{ fontSize: "40px", marginBottom: "8px", filter: "drop-shadow(0 4px 12px rgba(212,175,55,0.5))" }}>
                  🎟️✨
                </div>

                <p className="font-display" style={{ color: "#f5e08a", fontSize: "11px", letterSpacing: "0.3em", marginBottom: "8px" }}>
                  EXCLUSIVE GIFT UNLOCKED
                </p>

                <h3 className="font-script" style={{
                  fontSize: "40px", color: "#ffffff", margin: "0 0 12px",
                  lineHeight: 1.1,
                  background: "linear-gradient(90deg,#c9a84c,#f5e08a,#d4af37)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  You have unlocked 100% real present
                </h3>

                <p className="font-serif" style={{
                  color: "rgba(240,230,204,0.92)", fontSize: "15px", fontStyle: "italic",
                  lineHeight: 1.6, marginBottom: "22px"
                }}>
                  Press Download to download very legit and very cool present 100% legit uncracked method **2026 NEW**
                </p>

                <a
                  href={VOUCHER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    background: "linear-gradient(135deg, #c9a84c 0%, #f5e08a 50%, #d4af37 100%)",
                    color: "#1a0e05",
                    textDecoration: "none",
                    padding: "16px 32px",
                    borderRadius: "50px",
                    fontFamily: "var(--font-display)",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    boxShadow: "0 12px 32px rgba(212,175,55,0.45), inset 0 1px 0 rgba(255,255,255,0.6)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 44px rgba(212,175,55,0.65), inset 0 1px 0 rgba(255,255,255,0.8)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(212,175,55,0.45), inset 0 1px 0 rgba(255,255,255,0.6)";
                  }}
                >
                  <span>🎁 DOWNLOAD legit present</span>
                  <span style={{ fontSize: "14px" }}>↗</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* ── CLOSING ── */}
      <Reveal delay={100}>
        <div style={{
          padding: "48px 32px 96px",
          textAlign: "center",
          borderTop: "1px solid rgba(212,175,55,0.12)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "340px", height: "220px",
            background: "radial-gradient(ellipse,rgba(212,175,55,0.09) 0%,transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
            {["🌹", "💐", "🌸", "💐", "🌹"].map((f, i) => (
              <span key={i} style={{ fontSize: "22px", animation: `floatPetal ${3 + i * 0.3}s ${i * 0.2}s ease-in-out infinite` }}>{f}</span>
            ))}
          </div>

          <p className="font-script" style={{
            fontSize: "54px", lineHeight: 1.2,
            background: "linear-gradient(90deg,#c9a84c,#f5e08a,#d4af37,#f5e08a,#c9a84c)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            animation: "shimmer 4s linear infinite",
            marginBottom: "12px",
          }}>
            Congratulations!
          </p>

          <p className="font-serif" style={{ color: "rgba(240,230,204,0.6)", fontSize: "15px", fontStyle: "italic", lineHeight: 1.8 }}>
            May every single day of your marriage<br />
            feel as magical as today.<br />

            With love and good vibes from the crazy one, Roel
          </p>

          <div style={{ margin: "24px 0" }}>
            <Divider icon="💛" />
          </div>

          <p className="font-display" style={{ color: "rgba(212,175,55,0.4)", fontSize: "10px", letterSpacing: "0.25em" }}>
            WITH ALL THE LOVE IN THE WORLD
          </p>
        </div>
      </Reveal>
    </div>
  )
}
