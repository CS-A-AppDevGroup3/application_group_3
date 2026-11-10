import { useAuth } from '../AuthContext';

// Modules from the project proposal. They are listed honestly as not built yet.
const MODULES = [
  { name: 'Upload files', text: 'Add a PDF, DOCX, PPTX or TXT handout.' },
  { name: 'Reviewer', text: 'Summaries and key points, each linked to its source section.' },
  { name: 'Flashcards', text: 'Terms, definitions and facts taken from your file.' },
  { name: 'Quiz', text: 'Multiple choice, true or false, identification and fill-in-the-blank.' },
  { name: 'Progress', text: 'Scores per attempt and the topics you miss most.' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const firstName = user.name.split(' ')[0];
  const since = new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="dash">
      <header className="dash-top">
        <p className="brand">Student Reviewer</p>
        <button className="btn btn-quiet" onClick={logout}>Log out</button>
      </header>

      <main className="dash-main">
        <h1>Welcome, {firstName}</h1>
        <p className="muted">Everything you review here comes from the files you upload. Nothing is added from outside.</p>

        <section className="empty">
          <h2>You have no files yet</h2>
          <p>Upload a handout to turn it into a summary, flashcards and a practice quiz.</p>
          <button className="btn" disabled title="File upload is the next module">Upload a file</button>
          <span className="hint">Available once the file module is built</span>
        </section>

        <div className="dash-cols">
          <section>
            <h2>Modules</h2>
            <ul className="modules">
              {MODULES.map((m) => (
                <li key={m.name}>
                  <div>
                    <strong>{m.name}</strong>
                    <span>{m.text}</span>
                  </div>
                  <em>Not built yet</em>
                </li>
              ))}
            </ul>
          </section>

          <aside>
            <h2>Your account</h2>
            <dl className="account">
              <dt>Name</dt><dd>{user.name}</dd>
              <dt>Email</dt><dd>{user.email}</dd>
              <dt>Member since</dt><dd>{since}</dd>
            </dl>
          </aside>
        </div>
      </main>
    </div>
  );
}
