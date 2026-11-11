// Shared layout for login/register: a sample handout on the left, the form on the right.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="auth">
      <aside className="auth-paper" aria-hidden="true">
        <p className="paper-file">Biology 101 – Cell Structure.pdf</p>
        <h2 className="paper-heading">2.1 The cell membrane</h2>
        <p>
          <mark>The cell membrane controls what enters and leaves the cell.</mark> It is made of a
          phospholipid bilayer with embedded proteins.
        </p>
        <p className="paper-chip">Flashcard from section 2.1</p>
        <p>
          Transport across the membrane can be passive or active.{' '}
          <mark>Active transport requires energy in the form of ATP.</mark>
        </p>
        <p className="paper-chip">Quiz question from section 2.1</p>
      </aside>

      <section className="auth-panel">
        <p className="brand">Student Reviewer</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
        <p className="auth-footer">{footer}</p>
      </section>
    </main>
  );
}
