import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

const SPECIALTIES = [
  {
    kanji: "鮨", title: "Sushi Bar", link: "/menu#group-sushi-bar",
    text: "Nigiri, sashimi and more than eighty rolls — classic cuts to special creations like the Dancing Eel and Volcano.",
    cta: "See the rolls",
  },
  {
    kanji: "焼", title: "Hibachi", link: "/menu#group-hibachi-kitchen",
    text: "Chicken, steak, shrimp, salmon and scallops seared with sweet carrots, fried rice or noodles and house salad.",
    cta: "See hibachi",
  },
  {
    kanji: "弁", title: "Bento & Lunch", link: "/menu#group-bento-lunch",
    text: "Lunch bento with California roll, salad, rice and shumai — plus two-roll sushi lunch specials.",
    cta: "See lunch",
  },
  {
    kanji: "丼", title: "Poke Bowls", link: "/menu#cat-poke-bowl",
    text: "Two or three scoops of fish over rice with crab, cucumber, crunch and seaweed salad.",
    cta: "Build a bowl",
  },
  {
    kanji: "茶", title: "Drinks & Desserts", link: "/menu#group-drinks-desserts-sides",
    text: "Bubble tea, Ramune, mochi ice cream, tempura banana and Thai donuts to finish.",
    cta: "See drinks",
  },
];

const GALLERY = [
  { src: "/assets/img/party-platter.jpg", caption: "Sushi & sashimi party platter", alt: "Sashimi martini and party platter of rolls" },
  { src: "/assets/img/signature-roll.jpg", caption: "Signature special roll", alt: "Signature roll topped with spicy salmon and tobiko" },
  { src: "/assets/img/california-roll.jpg", caption: "Crunch roll", alt: "Close-up of a crunch roll with sesame" },
  { src: "/assets/img/shrimp-tempura-roll.jpg", caption: "Shrimp tempura roll", alt: "Shrimp tempura roll with wasabi and ginger" },
  { src: "/assets/img/dining-room.jpg", caption: "Dine in with us", alt: "O.E.C. dining room with dark wood tables" },
];

