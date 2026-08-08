import { useState, useEffect, useRef } from "react"

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


/* ── message card ── */
function MessageCard({ from, message, delay }: { from: string; message: string; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(212,175,55,0.2)",
        borderRadius: "18px",
        padding: "24px 22px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-20px", right: "-20px",
          width: "80px", height: "80px",
          background: "radial-gradient(circle,rgba(212,175,55,0.1),transparent 70%)",
          borderRadius: "50%",
        }} />
        <p style={{ fontSize: "22px", marginBottom: "10px" }}>"</p>
        <p className="font-serif" style={{
          color: "rgba(240,230,204,0.82)",
          fontSize: "15px",
          fontStyle: "italic",
          lineHeight: 1.75,
          marginBottom: "14px",
        }}>
          {message}
        </p>
        <p className="font-display" style={{ color: "#d4af37", fontSize: "10px", letterSpacing: "0.2em" }}>
          — {from}
        </p>
      </div>
    </Reveal>
  )
}

/* ══════════════════════════════════════════ */
export default function App() {
  const [stage, setStage] = useState<"sealed" | "opening" | "open">("sealed")
  const [heartCount, setHeartCount] = useState(0)
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([])
  let heartId = useRef(0)

  const openCard = () => {
    if (stage !== "sealed") return
    setStage("opening")
    setTimeout(() => setStage("open"), 800)
  }

  const tapHeart = () => {
    setHeartCount(n => n + 1)
    heartId.current += 1
    const id = heartId.current
    setFloatingHearts(h => [...h, { id, x: 40 + Math.random() * 20 }])
    setTimeout(() => setFloatingHearts(h => h.filter(x => x.id !== id)), 2000)
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
            Hibachi Benhihana Teriuaki
          </p>
        </div>

        <div style={{ animation: "fadeUp 1s 1s ease both" }}>
          <p className="font-serif" style={{
            color: "rgba(240,230,204,0.72)",
            fontSize: "16px", fontStyle: "italic", lineHeight: 1.8, marginTop: "20px",
          }}>
            So this is what I call —<br />
            techmaxxing. Cool no?
          </p>
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
            borderRadius: "24px", overflow: "hidden",
            border: "2px solid rgba(212,175,55,0.35)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            position: "relative",
          }}>
            <img
              src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=500&fit=crop&auto=format"
              alt="A breathtaking wedding moment with floral archway and soft candlelight"
              style={{ width: "100%", height: "280px", objectFit: "cover", opacity: 0.85, display: "block" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(8,5,7,0.1) 0%, rgba(8,5,7,0.55) 100%)",
            }} />
            <div style={{
              position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)",
              textAlign: "center", width: "100%",
            }}>
              <p className="font-script" style={{
                fontSize: "36px",
                background: "linear-gradient(90deg,#c9a84c,#f5e08a,#d4af37)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Today, forever begins
              </p>
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
              My dearest Bella
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
              From the very first day I met you, I knew you were someone truly extraordinary.
              The way you light up every room, the way you love so fiercely, the way you make
              everyone around you feel like they matter — that is a rare and beautiful gift.
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
            Today, as you walk down that aisle, know that I am watching you with the
            most full heart. You are breathtaking — not just in your dress, but in
            everything that you are.
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


      {/* ── WISHES FROM LOVED ONES ── */}
      <div style={{ padding: "0 24px 48px" }}>
        <Reveal delay={0}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <Divider icon="✦" />
            <p className="font-display" style={{ color: "rgba(212,175,55,0.5)", fontSize: "10px", letterSpacing: "0.4em", marginTop: "24px", marginBottom: "8px" }}>
              WITH LOVE FROM
            </p>
            <p className="font-script" style={{
              fontSize: "42px",
              background: "linear-gradient(90deg,#c9a84c,#f5e08a,#d4af37)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Those who love you most
            </p>
          </div>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <MessageCard
            from="Sophia — Your Best Friend"
            message="I have watched you grow into the most magnificent woman. You deserve every beautiful thing this life has to offer. Today is just the beginning. I love you to the moon and back, always."
            delay={0}
          />
          <MessageCard
            from="Mum & Dad"
            message="Our darling girl — from the moment you were born, you have made us proud in ways we never knew were possible. Go and be gloriously, wildly happy. We will be in the front row, crying the happiest tears."
            delay={120}
          />
          <MessageCard
            from="Your Girls 💕"
            message="To our beautiful bride — we danced with you through every chapter. Today we dance you into the best one yet. We are so impossibly proud of you. Now go get your fairytale!"
            delay={240}
          />
        </div>
      </div>

      {/* ── INTERACTIVE HEART ── */}
      <Reveal delay={100}>
        <div style={{ padding: "0 24px 48px", textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(160deg, rgba(46,22,48,0.95), rgba(26,14,20,0.98))",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "24px",
            padding: "36px 24px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.12)",
            position: "relative", overflow: "hidden",
          }}>
            {/* floating hearts */}
            {floatingHearts.map(h => (
              <div
                key={h.id}
                style={{
                  position: "absolute",
                  bottom: "60px",
                  left: `${h.x}%`,
                  fontSize: "22px",
                  animation: "floatHeartUp 2s ease forwards",
                  pointerEvents: "none",
                }}
              >
                💕
              </div>
            ))}

            <p className="font-display" style={{ color: "rgba(212,175,55,0.5)", fontSize: "10px", letterSpacing: "0.4em", marginBottom: "16px" }}>
              SEND YOUR LOVE
            </p>
            <p className="font-script" style={{
              fontSize: "36px", marginBottom: "20px",
              background: "linear-gradient(90deg,#c9a84c,#f5e08a,#d4af37)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Tap to send love
            </p>

            <button
              onClick={tapHeart}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontSize: "64px",
                display: "block", margin: "0 auto 16px",
                animation: heartCount > 0 ? "heartbeat 0.4s ease" : "heartbeat 2.5s ease-in-out infinite",
                transition: "transform 0.15s ease",
                filter: "drop-shadow(0 0 16px rgba(240,100,140,0.6))",
              }}
              aria-label="Send love"
            >
              💗
            </button>

            {heartCount > 0 && (
              <p className="font-script" style={{
                fontSize: "28px", color: "#f5e08a",
                animation: "fadeUp 0.5s ease forwards",
              }}>
                {heartCount === 1 ? "1 love sent!" : `${heartCount} loves sent!`}
              </p>
            )}
            {heartCount === 0 && (
              <p className="font-serif" style={{ color: "rgba(212,175,55,0.5)", fontSize: "13px", fontStyle: "italic" }}>
                Every tap sends a wish to the bride ✨
              </p>
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
            Congratulations,<br />beautiful bride
          </p>

          <p className="font-serif" style={{ color: "rgba(240,230,204,0.6)", fontSize: "15px", fontStyle: "italic", lineHeight: 1.8 }}>
            May every single day of your marriage<br />
            feel as magical as today.
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
