import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" to="/">
              <img className="brand-seal" src="/assets/seal.svg" alt="" />
              <span className="brand-text">
                <span className="brand-name">O.E.C.</span><br />
                <span className="brand-sub">Japanese Express</span>
              </span>
            </Link>
            <p>
              Fresh sushi, hibachi, bento and poke in St. Petersburg, Florida.
              Beer, wine and sake available.
            </p>
          </div>
          <div>
            <h4>Visit</h4>
            <ul>
              <li>
                <a
                  href="https://maps.google.com/?q=2438+66th+St+North,+St.+Petersburg,+FL+33710"
                  target="_blank" rel="noopener noreferrer"
                >
                  2438 66th St N, St.&nbsp;Petersburg, FL 33710
                </a>
              </li>
              <li><a href="tel:+17273454088">727-345-4088</a></li>
              <li>Closed Tuesdays</li>
            </ul>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/menu">Full Menu</Link></li>
              <li><Link to="/#location">Hours &amp; Location</Link></li>
              <li><Link to="/#favorites">House Favorites</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} O.E.C. Japanese Express. All rights reserved.
          </span>
          <span lang="ja">またのお越しをお待ちしております</span>
        </div>
      </div>
    </footer>
  );
}