export default function Home() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    api.get("/locations")
      .then((res) => setLocation(res.data[0] || null))
      .catch(() => setLocation(null));
  }, []);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="wrap">
          <p className="hero-kicker">St.&nbsp;Petersburg&nbsp;·&nbsp;Florida</p>
          <h1>
            Fresh from the <span className="accent">sushi bar</span>, hot off
            the hibachi.
          </h1>
          <p className="hero-tag">
            Family-run Japanese kitchen serving hand-rolled sushi, sizzling
            hibachi, bento boxes and poke bowls — made to order, every day but
            Tuesday.
            <span className="jp" lang="ja">寿司・鉄板焼・弁当・ポケ丼</span>
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/menu">Order Online</Link>
            <Link className="btn btn-ghost-light" to="/menu">View the Menu</Link>
          </div>
        </div>
        <p className="hero-vertical" lang="ja" aria-hidden="true">
          おいしい えん — 美味しい縁
        </p>
        <div
          className="seigaiha-band"
          style={{ backgroundImage: "url('/assets/seigaiha.svg')" }}
          aria-hidden="true"
        />
      </section>

      {/* ── Info ribbon ── */}
      <div className="ribbon" role="note">
        <div className="wrap">
          <span><strong>Closed Tuesdays</strong></span>
          <span>
            Call in <a href="tel:+17273454088"><strong>727-345-4088</strong></a>
          </span>
          <span>Take out · Dine in · <strong>We deliver</strong> ($15 min)</span>
        </div>
      </div>

      {/* ── Story ── */}
      <section className="section" id="about">
        <div className="wrap story-grid">
          <div className="story-copy">
            <div className="section-head">
              <p className="section-kicker" lang="ja">ようこそ</p>
              <h2 className="section-title">
                A neighborhood izakaya spirit, Florida made
              </h2>
            </div>
            <p>
              O.E.C. Japanese Express has been rolling sushi and firing the
              hibachi for St. Petersburg from our kitchen on 66th Street.
              Everything is prepared when you order it: rice seasoned through
              the day, fish cut to order, vegetables from the morning delivery.
            </p>
            <p>
              The menu runs deep — over 280 dishes — from a humble egg roll to
              a sushi paradise platter for two. Come hungry, leave happy.
            </p>
            <div className="story-points" role="list">
              <div className="story-point" role="listitem">
                <span className="jp" lang="ja">鮮</span>
                <span className="en">Cut fresh daily</span>
              </div>
              <div className="story-point" role="listitem">
                <span className="jp" lang="ja">火</span>
                <span className="en">Hibachi grilled</span>
              </div>
              <div className="story-point" role="listitem">
                <span className="jp" lang="ja">心</span>
                <span className="en">Family run</span>
              </div>
            </div>
          </div>
          <figure className="story-figure">
            <img
              src="/assets/img/shrimp-tempura-roll.jpg"
              alt="Shrimp tempura futomaki rolls drizzled with eel sauce"
              loading="lazy"
            />
            <figcaption lang="ja">海老天巻き</figcaption>
          </figure>
        </div>
      </section>

      {/* ── Specialties ── */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head center">
            <p className="section-kicker" lang="ja">お品書き</p>
            <h2 className="section-title">From our kitchen</h2>
            <p className="section-sub">
              Five ways to eat well at O.E.C. — every one made to order.
            </p>
          </div>
          <div className="cards">
            {SPECIALTIES.map((s) => (
              <article className="card" key={s.title}>
                <p className="card-kanji" lang="ja" aria-hidden="true">{s.kanji}</p>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <Link className="card-link" to={s.link}>{s.cta}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="section" id="gallery">
        <div className="wrap">
          <div className="section-head center">
            <p className="section-kicker" lang="ja">写真</p>
            <h2 className="section-title">From the pass</h2>
          </div>
          <div className="gallery">
            {GALLERY.map((g) => (
              <figure key={g.src}>
                <img src={g.src} alt={g.alt} loading="lazy" />
                <figcaption>{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Order banner ── */}
      <section className="banner-dark">
        <p className="vertical-deco left" lang="ja" aria-hidden="true">出前・持ち帰り</p>
        <p className="vertical-deco right" lang="ja" aria-hidden="true">お電話ください</p>
        <div className="wrap">
          <h2>Dinner is a phone call away</h2>
          <p>
            Order online for pickup or delivery, or call us directly.
            Delivery from a $15 minimum, before tax. Pay when you pick up —
            no card required online.
          </p>
          <p className="hours-note">Open every day except Tuesday</p>
          <div className="actions">
            <Link className="btn btn-primary" to="/menu">Start an Order</Link>
            <a className="btn btn-ghost-light" href="tel:+17273454088">
              Call 727-345-4088
            </a>
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section className="section" id="location">
        <div className="wrap">
          <div className="section-head center">
            <p className="section-kicker" lang="ja">店舗案内</p>
            <h2 className="section-title">Find us on 66th Street</h2>
          </div>
          <div className="locations-grid single">
            <article className="location-card">
              <p className="loc-jp" lang="ja">セントピーターズバーグ</p>
              <h3>{location ? location.name : "O.E.C. Japanese Express"}</h3>
              <p className="loc-sub">
                {location ? location.tagline : "St. Petersburg — call in · take out · dine in"}
              </p>
              <div className="loc-lines">
                <div className="loc-line">
                  <span className="k">Address</span>
                  <span>
                    <a
                      href="https://maps.google.com/?q=2438+66th+St+North,+St.+Petersburg,+FL+33710"
                      target="_blank" rel="noopener noreferrer"
                    >
                      {location
                        ? `${location.street}, ${location.city}, ${location.state} ${location.postal_code}`
                        : "2438 66th St North, St. Petersburg, FL 33710"}
                    </a>
                  </span>
                </div>
                <div className="loc-line">
                  <span className="k">Phone</span>
                  <span>
                    <a href="tel:+17273454088">
                      {location ? location.phone : "727-345-4088"}
                    </a>
                  </span>
                </div>
                <div className="loc-line">
                  <span className="k">Hours</span>
                  <table className="hours-table">
                    <tbody>
                      {(location
                        ? location.hours
                        : [
                            { days: "Sun – Thu", hours: "10:30 am – 9:30 pm" },
                            { days: "Fri & Sat", hours: "10:30 am – 10:30 pm" },
                            { days: "Tuesday", hours: "Closed" },
                          ]
                      ).map((h) => (
                        <tr key={h.days} className={h.hours === "Closed" ? "closed" : undefined}>
                          <td>{h.days}</td>
                          <td>{h.hours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="loc-actions">
                <Link className="btn btn-primary" to="/menu">Order Online</Link>
                <a className="btn btn-ghost" href="tel:+17273454088">Call to Order</a>
              </div>
              <p className="loc-note">
                {location ? location.note : "We deliver — $15.00 minimum, pre-tax."}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
