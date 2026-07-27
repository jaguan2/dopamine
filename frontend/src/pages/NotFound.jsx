import { Link, useLocation } from "react-router-dom";

// Catch-all for unknown URLs. Without this the router matches nothing and
// the page renders as a bare header + footer with an empty <main>.
export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <main className="page-narrow">
      <div className="checkout-empty">
        <span className="jp" lang="ja">迷子</span>
        <h1>This page wandered off</h1>
        <p>
          Nothing lives at <code>{pathname}</code>, but the sushi bar is still
          open.
        </p>
        <div className="notfound-actions">
          <Link className="btn btn-primary" to="/">Back to Home</Link>
          <Link className="btn btn-ghost" to="/menu">View the Menu</Link>
        </div>
      </div>
    </main>
  );
}
