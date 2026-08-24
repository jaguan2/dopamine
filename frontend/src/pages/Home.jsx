import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

const SPECIALTIES = [
  {
    kanji: "鮨", title: "Sushi Bar", link: "/menu#group-sushi-bar",
    text: "Nigiri and sashimi cut to order, with more than eighty rolls from classic cuts to house specials.",
    cta: "See the rolls",
  },
  {
    kanji: "焼", title: "Hibachi", link: "/menu#group-hibachi-kitchen",
    text: "Chicken, steak, shrimp, salmon and scallops from the flat top, with sweet carrots, fried rice or noodles and house salad.",
    cta: "See hibachi",
  },
  {
    kanji: "弁", title: "Bento & Lunch", link: "/menu#group-bento-lunch",
    text: "Lunch bento at $13.50 with California roll, salad, rice and shumai. Any two classic rolls at $8.99, Monday to Saturday.",
    cta: "See lunch",
  },
  {
    kanji: "丼", title: "Poke Bowls", link: "/menu#cat-poke-bowl",
    text: "Two or three scoops of fish over rice, with krab, cucumber, crunch and seaweed salad.",
    cta: "Build a bowl",
  },
  {
    kanji: "麺", title: "Noodles & Kitchen", link: "/menu#cat-yaki-udon",
    text: "Yaki udon and soba, noodle soups, teriyaki, katsu and entrees from the kitchen.",
    cta: "See noodles",
  },
];

const FAVORITES = [
  { name: "Mars Roll", jp: "火星", price: "13.50", desc: "Crunchy spicy crawfish inside, topped with tuna and salmon", spicy: true },
  { name: "Tiger Roll", jp: "虎", price: "14.95", desc: "Tuna, crab, avocado and masago, topped with salmon, eel, crunch and scallion" },
  { name: "Phoenix Roll", jp: "鳳凰", price: "14.95", desc: "Tempura shrimp, escolar and seaweed salad, topped with tuna and salmon in soy paper" },
  { name: "White Swan Roll", jp: "白鳥", price: "12.95", desc: "Spicy salmon and tempura flakes, topped with peppered escolar and masago", spicy: true },
  { name: "Tornado Roll", jp: "竜巻", price: "12.50", desc: "Tempura shrimp and cream cheese, topped with krab meat and eel sauce" },
  { name: "Funky Monkey Roll", jp: "猿", price: "6.95", desc: "Eel and banana with eel sauce and yum yum sauce" },
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
          <p className="hero-kicker">St. Petersburg, Florida</p>
          <h1>Sushi bar and hibachi kitchen</h1>
          <p className="hero-tag">
            Serving St. Petersburg since 2011. Every dish is prepared once it
            is ordered. Closed Tuesdays.
            <span className="jp" lang="ja">寿司・鉄板焼・弁当・ポケ丼</span>
          </p>
          <div className="hero-actions">
            <Link className="btn btn-light" to="/menu">Order Online</Link>
            <Link className="btn btn-ghost-light" to="/menu">View the Menu</Link>
          </div>
        </div>
      </section>

      {/* ── Info ribbon ── */}
      <div className="ribbon" role="note">
        <div className="wrap">
          <span>Closed Tuesdays</span>
          <span>
            <a href="tel:+17273454088">727-345-4088</a>
          </span>
          <span>Take out · Dine in · Delivery ($15 minimum)</span>
        </div>
      </div>

      {/* ── The restaurant ── */}
      <section className="section" id="about">
        <div className="wrap story-grid">
          <div className="story-copy">
            <div className="section-head">
              <p className="section-kicker" lang="ja">店について</p>
              <h2 className="section-title">The restaurant</h2>
            </div>
            <p>
              Opened in 2011. Family owned. A fresh sushi bar, with hibachi
              dishes off the grill.
            </p>
            <p>
              Nigiri and sashimi are cut to order, and there are close to
              ninety rolls between the classic list and the sushi bar's own
              specials, from a plain cucumber roll at $4.95 upward. Rolls can
              be made as hand rolls on request. Naruto comes wrapped in
              cucumber instead of rice, and poke bowls are built scoop by
              scoop.
            </p>
            <p>
              The kitchen handles hibachi, bento boxes, katsu, tempura, udon
              and soba, with beer, wine and sake at the bar. Dine in, take
              out, or let us deliver. Come give us a try.
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
                <span className="jp" lang="ja">巻</span>
                <span className="en">~90 rolls</span>
              </div>
            </div>
          </div>
          <div className="story-panel" aria-hidden="true">
            <span className="story-panel-kanji" lang="ja">縁</span>
            <span className="story-panel-reading" lang="ja">えん</span>
            <span className="story-panel-caption">Est. 2011</span>
          </div>
        </div>
      </section>

      {/* ── What we serve ── */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head center">
            <p className="section-kicker" lang="ja">お品書き</p>
            <h2 className="section-title">What we serve</h2>
            <p className="section-sub">
              Sushi bar, hibachi grill, bento, poke and noodles.
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

      {/* ── Signature rolls ── */}
      <section className="section" id="favorites">
        <div className="wrap">
          <div className="section-head center">
            <p className="section-kicker" lang="ja">特製巻き</p>
            <h2 className="section-title">Signature rolls</h2>
            <p className="section-sub">
              Six from the sushi bar's special roll list.
            </p>
          </div>
          <div className="fav-grid">
            {FAVORITES.map((f) => (
              <article className="fav-item" key={f.name}>
                <span className="fav-kanji" lang="ja" aria-hidden="true">{f.jp}</span>
                <div className="fav-body">
                  <div className="fav-row">
                    <h3>
                      {f.name}
                      {f.spicy && (
                        <span className="spicy" title="Spicy" aria-label="Spicy">🌶</span>
                      )}
                    </h3>
                    <span className="leader" aria-hidden="true" />
                    <span className="fav-price">${f.price}</span>
                  </div>
                  <p>{f.desc}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="fav-more">
            <Link className="btn btn-ghost" to="/menu#cat-sushi-special-roll">
              See all 34 special rolls
            </Link>
          </div>
        </div>
      </section>

      {/* ── Order ── */}
      <section className="banner-dark">
        <div className="wrap">
          <h2>Order for pickup or delivery</h2>
          <p>
            Orders are placed online and paid in person, at the counter or at
            the door. Delivery requires a $15.00 subtotal before tax.
          </p>
          <p className="hours-note">Open every day except Tuesday</p>
          <div className="actions">
            <Link className="btn btn-light" to="/menu">Start an Order</Link>
            <a className="btn btn-ghost-light" href="tel:+17273454088">
              Call 727-345-4088
            </a>
          </div>
        </div>
      </section>

      {/* ── Visit ── */}
      <section className="section" id="location">
        <div className="wrap">
          <div className="section-head center">
            <p className="section-kicker" lang="ja">店舗案内</p>
            <h2 className="section-title">Visit</h2>
          </div>
          <div className="locations-grid single">
            <article className="location-card">
              <h3>{location ? location.name : "O.E.C. Japanese Express"}</h3>
              <p className="loc-sub">
                {location ? location.tagline : "St. Petersburg · call in · take out · dine in"}
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
                {location ? location.note : "We deliver. $15.00 minimum, pre-tax."}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
