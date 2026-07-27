import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

const SPECIALTIES = [
  {
    kanji: "鮨", title: "Sushi Bar", link: "/menu#group-sushi-bar",
    text: "Nigiri, sashimi and more than eighty rolls, from classic cuts to special creations like the Dancing Eel and Volcano.",
    cta: "See the rolls",
  },
  {
    kanji: "焼", title: "Hibachi", link: "/menu#group-hibachi-kitchen",
    text: "Chicken, steak, shrimp, salmon and scallops seared with sweet carrots, fried rice or noodles and house salad.",
    cta: "See hibachi",
  },
  {
    kanji: "弁", title: "Bento & Lunch Specials", link: "/menu#group-bento-lunch",
    text: "Lunch bento for $13.50 with California roll, salad, rice and shumai, plus any two classic rolls for $8.99, Mon–Sat.",
    cta: "See lunch",
  },
  {
    kanji: "丼", title: "Poke Bowls", link: "/menu#cat-poke-bowl",
    text: "Two or three scoops of fish over rice with crab, cucumber, crunch and seaweed salad.",
    cta: "Build a bowl",
  },
  {
    kanji: "麺", title: "Noodles & Kitchen", link: "/menu#cat-yaki-udon",
    text: "Yaki udon, noodle soups, teriyaki, katsu and wok classics like General Tso's chicken.",
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
          <p className="hero-kicker">St.&nbsp;Petersburg&nbsp;·&nbsp;Florida</p>
          <h1>
            Fresh from the <span className="accent">sushi bar</span>, hot off
            the hibachi.
          </h1>
          <p className="hero-tag">
            Family-run Japanese kitchen serving hand-rolled sushi, sizzling
            hibachi, bento boxes and poke bowls. Made to order, every day but
            Tuesday.
            <span className="jp" lang="ja">寿司・鉄板焼・弁当・ポケ丼</span>
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/menu">Order Online</Link>
            <Link className="btn btn-ghost-light" to="/menu">View the Menu</Link>
          </div>
        </div>
        <p className="hero-vertical" lang="ja" aria-hidden="true">
          おいしい えん・美味しい縁
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
              The menu runs deep, from a $3.75 egg roll to sushi paradise
              platters for two. Come hungry, leave happy.
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
          <div className="story-panel" aria-hidden="true">
            <span className="story-panel-kanji" lang="ja">縁</span>
            <span className="story-panel-reading" lang="ja">えん・おいしい縁</span>
            <span className="story-panel-caption">Delicious connections · est. 2011</span>
          </div>
        </div>
      </section>

      {/* ── Specialties ── */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head center">
            <p className="section-kicker" lang="ja">お品書き</p>
            <h2 className="section-title">From our kitchen</h2>
            <p className="section-sub">
              Five ways to eat well at O.E.C., every one made to order.
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

      {/* ── House favorites ── */}
      <section className="section" id="favorites">
        <div className="wrap">
          <div className="section-head center">
            <p className="section-kicker" lang="ja">人気の巻き</p>
            <h2 className="section-title">House favorite rolls</h2>
            <p className="section-sub">
              Six specials our regulars keep coming back for, all made to order
              at the sushi bar.
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
          <p className="fav-more">
            <Link className="btn btn-ghost" to="/menu#cat-sushi-special-roll">
              See all 34 special rolls
            </Link>
          </p>
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
            Delivery from a $15 minimum, before tax. Pay when you pick up.
            No card required online.
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
